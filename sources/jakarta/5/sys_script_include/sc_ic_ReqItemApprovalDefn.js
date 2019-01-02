var sc_ic_ReqItemApprovalDefn = Class.create();
sc_ic_ReqItemApprovalDefn.prototype = Object.extendsObject(sc_ic_Base,{
    initialize: function(_gr,_gs) {
        sc_ic_Base.prototype.initialize.call(this,_gr,_gs);

        if (this._gr.getTableName() != sc_ic.REQ_ITEM_APRVL_DEFN) {
            this._log.error("Invalid GlideRecord provided when instanciating sc_ic_ReqItemApprovalDefn");
            throw new sc_ItemCreatorException("Invalid GlideRecord provided when instanciating sc_ic_ReqItemApprovalDefn");
        }
    },

	getApprovers: function() {
		var approvers = {};
		approvers.users = []
		approvers.groups = [];
		
		switch(this._gr.getValue('type')) {
			case sc_ic.USER:
				if (!GlideStringUtil.nil(this._gr.getValue(sc_ic.USER)))
					approvers.users.push(this._gr.getValue(sc_ic.USER));
				break;
			case sc_ic.GROUP:
				if (!GlideStringUtil.nil(this._gr.getValue(sc_ic.GROUP)))
					approvers.groups.push(this._gr.getValue(sc_ic.GROUP));
				break;
			case sc_ic.PREDEFINED_APPROVAL:
				if (!GlideStringUtil.nil(this._gr.getValue(sc_ic.APRVL_TYPE_DEFN))) {
					var aprvlTypeApprovers = sc_ic_Factory.wrap(this._gr[sc_ic.APRVL_TYPE_DEFN].getRefRecord()).getApprovers();
					if (aprvlTypeApprovers.users)
						approvers.users = new ArrayUtil().concat(approvers.users, aprvlTypeApprovers.users);
					if (aprvlTypeApprovers.groups)
						approvers.groups = new ArrayUtil().concat(approvers.groups, aprvlTypeApprovers.groups);
				}
				break;
		}
		
		return approvers;
	},
	
	_copyFields: function(source) {
		this._gr.order = source.order;
		this._gr.type = source.type;
		this._gr.detail = source.detail;
		switch (source.type+"") {
			case sc_ic.USER:
				this._gr[sc_ic.USER] = source[sc_ic.USER];
				break;
			case sc_ic.GROUP:
				this._gr[sc_ic.GROUP] = source[sc_ic.GROUP];
				break;
			case sc_ic.PREDEFINED_APPROVAL:
				this._gr[sc_ic.APRVL_TYPE_DEFN] = source[sc_ic.APRVL_TYPE_DEFN_STAGING][sc_ic.APRVL_TYPE_DEFN];
				break;
		}
				
		return this;
	},
	
	_copyReferences: function(source) {
		//No references to copy for this type of record.  Included so customers can overload in future.
		return this;
	},
	
    type: 'sc_ic_ReqItemApprovalDefn'
});

/**
 * Creates an approval definition for a requested item from a published approval definition
 */
sc_ic_ReqItemApprovalDefn.create = function(reqItem, source) {
	var reqItemApprovalDefnGr = new GlideRecord(sc_ic.REQ_ITEM_APRVL_DEFN);
	reqItemApprovalDefnGr.sc_req_item = reqItem.getUniqueValue();
	
	var reqItemApprovalDefn = sc_ic_Factory.wrap(reqItemApprovalDefnGr);
	reqItemApprovalDefn._copyFields(source);
	reqItemApprovalDefnGr.insert();
	reqItemApprovalDefn._copyReferences(source);
	
	return reqItemApprovalDefnGr;
};