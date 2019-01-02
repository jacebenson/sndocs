var HRServiceCreatorUtilAjax = Class.create();
HRServiceCreatorUtilAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

    getCOEList: function() {
        var data = {
            coes:[{name:gs.getMessage('-- None --'), value:''}]
        };
		var inactiveTables = gs.getProperty("sn_hr_core.inactive_tables","").split(",");
		var coeArray = hr.TABLE_CASE_EXTENSIONS;
		
		for(var i=0; i<coeArray.length; i++) {
			var coeValue = coeArray[i].toString();
			if (inactiveTables.indexOf(coeValue) == -1) {
				var coeName = this._getCOEName(coeValue);
				if (coeName)
					data.coes.push({
						name: coeName + ' [' + coeValue + ']',
						value: coeValue
					});
			}
		}
        return new global.JSON().encode(data);
    },

    getHRServiceDetails: function() {
        var retHRServiceDetails = {};

        var sysid = this.getParameter('sysparm_hrsysid');
        var grHRService = new GlideRecord('sn_hr_core_service');
        if (grHRService.get(sysid)) {
            retHRServiceDetails.hrServiceName = grHRService.name.toString();
            retHRServiceDetails.hrServiceCOE = grHRService.topic_detail.topic_category.coe.toString();
        }

        return new global.JSON().encode(retHRServiceDetails);
    },

    getTaskTypeState: function() {
        var templateTaskType = {
            taskType: [],
            state: [],
			assignmentType: []
        };

        var templateTable = this.getParameter('sysparm_tasktable');
        var taskField = 'hr_task_type';
        var stateField = 'state';
		var assignTypeField = 'assignment_type';
		
        templateTaskType.taskType = this._getChoiceList(taskField, templateTable);
        templateTaskType.state = this._getChoiceList(stateField, templateTable);
		templateTaskType.assignmentType = this._getChoiceList(assignTypeField, hr.TABLE_HR_TEMPLATE);
        
        return new global.JSON().encode(templateTaskType);
    },
	
	gaSupportTeam: function() {
        var supportTeam = {
			recipients: [],
        };

        var templateTable = this.getParameter('sysparm_tasktable');
        var supportTeamField = 'task_support_team';
		
		supportTeam.recipients = this._getChoiceList(supportTeamField, templateTable);
        return new global.JSON().encode(supportTeam);
    },

	getDateOffsetList: function() {
		var dateOffsetList = {
			offsetType: [],
			offsetUnits: []
		};
		
		var templateTable = this.getParameter('sysparm_table');
		var offsetType = 'date_offset_type';
		var offsetUnits = 'date_offset_units';
		dateOffsetList.offsetType = this._getChoiceList(offsetType, templateTable, true);
		dateOffsetList.offsetUnits = this._getChoiceList(offsetUnits, templateTable, true);
		
		return new global.JSON().encode(dateOffsetList);
	},
	
	getDueDateList: function() {
		var data = {
			duedate: []
		};
		data.dueDateList = this._getDueDateBooleanList(true);
		
		return new global.JSON().encode(data);
	},
	
	getElementLabel: function() {
		var retElementHTML = {};
		var elementLabel = '';
		
		var fieldName = this.getParameter('sysparm_element');
		var fieldTable = this.getParameter('sysparm_table');
		
		var fieldArray = fieldName.split('.');
		var fieldLength = fieldArray.length;

		for(var i=0; i < fieldLength; i++) {
		   var jsonAssignToInfo = this._getColumnLabel(fieldTable, fieldArray[i]);
		   elementLabel = elementLabel + (gs.nil(elementLabel)? '' : ' ' ) + jsonAssignToInfo.columnLabel;
		   fieldTable = jsonAssignToInfo.columnRef;
		}
		
		retElementHTML.elementLabel = elementLabel;
		return new global.JSON().encode(retElementHTML);
	},
	
	getParentCaseList: function() {
        var coeList = {
            coes: [{
                name: this._getCOEName('sn_hr_core_case') + ' [sn_hr_core_case]',
                value: 'sn_hr_core_case'
            }]
        };
		var inactiveTables = gs.getProperty("sn_hr_core.inactive_tables","");
		var coeArray = hr.TABLE_CASE_EXTENSIONS;
		
		for(var i=0; i<coeArray.length; i++) {
			var coeValue = coeArray[i].toString();
			if(coeValue == 'sn_hr_core_task' || inactiveTables.indexOf(coeValue) != -1)
				continue;

			var coeName = this._getCOEName(coeValue);
			coeList.coes.push({
                    name: coeName + ' [' + coeValue + ']',
                    value: coeValue
            });
		}
		
        return new global.JSON().encode(coeList);
    },
	
	canCreateTemplate: function() {
		var roles = gs.getUser().getRoles();
		var isHrAdmin = roles.indexOf('sn_hr_core.admin') > -1;
		if (isHrAdmin)
			return true;
		
		var isActivityWriter = roles.indexOf('sn_hr_le.activity_writer') > -1;
		return isActivityWriter;
	},
	
	canEditTemplate: function() {
		var sysid = this.getParameter('sysparm_sysid');
		var retCanEdit = {
			canEdit: '',
			isAdmin: '',
			isLEPluginActive: '',
			currentScopeName:'',
			callerScopeName:''
		};

		var appid = gs.getCurrentApplicationId();
		var currentCallerScope = this._getScopeNameByAppId(appid);
		
		var recScopeId = this._getRecordScopeId(sysid,'sn_hr_core_template');
		
		retCanEdit.isLEPluginActive = new GlidePluginManager().isActive('com.sn_hr_lifecycle_events');		
		var roles = gs.getUser().getRoles();
		var isHrAdmin = (roles.indexOf('sn_hr_core.admin') > -1) || (roles.indexOf('admin') > -1);
		var isAdmin = gs.hasRole('admin');
		
		var currRecScopeName = this._getScopeNameByAppId(recScopeId);
	
		if(isAdmin && recScopeId != '' && recScopeId != appid){
			
			retCanEdit.canEdit = false;
			retCanEdit.isAdmin = true;
			retCanEdit.currentScopeName = currRecScopeName;
			retCanEdit.callerScopeName = currentCallerScope;
			
			return new global.JSON().encode(retCanEdit);
		}
		if (isHrAdmin){
			retCanEdit.canEdit = true;
			retCanEdit.isAdmin = true;
			
			return new global.JSON().encode(retCanEdit);
		}
		
		var isActivityWriter = roles.indexOf('sn_hr_le.activity_writer') > -1;
		if (isActivityWriter){
			if(sysid) {
				var owningGrp = '';
				var grOwningGrp = new GlideRecord('sn_hr_core_template');
				if(grOwningGrp.get(sysid))
					owningGrp = grOwningGrp.owning_group;
				
				var grGroups = new GlideRecord('sys_user_grmember');
				grGroups.addQuery('user', gs.getUserID());
				grGroups.addQuery('group', owningGrp);
				grGroups.query();
				if(grGroups.next())
					retCanEdit.canEdit = true;
				else
					retCanEdit.canEdit = false;
				retCanEdit.isAdmin = false;
				return new global.JSON().encode(retCanEdit);
			}
			retCanEdit.canEdit = true;
			retCanEdit.isAdmin = false;
			return new global.JSON().encode(retCanEdit);
		} else {
			retCanEdit.canEdit = false;
			retCanEdit.isAdmin = false;
			return new global.JSON().encode(retCanEdit);
		}
	},
	
	_getRecordScopeId:function(sysId,table){
		var grScope = new GlideRecord(table);
		if(grScope.get(sysId))
			return grScope.getValue('sys_package');
		return '';
	},
	
	_getScopeNameByAppId:function(appId){
		var scopeName = new GlideRecord('sys_scope');
		scopeName.addQuery('sys_id',appId);
		scopeName.query();
		if(scopeName.next()){
			return scopeName.name.toString();
		}
		return "";
	},
    
    getTemplateInfo: function() {
        var staticFieldInfo = {
            'short_description': '',
            'skills': '',
            'assignment_group': '',
            'priority': '',
			'assigned_to':''
        };

		var excludeFields = gs.getProperty('sn_hr_core.template_exclude_fields');
		var arrayExcludeFields = [];
		
		if(excludeFields)
			arrayExcludeFields = excludeFields.replace(/ /g,'').split(',');
		
        var jsonTemplateInfo = {
            name: '',
            active: 'true',
            coe: '',
            shortDescription: '',
			assigned_to:'',
            availableSkillOptions: [],
            skillValue: [],
			owningGrp: {
				name: '',
				value: ''
			},
            assignmentGroup: {
                name: '',
                value: ''
            },
			assignedTo: {
				name:'',
				value:''
			},
            priority: '',
			assignmentOption:'',
			priorityList: [],
            templateFields: [],
            newTemplateFields: []
        };

        var sysid = this.getParameter('sysparm_sysid');
        var coe = this.getParameter('sysparm_coe');

        var jsonTemplateFieldValues = this._getTemplateMap(sysid);
        var jsonTemplateMap = jsonTemplateFieldValues.templateFieldsMap;
		var templateFieldArray = jsonTemplateFieldValues.templateFieldArray;
        jsonTemplateInfo.name = jsonTemplateFieldValues.staticFieldsMap.name;
        jsonTemplateInfo.active = jsonTemplateFieldValues.staticFieldsMap.active;
        jsonTemplateInfo.coe = jsonTemplateFieldValues.staticFieldsMap.coe;
		jsonTemplateInfo.owningGrp.name = jsonTemplateFieldValues.staticFieldsMap.owningGrp.name;
		jsonTemplateInfo.owningGrp.value = jsonTemplateFieldValues.staticFieldsMap.owningGrp.value;
		jsonTemplateInfo.assignmentOption = jsonTemplateFieldValues.staticFieldsMap.assignmentOption;
		
        coe = coe ? coe : jsonTemplateInfo.coe;
		jsonTemplateInfo.priorityList = this._getChoiceList('priority', coe);
        var grElements = coe ? this._getElements(coe) : '';
        var elementsLength = grElements.length;
		var newTemplateFields = [];
        for (var i = 0; i < elementsLength; i++) {
            var qualifier = '';
            var elementName = grElements[i].getLabel().toString();
            var elementValue = grElements[i].getName().toString();
            var elementTable = grElements[i].getED().getTableName().toString();
            var elementType = grElements[i].getED().getInternalType().toString();
            var isChoice = grElements[i].getED().isChoiceTable().toString();
			var canWrite = 'true';
			var canRead = 'true';
			
            var templateField = {};
            if (elementType == 'glide_date_time' || elementType == 'due_date' || elementType == 'glide_date' || elementType == 'date' || elementType == 'datetime' || elementType == 'integer_date' || elementType == 'schedule_date_time')
                continue;

            if (elementValue in staticFieldInfo) {
                if ('short_description' in jsonTemplateMap)
                    jsonTemplateInfo.shortDescription = jsonTemplateMap['short_description'];
				if ('assigned_to' in jsonTemplateMap){
					jsonTemplateInfo.assignedTo.value = jsonTemplateMap['assigned_to'].toString();
					jsonTemplateInfo.assignedTo.name = this._getReferenceDisp(jsonTemplateMap['assigned_to'], 'sys_user');
				}
                if ('skills' in jsonTemplateMap) {
                    var skillInfo = this._getListValues(jsonTemplateMap['skills'], 'cmn_skill');
                    jsonTemplateInfo.availableSkillOptions = skillInfo.availableOptions;
                    jsonTemplateInfo.skillValue = skillInfo.value;
                }
                if ('assignment_group' in jsonTemplateMap) {
                    jsonTemplateInfo.assignmentGroup.value = jsonTemplateMap['assignment_group'].toString();
                    jsonTemplateInfo.assignmentGroup.name = this._getReferenceDisp(jsonTemplateMap['assignment_group'], 'sys_user_group');
                }
                if ('priority' in jsonTemplateMap)
                    jsonTemplateInfo.priority = jsonTemplateMap['priority'];
                continue;
            }
			
			if(canRead == 'true') {
				var templateFieldDetails = this._getTemplateFieldDetails(elementName, elementValue, elementTable, elementType, coe, isChoice, jsonTemplateMap, templateFieldArray, arrayExcludeFields, canWrite);
				if (templateFieldDetails.validField)
					if (templateFieldDetails.onPage)
						this._arraySplice(newTemplateFields, templateFieldDetails.idx, templateFieldDetails.templateField);
					else
						jsonTemplateInfo.templateFields.push(templateFieldDetails.templateField);
			}
        }
		this._arrayClean(newTemplateFields, '');
		jsonTemplateInfo.newTemplateFields = newTemplateFields;		
        jsonTemplateInfo.coe = coe;
        return new global.JSON().encode(jsonTemplateInfo);
    },

    getTaskTemplateInfo: function() {
        var staticFieldInfo = {
            'short_description': '',
			'optional': '',
            'hr_task_type': '',
            'state': '',
			'set_reminder': '',
			'when_to_send': '',
			'interval': '',
			'email_template': '',
			'task_support_team': '',
			'parent_case_users': '',
			'groups': '',
			'queue': '',
			'assigned_to':'',
			'skills':'',
			'assignment_group':''
			
        };
		
		var excludeFields = gs.getProperty('sn_hr_core.template_exclude_fields');
		var arrayExcludeFields = [];
		
		if(excludeFields)
			arrayExcludeFields = excludeFields.replace(/ /g,'').split(',');

        var jsonTemplateInfo = {
            name: '',
            shortDescription: '',
			optional: '',
            active: 'true',
			owningGrp: {
				name:'',
				value:''
			},
			setReminder: '',
			whenToSend: '',
			reminderInterval: '',
			reminderTemplate: {
				name: '',
				value: ''
			},
			assignedTo: {
				name:'',
				value:''
			},
            parentTable: '',
            assignTo: '',
			assignmentType: '',
			assignmentOption:'',
			useAssignmentDate: '',
			dueDateInfo: {},
            hr_task_type: '',
			checklistInfo: [],
            state: '',
            templateFields: [],
            newTemplateFields: [],
			messages: {
				'Select user' : gs.getMessage('Select user'),
				'Select date' : gs.getMessage('Select date')
			},
			task_support_team: '',
			parent_case_users: '',
			groups: '',
			queue: {
				value: '',
				displayValue: ''
			},
			assignmentGroup: {
                name: '',
                value: ''
            },
			availableSkillOptions: [],
            skillValue: []
        };
        var sysid = this.getParameter('sysparm_sysid');
        var coe = this.getParameter('sysparm_coe');
        var jsonTemplateFieldValues = this._getTemplateMap(sysid);
        var jsonTemplateMap = jsonTemplateFieldValues.templateFieldsMap;
		var templateFieldArray = jsonTemplateFieldValues.templateFieldArray;
        jsonTemplateInfo.name = jsonTemplateFieldValues.staticFieldsMap.name;
        jsonTemplateInfo.active = jsonTemplateFieldValues.staticFieldsMap.active;
		jsonTemplateInfo.owningGrp.name = jsonTemplateFieldValues.staticFieldsMap.owningGrp.name;
		jsonTemplateInfo.owningGrp.value = jsonTemplateFieldValues.staticFieldsMap.owningGrp.value;
		jsonTemplateInfo.assignmentType = jsonTemplateFieldValues.staticFieldsMap.assignmentType;
		jsonTemplateInfo.assignmentOption = jsonTemplateFieldValues.staticFieldsMap.assignmentOption;
        jsonTemplateInfo.parentTable = jsonTemplateFieldValues.staticFieldsMap.parentTable;
        jsonTemplateInfo.assignTo = jsonTemplateFieldValues.staticFieldsMap.assignTo;
		jsonTemplateInfo.useAssignmentDate = jsonTemplateFieldValues.staticFieldsMap.useAssignmentDate;
		jsonTemplateInfo.dueDateInfo.dateSource = jsonTemplateFieldValues.staticFieldsMap.dateSource;
		jsonTemplateInfo.dueDateInfo.dateOffset = jsonTemplateFieldValues.staticFieldsMap.dateOffset;
		jsonTemplateInfo.dueDateInfo.dateUnits = jsonTemplateFieldValues.staticFieldsMap.dateUnits;
		jsonTemplateInfo.dueDateInfo.dateQuantity = jsonTemplateFieldValues.staticFieldsMap.dateQuantity;
        var grElements = this._getElements(coe);
        var elementsLength = grElements.length;
		var newTemplateFields = [];
        for (i = 0; i < elementsLength; i++) {
            var qualifier = '';
            var elementName = grElements[i].getLabel().toString();
            var elementValue = grElements[i].getName().toString();
            var elementTable = grElements[i].getED().getTableName().toString();
            var elementType = grElements[i].getED().getInternalType().toString();
            var isChoice = grElements[i].getED().isChoiceTable().toString();
			var canWrite = 'true';
			var canRead = 'true';
			
            var templateField = {};
            if (elementType == 'glide_date_time' || elementType == 'due_date' || elementType == 'glide_date' || elementType == 'date' || elementType == 'datetime' || elementType == 'integer_date' || elementType == 'schedule_date_time')
                continue;

            if (elementValue in staticFieldInfo) {
                if ('short_description' in jsonTemplateMap)
                    jsonTemplateInfo.shortDescription = jsonTemplateMap['short_description'];
				if('optional' in jsonTemplateMap)
					jsonTemplateInfo.optional = jsonTemplateMap['optional'];
                if ('hr_task_type' in jsonTemplateMap)
                    jsonTemplateInfo.hr_task_type = jsonTemplateMap['hr_task_type'];
				if ('state' in jsonTemplateMap)
                    jsonTemplateInfo.state = jsonTemplateMap['state'];
				if ('set_reminder' in jsonTemplateMap)
					jsonTemplateInfo.setReminder = jsonTemplateMap['set_reminder'];
				if ('when_to_send' in jsonTemplateMap)
					jsonTemplateInfo.whenToSend = jsonTemplateMap['when_to_send'];
				if ('interval' in jsonTemplateMap)
					jsonTemplateInfo.reminderInterval = jsonTemplateMap['interval'];
				if ('email_template' in jsonTemplateMap){
					jsonTemplateInfo.reminderTemplate.value = jsonTemplateMap['email_template'].toString();
                    jsonTemplateInfo.reminderTemplate.name = this._getReferenceDisp(jsonTemplateMap['email_template'], 'sn_hr_core_email_content');
				}if ('assigned_to' in jsonTemplateMap){
					jsonTemplateInfo.assignedTo.value = jsonTemplateMap['assigned_to'].toString();
					jsonTemplateInfo.assignedTo.name = this._getReferenceDisp(jsonTemplateMap['assigned_to'], 'sys_user');
				}
				if ('task_support_team' in jsonTemplateMap)
                    jsonTemplateInfo.task_support_team = jsonTemplateMap['task_support_team'];
				if ('parent_case_users' in jsonTemplateMap)
					jsonTemplateInfo.parent_case_users = this._getListValues(jsonTemplateMap['parent_case_users'], 'sn_hr_core_service_approval_option');
				if ('groups' in jsonTemplateMap)
					jsonTemplateInfo.groups = this._getListValues(jsonTemplateMap['groups'], 'sys_user_group');
				if ('queue' in jsonTemplateMap){
					jsonTemplateInfo.queue.value = jsonTemplateMap['queue'].toString();
                    jsonTemplateInfo.queue.displayValue = this._getReferenceDisp(jsonTemplateMap['queue'], 'chat_queue');
				}
				if ('skills' in jsonTemplateMap) {
                    var skillInfo = this._getListValues(jsonTemplateMap['skills'], 'cmn_skill');
                    jsonTemplateInfo.availableSkillOptions = skillInfo.availableOptions;
                    jsonTemplateInfo.skillValue = skillInfo.value;
                }
                if ('assignment_group' in jsonTemplateMap) {
                    jsonTemplateInfo.assignmentGroup.value = jsonTemplateMap['assignment_group'].toString();
                    jsonTemplateInfo.assignmentGroup.name = this._getReferenceDisp(jsonTemplateMap['assignment_group'], 'sys_user_group');
                }
                continue;
            }
			
			if(canRead == 'true') {
				var templateFieldDetails = this._getTemplateFieldDetails(elementName, elementValue, elementTable, elementType, coe, isChoice, jsonTemplateMap, templateFieldArray, arrayExcludeFields, canWrite);
				if (templateFieldDetails.validField)
					if (templateFieldDetails.onPage)
						this._arraySplice(newTemplateFields, templateFieldDetails.idx, templateFieldDetails.templateField);
					else
						jsonTemplateInfo.templateFields.push(templateFieldDetails.templateField);
				//Adding Checklist info if task type is Checklist
				if(jsonTemplateInfo.hr_task_type == 'checklist'){
					var checklistInfo = new sn_hr_core.hr_ChecklistUtil().getChecklistItems(sysid);
					if(checklistInfo)
					   jsonTemplateInfo.checklistInfo = checklistInfo;
				}
			}
        }
		this._arrayClean(newTemplateFields, '');
		jsonTemplateInfo.newTemplateFields = newTemplateFields;
        return new global.JSON().encode(jsonTemplateInfo);
    },
	
    saveTemplate: function() {
        var jsonResult = {};
        var data = this.getParameter('sysparm_data');
        var sysid = this.getParameter('sysparm_sysid');
        var hrSysid = this.getParameter('sysparm_hrsysid');
        var coe = this.getParameter('sysparm_coe');
        var name = this.getParameter('sysparm_templatename');
        var active = this.getParameter('sysparm_active');
		var owningGrp = this.getParameter('sysparm_owning');
		var assignmentOption = this.getParameter('sysparm_assignmentOption');
		var assignmentType = '';
        var parentTable = '';
        var assignTo = '';
		var useAssignmentDate = '';
        var dateInfo = {
            dateSource: '',
            dateOffset: '',
            dateUnits: '',
            dateQuantity: ''
        };

		var result = this._saveHRCoreTemplate(data, name, active, owningGrp, coe, sysid, assignmentType, assignmentOption, parentTable, assignTo, useAssignmentDate, dateInfo, false);
        jsonResult.sysid = result.sysid;
        jsonResult.name = result.name;

        return new global.JSON().encode(jsonResult);
    },

    saveTaskTemplate: function() {
		var sysid = this.getParameter('sysparm_sysid');
		var checklistInfo  = JSON.parse(this.getParameter('sysparm_checklistInfo'));
		if(checklistInfo && checklistInfo.length>0){
			var checklistTable = this.getParameter('sysparm_checklistTable');
			new sn_hr_core.hr_ChecklistUtil().updateChecklist(sysid,checklistInfo,checklistTable);
		}
        var jsonResult = {};
        var data = this.getParameter('sysparm_data');
        var hrSysid = this.getParameter('sysparm_hrsysid');
        var orderTaskId = this.getParameter('sysparm_ordertaskid');
        var coe = this.getParameter('sysparm_coe');
        var name = this.getParameter('sysparm_templatename');
        var active = this.getParameter('sysparm_active');
		var owningGrp = this.getParameter('sysparm_owning');
		var assignmentType = this.getParameter('sysparm_assigntype');
		var assignmentOption = this.getParameter('sysparm_assignmentOption');
        var parentTable = this.getParameter('sysparm_parenttable');
        var assignTo = this.getParameter('sysparm_assignto');
		var useAssignmentDate = this.getParameter('sysparm_useassignmentdate');
        var dateInfo = {};
        dateInfo.dateSource = this.getParameter('sysparm_datesource');
        dateInfo.dateOffset = this.getParameter('sysparm_dateoffset');
        dateInfo.dateUnits = this.getParameter('sysparm_dateunits');
        dateInfo.dateQuantity = this.getParameter('sysparm_datequantity');
        var result = this._saveHRCoreTemplate(data, name, active, owningGrp,coe, sysid, assignmentType,assignmentOption, parentTable, assignTo,useAssignmentDate, dateInfo, true);
        jsonResult.sysid = result.sysid;
        jsonResult.name = result.name;
        return new global.JSON().encode(jsonResult);
    },

    _getElements: function(coe) {
        var grDictionary = new GlideRecord(coe);
        grDictionary.initialize();

        return grDictionary.getElements();
    },
	
	_getCOEName: function(coeValue) {
        var retCOEName = '';
		var ln = new gs.getSession().getLanguage();	
		retCOEName = this._getTableLabel(coeValue, ln);
		if(retCOEName)
			return retCOEName;
		else
			retCOEName = this._getTableLabel(coeValue, 'en');

		if (!retCOEName)
			retCOEName = coeValue;

		return retCOEName;
     },
	
	_getTableLabel: function(table, ln){
		var grDoc = new GlideRecord('sys_documentation');
		grDoc.addNullQuery('element');
		grDoc.addQuery('name',table);
		grDoc.addQuery('language',ln);
		grDoc.query();

		if(grDoc.next())
		   return grDoc.label.toString();
		else
		   return;
	},

    _getTemplateMap: function(sysid) {
        var retTemplateMap = {
            staticFieldsMap: {
				coe: '',
                active: 'true',
				owningGrp: {
					name:'',
					value:''
				},
            },
            templateFieldsMap: {},
			templateFieldArray: []
        };
        var retTemplateValue = '';
        var grTemplate = new GlideRecord('sn_hr_core_template');
        if (grTemplate.get(sysid) && grTemplate.canRead()) {
            retTemplateValue = grTemplate.template.toString();
			
            retTemplateMap.staticFieldsMap.name = grTemplate.name.toString();
            retTemplateMap.staticFieldsMap.active = grTemplate.active.toString();
			retTemplateMap.staticFieldsMap.owningGrp.value = grTemplate.owning_group.toString();
			retTemplateMap.staticFieldsMap.owningGrp.name = grTemplate.owning_group.getDisplayValue().toString();			
            retTemplateMap.staticFieldsMap.coe = grTemplate.table.toString();
			retTemplateMap.staticFieldsMap.assignmentType = grTemplate.assignment_type.toString();
			retTemplateMap.staticFieldsMap.assignmentOption = grTemplate.assignment_option.toString();
            retTemplateMap.staticFieldsMap.parentTable = grTemplate.parent_case_table.toString();
            retTemplateMap.staticFieldsMap.assignTo = grTemplate.assign_to.toString();
			retTemplateMap.staticFieldsMap.useAssignmentDate = grTemplate.use_assignment_date.toString();
            retTemplateMap.staticFieldsMap.dateSource = grTemplate.due_date_source.toString();
            retTemplateMap.staticFieldsMap.dateOffset = grTemplate.date_offset_type.toString();
            retTemplateMap.staticFieldsMap.dateUnits = grTemplate.date_offset_units.toString();
            retTemplateMap.staticFieldsMap.dateQuantity = grTemplate.date_offset_quantity.toString();
        }		
        var tempArray = retTemplateValue.split('^');
        for (var i = 0; i < tempArray.length - 1; i++) {
            var idx = tempArray[i].indexOf('=');
            retTemplateMap.templateFieldsMap[tempArray[i].substr(0, idx)] = tempArray[i].substr(idx + 1, tempArray[i].length);
			retTemplateMap.templateFieldArray.push(tempArray[i].substr(0, idx));
        }
        return retTemplateMap;
    },
	
	_arraySplice: function(arry, idx, val) {
		var index = idx;
		var length = arry.length;
		while(length < index) {
			arry[index-1] = '';
			index--;
		}
		arry[idx] = val;
	},
	
	_arrayClean: function(arry, deleteValue) {
	   for (var i = 0; i < arry.length; i++) {
		if (arry[i] == deleteValue) {        
		  arry.splice(i, 1);
		  i--;
		}
	  }
	},

    _getTemplateFieldDetails: function(elementName, elementValue, elementTable, elementType, coe, isChoice, jsonTemplateMap, templateFieldArray, arrayExcludeFields, canWrite) {
        var retTempFieldDetails = {
            templateField: {},
            onPage: '',
            validField: '',
			idx: ''
        };

        var templateField = {};
		if(arrayExcludeFields.indexOf(elementValue) == -1 && this._isFieldActive(elementValue, elementTable)) {
			if (elementType == "reference" || elementType == "glide_list") {
				var refDetails = this._getReferenceDetails(elementValue, elementTable, coe);
				templateField.reference = refDetails.reference;
				templateField.qualifier = refDetails.qualifier;
			}

			if (elementType != "variables" && (elementValue.indexOf("sys_") < 0)) {
				retTempFieldDetails.validField = true;
				templateField.display = elementName;
				templateField.name = elementValue;
				templateField.type = elementType;
				templateField.table = coe;
				templateField.canWrite = canWrite;
				templateField.booleanList = this._getBooleanList();
				templateField.choiceInteger = this._getChoiceInteger(elementValue, elementTable);
				templateField.isChoice = isChoice;
				if ((elementType == 'integer' || elementType == 'string') && (templateField.choiceInteger == 1 || templateField.choiceInteger == 3))
					templateField.choiceList = this._getChoiceList(templateField.name, templateField.table);
				templateField.choiceValue = '';
				if(elementType == 'currency')
					templateField.currencyList = this._getCurrencyList(elementValue, coe);
				if (templateField.name in jsonTemplateMap) {
					retTempFieldDetails.idx = templateFieldArray.indexOf(templateField.name);
					if (elementType == "reference") {
						templateField.refValue = jsonTemplateMap[templateField.name];
						templateField.refDisp = this._getReferenceDisp(jsonTemplateMap[templateField.name], templateField.reference);
						retTempFieldDetails.onPage = true;
					} else if (elementType == "glide_list") {
						var listInfo = this._getListValues(jsonTemplateMap[templateField.name], templateField.reference);
						templateField.availableOptions = listInfo.availableOptions;
						templateField.value = listInfo.value;
						retTempFieldDetails.onPage = true;
					} else if ((elementType == 'glide_duration') || (elementType == 'timer') || (elementType == 'currency')) {
						templateField.value = jsonTemplateMap[templateField.name];
						retTempFieldDetails.onPage = true;
					} else if ((elementType == 'integer' || elementType == 'string') && (templateField.choiceInteger == 1 || templateField.choiceInteger == 3)) {
						templateField.choiceValue = jsonTemplateMap[templateField.name];
						retTempFieldDetails.onPage = true;
					} else if (elementType == 'boolean') {
						templateField.boolValue = jsonTemplateMap[templateField.name];
						retTempFieldDetails.onPage = true;
					} else if ((elementType == 'journal_list') || (elementType == 'journal_input') || (elementType == 'user_input') || (elementType == 'journal') || (elementType == 'translated_html')) {
						templateField.value = jsonTemplateMap[templateField.name];
						retTempFieldDetails.onPage = true;
					} else if ((elementType == 'integer' || elementType == 'string' || elementType == 'percent_complete' || elementType == 'url') && (templateField.choiceInteger == 0)) {
						templateField.value = jsonTemplateMap[templateField.name];
						retTempFieldDetails.onPage = true;
					}else if ('assigned_to' in jsonTemplateMap){
						templateField.assignedTo.value = jsonTemplateMap['assigned_to'].toString();
						templateField.assignedTo.name = this._getReferenceDisp(jsonTemplateMap['assigned_to'], 'sys_user');
					} else {
						templateField.value = jsonTemplateMap[templateField.name];
						retTempFieldDetails.onPage = false;
					}
				} else {
					templateField.value = '';
					retTempFieldDetails.onPage = false;
				}
			} else
				retTempFieldDetails.validField = false;
		}
        retTempFieldDetails.templateField = templateField;

        return retTempFieldDetails;
    },
	
	_isFieldActive: function(field, table) {
		var grDictionary = new GlideRecord('sys_dictionary');
		grDictionary.addQuery('element', field);
		grDictionary.addQuery('name', table);
		grDictionary.query();
		
		if(grDictionary.next())
			return grDictionary.active;
		else
			return false;
	},
	
	_getCurrencyList: function(field, table) {
		var list = [];
		var grCurr = new GlideRecord(table);
		grCurr.initialize();
		var ele = grCurr.getElement(field);
		var refCode = ele.getSessionCurrencyCode();
		list.push({label:refCode + '', value:refCode + ''});
		var currencyTypes = new GlideRecord('fx_currency');
		currencyTypes.addActiveQuery();
		currencyTypes.orderBy('code');
		currencyTypes.query();
		while (currencyTypes.next())
			   if (currencyTypes.code != refCode) list.push({label:currencyTypes.code + '', value:currencyTypes.code + ''});

		return list;
	  },

    _getChoiceList: function(choiceField, choiceTable, removeNone) {
        var choiceList = [];
        var choices = new GlideChoiceList.getChoiceList(choiceTable, choiceField);
		
		if(removeNone)
			choices.removeNone();
		else
			choices.addNone();
		
        var numChoices = choices.getSize();
        for (var i = 0; i < numChoices; i++)
                choiceList.push({
                    label: choices.getChoice(i).getLabel(),
                    value: choices.getChoice(i).getValue()
                });

        return choiceList;
    },
	
	_getBooleanList: function(addNone) {
		var boolList = [];
		if(addNone)
			boolList.push({label:gs.getMessage('-- None --'), value:''});
		boolList.push({label:gs.getMessage('True'), value:'true'});
		boolList.push({label:gs.getMessage('False'), value:'false'});

		return boolList;
	},
	
	_getDueDateBooleanList: function(addNone) {
		var boolList = [];
		if(addNone)
			boolList.push({label:gs.getMessage('-- None --'), value:'none'});
		boolList.push({label:gs.getMessage('Based on task assignment date'), value:true});
		boolList.push({label:gs.getMessage('Based on parent case table'), value:false});

		return boolList;
	},

    _getReferenceDetails: function(field, tablename, coe) {
        var refDetails = {};        
     
        var grReference = new GlideRecord('sys_dictionary');        
        grReference.addQuery('name', tablename);        
        grReference.addQuery('element', field);     
        grReference.query();        
        if (grReference.next()) {       
            refDetails.reference = grReference.reference.toString();            
            refDetails.qualifier = '';      
        }

		return refDetails;
    },

    _getReferenceDisp: function(refSysid, refTable) {
        var refDisp = '';
        var grRefTable = new GlideRecord(refTable);
        if (grRefTable.get(refSysid))
            refDisp = grRefTable.getDisplayValue().toString();

        return refDisp;
    },

    _getListValues: function(listValues, listTable) {
        var arrayAvailableOptions = {
            availableOptions: [],
            value: []
        };
        var qry = 'sys_idIN' + listValues;
        var grList = new GlideRecord(listTable);
        grList.addEncodedQuery(qry);
        grList.query();

        while (grList.next()) {
            arrayAvailableOptions.availableOptions.push({
                name: grList.getDisplayValue().toString(),
                value: grList.sys_id.toString()
            });
            arrayAvailableOptions.value.push(grList.sys_id.toString());
        }
        return arrayAvailableOptions;
    },

    _getChoiceInteger: function(field, tablename) {
        var choiceInteger = '';

        var grDictionary = new GlideRecord('sys_dictionary');
        grDictionary.addQuery('element', field);
        grDictionary.addQuery('name', tablename);
        grDictionary.query();

        if (grDictionary.next())
            choiceInteger = grDictionary.choice.toString();

        return choiceInteger;
    },
	
	_getColumnLabel: function(tableName, fieldName) {
	   var retColumnInfo = {
		  columnLabel:'',
		  columnRef: '' 
	   };
	   var grTab = new GlideRecord(tableName);
	   grTab.initialize();
	   if (grTab.isValid()) {
		   var ele = grTab.getElement(fieldName);
		   retColumnInfo.columnLabel = ele.getLabel().toString();
		   if (ele.getED().getInternalType() == "reference")
			   retColumnInfo.columnRef = ele.getReferenceTable();
	   }

	   return retColumnInfo;
	},

    _saveHRCoreTemplate: function(data, name, active, owningGrp, coe, sysid, assignmentType, assignmentOption, parentTable, assignTo, useAssignmentDate, dateInfo, taskTemplate) {
        var retResult = {};
        var grSaveTemplate = new GlideRecord('sn_hr_core_template');
        if (grSaveTemplate.get(sysid)) {
			
			grSaveTemplate.table = coe;
            grSaveTemplate.template = data;
            grSaveTemplate.name = name;
            grSaveTemplate.active = active;
			grSaveTemplate.owning_group = owningGrp;
			if(taskTemplate){
				grSaveTemplate.assignment_type = assignmentType;
				grSaveTemplate.assignment_option = assignmentOption;
				grSaveTemplate.parent_case_table = parentTable;
				grSaveTemplate.assign_to = assignTo;
				grSaveTemplate.use_assignment_date = useAssignmentDate;
				grSaveTemplate.due_date_source = dateInfo.dateSource;
				grSaveTemplate.date_offset_type = dateInfo.dateOffset;
				grSaveTemplate.date_offset_units = dateInfo.dateUnits;
				grSaveTemplate.date_offset_quantity = dateInfo.dateQuantity;
			}
			if (grSaveTemplate.canWrite())
				retResult.sysid = grSaveTemplate.update();
        } else {
            grSaveTemplate.initialize();
            grSaveTemplate.table = coe;
            grSaveTemplate.template = data;
            grSaveTemplate.name = name;
            grSaveTemplate.active = active;
			grSaveTemplate.owning_group = owningGrp;
			if(taskTemplate) {
				grSaveTemplate.assignment_type = assignmentType;
				grSaveTemplate.assignment_option = assignmentOption;
				grSaveTemplate.parent_case_table = parentTable;
				grSaveTemplate.assign_to = assignTo;
				grSaveTemplate.use_assignment_date = useAssignmentDate;
				grSaveTemplate.due_date_source = dateInfo.dateSource;
				grSaveTemplate.date_offset_type = dateInfo.dateOffset;
				grSaveTemplate.date_offset_units = dateInfo.dateUnits;
				grSaveTemplate.date_offset_quantity = dateInfo.dateQuantity;
			}

			if (!grSaveTemplate.canCreate())
				return retResult;
            retResult.sysid = grSaveTemplate.insert();
        }
        retResult.name = name;
        return retResult;
    },

    type: 'HRServiceCreatorUtilAjax'
});