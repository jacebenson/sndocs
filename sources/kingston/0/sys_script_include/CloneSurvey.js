var CloneSurvey = Class.create();
var metricDefinitionMap = {};
CloneSurvey.prototype = {
    initialize: function() {
    },
	
	cloneMetricType:function(currentMetricType){
		var oldMetricTypeSysID = currentMetricType.getUniqueValue();
		this.handleNullValues(currentMetricType,'asmt_metric_type',null,null);
		currentMetricType.name = "Copy of " + currentMetricType.name;
		currentMetricType.publish_state = 'draft';
		if(currentMetricType.evaluation_method == 'quiz')
			currentMetricType.condition = '';
		var newMetricTypeSysID = currentMetricType.insert();
		// clone data from asmt_metric_category
		this.cloneMetricCategory(oldMetricTypeSysID,newMetricTypeSysID);
	},
	
	cloneMetricCategory:function(oldMetricTypeSysID,newMetricTypeSysID){
		var met_cat = new GlideRecord('asmt_metric_category');
		met_cat.query("metric_type",oldMetricTypeSysID);
		while(met_cat.next()){
			var catID = met_cat.getValue('sys_id');
			var isOrderNull = met_cat.order == '';
			met_cat.metric_type = newMetricTypeSysID;
			var newCatID = met_cat.insert();
			this.handleNullValues(met_cat,'asmt_metric_category',newCatID,isOrderNull);
			// clone data from asmt_metric
			this.cloneMetric(oldMetricTypeSysID,newMetricTypeSysID,catID,newCatID);
		}
	},
	
	cloneMetric:function(oldMetricTypeSysID,newMetricTypeSysID,catID,newCatID){
		var asmtMetric = new GlideRecord('asmt_metric');
		asmtMetric.addQuery("metric_type", oldMetricTypeSysID);
		asmtMetric.addQuery("category",catID);
		asmtMetric.orderBy("depends_on");
		asmtMetric.query();
		var originalToCloneMetricMap = {};
		while (asmtMetric.next()) {
			var metricId = asmtMetric.getValue('sys_id');
			var isDisplayYesNoNull = asmtMetric.displayed_when_yesno == '';
			asmtMetric.metric_type = newMetricTypeSysID;
			asmtMetric.category = newCatID;
			if(asmtMetric.depends_on != null && asmtMetric.depends_on != ''){
				asmtMetric.depends_on = originalToCloneMetricMap[asmtMetric.depends_on];
			}
			var newMetricID = asmtMetric.insert();
			originalToCloneMetricMap[metricId] = newMetricID;
			this.handleNullValues(asmtMetric,'asmt_metric',newMetricID,isDisplayYesNoNull);
			//clone data from asmt_metric_definition
			if(asmtMetric.getValue("datatype") == "imagescale"){
				this.cloneMetricDefinition(metricId,newMetricID,true);
			}
			else if(asmtMetric.getValue("datatype") != "numericscale"){
				this.cloneMetricDefinition(metricId,newMetricID,false);
			}
		}
		this.restoreReferences(newMetricTypeSysID);
	},
	
	cloneMetricDefinition:function(metricId,newMetricID,callAttachments){
		var met_def = new GlideRecord('asmt_metric_definition');
		met_def.query("metric", metricId);
		while (met_def.next()) {
			var metricDefID = met_def.getValue('sys_id');
			met_def.metric = newMetricID;
			var newMetricDefID = met_def.insert();
			metricDefinitionMap[metricDefID] = newMetricDefID;
			if(callAttachments)
				this.cloneAttachments(metricDefID,newMetricDefID);
		}
	},
	
	cloneAttachments:function(metricDefID,newMetricDefID){
		//copy the image attachments for imagescale question
		GlideSysAttachment.copy('asmt_metric_definition',metricDefID,'asmt_metric_definition',newMetricDefID);
	},
	
	handleNullValues:function(glideRecord,tableName, newSysId,checkNullParam){
		// If there are any null values for boolean type columns, set it to 0
		var gr = new GlideRecord('sys_dictionary');
		if(tableName == 'asmt_metric_type'){
			gr.addQuery('name',tableName);
			gr.addQuery('internal_type','boolean');
			gr.query();
			gr.next();
			while(gr.next()){
			if((glideRecord.getValue(gr.getValue('element'))) == null)
				glideRecord.setValue(gr.getValue('element'),0);
			}
		}else if (tableName == 'asmt_metric_category'){
			// If order is null in the asmt_metric_category, updating it to be null in the cloned survey.
			var newCategoryRecord = new GlideRecord(tableName);
			newCategoryRecord.get(newSysId);
			if(checkNullParam){
				newCategoryRecord.order = '';
				newCategoryRecord.update();
			}
		}else if(tableName == 'asmt_metric'){
			// If displayed_when_yesno is null in asmt_metric updating it to be null in the cloned survey.
			var newMetricRecord = new GlideRecord(tableName);
			newMetricRecord.get(newSysId);
			if(checkNullParam){
				newMetricRecord.setValue('displayed_when_yesno','');
				newMetricRecord.update();
			}
		}
	},
	
	/*
	* restoreReferences: this method is used to put the correct values for the choices in case of dependent questions.
	*/
	restoreReferences:function(metricID){
		var metric = new GlideRecord('asmt_metric');
		metric.addQuery('metric_type',metricID);
		metric.query();
		while(metric.next()){
			var isDisplayedWhenNull = metric.displayed_when == '';
			if(!isDisplayedWhenNull){
				//split by comma, get from map, and construct the new comma separated value
				var displayArray = metric.displayed_when.split(',');
				var originalDisplayWhenMap = new Array(displayArray.length);
				for(var i=0; i<displayArray.length; i++) {
					originalDisplayWhenMap[i] = metricDefinitionMap[displayArray[i]];
				}
				metric.displayed_when = originalDisplayWhenMap.join(',');
				metric.update();
			}
		}
	},
    
	type:'CloneSurvey'
};