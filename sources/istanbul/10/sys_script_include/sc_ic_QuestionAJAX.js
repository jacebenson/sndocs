var sc_ic_QuestionAJAX = Class.create();
sc_ic_QuestionAJAX.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	getDefaultQuestionType : function() {
		var questionClassSysId = this.getParameter("sysparm_sc_ic_question_class");
		if (JSUtil.nil(questionClassSysId))
			return "";

		var data = {};
		data[sc_ic.QUESTION_CLASS] = questionClassSysId;
		var questionTypeIds = sc_ic_Factory.getWrapperClass(sc_ic.QUESTION_TYPE).getTypesByClass(data);

		if (JSUtil.nil(questionTypeIds))
			return "";

		return questionTypeIds.replace(/^sys_idIN0/,"").replace(/^,/,"");
	},

	isPublic: function() {
		return false;
	},

    type: 'sc_ic_QuestionAJAX'
});