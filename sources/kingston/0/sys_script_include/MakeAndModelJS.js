// Discovery class

/**
 * A javascript MakeAndModel class to replace the Java class
 * Aleck Lin aleck.lin@servicenow.com
 *
 * June 2017 - This used to contain much duplicated logic from MakeAndModel*.java.  PRB702376
 *    refactored this to use MakeAndModel.java (callable from your script as class SncMakeAndModel)
 *    so can maintain logic in a single location, yet keep this script backwards compatible.
 */
var MakeAndModelJS = Class.create();

/**
 * Creates a new instance of this class from the given names.  If the given manufacturer name is not nil, then the matching record
 * in the core_company is located (and created, if necessary).  Similarly, if the given model name is not nil, then the matching
 * record in the model table is located (and created, if necessary).  If the model name is given but the manufacturer is not,
 * then the record in the model table will have a null reference to the core_company table.
 * 
 * @param mfrName The manufacturer name.
 * @param modelName The model name.
 * @param modelType The model type name.  Alternatively, you can specify a table name "cmdb_model" or any subclass
 *   of that table, but table name must start with 'cmdb_'.
 * @return The MakeAndModel instance created.
 */
MakeAndModelJS.fromNames = function(make, model, modelType) {
	var modelTable = SncMakeAndModel.determineModelTableName(modelType);
	var makeAndModelJava = SncMakeAndModel.fromNames(make, model, modelTable);		
	var mm = new MakeAndModelJS(makeAndModelJava);		
	return mm;
};

// If you need to customize the model type -> model table name mapping to differ from below,
// change call above from 'SncMakeAndModel.determineModelTableName(...)' to 'determineModelTableName(...)',
// and customize this function:
/*
function determineModelTableName(model_type) {
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
*/

MakeAndModelJS.prototype = {
    initialize: function(makeAndModelJava) {
		this.makeAndModelJava = makeAndModelJava;
    },
	
	getManufacturerSysID: function() {
		return this.makeAndModelJava.getManufacturerSysID() + '';
	},
	
	getModelNameSysID: function() {
		return this.makeAndModelJava.getModelNameSysID() + '';
	},
	
    type: 'MakeAndModelJS'
};