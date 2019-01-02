var IncidentUtilsSNC = Class.create();
IncidentUtilsSNC.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	INCIDENT : 'incident',
	ATTR_DOMAIN : 'sys_domain',
	ATTR_PARENT_INCIDENT : 'parent_incident',
	ATTR_WORK_NOTES : "work_notes",
	ATTR_NUMBER : "number",
	COPY_IF_ACTIVE_ATTRS : ['parent_incident', 'problem_id', 'rfc'],
	ALWAYS_IGNORE_ATTRS : ['active','additional_assignee_list','child_incidents','close_code','close_notes','closed_at','closed_by','contact_type','created','created_by','hold_reason','knowledge','made_sla','notify','number','opened_at','opened_by','reassignment_count','reopen_count','resolved_at','resolved_by','sys_id','sys_domain','sys_mod_count','time_worked','updated','updated_by','watch_list','work_notes_list'],
	PROP_INCIDENT_COPY_RELATED_LISTS: 'com.snc.incident.copy.related_lists',
	PROP_INCIDENT_COPY_ATTRS: 'com.snc.incident.copy.attributes',
	PROP_INCIDENT_COPY_ENABLED: 'com.snc.incident.copy.enable',
	PROP_CREATE_CHILD_INCIDENT: 'com.snc.incident.create.child.enable',
	PROP_INCIDENT_COPY_ATTACH: 'com.snc.incident.copy.attach',
	INCIDENT_DEFAULT_ATTR_VALUE: 'assignment_group,business_service,category,caused_by,cmdb_ci,company,description,impact,location,parent_incident,problem_id,rfc,short_description,subcategory,urgency',
	RELATED_TABLES_MAP:{
		'task_cmdb_ci_service': {
			property: 'com.snc.incident.copy.rl.task_cmdb_ci_services.attributes',
			parentAttr: 'task',
			defaultValue: 'cmdb_ci_service',
			key: 'cmdb_ci_service'
		},
		'task_ci': {
			property: 'com.snc.incident.copy.rl.task_ci.attributes',
			parentAttr: 'task',
			defaultValue: 'ci_item',
			key: 'ci_item'
		}
	},
	ACTION_TYPE : {
		COPY_INCIDENT : "copy_incident",
		CREATE_CHILD_INCIDENT : "create_child_incident"
	},

	initialize : function(request, responseXML, gc) {
		AbstractAjaxProcessor.prototype.initialize.call(this, request, responseXML, gc);
		this.arrayUtil = new ArrayUtil();
		this.log = new GSLog('com.snc.incident.copy.log', 'IncidentUtilsSNC');
	},

	ajaxFunction_getIncidentQueryParams: function() {
		var srcSysId = this.getParameter('sysparm_src_sysid');
		var uiActionType = this.getParameter('sysparm_ui_action');
		var attributesList = this._getAttributeList();

		if(!attributesList)
			return false;

		var gr = new GlideRecord(this.INCIDENT);
		if (gr.get(srcSysId))
			return this._getRecordValuesAsEncodedQuery(gr, attributesList, uiActionType);
		else
			this.log.logErr('Invalid source incident sysid provided = ' + srcSysId);
	},

	copyIncidentAttachments : function(srcSysId, targetSysId) {
		var isCopyEnabled = gs.getProperty(this.PROP_INCIDENT_COPY_ATTACH, 'true') == 'true';
		if (isCopyEnabled) {
			var gr = new GlideRecord(this.INCIDENT);
			if (gr.get(srcSysId))
				return this._copyAttachments(gr, targetSysId);
			else
				this.log.logWarning('copyIncidentAttachments: Provided INCIDENT does not exist - '+srcSysId);
		}
	},

	copyIncidentRelatedLists: function(srcIncSysID, newIncSysID) {
		var relatedTables = this._getCsvPropertyValue(this.PROP_INCIDENT_COPY_RELATED_LISTS, '');
		for (var i = 0; i < relatedTables.length; ++i) {
			var table = relatedTables[i];
			var ans = this._makeRelatedTableCopy(srcIncSysID, newIncSysID, table);
			if (!this._isSet(ans)) {
				this.log.logWarning('copyIncidentRelatedLists: Could not copy related table '+table);
				return false;
			}
		}
		return true;
	},

	makeRelatedTableCopy: function( /*String*/ srcParentSysId,
					/*String*/ targetParentSysId,
					/*String*/ table,
					/*String*/ key,
					/*String*/ parentAttr,
					/*Array*/ copyAttrs) {
		var ans = [];
		copyAttrs = this.arrayUtil.diff(copyAttrs, this.ALWAYS_IGNORE_ATTRS, [parentAttr]);
		var srcGr = new GlideRecord(table);
		if (srcGr.isValid()) {
			var existingRecords = [];
			srcGr.addQuery(parentAttr, srcParentSysId);
			srcGr.query();

			if (key)
				existingRecords = this._getTargetRelatedRecordKeys(table, key, parentAttr, targetParentSysId);

			while (srcGr.next()) {
				if (key && this.arrayUtil.contains(existingRecords, srcGr.getValue(key)))
					continue;

				var newSysId = this._makeRelatedRecordCopy(srcGr, copyAttrs, parentAttr, targetParentSysId);
				if (newSysId)
					ans.push(newSysId);
				else
					this.log.logWarning('makeRelatedTableCopy: Could not copy related table ' + table);
			}

			return ans;
		} else
			this.log.logWarning('makeRelatedTableCopy: Invalid table ' + table);
	},

	getRedirectUrlForIncidentForm: function (actionVerb, sysId) {
		return this._getRedirectUrlForForm(actionVerb, sysId, this.INCIDENT);
	},

	getCsvValue: function(val) {
		val = val.trim().split(',');
		for (var i = 0; i < val.length;) {
			val[i] = val[i].trim();
			if (!val[i]) {
				val.splice(i, 1);
			} else {
				i++;
			}
		}
		return val;
	},

	isCopyIncidentFlagValid : function() {
		var isCopyIncidentPropEnabled = gs.getProperty(this.PROP_INCIDENT_COPY_ENABLED, 'false');

		return isCopyIncidentPropEnabled == 'true';
	},

	isCreateChildIncidentFlagValid : function() {
		var isCreateChildIncidentEnabled = gs.getProperty(this.PROP_CREATE_CHILD_INCIDENT, 'false');

		return isCreateChildIncidentEnabled == 'true';
	},

	_isCreateChildIncidentAction : function(uiActionType) {
		return uiActionType == this.ACTION_TYPE.CREATE_CHILD_INCIDENT;
	},

	_getAttributeList : function() {
		var fieldList = this._getCsvPropertyValue(this.PROP_INCIDENT_COPY_ATTRS, this.INCIDENT_DEFAULT_ATTR_VALUE);
		return this.arrayUtil.diff(fieldList, this.ALWAYS_IGNORE_ATTRS);
	},

	_isCopyIncidentAction : function(action) {
		return action == this.ACTION_TYPE.COPY_INCIDENT;
	},

	_copyAttachments: function(srcGr, targetSysId) {
		var res = [];
		if (srcGr.hasAttachments()) {
			var table = srcGr.getTableName();
			res = j2js(GlideSysAttachment.copy(table, srcGr.getUniqueValue(), table, targetSysId));
		}
		return res;
	},

	_makeRelatedTableCopy: function(srcParentSysId, targetParentSysId, table) {
		var map = this.RELATED_TABLES_MAP[table];
		if (!map) {
			this.log.logWarning('_makeRelatedTableCopy: Unsupported related table ' + table);
			return;
		}
		var key = map.key;
		var parentAttr = map.parentAttr;
		var copyAttrs = this._getCsvPropertyValue(map.property, map.defaultValue);
		return this.makeRelatedTableCopy(srcParentSysId, targetParentSysId, table, key, parentAttr, copyAttrs);
	},

	_makeRelatedRecordCopy: function(srcGr, copyAttrs, parentAttr, targetParentSysId) {
		var gr = this._makeRecordCopy(srcGr, copyAttrs);
		gr.setValue(parentAttr, targetParentSysId);
		return gr.insert();
	},

	_makeRecordCopy: function(srcGr, copyAttrs) {
		var table = srcGr.getTableName();
		var gr = new GlideRecord(table);
		gr.initialize();
		for (var i = 0; i < copyAttrs.length; ++i) {
			var field = copyAttrs[i];
			if (srcGr.isValidField(field))
				gr.setValue(field, srcGr.getValue(field));
			else
				this.log.logWarning("_makeRecordCopy: Invalid field '" + field + "' provided for table '" + table + "'.");
		}
		return gr;
	},

	_getTargetRelatedRecordKeys: function(table, key, parentAttr, targetParentSysId) {
		var ans = [];
		var gr = new GlideRecord(table);
		gr.addQuery(parentAttr, targetParentSysId);
		gr.query();
		while (gr.next()) {
			ans.push(gr.getValue(key));
		}
		return ans;
	},

	_isSet: function(obj) {
		// Unlike browsers, Rhino condition evaluation
		// returns false when the passed obj is array
		// and has length 0. We want the browser behavior.
		return obj || JSUtil.type_of(obj) === 'object';
	},

	_getRecordValuesAsEncodedQuery: function(record, attributesList, uiActionType) {
		var table = record.getTableName();
		var gr = new GlideRecord(table);
		var activeAttrsToCopy = [];
		// If action is of type "Copy Incident", loop through COPY_IF_ACTIVE_ATTRS list,
		// and skip copying inactive fields.
		if (this._isCopyIncidentAction(uiActionType)) {
			for (var index = 0; index < this.COPY_IF_ACTIVE_ATTRS.length; index++) {
				var attr = this.COPY_IF_ACTIVE_ATTRS[index];
				var activeIndex = attributesList.indexOf(attr);
				if (activeIndex != -1) {
					attributesList.splice(activeIndex, 1);
					if (record[attr].active == 1)
						activeAttrsToCopy.push(attr);
				}
			}
		}

		for (var i = 0; i < attributesList.length; ++i) {
			var name = attributesList[i];
			if (record.isValidField(name)) {
				if (record.getValue(name)){
					// We have to use the display value if it's a date based field for form filter
					if (record.getElement(name).getED().getInternalType() == "glide_date_time")
						gr.addQuery(name, record.getDisplayValue(name));
					else
						gr.addQuery(name, record.getValue(name));
				}
			}
			else
				this.log.logWarning("Invalid field '" + name + "' provided for table '" + table + "'.");
		}

		if (this._isCopyIncidentAction(uiActionType)) {
			for (var j = 0 ; j < activeAttrsToCopy.length; j++) {
				gr.addQuery(activeAttrsToCopy[j], record.getValue(activeAttrsToCopy[j]));
			}
			gr.addQuery(this.ATTR_WORK_NOTES, gs.getMessage('Created from a similar incident {0}', record.getValue(this.ATTR_NUMBER)));
		}

		if (this._isCreateChildIncidentAction(uiActionType)) {
			gr.addQuery(this.ATTR_PARENT_INCIDENT, record.getUniqueValue());
			gr.addQuery(this.ATTR_DOMAIN, record.getValue(this.ATTR_DOMAIN));
		}

		return gr.getEncodedQuery();
	},

	_getRedirectUrlForForm: function(actionVerb, sysId, table) {
		var urlOnStack = '';
		var suffix = '_and_stay';
		if (!JSUtil.nil(actionVerb) && ((actionVerb.indexOf(suffix, actionVerb.length - suffix.length) !== -1))) {
			var gu = new GlideURL(table + '.do');
			gu.set('sys_id', sysId);
			var createdIncidentUrl = gu.toString();
			urlOnStack = createdIncidentUrl;
		} else {
			if (!gs.getSession().getStack().isEmpty())
				urlOnStack = gs.getSession().getStack().pop();
			if (JSUtil.nil(urlOnStack))
				urlOnStack = 'welcome.do';
		}
		return urlOnStack;
	},

	_getCsvPropertyValue: function(ppty, defaultVal) {
		var val = gs.getProperty(ppty, defaultVal);
		return this.getCsvValue(val);
	},

	type: 'IncidentUtilsSNC'
});