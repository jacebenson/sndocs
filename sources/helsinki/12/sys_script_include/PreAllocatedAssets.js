var PreAllocatedAssets = Class.create();
PreAllocatedAssets.prototype = {
	initialize : function() {
	},

	/*
	 * splits the record given by the sys_id by the amount passed
	 */
	splitRecord : function(sys_id, amount) {
		var record = new GlideRecord('alm_asset');
		record.get(sys_id);
		record.quantity = record.quantity - amount;
		record.update();

		var duplicate = new GlideRecord(record.sys_class_name);
		duplicate.initialize();
		duplicate.model_category = record.model_category;
		duplicate.model = record.model;
		duplicate.install_status = record.install_status;
		duplicate.substatus = record.substatus;
		duplicate.stockroom = record.stockroom;
		duplicate.location = record.location;
		duplicate.managed_by = record.managed_by;
		duplicate.assigned_to = record.assigned_to;
		duplicate.company = record.company;
		duplicate.parent = record.parent;
		duplicate.quantity = amount;
		duplicate.cost = record.cost;
		return duplicate.insert();
	},

	type : 'PreAllocatedAssets'
};