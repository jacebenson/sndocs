var AddRelationshipAjax = Class.create();

AddRelationshipAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	process: function() {
		if (this.getType() == "getRelationships") {
			this.getRelationships(this.getValue(), this.getParameter('sysparm_table_name'));
		}

		if (this.getType() == "getRelatedLists") {
			this.getRelatedLists(this.getValue(), this.getParameter('sysparm_dependent_table'));
		}

		if (this.getType() == "save")
			this.save(this.getName(), this.getValue(), this.getChars());

		var sysChangeSet = this.getParameter("sysparm_changeset");
		if ((this.getType() == "save_proposed_changes") && (!gs.nil(sysChangeSet)))
			this._saveProposed(sysChangeSet, this.getName(), this.getValue(), this.getChars());

		//ng propose change
		if ((this.getType() == "save_ng_proposed_changes") && (!gs.nil(sysChangeSet))) {
			this._ngSaveProposed(sysChangeSet, this.getName(), this.getValue(), this.getChars());
		}

		if (this.getType() == "getExisting")
			this.getExisting(this.getName(), this.getValue());
		//get default filter value
		if(this.getType() == "getSuggestedQuery")
			this.getSuggestedQuery(this.getName(), this.getValue(), this.getChars());

	},

	getSuggestedQuery: function(item_id, relationship_id, mode) {
		var add = new AddRelationshipQuery(this, item_id, relationship_id, mode);
		var sql = add.getQuery();

		var item = document.createElement('suggested_query');
		item.setAttribute('value', sql);
		root.appendChild(item);
	},

	getRelationships: function(item_id, tableName) {
		var pl = this._getPlausible(item_id, tableName);
		var gr = this._getAllRelationships();

		while (gr.next()) {
			var pd = 'parent:' + gr.sys_id;
			var cd = 'child:' + gr.sys_id;

			var pSuggest = pl[pd] && true ? pl[pd].suggested : false;
			var cSuggest = pl[cd] && true ? pl[cd].suggested : false;
			var parentDependentClass = pl[pd] && true ? pl[pd].dependentClass : 'cmdb_ci';
			var childDependentClass = pl[cd] && true ? pl[cd].dependentClass : 'cmdb_ci';

			this._addItem(pd, gr.getDisplayValue('parent_descriptor'), parentDependentClass, pSuggest);
			this._addItem(cd, gr.getDisplayValue('child_descriptor'), childDependentClass, cSuggest);
		}

		// Add user and group
		this._addUserAndGroup();
	},

	getRelatedLists: function(item_id, tableName) {
		var dependentTable = tableName;
		var gr = new GlideRecord(dependentTable);
		var map = gr.getRelatedLists();
		var iterator = map.keySet().iterator();
		var key = null;
		var relatedListsArry = new Array();
		var relatedLists = {};

		while (iterator.hasNext()) {
			key = iterator.next();
			relatedListsArry.push({
				'key': key,
				'label': map.get(key)
			});
		}

		// sort by label
		relatedListsArry.sort(function(objA, objB) {
			if (objA.label < objB.label)
				return -1;
			else if (objA.label == objB.label)
				return 0;
			else
				return 1;
		});

		relatedLists['relatedLists'] = relatedListsArry;

		var json = new JSON();

		var result = this.newItem("result");
		result.setAttribute("relatedList", json.encode(relatedLists));
	},

	_addUserAndGroup: function() {
		var gr = new GlideRecord('cmdb_rel_user_type');
		gr.orderBy('parent_descriptor');
		gr.query();
		while (gr.next())
			this._addItem('parent:sys_user:' + gr.sys_id, gr.getDisplayValue('parent_descriptor'), 'sys_user', true);

		var gr = new GlideRecord('cmdb_rel_group_type');
		gr.orderBy('parent_descriptor');
		gr.query();
		while (gr.next())
			this._addItem('parent:sys_user_group:' + gr.sys_id, gr.getDisplayValue('parent_descriptor'), 'sys_user_group', true);

	},

	getExisting: function(item_id, relationship_id) {
		var mode = this._getMode(relationship_id);

		if (mode == 'cmdb_ci')
			this._getExistingCMDB_CI(item_id, relationship_id);
		else if (mode == 'sys_user')
			this._getExistingSYS_USER(item_id, relationship_id);
		else if (mode == 'sys_user_group')
			this._getExistingSYS_USER_GROUP(item_id, relationship_id);

		this._piggyBackQuery(item_id, relationship_id, mode);
	},

	_getMode: function(relationship_id) {
		var x = relationship_id.split(':');
		var mode = 'cmdb_ci';
		if (x.length == 3)
			mode = x[1];

		return mode;
	},

	_getExistingCMDB_CI: function(item_id, relationship_id) {
		var gr = this._getExistingCMDB_CI_gr(item_id, relationship_id);
		var sql = 'sys_idIN';
		var count = 0;
		while (gr.next()) {
			if (count != 0)
				sql += ',';
			count++;
			if (this.match == 'parent')
				sql = sql + gr.child;
			else
				sql = sql + gr.parent;
		}
		gr = new GlideRecord('cmdb_ci');
		gr.addEncodedQuery(sql);
		gr.orderBy(gr.getDisplayName());
		gr.query();
		while (gr.next())
			this._addItem(gr.sys_id, gr.getDisplayValue());
	},

	_getExistingSYS_USER: function(item_id, relationship_id) {
		var x = relationship_id.split(':');
		var gr = this._getExistingSYS_USER_gr(item_id, x[2]);
		while (gr.next())
			this._addItem(gr.user, gr.user.getDisplayValue());
	},

	_getExistingSYS_USER_gr: function(item_id, type) {
		var gr = new GlideRecord('cmdb_rel_person');
		gr.addQuery('ci', item_id);
		gr.addQuery('type', type);
		gr.orderBy('user.name');
		gr.setQueryReferences(true);
		gr.query();
		return gr;
	},

	_getExistingSYS_USER_GROUP: function(item_id, relationship_id) {
		var x = relationship_id.split(':');
		var gr = this._getExistingSYS_USER_GROUP_gr(item_id, x[2]);
		while (gr.next())
			this._addItem(gr.group, gr.group.getDisplayValue());
	},

	_getExistingSYS_USER_GROUP_gr: function(item_id, type) {
		var gr = new GlideRecord('cmdb_rel_group');
		gr.addQuery('ci', item_id);
		gr.addQuery('type', type);
		gr.orderBy('group.name');
		gr.setQueryReferences(true);
		gr.query();
		return gr;
	},

	_piggyBackQuery: function(item_id, relationship_id, mode) {
		var add = new AddRelationshipQuery(this, item_id, relationship_id, mode);
		var sql = add.getQuery();

		var item = document.createElement('suggested_query');
		item.setAttribute('value', sql);
		root.appendChild(item);
	},

	_getExistingCMDB_CI_gr: function(item_id, relationship_id) {
		if (relationship_id.indexOf('parent:') == 0) {
			this.match = 'parent';
			var type = relationship_id.substring('parent:'.length);
		} else {
			var type = relationship_id.substring('child:'.length);
			this.match = 'child';
		}
		var gr = new GlideRecord('cmdb_rel_ci');
		gr.addQuery(this.match, item_id);
		gr.addQuery('type', type);
		gr.query();
		return gr;
	},

	save: function(item_id, relationship_id, kids) {
		var mode = this._getMode(relationship_id);
		if (mode == 'cmdb_ci')
			this._saveCMDB_CI(item_id, relationship_id, kids);
		else if (mode == 'sys_user')
			this._saveSYS_USER(item_id, relationship_id, kids);
		else if (mode == 'sys_user_group')
			this._saveSYS_USER_GROUP(item_id, relationship_id, kids);
	},

	_saveSYS_USER_GROUP: function(item_id, relationship_id, kids) {
		var x = relationship_id.split(':');
		var gr = this._getExistingSYS_USER_GROUP_gr(item_id, x[2]);
		var toAdd = (kids + '').split(',');
		toAdd = this._prune(gr, toAdd, 'group');

		for (var i = 0; i < toAdd.length; i++) {
			//PRB622335: getting orphaned in cmdb_rel_group and cmdb_rel_person tables when try to remove relationships
			if (!toAdd[i] || toAdd[i].length === 0 || toAdd[i] === '--None--')
				continue;

			var gr = new GlideRecordSecure('cmdb_rel_group');
			gr.ci = item_id;
			gr.group = toAdd[i];
			gr.type = x[2];
			//PRB631393
			if(!gr.insert())
				gs.addErrorMessage('Invalid insert');
		}
	},

	_prune: function(gr, toAdd, field) {
		while (gr.next()) {
			var match = false;
			for (var i = 0; i < toAdd.length; i++) {
				if (toAdd[i] != gr.getValue(field))
					continue;

				match = true;
				toAdd.splice(i, 1);
				break;
			}

			if (!match){ 
				if(!gr.canDelete()){
					//PRB631393
					gs.addErrorMessage('Invalid update');
					continue;
				}
				
				//PRB631393
				if(!gr.deleteRecord())
					gs.addErrorMessage('Invalid update');
			}
		}
		return toAdd;
	},

	_saveSYS_USER: function(item_id, relationship_id, kids) {
		var x = relationship_id.split(':');
		var gr = this._getExistingSYS_USER_gr(item_id, x[2]);
		var toAdd = (kids + '').split(',');
		toAdd = this._prune(gr, toAdd, 'user');
		for (var i = 0; i < toAdd.length; i++) {
			//PRB622335: getting orphaned in cmdb_rel_group and cmdb_rel_person tables when try to remove relationships
			if (!toAdd[i] || toAdd[i].length === 0 || toAdd[i] === '--None--')
				continue;

			var gr = new GlideRecordSecure('cmdb_rel_person');
			gr.ci = item_id;
			gr.user = toAdd[i];
			gr.type = x[2];
			//PRB631393
			if(!gr.insert())
				gs.addErrorMessage('Invalid insert');
		}
	},

	_saveCMDB_CI: function(item_id, relationship_id, kids) {
		var gr = this._getExistingCMDB_CI_gr(item_id, relationship_id);
		var toAdd = (kids + '').split(',');
		while (gr.next()) {
			if (this.match == 'parent')
				var child = gr.child + '';
			else
				var child = gr.parent + '';
			var match = false;
			for (var i = 0; i < toAdd.length; i++) {
				if (toAdd[i] != child)
					continue;

				match = true;
				toAdd.splice(i, 1);
				break;
			}

			if (!match){
				if(!gr.canDelete()){
					//PRB631393
					gs.addErrorMessage('Invalid update');
					continue;
				}
				//PRB631393
				if(!gr.deleteRecord())
					gs.addErrorMessage('Invalid update');
			}
		}

		for (var i = 0; i < toAdd.length; i++) {
			var gr = new GlideRecordSecure('cmdb_rel_ci');
			if (toAdd[i] == '--None--')
				continue;

			if (!toAdd[i])
				continue;

			gs.log("************ ADDING ************" + toAdd[i]);
			if (this.match == 'parent') {
				gr.child = toAdd[i];
				gr.parent = item_id;
				gr.type = relationship_id.substring('parent:'.length);
			} else {
				gr.type = relationship_id.substring('child:'.length);
				gr.child = item_id;
				gr.parent = toAdd[i];
			}
			//PRB631393
			if(!gr.insert())
				gs.addErrorMessage('Invalid insert');
		}
	},

	_saveProposed: function(task_id, item_id, relationship_id, kids) {
		var grExist = this._getExistingCMDB_CI_gr(item_id, relationship_id);
		var toAdd = (kids + '').split(',');
		var child;
		var base = new SNC.CMDBUtil();
		while (grExist.next()) {
			if (this.match == 'parent')
				child = grExist.child + '';
			else
				child = grExist.parent + '';
			var match = false;
			for (var j = 0; j < toAdd.length; j++) {
				if (toAdd[j] != child)
					continue;

				match = true;
				toAdd.splice(j, 1);
				break;
			}

			// This record is a proposed delete
			if (!match)
				base.baselineProposedChangesGenDeleteRelation(grExist, task_id);
		}

		for (var i = 0; i < toAdd.length; i++) {
			if (toAdd[i] == '--None--')
				continue;

			if (!toAdd[i])
				continue;

			gs.log("************ PROPOSE ADDING ************" + toAdd[i]);
			var gr = new GlideRecord('cmdb_rel_ci');
			if (this.match == 'parent') {
				gr.child = toAdd[i];
				gr.parent = item_id;
				gr.type = relationship_id.substring('parent:'.length);
			} else {
				gr.type = relationship_id.substring('child:'.length);
				gr.child = item_id;
				gr.parent = toAdd[i];
			}
			base.baselineProposedChangesGenAddRelation(gr, task_id);
		}
	},

	_ngSaveProposed: function(task_id, item_id, serializedToAdd, mode) {
		var toAdd = JSON.parse(serializedToAdd);
		var grExist = this._ngGetExistingCMDB_CI_gr(item_id, mode);
		var base = new SNC.CMDBUtil();
		var compareField;

		if (mode == 'down')
			compareField = 'child';
		else
			compareField = 'parent';

		while (grExist.next()) {
			var same = false;

			for (var i = 0; i < toAdd.length; i++) {
				if (toAdd[i].sys_id == '')
					continue;

				if ((toAdd[i].type_id != grExist.type) || (toAdd[i][compareField + '_id'] != grExist.getValue(compareField)))
					continue;

				same = true;
				toAdd.splice(i, 1);
				break;
			}

			if (!same) {
				base.baselineProposedChangesGenDeleteRelation(grExist, task_id);
			}
		}

		for (var i = 0; i < toAdd.length; i++) {
			var gr = new GlideRecord('cmdb_rel_ci');
			if (mode == 'down') {
				gr.parent = item_id;
				gr.child = toAdd[i].child_id;
				gr.type = toAdd[i].type_id;
			} else {
				gr.child = item_id;
				gr.parent = toAdd[i].parent_id;
				gr.type = toAdd[i].type_id;
			}
			base.baselineProposedChangesGenAddRelation(gr, task_id);
		}
	},

	_ngGetExistingCMDB_CI_gr: function(item_id, mode) {
		var match;
		if (mode == 'down') {
			match = 'parent';
		} else {
			match = 'child';
		}
		var gr = new GlideRecord('cmdb_rel_ci');
		gr.addQuery(match, item_id);
		gr.query();
		return gr;
	},

	_getParentClasses: function(item_id, tableName) {
		var gr;
		var className;
		if (tableName != null) {
			className = tableName;
		} else {
			gr = new GlideRecord('cmdb_ci');
			gr.get(item_id);
			className = gr.sys_class_name + '';
		}

		var parents = SNC.CMDBUtil.getTables0(className);
		return parents;
	},

	_getPlausible: function(item_id, tableName) {
		var parents = this._getParentClasses(item_id, tableName);

		var plausible = new Object();
		gr = new GlideRecord('cmdb_rel_type_suggest');
		gr.addQuery('base_class', parents);
		gr.query();
		while (gr.next()) {
			if (gr.parent) {
				var key = 'parent:' + gr.cmdb_rel_type;
				if (!(plausible[key]))
					plausible[key] = {
						suggested: true,
						dependentClass: gr.dependent_class + ''
					};
				else if (plausible[key].dependentClass.indexOf(gr.dependent_class + '') < 0)
					plausible[key].dependentClass += (',' + gr.dependent_class);

			}
			if (gr.child) {
				var key = 'child:' + gr.cmdb_rel_type;
				if (!(plausible[key]))
					plausible[key] = {
						suggested: true,
						dependentClass: gr.dependent_class + ''
					};
				else if (plausible[key].dependentClass.indexOf(gr.dependent_class + '') < 0)
					plausible[key].dependentClass += (',' + gr.dependent_class);
			}
		}

		return plausible;
	},

	_getAllRelationships: function() {
		var gr = new GlideRecord('cmdb_rel_type');
		gr.orderBy('parent_descriptor');
		gr.query();
		return gr;
	},

	_addItem: function(value, label, dependentClass, suggested) {
		var item = this.newItem();
		item.setAttribute('value', value);
		item.setAttribute('label', label);
		if (typeof(suggested) != 'undefined')
			item.setAttribute('suggested', suggested);
		if (typeof(dependentClass) != 'undefined')
			item.setAttribute('dependent_class', dependentClass);
	},

	type: "AddRelationshipAjax"
});