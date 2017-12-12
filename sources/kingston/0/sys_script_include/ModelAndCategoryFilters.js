var ModelAndCategoryFilters = Class.create();
ModelAndCategoryFilters.prototype = {
	initialize : function() {
	},
	
	/*
     * Configuration Item model reference
     */
	ciModelRefQual: function(ci) {
	    // when creating a CI, we always allow models with no category
		var refQual = 'cmdb_model_categoryISEMPTY';
	   
	    // add an OR filter to get only the models that match the class of CI we are creating
	    var ciClass = this._getCIClass(ci);		
		var category = new GlideRecord('cmdb_model_category');
		category.addQuery('cmdb_ci_class', ciClass);
		category.query();
	    if (category.next())
		    refQual += '^ORcmdb_model_categoryLIKE' + category.sys_id; 
	   
	    return refQual;
    },

	/*
	 * Model category reference qualifier based on asset class and whether or
	 * not model is already set
	 */
	assetModelCategoryRefQual : function(asset) {
		var refQual = '';
		var assetClass = this._getAssetClass(asset);
		if (assetClass == 'alm_asset') {
			// real assets must be declared as such by the category or come from
			// a bundle
			refQual = 'asset_class=alm_asset^ORbundle=true';
		} else if (assetClass == 'alm_consumable') {
			// consumable can be declared directly by the category or by model
			// overriding a core asset category
			refQual = 'asset_class!=alm_license';
		} else {
			// other alm_asset extensions are just a direct mapping to the
			// asset_class defined in category
			refQual = 'asset_class=' + assetClass;
		}

		if (asset.model.toString() != '') {
			// refine qualifier if model is already set
			var model = new GlideRecord('cmdb_model');
			model.get(asset.model.toString());
			refQual = refQual + '^sys_idIN' + model.cmdb_model_category;
		}

		return refQual;
	},

	/*
	 * Model reference qualifier based on asset class and whether or not model
	 * category is already set
	 */
	assetModelRefQual : function(asset) {
		var categoryClause = '';
		var isCategoryDefined = (asset.model_category.toString() != '');
		var isCategoryConsumable = false;
		var isCategoryBundle = false;
		var assetClass = this._getAssetClass(asset);

		if (isCategoryDefined) {
			var category = new GlideRecord('cmdb_model_category');
			category.get(asset.model_category.toString());
			categoryClause = 'cmdb_model_categoryLIKE' +
					category.sys_id.toString();
			if (category.asset_class.toString() == 'alm_consumable')
				isCategoryConsumable = true;
			if (category.bundle.toString() == 'true')
				isCategoryBundle = true;
		} else {
			// when category is not specified, we should still narrow down based
			// on the possible categories for the record's actual table
			categoryClause = this
					._getCategoriesProducingAssetClassOrClause(assetClass);
		}
		var refQual = categoryClause;

		// refine filter based on asset tracking strategy of the models
		if (assetClass != 'alm_consumable') {
			if (refQual != '')
				refQual = refQual + '^';
			// exclude models that force tracking as consumable or no asset at
			// all
			refQual = refQual + 'asset_tracking_strategy=leave_to_category';
		} else {
			if (isCategoryDefined == true) {
				if (refQual != '')
					refQual = refQual + '^';
				if (isCategoryConsumable == true) {
					// exclude models that force no tracking
					refQual = refQual + 'asset_tracking_strategy!=do_not_track';
				} else {
					// exclude models that don't force tracking as consumable
					// for categories other than consumable
					refQual = refQual +
							'asset_tracking_strategy=track_as_consumable';
				}
			} else {
				// category not defined -> we expand the result set, not narrow
				// it down, with asset tracking strategy (or)
				refQual = refQual +
						'^ORasset_tracking_strategy=track_as_consumable';
			}
		}

		return refQual;
	},

	cmdbModelCategoryRefQual : function() {
		var models = '';

		var gr = new GlideRecord('cmdb_model_category');
		gr.addQuery('cmdb_ci_class', current.sys_class_name);
		gr.query();
		while (gr.next()) {
			var mlist = this.getModels(gr.sys_id);
			if (mlist != '')
				models = models + "," + mlist;
		}

		if (models != '')
			return "sys_idIN" + models;
		else
			return null;
	},

	getModels : function(sys_id) {
		var models = "";

		var gr = new GlideRecord('cmdb_model');
		gr.addQuery('cmdb_model_category', sys_id);
		gr.query();
		while (gr.next())
			models = models + "," + gr.sys_id;
		return models;
	},

	/*
	 * Model category reference qualifier for model component definition records
	 */
	bundleModelCategoryRefQual : function(component_def) {
		var refQual = 'allow_in_bundle=true';

		if (component_def.child.toString() != '') {
			// refine qualifier if model is already set
			var model = new GlideRecord('cmdb_model');
			model.get(component_def.child.toString());
			refQual = refQual + '^sys_idIN' + model.cmdb_model_category;
		}
		return refQual;
	},

	/*
	 * Model reference qualifier for model component definition records
	 * (component field)
	 */
	componentModelRefQual : function(component_def) {
		var refQual = '';

		if (component_def.model_category.toString()) {
			var category = new GlideRecord('cmdb_model_category');
			category.get(component_def.model_category.toString());
			refQual = 'cmdb_model_categoryLIKE' + category.sys_id.toString();
		} else {
			// when category is not specified, we should still narrow down to
			// include only models
			// corresponding to categories that can go in bundles
			refQual = this._getFlaggedCategoriesOrClause('allow_in_bundle');
		}

		// filter out models that don't create any assets
		if (refQual != '')
			refQual = refQual + '^';
		return refQual + 'asset_tracking_strategy!=do_not_track';
	},

	/*
	 * Model reference qualifier for model component definition records (bundle
	 * field)
	 */
	bundleModelRefQual : function(component_def) {
		// when category is not specified, we should still narrow down to
		// include only models
		// corresponding to categories that can instantiate main component in
		// bundles
		var refQual = this._getFlaggedCategoriesOrClause('allow_as_master');
		// abstract bundles can also be bundle parents
		if (refQual != '')
			refQual = refQual + '^OR';
		refQual = refQual + this._getFlaggedCategoriesOrClause('bundle');

		// filter out models that force tracking as consumable or no tracking
		if (refQual != '')
			refQual = refQual + '^';
		return refQual + 'asset_tracking_strategy=leave_to_category';
	},

	/*
	 * Helper to get asset class of asset.
	 */
	_getAssetClass : function(asset) {
	    if (asset === null)
		    return '';
	   
		var assetClass = asset.sys_class_name;
		if ('' == assetClass)
			assetClass = 'alm_asset';
		return assetClass;
	},
	
    /*
     * Helper to get ci class of ci.
     */
    _getCIClass: function(ci) {
	    if (ci === null)
		    return '';
        var ciClass = ci.sys_class_name;
        if ('' == ciClass)
            ciClass = 'cmdb_ci';
        return ciClass;  
    },

	/*
	 * Helper to filter models based on what class their category would allow
	 * them to create
	 */
	_getCategoriesProducingAssetClassOrClause : function(assetClass) {
		var categoryClause = '';
		var categories = new GlideRecord('cmdb_model_category');
		categories.addQuery('asset_class', assetClass);
		categories.query();
		while (categories.next()) {
			if (categoryClause != '')
				categoryClause = categoryClause + '^OR';
			categoryClause = categoryClause + 'cmdb_model_categoryLIKE' +
					categories.sys_id.toString();
		}
		return categoryClause;
	},

	/*
	 * Helper to filter models belonging to categories with paramter flag set to
	 * true
	 */
	_getFlaggedCategoriesOrClause : function(flag) {
		var categoryClause = '';
		var categories = new GlideRecord('cmdb_model_category');
		categories.addQuery(flag, 'true');
		categories.query();
		while (categories.next()) {
			if (categoryClause != '')
				categoryClause = categoryClause + '^OR';
			categoryClause = categoryClause + 'cmdb_model_categoryLIKE' +
					categories.sys_id.toString();
		}
		return categoryClause;
	},

	type : 'ModelAndCategoryFilters'
};