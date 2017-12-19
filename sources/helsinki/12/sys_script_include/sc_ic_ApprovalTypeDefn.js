var sc_ic_ApprovalTypeDefn = Class.create();
sc_ic_ApprovalTypeDefn.prototype = Object.extendsObject(sc_ic_Base,{
    initialize: function(_gr,_gs) {
        sc_ic_Base.prototype.initialize.call(this,_gr,_gs);

        if (this._gr.getTableName() != sc_ic.APRVL_TYPE_DEFN) {
            this._log.error("Invalid GlideRecord provided when instanciating sc_ic_ApprovalTypeDefn");
            throw new sc_ItemCreatorException("Invalid GlideRecord provided when instanciating sc_ic_ApprovalTypeDefn");
        }
    },
	
	setExpired: function() {
		this._gr.active = false;
		return this;
	},
	
	expire: function() {
		this.setExpired();
		this._gr.update();
	},

	_copyFields: function(source) {
		this._log.debug("[_copyFields] Starting approval type definition copy");
		this._gr.name = source.name;
		this._gr.description = source.description;
		this._gr.type = source.type;
		this._gr.users = source.users;
		this._gr.groups = source.groups;
		this._gr.script_output = source.script_output;
		this._gr.approver_script = source.approver_script;
		this._gr[sc_ic.APRVL_TYPE_DEFN_STAGING] = source.getUniqueValue();
		this._gr[sc_.IC_VERSION] = source[sc_ic.VERSION];
		return this;
	},
	
	_copyReferences: function(source) {
		//No references to copy for this type of record.  Included so customers can overload in future.
		return this;
	},
	
	getApprovers: function() {
		var approvers = {};
		approvers.users = []
		approvers.groups = [];
		
		var aprvlDefnType = this._gr.getValue(sc_ic.TYPE);
		
		switch(aprvlDefnType) {
			case sc_ic.USER:
				if (!GlideStringUtil.nil(this._gr.getValue(sc_ic.USERS)))
					approvers.users.push(this._gr.getValue(sc_ic.USERS) + "");
				break;
			
			case sc_ic.GROUP:
				if (!GlideStringUtil.nil(this._gr.getValue(sc_ic.GROUPS)))
					approvers.groups.push(this._gr.getValue(sc_ic.GROUPS) + "");
				break;
	
			case sc_ic.SCRIPT:
				if (!GlideStringUtil.nil(this._gr.getValue(sc_ic.APPROVER_SCRIPT)))
					var scriptedApprovers = this._processApprovalScript(this._gr.getValue(sc_ic.SCRIPT_OUTPUT), this._gr.getValue(sc_ic.APPROVER_SCRIPT));
					if (scriptedApprovers.users)
						approvers.users = new ArrayUtil().concat(approvers.users, scriptedApprovers.users);
					if (scriptedApprovers.groups)
						approvers.groups = new ArrayUtil().concat(approvers.groups, scriptedApprovers.groups);
				break;
				
			default:
				if (this._log.atLevel(GSLog.ERR))
					this._log.error("Unexpected type '" + aprvlDefnType + "' when processing " + this._gr.getClassDisplayValue() + " '" + this._gr.getDisplayValue() + "'");
		}

		return approvers;
	},
	
	_processApprovalScript: function(scriptReturns, approverScript) {
		var approvers = {};
		approvers.users = []
		approvers.groups = [];
		
		if (GlideStringUtil.nil(approverScript))
			return approvers;

		var approverScriptResult = GlideEvaluator.evaluateString(approverScript);
		
		if (GlideStringUtil.nil(approverScriptResult))
			return approvers;
		
		switch(scriptReturns) {
			case 'users':
				var userGr = new GlideRecord(sc_.USER);
				userGr.addQuery('sys_id','IN',approverScriptResult);
				userGr.addActiveQuery();
				userGr.query();
				while (userGr.next())
					approvers.users.push(userGr.getValue('sys_id'));
				break;

			case 'groups':
				var groupGr = new GlideRecord(sc_.GROUP);
				groupGr.addQuery('sys_id','IN',approverScriptResult);
				groupGr.addActiveQuery();
				groupGr.query();
				while (groupGr.next())
					approvers.groups.push(groupGr.getValue('sys_id'));
				break;
				
			default:
				if (this._log.atLevel(GSLog.ERR))
					this._log.error("Unexpected script returns value '" + scriptReturns + "' when processing " + this._gr.getClassDisplayValue() + " '" + this._gr.getDisplayValue() + "'");
		}
		
		if (this._log.atLevel(GSLog.DEBUG))
			this._log.debug("[_processApprovalScript] result of running approval script \"" + this._gr.getDisplayValue() + "\":" +
							"\n    approvers.users=" + approvers.users +
				            "\n    approvers.groups=" + approvers.groups);
		
		return approvers;
	},
	
    type: 'sc_ic_ApprovalTypeDefn'
});

/**
 * Creates an approval type definition from a stages approval type definition
 */
sc_ic_ApprovalTypeDefn.create = function(source) {
	var atd = new GlideRecord(sc_ic.APRVL_TYPE_DEFN);
	var typeDef = sc_ic_Factory.wrap(atd);
	
	typeDef._copyFields(source);
	atd.insert();
	typeDef._copyReferences(source);
	
	return atd;
};