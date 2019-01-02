var LabelCollision = Class.create();
LabelCollision.prototype = {
    initialize: function() {
    },
	
	_message: 'OK',
	
	/*
	* returning 'OK' is understood as 'change is authorized'. returning anything else is understood as 'change is refused'
	* changesFrom and changesTo are expected to be 2 versions of a same glide record on the label table (typically previous and current)
	*/
	validateAndProcessChange: function(changesFrom, changesTo) {
		// just in case...
		if (changesFrom != null && (changesFrom.sys_id != changesTo.sys_id))
			return gs.getMessage('An unexpected error occurred');

		// changing label is shared
		if (changesTo.viewable_by != 'me') {
			// refuse the change only if the name is already claimed by a shared label
			if (this._isCollidingWithShared(changesTo))
				return gs.getMessage('The name "{0}" is already in use for a shared tag (case insensitive)', changesTo.name);
			
			// the conflicting private labels renaming will be handled through async BRs so we are done		
			return 'OK';
		}
		
		// changing label is private
		if (this._isCollidingWithPrivate(changesTo)) {
			// name is already claimed by a private label for this user, the change is refused
			return gs.getMessage('The name "{0}" is already in use for one of your tags (case insensitive)', changesTo.name);
		}	
			
		// change the name of the tag if tag would conflict with a shared tag that the user can see
		this._handlePrivateCollidingWithShared(changesTo);

		return this._message;
	},
	
	/*
	* Retrieve all private labels that are now colliding with this shared label and suffix their name with [private]
	*/ 
	renameCollidingPrivateLabels: function(sharedLabel) {
		// look for potential collisions
		var collisions = new GlideRecord('label');
		collisions.addEncodedQuery('sys_id!=' + sharedLabel.sys_id + '^viewable_by=me^name=' + sharedLabel.name);
		collisions.query();
		while (collisions.next()) {
			var toRename = new GlideRecord('label');
			if (toRename.get(collisions.sys_id))
				this._renameOrMergePrivate(toRename, true);
		}	
	},

	/*
	* Retrieve all private labels of the given user that are now colliding with this shared label and suffix their name with [private]
	*/ 
	renameCollidingPrivateLabelsForUser: function(sharedLabel, userId) {
		// look for potential collisions
		var collisions = new GlideRecord('label');
		collisions.addEncodedQuery('sys_id!=' + sharedLabel.sys_id + '^viewable_by=me^name=' + sharedLabel.name + '^owner=' + userId);
		collisions.query();
		while (collisions.next()) {
			var toRename = new GlideRecord('label');
			if (toRename.get(collisions.sys_id)) 
				this._renameOrMergePrivate(toRename, true);
		}
	},
	
	/*
	* Rename or merge into existing
	*/
	_renameOrMergePrivate: function(toRename, update) {
		var oldName = toRename.name.toString();
		var newName = oldName + ' '; // to avoid risking losing the space in translation (literally)
		newName += gs.getMessage('[private]');
		
		var collisions = new GlideRecord('label');
		collisions.addEncodedQuery('sys_id!=' + toRename.sys_id + '^viewable_by=me^name=' + newName + '^owner=' + toRename.owner);
		collisions.query();
		if (collisions.next()) {
			if (toRename.operation() == 'insert')
				this._message = gs.getMessage('You already have access to a shared tag named {0} and to a private tag named {1}', [oldName, newName]);
			else
				(new LabelMergeAjax()).doMergeLabels(collisions, [toRename.sys_id], true); 
		} else {
			toRename.name = newName;
			if (update == true) {
				toRename.update();
				gs.info("Updated private label [" + toRename.sys_id + "] to new name [" + newName + "]");
			}
		}
	},

	/*
	* check if tag is colliding with a shared tag
	*/
	_isCollidingWithShared: function(label) {
		// look for a potential collision
		var collisions = new GlideRecord('label');
		collisions.addEncodedQuery('sys_id!=' + label.sys_id + '^viewable_by!=me^name=' + label.name);
		collisions.query();			
		return (collisions.hasNext());
	},
		
	/*
	* check if the tag is colliding with a shared tag
	*/
	_handlePrivateCollidingWithShared: function(privateLabel) {
		// look for a potential collision
		var collisions = new GlideRecord('label');
		collisions.addEncodedQuery('sys_id!=' + privateLabel.sys_id + '^viewable_by!=me^name=' + privateLabel.name);
		collisions.query();	
		while (collisions.next()) {
			// can the tag owner see the colliding tag
			var realCollision = false;
			if (collisions.viewable_by == 'everyone' || collisions.owner == privateLabel.owner)
				realCollision = true;
			else {
				var entitlements = new GlideRecord('label_user_m2m');
				entitlements.addQuery('user', privateLabel.owner);
				entitlements.addQuery('label', collisions.sys_id);
				entitlements.query();
				if (entitlements.hasNext())
					realCollision = true;
			}
			if (realCollision)
				this._renameOrMergePrivate(privateLabel, false);
		}
	},
	
	/*
	* check if the tag is colliding with a private tag of the same owner
	*/
	_isCollidingWithPrivate: function(label) {
		var collisions = new GlideRecord('label');
		collisions.addEncodedQuery('sys_id!=' + label.sys_id + '^owner=' + label.owner + '^name=' + label.name + '^viewable_by=me');
		collisions.query();			
		return collisions.hasNext();
	},

    type: 'LabelCollision'
}