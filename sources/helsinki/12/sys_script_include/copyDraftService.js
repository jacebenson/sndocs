function copyDraftService(oldServiceID, newServiceName) {
	var oldServiceGR = new GlideRecord("sc_ic_item_staging");
	if (!oldServiceGR.get(oldServiceID))
		return;
	
	if (newServiceName != null)
		oldServiceGR.name = newServiceName;
	else
		oldServiceGR.name = "Copy of " + current.name;
	oldServiceGR.state = 'draft';
	oldServiceGR.sc_cat_item = '';
	oldServiceGR.setWorkflow(false);
	var newServiceID = oldServiceGR.insert();
	copySections(oldServiceID, newServiceID);
	return newServiceID;
	
	function copySections(oldServiceID, newServiceID) {
		var sections = new GlideRecord('sc_ic_section');
		sections.addQuery('sc_ic_item_staging', oldServiceID);
		sections.query();
		while (sections.next()) {
			var oldSectionID = sections.sys_id.toString();
			sections.sc_ic_item_staging = newServiceID;
			sections.setWorkflow(false);
			var newSectionID = sections.insert();
			copyColumns(oldSectionID, newSectionID);
		}
	}
	
	function copyColumns(oldSectionID, newSectionID) {
		var columns = new GlideRecord('sc_ic_column');
		columns.addQuery('sc_ic_section', oldSectionID);
		columns.query();
		while (columns.next()) {
			var oldColumnID = columns.sys_id.toString();
			columns.sc_ic_section = newSectionID;
			var newColumnID = columns.insert();
			copyQuestions(oldColumnID, newColumnID);
		}
	}
	
	function copyQuestions(oldColumnID, newColumnID) {
		var questions = new GlideRecord('sc_ic_question');
		questions.addQuery('sc_ic_column', oldColumnID);
		questions.query();
		while (questions.next()) {
			var oldQuestionID = questions.sys_id.toString();
			questions.sc_ic_column = newColumnID;
			questions.sc_ic_section = questions.sc_ic_column.sc_ic_section;
			questions.sc_ic_item_staging = questions.sc_ic_column.sc_ic_section.sc_ic_item_staging;
			questions.policy_payload = stripPolicySysIDs(questions.policy_payload.toString());
			var newQuestionID = questions.insert();
			copyQuestionChoices(oldQuestionID, newQuestionID);
		}
	}
	
	function stripPolicySysIDs(payload) {
		var json = new JSON();
		var o = json.decode(payload);
		for (var i in o) {
			for (var j in o[i]) {
				if (j == "sys_id" || j == "action_sys_id")
					delete o[i][j];
			}
		}
		return json.encode(o);
	}
	
	function copyQuestionChoices(oldQuestionID, newQuestionID) {
		var choices = new GlideRecord('sc_ic_question_choice');
		choices.addQuery('sc_ic_question', oldQuestionID);
		choices.orderBy('order');
		choices.query();
		while (choices.next()) {
			choices.sc_ic_question = newQuestionID;
			choices.insert();
		}
	}
}