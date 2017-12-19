var sc_ic_QuestionClass = Class.create();
sc_ic_QuestionClass.prototype = Object.extendsObject(sc_ic_Base,{
    initialize: function(_gr,_gs) {
		sc_ic_Base.prototype.initialize.call(this,_gr,_gs);
    },

    type: 'sc_ic_QuestionClass'
});

sc_ic_QuestionClass.getAvailableClasses = function () {
	var log = new GSLog(sc_ic.LOG_LEVEL,"sc_ic_QuestionClass").setLog4J();
	
	var questionClassTypes = {};
	var questionClassGr = new GlideRecord(sc_ic.QUESTION_CLASS);
	questionClassGr.addActiveQuery();
	questionClassGr.orderBy("name");
	questionClassGr.query();
	
	while (questionClassGr.next())
		questionClassTypes[questionClassGr[sc_ic.TYPE]+""] = !questionClassGr[sc_ic.PRECONFIGURED_ONLY];
	
	var questionTypeGr = new GlideAggregate(sc_ic.QUESTION_TYPE);
	questionTypeGr.addActiveQuery();
	questionTypeGr.addQuery(sc_ic.QUESTION_CLASS + "." + sc_ic.PRECONFIGURED_ONLY, true);
	questionTypeGr.groupBy(sc_ic.QUESTION_CLASS);
	questionTypeGr.query();
	
	while (questionTypeGr.next())
		questionClassTypes[questionTypeGr[sc_ic.QUESTION_CLASS]+""] = true;
	
	var refQual = "typeIN0";
	for (questionType in questionClassTypes) {
		if (questionClassTypes[questionType])
			refQual += "," + questionType;
	}
	
	log.debug("[getAvailableClasses] Ref Qualifier: " + refQual);
	return refQual;
};