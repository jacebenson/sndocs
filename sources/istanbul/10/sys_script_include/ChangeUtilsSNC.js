var ChangeUtilsSNC = Class.create();
ChangeUtilsSNC.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	CHANGE_REQUEST: 'change_request',
	ALWAYS_IGNORE_ATTRS: ['created_by', 'created', 'updated_by', 'updated', 'sys_mod_count', 'sys_id'],
	CHANGE_TASK: 'change_task',
	TASK_CREATED_FROM: 'created_from',
	TASK_CREATED_FROM_WORKFLOW: 'workflow',
	PROP_CHANGE_RELATED_LISTS: 'com.snc.change_request.copy.related_lists',
	PROP_CHANGE_ATTRS: 'com.snc.change_request.copy.attributes',
	PROP_CHANGE_COPY_ENABLED: 'com.snc.change_request.enable_copy',
	PROP_CHANGE_ATTACH_COPY_ENABLED: 'com.snc.change_request.attach.enable_copy',
	CHANGE_REQUEST_DEFAULT_ATTR_VALUE: 'category,cmdb_ci,priority,risk,impact,type,assignment_group,assigned_to,short_description,description,change_plan,backout_plan,test_plan',
	VERB_BACK: 'sysverb_back',
	RELATED_TABLES_MAP: {
		'change_task': {
			property: 'com.snc.change_request.copy.rl.change_task.attributes',
			parentAttr: 'change_request',
			defaultValue: 'cmdb_ci,priority,assignment_group,assigned_to,short_description,description',
			key: '',
			copyRelated: 'task_ci',
			copyAttachmentsKey: 'com.snc.change_request.rl.change_task.attach.enable_copy'
		},
		'task_cmdb_ci_service': {
			property: 'com.snc.change_request.copy.rl.task_cmdb_ci_services.attributes',
			parentAttr: 'task',
			defaultValue: 'cmdb_ci_service',
			key: 'cmdb_ci_service'
		},
		'task_ci': {
			property: 'com.snc.change_request.copy.rl.task_ci.attributes',
			parentAttr: 'task',
			defaultValue: 'ci_item',
			key: 'ci_item'
		}
	},
	STAY_ON_CURRENT_CHANGE_REQUEST_MAP: {
		//Calculate risk - eea1aa78c0a8ce01002aa530a8f1eb65
		"eea1aa78c0a8ce01002aa530a8f1eb65": true,
		//Refresh impacted services - refresh_impacted_services
		"refresh_impacted_services": true
	},

	initialize: function(request, responseXML, gc) {
		AbstractAjaxProcessor.prototype.initialize.call(this, request, responseXML, gc);
		this.arrayUtil = new ArrayUtil();
		this.log = new GSLog('com.snc.change_request.copy.log', 'ChangeUtilsSNC');
		
		this.STAY_ON_CURRENT_CHANGE_REQUEST_MAP[this.VERB_BACK] = true;
	},

	//function to return if an actionVerb is supposed to be redirected
	//to stay on the same page
	isStayOnCRPageActionVerb: function(actionVerb) {
		if (JSUtil.nil(actionVerb))
			return false;
		return !!this.STAY_ON_CURRENT_CHANGE_REQUEST_MAP[actionVerb];
	},

	ajaxFunction_getChangeQueryParams: function() {
		//read attributes list
		var attributesList = this._getCsvPropertyValue(this.PROP_CHANGE_ATTRS,
			this.CHANGE_REQUEST_DEFAULT_ATTR_VALUE);
		var srcSysId = this.getParameter('sysparm_src_sysid');
		var gr = new GlideRecord(this.CHANGE_REQUEST);
		if (gr.get(srcSysId)) {
			return this._getRecordValuesAsEncodedQuery(gr, attributesList);;
		} else {
			this.log.logErr('Invalid src change_request sysid provided = ' +
				srcSysId);
		}
	},

	_getRecordValuesAsEncodedQuery: function(record, attributesList) {
		var table = j2js(record.getTableName());

		var gr = new GlideRecord(table);
		for (var i = 0; i < attributesList.length; ++i) {
			var name = attributesList[i];
			if (record.isValidField(name))
				if (record.getValue(name))
					gr.addQuery(name, record.getValue(name));
			else
				this.log.logWarning("Invalid field '" + name + "' provided for table '" + table + "'.");
		}
		return gr.getEncodedQuery();
	},

	_isSet: function(obj) {
		// Unlike browsers, Rhino condition evaluation
		// returns false when the passed obj is array
		// and has length 0. We want the browser behavior.
		return obj || JSUtil.type_of(obj) === 'object';
	},

	isCopyFlagValid: function() {
		//Read property definition
		var isCopyChangeEnabledProp = j2js(gs.getProperty(this.PROP_CHANGE_COPY_ENABLED));

		if (isCopyChangeEnabledProp === 'false') {
			return false;
		} else {
			return true;
		}

	},

	isCopyRulesValid: function(/*GlideRecord*/ changeRequest) {
		//Read service now rules for enabling copy
		var rulesValid = true;

		if (j2js(changeRequest.type) === 'standard') {
			rulesValid = false;
		}

		return rulesValid;
	},

	getCsvValue: function(val) {
		var val = val.trim();
		val = val.split(',');
		for (var i = 0; i < val.length;) {
			val[i] = val[i].trim();
			if (!val[i]) {
				val.splice(i, 1); // Removing empty entries
			} else {
				i++;
			}
		}
		return val;
	},

	_getCsvPropertyValue: function(ppty, defaultVal) {
		var val = gs.getProperty(ppty, defaultVal);
		return this.getCsvValue(val);
	},

	_copyAttachments: function(srcGr, targetSysId) {
		var res = [];
		if (srcGr.hasAttachments()) {
			var table = srcGr.getTableName();
			res = j2js(GlideSysAttachment.copy(table, srcGr.getUniqueValue(), table, targetSysId));
		}
		return res;
	},

	makeRelatedTableCopy: function( /*String*/ srcParentSysId,
									/*String*/ targetParentSysId,
									/*String*/ table,
									/*String*/ key, /*If provided, used to prevent duplicate rows*/
									/*String*/ parentAttr,
									/*Array*/ copyAttrs,
									/*Boolean*/ copyAttachments,
									/*CSV String*/ copyChildRelatedLists) {
		if (!copyChildRelatedLists)
			copyChildRelatedLists = [];
		else
			copyChildRelatedLists = this.getCsvValue(copyChildRelatedLists);

		var ans = [];
		copyAttrs = this.arrayUtil.diff(copyAttrs, this.ALWAYS_IGNORE_ATTRS, [
			parentAttr
		]);
		var srcGr = new GlideRecord(table);
		if (srcGr.isValid()) {
			var existingRecords = [];
			srcGr.addQuery(parentAttr, srcParentSysId);
			srcGr.query();
			if (key) {
				existingRecords = this._getTargetRelatedRecordKeys(table, key,
					parentAttr, targetParentSysId);
			}
			while (srcGr.next()) {
				if (key
					&& this.arrayUtil.contains(existingRecords, srcGr.getValue(key)))
					continue;
				if ((table == this.CHANGE_TASK) && (srcGr.getValue(this.TASK_CREATED_FROM) == this.TASK_CREATED_FROM_WORKFLOW))
					continue;
				var newSysId = this._makeRelatedRecordCopy(srcGr, copyAttrs,
					parentAttr, targetParentSysId);
				if (newSysId) {
					ans.push(newSysId);

					if (copyAttachments)
						this._copyAttachments(srcGr, newSysId);

					for (var i = 0; i < copyChildRelatedLists.length; ++i) {
						var relatedTable = copyChildRelatedLists[i];
						var newAns = this._makeRelatedTableCopy(srcGr.getUniqueValue(),
																newSysId, relatedTable);
						if (!this._isSet(newAns)) {
							this.log.logWarning('makeRelatedTableCopy: Could not copy related\'s related table ' +
												relatedTable);
						}
					}
				} else {
					this.log.logWarning('makeRelatedTableCopy: Could not copy related table ' + table);
				}
			}
			return ans;
		} else {
			this.log.logWarning('makeRelatedTableCopy: Invalid table ' + table);
		}
	},

	_makeRelatedTableCopy: function(srcParentSysId, targetParentSysId, table) {
		var map = this.RELATED_TABLES_MAP[table];
		if (!map) {
			this.log.logWarning('_makeRelatedTableCopy: Unsupported related table ' + table);
			return;
		}
		var key = map.key;
		var parentAttr = map.parentAttr;
		var attachmentKey = map.copyAttachmentsKey;
		var copyAttachments = false;
		if (attachmentKey)
			copyAttachments = this._getCsvPropertyValue(attachmentKey, 'true') == 'true';
		var copyAttrs = this._getCsvPropertyValue(map.property,
			map.defaultValue);
		var copyChildRelatedLists = map['copyRelated'];
		return this.makeRelatedTableCopy(srcParentSysId, targetParentSysId, table,
										 key, parentAttr, copyAttrs,
										 copyAttachments, copyChildRelatedLists);
	},

	_makeRelatedRecordCopy: function(srcGr, copyAttrs, parentAttr,
		targetParentSysId) {
		var gr = this._makeRecordCopy(srcGr, copyAttrs);
		gr.setValue(parentAttr, targetParentSysId);
		return gr.insert();
	},

	_getTargetRelatedRecordKeys: function(table, key, parentAttr,
		targetParentSysId) {
		var ans = [];
		var gr = new GlideRecord(table);
		gr.addQuery(parentAttr, targetParentSysId);
		gr.query();
		while (gr.next()) {
			ans.push(gr.getValue(key));
		}
		return ans;
	},

	_makeRecordCopy: function(srcGr, copyAttrs) {
		var table = j2js(srcGr.getTableName());
		var gr = new GlideRecord(table);
		gr.initialize();
		for (var i = 0; i < copyAttrs.length; ++i) {
			var field = copyAttrs[i];
			if (srcGr.isValidField(field))
				gr.setValue(field, srcGr.getValue(field));
			else
				this.log.logWarning("_makeRecordCopy: Invalid field '" + field +
									"' provided for table '" + table + "'.");
		}
		return gr;
	},

	copyChangeRelatedLists: function(/*String*/ srcChgSysID, /*String*/ newChgSysID) {
		var ret = true;
		var relatedTables = this._getCsvPropertyValue(this.PROP_CHANGE_RELATED_LISTS, '');
		for (var i = 0; i < relatedTables.length; ++i) {
			var table = relatedTables[i];
			var ans = this._makeRelatedTableCopy(srcChgSysID, newChgSysID, table);
			if (!this._isSet(ans)) {
				this.log.logWarning('copyChangeRelatedLists: Could not copy related table ' + table);
				ret = false;
			}
		}
		return ret;
	},

	copyChangeAttachments: function(/*String*/ srcSysId, /*String*/ targetSysId) {
		var isCopyEnabled = gs.getProperty(this.PROP_CHANGE_ATTACH_COPY_ENABLED, 'true') == 'true';
		if (isCopyEnabled) {
			var gr = new GlideRecord(this.CHANGE_REQUEST);
			if (gr.get(srcSysId)) {
				return this._copyAttachments(gr, targetSysId);
			} else {
				this.logErr('copyChangeAttachments: Provided Change Request does not exist - ' + srcSysId);
			}
		}
	},

	_getRedirectUrlForForm: function(/*String*/ actionVerb, /*SysId String*/ sysId, /*String*/ table) {
		var isStayOnPageActionVerb = this.isStayOnCRPageActionVerb(actionVerb);

		//Logic for deriving URL to redirect to
		var urlOnStack = '';
		var suffix = '_and_stay';
		if (!JSUtil.nil(actionVerb) && ((actionVerb.indexOf(suffix, actionVerb.length - suffix.length) !== -1) || isStayOnPageActionVerb)) {
			// If the action verb ends with _and_stay then the user intends to submit
			// the form and stay back on that page. However, the goto url overrides
			// that behavior and user is taken to this processor. So, the onus is
			// on processor to redirect the user back to the form.
			// Or is one of the actions where we should stay on the form.

			//set the new sys_id to the URL for the form.
			var gu = new GlideURL(table + '.do');
			gu.set('sys_id', sysId);
			var createdChangeUrl = gu.toString();
			urlOnStack = createdChangeUrl;
		} else {
			// It is assumed that the processor's url is not added to back stack,
			// and before the user is redirected to this, the form's url is popped from
			// back stack by system. So the stack top contains the page we want to goto.
			if (!gs.getSession().getStack().isEmpty())
				urlOnStack = gs.getSession().getStack().pop();
			if (JSUtil.nil(urlOnStack))
				urlOnStack = 'welcome.do';
		}
		return urlOnStack;
	},

	getRedirectUrlForChangeForm: function (/*String*/ actionVerb, /*SysId String*/ sysId) {
		return this._getRedirectUrlForForm(actionVerb, sysId, this.CHANGE_REQUEST);
	},
	
	// Checks if the "back" button on the form was pressed
	isVerbBack: function(actionVerb) {
		return actionVerb === this.VERB_BACK;
	},

	type: 'ChangeUtilsSNC'
});