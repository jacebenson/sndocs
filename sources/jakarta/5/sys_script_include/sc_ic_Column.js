var sc_ic_Column = Class.create();
sc_ic_Column.prototype = Object.extendsObject(sc_ic_Base, {
    initialize: function(_gr,_gs) {
		sc_ic_Base.prototype.initialize.call(this,_gr,_gs);
		this._defnChgFld = {
			"index": true
		};
    },
	
	columnChanged: function() {
		for (var key in this._defnChgFld)
			if (this._defnChgFld[key] && this._gr[key].changes()) {
				this._log.debug("[columnChanged] Column has changed");
				return true;
			}
		
		return false;
	},

	setLayoutChangedOnItem: function() {
		var iGr = new GlideRecord(sc_ic.ITEM_STAGING);
		if (iGr.get(this._gr[sc_ic.SECTION][sc_ic.ITEM_STAGING])) {
			this._log.debug("[setLayoutChangedOnItem] Changed Item " + iGr.getDisplayValue());
			sc_ic_Factory.wrap(iGr).layoutChanged();
		}
	},
	
	publish: function() {
	},
	
	isUsedByQuestions: function() {
		var questionGr = new GlideAggregate(sc_ic.QUESTION);
		questionGr.addQuery(sc_ic.COLUMN, this._gr.getUniqueValue());
		questionGr.addAggregate("COUNT");
		questionGr.query();
		
		if (questionGr.next() & questionGr.getAggregate("COUNT") > 0)
			return true;
			
		return false;
	},

    type: 'sc_ic_Column'
});