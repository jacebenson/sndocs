var LabelMergeAjax = Class.create();
LabelMergeAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	mergeLabels: function() {
		var ids = this.getParameter("sysparm_labelIds").split(",");
		var targetId = this.getParameter("sysparm_targetLabel");
		if (gs.nil(targetId))
			return;	

		var targetLabel = new GlideRecord("label");
		if (!targetLabel.get(targetId))
			return;
		
		this.doMergeLabels(targetLabel, ids, false);
	},

	/*
	* Merge labels whose ids are supplied in the target label. Bypass ownership and visibility checks if force is set to true
	*/
	doMergeLabels: function(targetLabel, ids, force) {	
		// quick checks for no op
		if (targetLabel == null || !targetLabel.instanceOf('label') || gs.nil(targetLabel.sys_id) ||
			ids == null || ids.length == 0)
			return;
		
		if (!force && !this._canMergeIntoTag(targetLabel)) {
			gs.addInfoMessage(gs.getMessage("You do not have permission to merge tags into {0}", targetLabel.getDisplayValue()));
			return;
		}

		var mergeeCount = 0;
		for (var i = 0; i < ids.length; i++) {
			if (this._merge(targetLabel.sys_id, ids[i], force))
				mergeeCount++;
		}
		
		if (mergeeCount == 0)
			gs.addInfoMessage(gs.getMessage("No tags were merged"));
		else if (mergeeCount == 1)
			gs.addInfoMessage(gs.getMessage("1 tag was merged and deleted and all its record associations have been moved to {0}", [targetLabel.getDisplayValue()]));
		else
			gs.addInfoMessage(gs.getMessage("{0} tags were merged and deleted and all their record associations have been moved to {1}", ["" + mergeeCount, targetLabel.getDisplayValue()]));
	},
	
	_merge: function(targetId, mergeeId, force) {
		if (targetId == mergeeId)
			return false;

		var oldLabel = new GlideRecord("label");
		if (!oldLabel.get(mergeeId))
			return false;

		// only the owner or a tag admin can merge a tag into another one
		if (!force && oldLabel.owner != gs.getUserID() && !gs.hasRole("tags_admin")) {
			gs.addInfoMessage(gs.getMessage("You do not have permission to merge tag {0} into another tag", oldLabel.getDisplayValue()));
			return false;
		}
		
		var labelEntry = new GlideRecord("label_entry");
		labelEntry.addQuery("label", mergeeId);
		labelEntry.query();
		while (labelEntry.next()) {
			labelEntry.setValue("label", targetId);
			labelEntry.update();
		}
		
		return oldLabel.deleteRecord();
	},
	
	_canMergeIntoTag: function(targetLabel) {
		// only users who own the target tag, are allowed to collaborate to it, or are tag admins can merge into a tag
		var canMergeIntoTarget = false;
		if (targetLabel.owner == gs.getUserID() || targetLabel.viewable_by == 'everyone')
			canMergeIntoTarget = true;
		else if (gs.hasRole("tags_admin"))
			canMergeIntoTarget = true;
		else {
			var sharingToken = new GlideRecord("label_user_m2m");
			sharingToken.addQuery("label", targetLabel.sys_id);
			sharingToken.addQuery("user", gs.getUserID());
			sharingToken.query();
			if (sharingToken.hasNext())
				canMergeIntoTarget = true;
		}
		return canMergeIntoTarget;
	},
	
	type: "LabelMergeAjax"
});
	
	
	
	
	
	