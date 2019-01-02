var sc_ic_QuestionChoice = Class.create();
sc_ic_QuestionChoice.prototype = Object.extendsObject(sc_ic_Base, {
    initialize: function(_gr,_gs) {
		sc_ic_Base.prototype.initialize.call(this,_gr,_gs);
    },

	itemQuestionChanged: function() {
		if (JSUTIL.nil(this._gr[sc_ic.QUESTION]) || JSUtil.nil(this._gr[sc_ic.QUESTION][sc_ic.ITEM_STAGING]))
			return;
		
		var item = new GlideRecord(sc_ic.ITEM_STAGING);
		if (item.get(this._gr[sc_ic.QUESTION][sc_ic.ITEM_STAGING]))
			sc_ic_Factory.wrap(item).questionChanged();
	},
	
	getNextOrderNumber: function() {
		var questionChoiceGr = new GlideAggregate(sc_ic.QUESTION_CHOICE);
		questionChoiceGr.addAggregate("MAX", "order");
		questionChoiceGr.addNotNullQuery("order");
		questionChoiceGr.addQuery(sc_ic.QUESTION, this._gr[sc_ic.QUESTION]);
		questionChoiceGr.groupBy(sc_ic.QUESTION);
		questionChoiceGr.query();
	
		if (questionChoiceGr.next()) {
			return "" + (100 + parseInt(questionChoiceGr.getAggregate("MAX", "order"), 10));
		}
	
		return 100;
	},

	setQuestionChoiceChangedOnItem: function() {
		var itemStagingGr = new GlideRecord(sc_ic.ITEM_STAGING);
		if (itemStagingGr.get(this._gr[sc_ic.QUESTION][sc_ic.ITEM_STAGING])) {
			this._log.debug("[setQuestionChoiceChangedOnItem] Changed Item " + this._gr[sc_ic.ITEM_STAGING]);
			sc_ic_Factory.wrap(itemStagingGr).questionDefinitionChanged();
		}
	},
	
    type: 'sc_ic_QuestionChoice'
});