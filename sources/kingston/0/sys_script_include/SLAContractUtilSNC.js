var SLAContractUtilSNC = Class.create();
SLAContractUtilSNC.prototype = {

	TABLE_CONTRACT_REL_CONTRACT_SLA: 'contract_rel_contract_sla',
	TABLE_CONTRACT_SLA: 'contract_sla', // SLA defition
	VIEW_CONTRACT_SLA_CONTRACT: 'contract_sla_contract',
	ATTR_CONTRACT: 'contract',
	ATTR_CONTRACT_SLA: 'contract_sla',
	ATTR_COLLECTION: 'collection',
	PROP_CONTRACT_TABLES: 'com.snc.sla.contract.tables',

	initialize: function() {},

	getAllSLAsQuery: function(collection){
		// Check active SLA Definitions
		var slaGR = new GlideRecord('contract_sla');
		slaGR.addActiveQuery();
		slaGR.addQuery(this.ATTR_COLLECTION, collection);
		// avoid service_offering_sla definitions, if they might exist
		if (slaGR.isValidField('sys_class_name'))
			slaGR.addQuery('sys_class_name', this.TABLE_CONTRACT_SLA);
		return slaGR;
	},

	slaHasContract: function(slaSysId) {
		var gr = new GlideAggregate(this.TABLE_CONTRACT_REL_CONTRACT_SLA);
		gr.addQuery(this.ATTR_CONTRACT_SLA, slaSysId);
		gr.addNotNullQuery(this.ATTR_CONTRACT);
		gr.addAggregate("COUNT");
		gr.query();
		return gr.next() && gr.getAggregate("COUNT") > 0;
	},

	isContractAttachedToSLA: function(contractSysId, slaSysId) {
		var gr = new GlideAggregate(this.TABLE_CONTRACT_REL_CONTRACT_SLA);
		gr.addQuery(this.ATTR_CONTRACT, contractSysId);
		gr.addQuery(this.ATTR_CONTRACT_SLA, slaSysId);
		gr.addAggregate("COUNT");
		gr.query();

		return gr.next() && gr.getAggregate("COUNT") > 0;
	},

	// Ignore 'Contract SLAs' mode of operation if com.snc.sla.contract.tables (CSV) property exists but does not contain current task.sys_class_name, or contract_rel_contract_sla table does not exist
	ignoreContract: function(classname) {
		// contract_rel_contract_sla table would not be there if plugin is not installed
		if (!new GlideRecord(this.TABLE_CONTRACT_REL_CONTRACT_SLA).isValid())
			return true;
		var contractTables = gs.getProperty(this.PROP_CONTRACT_TABLES);
		if (contractTables == null)
			return false;
		var list = contractTables.replaceAll(' ', '').split(',');
		return !(new ArrayUtil().contains(list, classname));
	},

	hasContractProperty: function() {
		return gs.getProperty(this.PROP_CONTRACT_TABLES) != null;
	},

	getContractualSLAs: function(contract, collection, includeNonContractual) {
		var gr = this.getAllSLAsQuery(collection);
		var joinQuery = gr.addJoinQuery(this.VIEW_CONTRACT_SLA_CONTRACT, 'sys_id', 'sla_sys_id');
		joinQuery.addCondition("cntr_contract", contract);
		if (includeNonContractual)
			joinQuery.addOrCondition("cntr_contract", 'NULL');
		return gr;
	},

	processNonContractualSLAs: function(contractGR) {
		return contractGR.process_non_contractual_slas == true;
	},

	getNonContractualSLAs: function(collection) {
		var gr = this.getAllSLAsQuery(collection);
		var joinQuery = gr.addJoinQuery(this.VIEW_CONTRACT_SLA_CONTRACT, 'sys_id', 'sla_sys_id');
		joinQuery.addCondition("cntr_contract", 'NULL');
		return gr;
	},

	type: 'SLAContractUtilSNC'
};