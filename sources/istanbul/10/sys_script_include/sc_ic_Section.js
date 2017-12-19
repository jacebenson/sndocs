var sc_ic_Section = Class.create();
sc_ic_Section.prototype = Object.extendsObject(sc_ic_Base, {
    initialize: function(_gr,_gs) {
		sc_ic_Base.prototype.initialize.call(this,_gr,_gs);

		this._defnChgFld = {
			"index": true,
			"label":true
		};
    },
	
	sectionChanged: function() {
		for (var key in this._defnChgFld)
			if (this._defnChgFld[key] && this._gr[key].changes()) {
				this._log.debug("[sectionChanged] Section has changed");
				return true;
			}
		
		return false;
	},

	setLayoutChangedOnItem: function() {
		var iGr = new GlideRecord(sc_ic.ITEM_STAGING);
		if (iGr.get(this._gr[sc_ic.ITEM_STAGING])) {
			this._log.debug("[setLayoutChangedOnItem] Changed Item " + this._gr[sc_ic.ITEM_STAGING]);
			sc_ic_Factory.wrap(iGr).layoutChanged();
		}
	},
	
	createDefaultColumns: function() {
		var columnGr = new GlideRecord(sc_ic.COLUMN);
		columnGr[sc_ic.SECTION] = this._gr.getUniqueValue();
		columnGr.name = "Left column";
		columnGr[sc_ic.INDEX] = 0;
		columnGr.insert();
			
		columnGr.initialize();
		columnGr[sc_ic.SECTION] = this._gr.getUniqueValue();
		columnGr.name = "Right column";
		columnGr[sc_ic.INDEX] = 1;
		columnGr.insert();
	},
	
	isDuplicate: function() {
		if (JSUtil.nil(this._gr[sc_ic.ITEM_STAGING]) || JSUtil.nil(this._gr[sc_ic.INDEX]))
			return false;
		
		var sectionGr = new GlideRecord(sc_ic.SECTION);
		sectionGr.addQuery(sc_ic.ITEM_STAGING, this._gr[sc_ic.ITEM_STAGING]);
		sectionGr.addQuery(sc_ic.INDEX, this._gr[sc_ic.INDEX]);
		sectionGr.query();
				
		if (sectionGr.hasNext())
			return true;
		
		return false;
	},
	
	getNextQuestionOrderNumber: function() {
		var questionGr = new GlideAggregate(sc_ic.QUESTION);
		questionGr.addAggregate("MAX", "order");
		questionGr.addNotNullQuery("order");
		questionGr.addQuery(sc_ic.SECTION, this._gr.getUniqueValue());
		questionGr.groupBy(sc_ic.SECTION);
		questionGr.query();
	
		if (questionGr.next()) {
			return "" + (1 + parseInt(questionGr.getAggregate("MAX", "order"), 10));
		}
	
		return 1;
	},
	
	isProducerServiceItem: function() {
		return JSUtil.nil(this._gr[sc_ic.ITEM_STAGING][sc_ic.ITEM_TYPE]) || this._gr[sc_ic.ITEM_STAGING][sc_ic.ITEM_TYPE] == "sc_cat_item_producer_service";	
	},
	
	isUsedByQuestions: function() {
		var questionGr = new GlideAggregate(sc_ic.QUESTION);
		questionGr.addQuery(sc_ic.SECTION, this._gr.getUniqueValue());
		questionGr.addAggregate("COUNT");
		questionGr.query();
		
		if (questionGr.next() & questionGr.getAggregate("COUNT") > 0)
			return true;
			
		return false;
	},

    type: 'sc_ic_Section'
});

sc_ic_Section.getNextPosition = function(itemSysId, returnDisplayValue) {
	var nextPosition = (returnDisplayValue ? 1 : 0);

	if (JSUtil.nil(itemSysId))
		return nextPosition;
	
	var sectionGr = new GlideAggregate(sc_ic.SECTION);
	sectionGr.addAggregate("MAX", "index");
	sectionGr.addQuery(sc_ic.ITEM_STAGING, itemSysId);
	sectionGr.groupBy(sc_ic.ITEM_STAGING);
	sectionGr.query();
	
	if (sectionGr.next()) {
		return "" + (nextPosition + 1 + parseInt(sectionGr.getAggregate("MAX", "index"), 10));
	}
	
	return nextPosition;
};