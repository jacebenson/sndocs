var DemoSCCreateItem = Class.create();
DemoSCCreateItem.prototype = {
    initialize: function() {
    },

	createCatalogItem : function() {
		// create a scoped category
		var category = new sn_sc.CatCategory();
		category.setAttributes({"title":"Roger 2"});
		var categorySysId = category.create();
		
		// create a scoped item
		var catalogItem = new sn_sc.CatItem();
		catalogItem.setAttributes({"name":"Andrew 18 My FirstCatItem"});
		catalogItem.setCatalogs("e0d08b13c3330100c8b837659bba8fb4");   // Service Catalog
		catalogItem.setCategories(categorySysId); // use scoped category
		
		var catItemSysId = catalogItem.create();
		
		this._addVariableSets(catItemSysId);
		this._createDefaultPicture(catItemSysId);
		
		return catItemSysId;
	},
	
	_addVariableSets : function(catItemSysId) {
		// List of all variable sets to attach
		var myVarSets = [];
		
		// Create variable set
		var myVarSetAttrs = {"name": "Requester details", "order": "100"};
		var myVarSet = new sn_sc.CatalogItemVariableSet();
		myVarSet.setAttributes(myVarSetAttrs);
		var myVarSetId = myVarSet.create(true);
		myVarSets.push(myVarSetId);
		
		// Create variables and attach them to the variable set created above
		var myVarAttrs = {"type": "6", "variable_set": myVarSetId, "question_text": "First Name", "name": "first_name"};
		var myVar = new sn_sc.CatalogItemVariable();
		myVar.setAttributes(myVarAttrs);
		myVar.create(true);
		
		myVarAttrs = {"type": "6", "variable_set": myVarSetId, "question_text": "Last Name", "name": "last_name"};
		myVar = new sn_sc.CatalogItemVariable();
		myVar.setAttributes(myVarAttrs);
		myVar.create(true);
		
		for	(var i = 0; i < myVarSets.length; i++) {
			var myCatItemVarSetM2m = new sn_sc.CatalogItemVariableSetM2M();
			var m2mAttrs = {"sc_cat_item": catItemSysId, "variable_set": myVarSets[i]}
			myCatItemVarSetM2m.setAttributes(m2mAttrs);
			myCatItemVarSetM2m.create(true);
		}
	},
	
	
	_createDefaultPicture : function(catItemSysId){
		// Create and add a picture for this cat item.
		var defaultPicture = "cdd98671eb1301003eadeb29a206febd";  // db_image record sys_id
		if (!gs.nil(defaultPicture))
			this._attachImage(defaultPicture, catItemSysId, "picture");
	},
	
	_attachImage: function (dbImageSysId, catItemSysId, type) {
		var catalogItem = new sn_sc.CatItem(catItemSysId);
		catalogItem.setImage(dbImageSysId, type);
	},
	
    type: 'DemoSCCreateItem'
};