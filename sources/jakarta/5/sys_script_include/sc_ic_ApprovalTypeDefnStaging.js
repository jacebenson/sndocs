var sc_ic_ApprovalTypeDefnStaging = Class.create();
sc_ic_ApprovalTypeDefnStaging.prototype = Object.extendsObject(sc_ic_BaseTypeDefnStaging,{
    initialize: function(_gr,_gs) {
        sc_ic_Base.prototype.initialize.call(this,_gr,_gs);

        if (this._gr.getTableName() != sc_ic.APRVL_TYPE_DEFN_STAGING) {
            this._log.error("Invalid GlideRecord provided when instanciating sc_ic_ApprovalTypeDefnStaging");
            throw new sc_ItemCreatorException("Invalid GlideRecord provided when instanciating sc_ic_ApprovalTypeDefnStaging");
        }
		// Fields that trigger the approval changing to draft
		this._toDraft = {'name': true, 'description': true, 'type':true, 'users':true,
						 'groups':true,'script_output': true, 'approver_script': true};
    },
	
	/**
	 * Published the approval definition expiring the currently published version
	 */
	publish: function() {
		this._publishToTable(sc_ic.APRVL_TYPE_DEFN);
	},
	
	isPublished: function() {
		return JSUtil.notNil(this._gr[sc_ic.APRVL_TYPE_DEFN]);
	},
	
	/**
	 * Expires the current & it's "Published Definition" record
	 */
	setExpired: function() {
	    this._gr[sc_ic.STATE] = sc_ic.EXPIRED;
		this._gr[sc_.ACTIVE] = false;
		return this;
	},
	
	/**
	 * Expires this record and the published record
	 */
	expire: function() {
		this.setExpired();
		this._gr.update();
		if (!this._gr.isActionAborted() && !JSUtil.nil(this._gr[sc_ic.APRVL_TYPE_DEFN]))
			sc_ic_Factory.wrap(this._gr[sc_ic.APRVL_TYPE_DEFN].getRefRecord()).expire();
	},
	
    type: 'sc_ic_ApprovalTypeDefnStaging'
});