var hr_ServiceConfigUtil = Class.create();
hr_ServiceConfigUtil.prototype = {
    initialize: function() {
    },
	
	getInitInfo: function(sysId, mainTable, templateTable) {
		var initInfo = {};
		var grMain = new GlideRecord(mainTable);
		if(grMain.get(sysId)){
			initInfo.hrServiceName = gs.nil(grMain.name)? '' : grMain.name.toString();
			initInfo.hrServiceValue = gs.nil(grMain.value)? '' :grMain.value.toString();
			initInfo.active = gs.nil(grMain.active)? '' :grMain.active.toString();
			initInfo.topicDetailValue = gs.nil(grMain.topic_detail)? '' :grMain.topic_detail.toString();
			initInfo.topicDetailName = gs.nil(grMain.topic_detail.getDisplayValue())? '' :grMain.topic_detail.getDisplayValue().toString();
			initInfo.description = gs.nil(grMain.description)? '' :grMain.description.toString();
			initInfo.recordProducer = {value:'', name:''};
			initInfo.recordProducer.value = gs.nil(grMain.getValue('producer'))? '' :grMain.getValue('producer').toString();
			initInfo.recordProducer.name = gs.nil(grMain.getDisplayValue('producer'))? '' :grMain.getDisplayValue('producer').toString();
			initInfo.instructions = gs.nil(grMain.fulfillment_instructions)? '' :grMain.fulfillment_instructions.toString();
			initInfo.hrCaseOptions = {};
			initInfo.hrCaseOptions.valueList = gs.nil(grMain.getValue('case_options'))? '' :grMain.getValue('case_options').toString();
			initInfo.hrCaseOptions.nameList = gs.nil(grMain.getDisplayValue('case_options'))? '' :grMain.getDisplayValue('case_options').toString();
			initInfo.relRelatedLists = {availableData: [], selectedData: []};
			initInfo.relRelatedLists.selectedData = this._getSelectedRelatedLists(grMain.getValue('subject_person_related_lists'), grMain.getDisplayValue('subject_person_related_lists'));
			initInfo.relRelatedLists.availableData = this._getAvailableRelatedLists();
		}
		return initInfo;
	},
	
	saveHRService: function(jsonData, sysid) {
		var res = {result: true};
		var grHrService = new GlideRecord('sn_hr_core_service');
		var fieldsCount = jsonData.hrService.length;
		if(grHrService.get(sysid)){
			for(var i =0; i<fieldsCount;i++){
				var nm = jsonData.hrService[i].field;
				grHrService.setValue(nm, jsonData.hrService[i].value);
			}
			res.result = grHrService.update();
		}
		return res;
	},

	getTopicInfo: function(topicDetail, hrCOE) {
		var exlusionFieldsList = [
			'sys_updated_on',
			'sys_created_by',
			'sys_domain_path',
			'sys_class_name',
			'sys_updated_by',
			'sys_created_on',
			'sys_domain',
			'sys_id',
			'sys_mod_count',
			'sys_tags'
		];
		
		var topicInfo = {
			coe: '',
			topicCatDisplayValue: '',
			topicCatValue: '',
			availableData: [],
			templateFields: []
		};
		var jsonParser = new global.JSON();
		
		var grTopic = new GlideRecord('sn_hr_core_topic_detail');
		grTopic.addQuery('sys_id',topicDetail);
		grTopic.query();
		
		if(grTopic.next()){
			var coe = grTopic.topic_category.coe.toString();
			topicInfo.coe = coe;
			topicInfo.topicCatDisplayValue= grTopic.topic_category.name.toString();
			topicInfo.topicCatValue = grTopic.topic_category.toString();
			
			var grDictionary = new GlideRecord(coe);
			grDictionary.setLimit(1);
			grDictionary.query();
			
			var grElements = grDictionary.getElements();
			var elementsLength = grElements.length;
			
			for(var i = 0; i < elementsLength; i++){
				var qualifier = '';
				var elementName = grElements[i].getLabel().toString();
				var elementValue = grElements[i].getName().toString();
				var elementTable = grElements[i].getED().getTableName().toString();
				
				var templateField = {};
				if (grElements[i].getED().getInternalType().toString() == "reference" || grElements[i].getED().getInternalType().toString() == "glide_list") {
					var refDetails = this._getReferenceDetails(elementValue, elementTable, coe);
					templateField.reference = refDetails.reference;
					templateField.qualifier = refDetails.qualifier;
				}
				if (grElements[i].getED().getInternalType().toString() != "variables" && (elementValue.indexOf("sys_") < 0)){
					topicInfo.availableData.push({name:elementName, value:elementValue});
					templateField.display = grElements[i].getLabel().toString();
					templateField.name = grElements[i].getName().toString();
					templateField.type = grElements[i].getED().getInternalType().toString();
					templateField.table = coe;
					templateField.choiceInteger = this._getChoiceInteger(elementValue, elementTable);
					templateField.isChoice = grElements[i].getED().isChoiceTable().toString();
					templateField.value = '';
					topicInfo.templateFields.push(templateField);
				}
				
			}	
		} else {
			topicInfo.coe = 'Not found';
			topicInfo.topicCatDisplayValue = 'Not found';
			topicInfo.topicCatValue = 'Not found';
			topicInfo.availableData = [];
			topicInfo.templateFields = [];
		}
		return topicInfo;	
	},
	
	getCOEList: function() {
		var coeList = {
			coes: [{
					name: 'HR Case [sn_hr_core_case]',
					value: 'sn_hr_core_case'
				}]
		};		
		var grDBObject = new GlideRecord('sys_db_object');
		grDBObject.addQuery('super_class.name','sn_hr_core_case');
		grDBObject.query();
		
		while(grDBObject.next()){
			coeList.coes.push({name:grDBObject.label.toString() + ' [' + grDBObject.name.toString() + ']', value: grDBObject.name.toString()});
		}
		return coeList;
	},
	
	getActiveCOEList: function() {
		var activeCOEList = [
			{
				name: 'HR Case',
				value: 'sn_hr_core_case'
			}
		];		
		var grDBObject = new GlideRecord('sys_db_object');
		grDBObject.addQuery('super_class.name','sn_hr_core_case');
		grDBObject.query();
		
		while(grDBObject.next()){
			if(this._activeCOE(grDBObject.name))
				activeCOEList.push({name:grDBObject.label.toString(), value: grDBObject.name.toString()});
		}
		return activeCOEList;
	},
	
	/* An Active COE is either a customer/unlicensed COE which does not appear in the license 
	 * COE license configuration table or one that is licensed and has a COE table:active = true
	 */
	_activeCOE: function(coeTable) {
		var grCOEConfig = new GlideRecord('sn_hr_core_coe_config_matching');
		if(grCOEConfig.get('table', coeTable)) {
			var grCOE = new GlideRecord('sn_hr_core_coe');
			if(grCOE.get(grCOEConfig.coe))
				return grCOE.active;
		}
		return true;
	},
	
	getTemplatePriority: function() {
		var templatePriority = {
			priorityList: []
		};
		
		var grPriority = new GlideRecord('sys_choice');
		grPriority.addQuery('name', 'task');
		grPriority.addQuery('element', 'priority');
		grPriority.query();
		
		while(grPriority.next()) 
			templatePriority.priorityList.push({name: grPriority.label.toString(), value: grPriority.value.toString()});

		return templatePriority;
	},
	
	getChoiceList: function(choiceTable, choiceField) {
		var jsonChoiceList = {
			choiceList: []
		};
		var choices = new GlideChoiceList.getChoiceList(choiceTable, choiceField);
		var numChoices = choices.getSize();
		for(var i = 0; i < numChoices; i++)
			jsonChoiceList.choiceList.push({label: choices.getChoice(i).getLabel(), value: choices.getChoice(i).getValue()});
		
		return jsonChoiceList;
	},
	
	buildTemplateList: function(listTable) {
		var jsonTemplateList = {
			availableData: []
		};
		var grDictionary = new GlideRecord(listTable);
		grDictionary.setLimit(1);
		grDictionary.query();
			
		var grElements = grDictionary.getElements();
		var elementsLength = grElements.length;
			
		for(var i = 0; i < elementsLength; i++){
			var elementName = grElements[i].getLabel().toString();
			var elementValue = grElements[i].getName().toString();
			
			jsonTemplateList.availableData.push({name: elementName, value: elementValue});
		}
		return jsonTemplateList;
	},
	
	_getChoiceInteger: function(field, tablename) {
		var choiceInteger = '';
		
		var grDictionary = new GlideRecord('sys_dictionary');
		grDictionary.addQuery('element', field);
		grDictionary.addQuery('name', tablename);
		grDictionary.query();
		
		if(grDictionary.next())
			choiceInteger = grDictionary.choice.toString();
		
		return choiceInteger;		
	},
	
	_getReferenceDetails: function(field, tablename, coe) {
		var refDetails = {};
		var qualifier = '';
		
		if(tablename != coe){
			var grOverride = new GlideRecord('sys_dictionary_override');
			grOverride.addQuery('element', field);
			grOverride.addQuery('name', coe);
			grOverride.addQuery('reference_qual_override', true);
			grOverride.query();
			
			if(grOverride.next())
				qualifier = grOverride.reference_qual.toString();
		} 
		var grReference = new GlideRecord('sys_dictionary');
		grReference.addQuery('name', tablename);
		grReference.addQuery('element', field);
		grReference.query();
		
		if(grReference.next()){
			refDetails.reference = grReference.reference.toString();
			if(refDetails.use_reference_qualifier == 'dynamic')
				refDetails.qualifier = qualifier?qualifier:grReference.dynamic_ref_qual.toString();
			else
				refDetails.qualifier = qualifier?qualifier:grReference.reference_qual.toString();
		}
		
		return refDetails;
	},
	
	_getSelectedRelatedLists: function(valueList, nameList) {
		var selectedResult = [];
			var valArray = gs.nil(valueList)? [] : valueList.split(',');
			var nameArray = gs.nil(nameList)? [] : nameList.split(',');

			for(var i=0; i<valArray.length; i++) {
				selectedResult.push({name: nameArray[i], value: valArray[i]});
			}
		return selectedResult;
	},
	
	_getAvailableRelatedLists: function() {
		var refQual = new hr_ServicesUtil().getProfileSubjectFilter();
		var grRelations = new GlideRecord('sys_relationship');
		grRelations.addEncodedQuery(refQual);
		grRelations.query();
		
		var availableResult = [];
		
		while(grRelations.next()){
			availableResult.push({name: grRelations.name.toString(), value:grRelations.sys_id.toString()});
		}
		return availableResult;
	},

	
	
    type: 'hr_ServiceConfigUtil'
};