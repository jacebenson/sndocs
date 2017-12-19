var sc_ic_CatalogItemVariableChoice = Class.create();
sc_ic_CatalogItemVariableChoice.prototype = Object.extendsObject(sc_ic_Base,{
    initialize: function(_gr, _gs) {
		sc_ic_Base.prototype.initialize.call(this, _gr, _gs);
    },

	/**
	 * Copy fields from the source and relate the choice to the given variable Gr
	 */
	_copyFields: function(source) {
		this._log.debug("[_copyFields] Starting choice data copy");
		this._gr.text = source.text;
		this._gr.value = source.value;
		this._gr.misc = source.cost.getCurrencyString();
		this._gr.rec_misc = source.recurring_cost.getCurrencyString();
		this._gr.order = source.order;
	},
	
    type: 'sc_ic_CatalogItemVariableChoice'
});

sc_ic_CatalogItemVariableChoice.create = function(prnt, source) {
    var vcGr = new GlideRecord(sc_.QUESTION_CHOICE);
	vcGr.question = prnt.getUniqueValue();
	
	var varChoice = sc_ic_Factory.wrap(vcGr);
	varChoice._copyFields(source);
	vcGr.insert();
	
	return vcGr;
};