(function process(g_request, g_response, g_processor) {

	if (g_request.getParameter('sysparm_request_type') == 'verify_signature') {
		var avs = new global.AssessmentVerifySignature();
		var answer = (avs.authorizedUser(g_request.getParameter('sysparm_user'), g_request.getParameter('sysparm_password'))) ? 'true' : 'false'
		g_processor.writeOutput(answer);
		return;
	} else
		processRequest();

	function processRequest(){
		var params = g_request.getParameterNames();
		var data = {};
		if(params.length>0){
			data = new global.JSON().decode(params[0]);
		}else{
			gs.log('Parameters are empty');
			g_processor.writeOutput(new global.JSON().encode({"success":"false","message":"Missing form parameters."}));
			return;
		}
		var instance_sysID = data["sysparm_instance_id"];
		var action_type = data["sysparm_action"];
		if (!instance_sysID) {
			gs.log('Error in submitting assessment instance');
			g_processor.writeOutput(new global.JSON().encode({"success":"false","message":"Missing assessment instance id."}));
			return;
		}
		if(action_type == "save" || action_type == "submit"){
			saveAssessment(instance_sysID, action_type, data);
		}else{
			g_processor.writeOutput(new global.JSON().encode({"success":"false","message":"unsupported action type."}));
		}
	}

	function isNil(str){
		return (str == null || str == "");
	}

	function saveAssessment(instance_sysID, action_type, data) {
		var inst = new GlideRecord("asmt_assessment_instance");
		inst.get(instance_sysID);
		var status = inst.state;
		var questionCount = 0;
		var questionAnswer = 0;
		var percentAnswered = 0;
		var signatureResult = null;
		var questionMap = {};
		var questionDefinitionMap = {};
		var definitionValueMap = {};
		var retake = false;
		if ((status == 'complete') && (inst.metric_type.allow_retake) && (inst.due_date > new GlideDateTime())) {
			status = 'wip'; // Store new results when saving a completed instance and retake is allowed.
			retake = true;
		}

		if (status == 'wip' || status == 'ready') {
			for(var param in data){
				if (param.startsWith('percent_answered')) {
					percentAnswered = data[param];
					continue;
				}
				if (param.startsWith('signature_result')) {
					signatureResult = data[param];
					continue;
				}
				if (param.startsWith('ASMTQUESTION:')) {
					var value = data[param];
					var result = saveResponse(param.substring('ASMTQUESTION:'.length), value);
					if (result > 0)
						questionAnswer++;
				}
				if (param.startsWith('sys_original.ASMTQUESTION:')) {
					questionCount++;
				}
				if(param.startsWith('ASMTDEFINITION:')){
					var definitionId = param.substring('ASMTDEFINITION:'.length, 'ASMTDEFINITION:'.length + 32);
					var questionId = param.split('_')[1];
					var selected = (isNil(data[param]) || data[param] == "false") ?  false : true;

					if(questionId in questionMap){
						if(!questionMap[questionId] && selected)
							questionMap[questionId] = true;
					}
					else
						questionMap[questionId] = selected;

					if(selected){
						if(questionId in questionDefinitionMap)
							questionDefinitionMap[questionId] += ","+definitionId;
						else
							questionDefinitionMap[questionId] = definitionId;
					}
				}
				else if(param.startsWith('ASMTDEFINITIONRANK:')){
					var definitionId = param.substring('ASMTDEFINITIONRANK:'.length, 'ASMTDEFINITIONRANK:'.length + 32);
					var questionId = param.split('_')[1];
					var value = data[param];
					questionMap[questionId] = "RANKING";

					if(!isNil(value)){
						if(questionId in questionDefinitionMap)
							questionDefinitionMap[questionId] += ","+definitionId;
						else
							questionDefinitionMap[questionId] = definitionId;

						definitionValueMap[definitionId] = value;
					}
				}
			}

			questionAnswer = saveMultipleCheckboxes(instance_sysID, questionMap, questionDefinitionMap, definitionValueMap, questionAnswer);

			if(action_type == 'submit')
				inst.taken_on = new GlideDateTime();
			saveStatus(inst, questionCount, questionAnswer, action_type, retake, percentAnswered, signatureResult);
			g_processor.writeOutput(new global.JSON().encode({"success":"true"}));
		}
	}

	function saveMultipleCheckboxes(instance, questionMap, questionDefinitionMap, definitionValueMap, questionAnswer){
		for(var key in questionMap){
			var qst = new GlideRecord("asmt_assessment_instance_question");
			qst.addQuery('instance', instance);
			qst.addQuery('metric', key);
			qst.query();
			if (!qst.next())
				continue;
			var source_table = qst.source_table;
			var source_id = qst.source_id;
			var metric = qst.metric;
			var category = qst.category;

			//delete
			var gr = new GlideRecord("asmt_assessment_instance_question");
			gr.addQuery('instance',instance);
			gr.addQuery('metric',metric);
			gr.addQuery('source_id',source_id);
			gr.addQuery('category',category);
			gr.deleteMultiple();

			var type = questionMap[key];
			if(type == "RANKING" || type){
				questionAnswer++;
				//insert for all values
				if (!questionDefinitionMap[key])
					continue;
				var arr = questionDefinitionMap[key].split(",");
				for(var i=0;i<arr.length;i++){
					var definitionId = arr[i];
					var metricDef = new GlideRecord('asmt_metric_definition');
					metricDef.addQuery('sys_id',definitionId);
					metricDef.query();
					if(metricDef.next()){
						var qstRecord = new GlideRecord("asmt_assessment_instance_question");
						qstRecord.initialize();
						qstRecord.source_table = source_table;
						qstRecord.source_id = source_id;
						qstRecord.metric = metric;
						qstRecord.category = category;
						qstRecord.instance = instance;
						qstRecord.metric_definition = definitionId;
						if(!isNil(type) && type == "RANKING"){
							qstRecord.value = definitionValueMap[definitionId];
						}
						else
							qstRecord.value = metricDef.getValue("value").toString();
						qstRecord.insert();
					}
				}
			}
			else{
				//insert
				var qstRecord = new GlideRecord("asmt_assessment_instance_question");
				qstRecord.initialize();
				qstRecord.source_table = source_table;
				qstRecord.source_id = source_id;
				qstRecord.metric = metric;
				qstRecord.category = category;
				qstRecord.instance = instance;
				qstRecord.insert();
			}
		}

		return questionAnswer;
	}

	function saveResponse(questionId, value) {
		var qst = new GlideRecord("asmt_assessment_instance_question");
		qst.get(questionId);
		var returnValue = 0;
		if (qst.isValid()) {
			if('string,datetime'.indexOf(qst.metric.datatype) >= 0){
				qst.value = 0;
				qst.string_value = value;
				if (value)
					returnValue = 1;
				else
					returnValue = -1;
			}else if('checkbox'.indexOf(qst.metric.datatype) >= 0){
				returnValue = 1;
				if (value == 'true' || value == 'on') {
					qst.value = 1;
					qst.string_value = 'true';
				} else {
					qst.value = 0;
					qst.string_value = 'false';
				}
			}else if('reference'.indexOf(qst.metric.datatype)>=0){
				qst.reference_id = value;
				if (value)
					returnValue = 1;
				else
					returnValue = -1;
			}else{
				qst.value = value;
				if (value)
					returnValue = 1;
				else
					returnValue = -1;
			}
			qst.update();
		}
		return returnValue;
	}

	function saveStatus(inst, questionCount, questionAnswer, action_type, retake, percentAnswered, signatureResult) {
		inst.percent_answered = percentAnswered;
		if (signatureResult)
			inst.signature_result = signatureResult;
		if(action_type == 'submit'){
			if(retake){
				inst.state = "wip";
			}else{
				inst.state = "complete";
			}
			inst.update();
		}else if(action_type == 'save'){
			if (inst.state != "complete")
				inst.state = "wip";
			inst.update();
		}
	}

})(g_request, g_response, g_processor);