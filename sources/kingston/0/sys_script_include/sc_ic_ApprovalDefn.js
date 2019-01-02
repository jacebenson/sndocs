var sc_ic_ApprovalDefn = Class.create();
sc_ic_ApprovalDefn.prototype = Object.extendsObject(sc_ic_Base,{
    initialize: function(_gr,_gs) {
        sc_ic_Base.prototype.initialize.call(this,_gr,_gs);
    },
		
	_copyFields: function(source) {
		this._gr.active = source.active;
		this._gr.order = source.order;
		this._gr.type = source.type;
		this._gr.detail = source.detail;
		switch (source.getValue("type")) {
			case sc_ic.USER:
				this._gr[sc_ic.USER] = source[sc_ic.USER];
				break;
			case sc_ic.GROUP:
				this._gr[sc_ic.GROUP] = source[sc_ic.GROUP];
				break;
			case sc_ic.PREDEFINED_APPROVAL:
				this._gr[sc_ic.APRVL_TYPE_DEFN_STAGING] = source[sc_ic.APRVL_TYPE_DEFN_STAGING];
				break;
		}
		return this;
	},
	
	_copyReferences: function(source) {
		//No references to copy for this type of record.  Included so customers can overload in future.
		return this;
	},
	
    type: 'sc_ic_ApprovalDefn'
});

/**
 * Creates an approval definition from a staging approval definition
 */
sc_ic_ApprovalDefn.create = function(catItem, source) {
	var approvalDefnGr = new GlideRecord(sc_ic.APRVL_DEFN);
	approvalDefnGr.sc_cat_item = catItem.getUniqueValue();

	var approvalDefn = sc_ic_Factory.wrap(approvalDefnGr);
	approvalDefn._copyFields(source);
	approvalDefnGr.insert();
	approvalDefn._copyReferences(source);
	
	return approvalDefnGr;
};