// Discovery class

/**
 * A javascript MakeAndModel class to replace the Java class
 * Aleck Lin aleck.lin@servicenow.com
 */

var MakeAndModelJS = Class.create();

MakeAndModelJS.fromNames = function(make, model, model_type) {
	var mm = new MakeAndModelJS(make, model, determineModelType(model_type));		
	return mm;
};

function determineModelType(model_type) {
	if (JSUtil.nil(model_type))
		return "cmdb_model";
	
	if (model_type.indexOf("cmdb_") == 0)
		return model_type;
	
    var mtype = model_type.toLowerCase();	
	if (mtype == "hardware")
		return "cmdb_hardware_product_model";
	
	if (mtype == "consumable")
		return "cmdb_consumable_product_model";
	
	if (mtype == "software")
		return "cmdb_software_product_model";
	
	if (mtype == "application")
		return "cmdb_application_product_model";
	
    return "cmdb_model";
}

MakeAndModelJS.prototype = {
    initialize: function(make, model, model_table) {
		this.manufacturer = make;
		this.model = model;
		this.model_table =  JSUtil.nil(model_table) ? "cmdb_model" : model_table;
		
		this.manufacturerSysID = null;
		this.modelSysID = null;
		
		this._findOrCreateMakeAndModel();	
    },
	
	getManufacturerSysID: function() {
		return this.manufacturerSysID;
	},
	
	getModelNameSysID: function() {
		return this.modelSysID;
	},
	
	_findOrCreateMakeAndModel: function() {
		this._findOrCreateManufacturer();
		this._findOrCreateModel();		
	},
	
	_findOrCreateManufacturer: function() {
		// if we have a manufacturer name, find it or make it...
		if (JSUtil.nil(this.manufacturer))
			return;
		
		var companySysID = "";
		
		// First attempt to find it canonical version
		if (this._useCanonicalLookup()){
			companySysID = SNC.CanonicalName.normalizeCompany(this.manufacturer, false);
			this.manufacturerSysID = companySysID;
		}

		if (gs.nil(companySysID)) {
			var companyName = this.manufacturer;
			if (this._useCanonicalLookup())
				companyName = SNC.CanonicalName.normalizeCompany(this.manufacturer, true);

			var gr = new GlideRecord("core_company");
			gr.addQuery("name", companyName);
			gr.query();
			if (gr.next())
				this.manufacturerSysID = gr.sys_id + '';
			else {
				gr.initialize();
				gr.setValue("name", companyName);
				this.manufacturerSysID = gr.insert();
			}
		}
	},

	_findOrCreateModel: function() {
		// if we have a model name, find it or make it...
		if (JSUtil.nil(this.model))
			return;

		var gr = new GlideRecord(this.model_table);
		gr.addQuery("name", this.model);
		if (this.manufacturerSysID != null)
			gr.addQuery("manufacturer", this.manufacturerSysID);
		else
			gr.addNullQuery("manufacturer");
		gr.query();
		if (gr.next())
			this.modelSysID = gr.sys_id + '';
		else {
			gr.initialize();
			gr.name = this.model;
			if (this.manufacturerSysID != null)
				gr.manufacturer = this.manufacturerSysID;
			this.modelSysID = gr.insert();
		}
	},

	_useCanonicalLookup: function() {
		if (pm.isActive("com.glide.data_services_canonicalization.client") &&
				(gs.getProperty("glide.cmdb.canonical.discovery.enabled") == "true" &&
				 gs.getProperty("glide.cmdb.canonical.always_run") == "false"
				))
			return true;

		return false;
	},

    type: 'MakeAndModelJS'
};