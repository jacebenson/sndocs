var AssetandCI = Class.create();
AssetandCI.prototype = {
	initialize : function() {
	},
	
	createMultipleAssets : function(categoryId) {
		var category= new GlideRecord('cmdb_model_category');
		category.query("sys_id", categoryId);
        if (!category.next() || category.asset_class.nil() || category.enforce_verification || category.cmdb_ci_class == '')
        return;
        
        var ci = new GlideRecord(category.cmdb_ci_class);
        if (!ci.isValid()) return;
		ci.addQuery('asset', '').addOrCondition('asset', null);
		ci.addQuery('model_id.cmdb_model_category', 'CONTAINS', category.sys_id);
		ci.query();
		
		while (ci.next()) {
			if (ci.model_id != null && !ci.model_id.nil() && ci.model_id.asset_tracking_strategy == 'do_not_track')
				continue;
			var asset = new GlideRecord(category.asset_class);
			asset.initialize();
			asset.ci = ci.sys_id;
			asset.model_category = category.sys_id;
			// inherit values from CI for shared fields
			var sync = new AssetAndCISynchronizer();
			sync.syncRecordsWithoutUpdate(ci, asset, 'alm_asset', true);
			// insert assert record and stick its reference in the CI
			ci.asset = asset.insert();
			ci.update();
		}
	},
	
	updateEmptyModels : function(modelCategory, ciClass) {
		var ci = new GlideRecord('cmdb_ci');
		ci.addQuery('sys_class_name', ciClass);
		ci.addQuery('model_id', '').addOrCondition('model_id', null);
		ci.query();
		
		if (!ci.hasNext())
			return;
		
		var model = this._getUnknownModel(modelCategory);
		while (ci.next()) {
			ci.model_id = model;
			ci.update();
		}
	},
	
	deleteAsset : function(ci) {
		var asset = new GlideRecord('alm_asset');
		if (asset.get(ci.asset.toString()))
			asset.deleteRecord();
	},
	
	deleteAssetOnly: function(asset) {
		var ci = new GlideRecord('cmdb_ci');
		if (ci.get(asset.ci)) { 
			ci.asset = '';
			if (ci.update()) {
				asset.ci = '';
				if (asset.update())
					asset.deleteRecord();
			}
		}
	},
	
	deleteCI : function(asset) {
		var ci = new GlideRecord('cmdb_ci');
		if (ci.get(asset.ci.toString()))
			ci.deleteRecord();
	},
	
	/*
 	* Create an asset associated bi-directionally to the ci if category allows.
 	* Fields shared between the 2 tables are inherited from the source record
 	* by the destination record. The asset is saved to DB but the CI needs to
 	* be updated by caller code in order to prevent superfluous updates
 	*/
	createAsset : function(ci) {
		this.createAssetByPass(ci, false);
	},
	
	/*
 	* Create an asset associated bi-directionally to the ci if category allows.
 	* Fields shared between the 2 tables are inherited from the source record
 	* by the destination record. The asset is saved to DB but the CI needs to
 	* be updated by caller code in order to prevent superfluous updates
 	*/
	createAssetByPass : function(ci, bypass) {
		// Check the model asset creation strategy
		if (ci.model_id != null && !ci.model_id.nil() && ci.model_id.asset_tracking_strategy == 'do_not_track')
			return;
		
		// Do we already have an asset?
		if (!ci.asset.nil()) {
			gs.log("Duplicate asset generation prevented for CI " + ci.name);
			return;
		}
		
		// Is there already an asset for this CI?
		var otherAsset = new GlideRecord("alm_asset");
		otherAsset.addQuery("ci", ci.sys_id);
		otherAsset.setLimit(1);
		otherAsset.query();
		if (otherAsset.next()) {
			ci.asset = otherAsset.sys_id;
			gs.log("Duplicate asset generation (Existing asset) prevented for CI " + ci.name);
			return;
		}
		
		var category = this._getModelCategoryAndRepairModelAssociation(ci);
		if (category != null && !category.nil() && !category.asset_class.nil() && (category.enforce_verification != true || bypass == true)) {
			var asset = new GlideRecord(category.asset_class);
			asset.initialize();
			asset.ci = ci.sys_id;
			asset.model_category = category.sys_id;
			// inherit values from CI for shared fields
			var sync = new AssetAndCISynchronizer();
			sync.syncRecordsWithoutUpdate(ci, asset, 'alm_asset', bypass);
			// insert assert record and stick its reference in the CI
			ci.unverified = false;
			ci.asset = asset.insert();
		} else if (category != null && !category.nil() && !category.asset_class.nil() && category.enforce_verification == true) {
			ci.unverified = true;
		}
	},
	
	/*
 	* Create a CI associated bi-directionally to the asset if category and
 	* model allow. Fields shared between the 2 tables are inherited from the
 	* source record by the destination record. The CI is saved to DB but the
 	* asset needs to be updated by caller code in order to prevent superfluous
 	* updates
 	*/
	createCI : function(asset) {
		// retrieve CI class from the model category if model doesn't override
		// it as
		// consumable or no tracking
		
		// Skip if we already have a CI
		if (!asset.ci.nil()) {
			gs.log("Duplicate CI generation prevented for asset " + asset.display_name);
			return;
		}
		
		// Is there a CI out there with this asset?
		var otherCI = new GlideRecord("cmdb_ci");
		otherCI.addQuery("asset", asset.sys_id);
		otherCI.setLimit(1);
		otherCI.query();
		if (otherCI.next()) {
			asset.ci = otherCI.sys_id;
			gs.log("Duplicate CI generation (existing CI) prevented for asset " + asset.display_name);
			return;
		}
		
		var ciClass = '';
		if ('leave_to_category' == asset.model.asset_tracking_strategy
			.toString())
		ciClass = asset.model_category.cmdb_ci_class.toString();
		
		if (ciClass != '') {
			var ci = new GlideRecord(ciClass);
			ci.initialize();
			ci.asset = asset.sys_id;
			// in the absence of a calculated name for CIs, set
			// something so links don't appear blank
			ci.name = asset.model.name;
			// Populate manufacturer
			ci.manufacturer = asset.model.manufacturer;
			
			// inherit values from asset for shared fields
			var sync = new AssetAndCISynchronizer();
			sync.syncRecordsWithoutUpdate(asset, ci, 'cmdb_ci', false);
			
			// insert CI record and stick its reference in the asset
			asset.ci = ci.insert();
		}
	},
	
	cascadeAssetCreationFromBundle : function(asset) {
		this._createAssetComponentsAndAlterAssetAsNeeded(asset);
	},
	
	/*
 	* Reference qualifier to pick parent
 	*/
	assetParentRefQual : function(asset) {
		var refQual = '';
		if (asset.substatus != 'pre_allocated') {
			// only pre-allocated assets can be children of another
			// pre-allocated asset
			refQual = 'substatus=^ORsubstatus!=pre_allocated^';
		}
		// in any case, stacks, consumables and licenses cannot be parents
		refQual += 'quantity=1^sys_class_name!=alm_consumable^sys_class_name!=alm_license';
		return refQual;
	},
	
	/*
 	* Merge a single CI into another one and delete the source CI
 	*/
	mergeCI : function(ci, new_ci) {
		var oci = new GlideRecord("cmdb_ci");
		oci.get(ci);
		
		var nci = new GlideRecord("cmdb_ci");
		nci.get(new_ci);

		nci.serial_number = oci.serial_number;
		nci.discovery_source = oci.discovery_source;
		nci.mac_address = oci.mac_address;
		nci.name = oci.name;
		nci.operational_status = oci.operational_status;
		nci.correlation_id = oci.correlation_id;
		nci.model_id = oci.model_id;
		nci.update();
	
		if (!asset.nil()) {
			var asset = new GlideRecord("alm_asset");
			asset.get(nci.asset);
			asset.model = oci.model_id;
			asset.update();
		}
		
		oci.deleteRecord();
	},
	
	/*
 	* trickle information from parent (grParentAsset) to child (grAsset) does
 	* not trigger update overrides child information if any, even when parent
 	* field is null
 	*/
	inheritInfoFromParentAsset : function(grAsset, grParentAsset) {
		this._inheritInfoFromParentAsset(grAsset, grParentAsset, grAsset.sys_class_name);
	},
	
	/*
 	* trickle information from parent (grParentAsset) to child (grAsset) does
 	* not trigger update overrides child information if any, even when parent
 	* field is null
 	*/
	_inheritInfoFromParentAsset : function(grAsset, grParentAsset, childClass) {
		var isChildConsumable = (childClass == 'alm_consumable');
		var isChildPreAllocated = (grAsset.substatus == 'pre_allocated');
		// consumable state is always controlled by the consumable itself
		// pre-allocated is 'in transit' (9) when parent is too, 'in stock' (6)
		// otherwise
		// parent governs state of all real, allocated assets
		if (!isChildConsumable) {
			if (isChildPreAllocated) {
				if (grParentAsset.install_status == '9')
					grAsset.install_status = '9';
				else
					grAsset.install_status = '6';
			} else
			grAsset.install_status = grParentAsset.install_status;
		}
		
		// substate trickle only for real, allocated assets
		if (!isChildConsumable && !isChildPreAllocated)
			grAsset.substatus = grParentAsset.substatus;
		
		// other fields whose values need to always trickle down
		grAsset.location = grParentAsset.location;
		grAsset.stockroom = grParentAsset.stockroom;
		grAsset.company = grParentAsset.company;
		grAsset.department = grParentAsset.department;
		if(!isChildConsumable || grAsset.assigned_to == '')
			grAsset.assigned_to = grParentAsset.assigned_to;
		grAsset.managed_by = grParentAsset.managed_by;
		grAsset.owned_by = grParentAsset.owned_by;
		grAsset.assigned = grParentAsset.assigned;
		grAsset.cost_cc = grParentAsset.cost_cc;
		grAsset.cost_center = grParentAsset.cost_center;
	},
	
	/*
 	* Retrieve asset creation strategy based on model and class
 	* Also update empty model to Unknown model if category calls
 	* for asset tracking
 	* (legacy: allow empty models for items that don't pertain to
 	* asset management)
 	*/
	_getModelCategoryAndRepairModelAssociation : function(ci) {
		var modelCategory = new GlideRecord('cmdb_model_category');
		
		// category has to match ci class
		modelCategory.addQuery('cmdb_ci_class', ci.sys_class_name);
		
		// category has to match model expectations when model is defined
		var modelCategoryList = '';
		if (!ci.model_id.nil())
			modelCategoryList = ci.model_id.cmdb_model_category.toString();
		if (modelCategoryList !== '')
			modelCategory.addQuery('sys_id', 'IN', ci.model_id.cmdb_model_category);
		
		modelCategory.query();
		if (modelCategory.next()) {
			if (modelCategoryList === '') {
				if (ci.model_id.nil()) {
					// when no model was set, we want to allow creation nonetheless and
					// update the ci to refer to the Unknown model of the retrieved category
					ci.model_id = this._getUnknownModel(modelCategory.sys_id);
				} else {
					// when no category is specified in the model, we want to allow creation nonetheless and
					// update the model to support this class
					var model = new GlideRecord('cmdb_model');
					model.get(ci.model_id);
					model.cmdb_model_category = modelCategory.sys_id;
					model.update();
				}
			}
			return modelCategory;
		}
		return null;
	},
	
	/*
 	* - Change asset definition and class to main component's definition and
 	* class for abstract bundles - Cycle through bundle definition and
 	* instantiate all components - Recursion is naturally handled by the same
 	* logic being called for each component
 	*/
	_createAssetComponentsAndAlterAssetAsNeeded : function(asset) {
		// gather model bundle information
		var components = this._getBundleDefinition(asset.model);
		var masterIndex = components.pop();
		var models = this._getModelsDefinitions(components);
		var modelCategories = this._getCategoriesDefinitions(components);
		var attachToAsset = false;
		
		if (asset.model_category.bundle.toString() == 'true') {
			// abstract bundle
			var model = "";
			var category = "";
			var assetClass = "";
			if (masterIndex > -1) {
				// there is a master component : redirect current asset to it
				var mainComponent = components[masterIndex];
				model = models[mainComponent.model];
				category = modelCategories[mainComponent.modelCategory];
				assetClass = this._getAssetClass(model, category);
				asset.sys_class_name = assetClass;
				asset.model = mainComponent.model;
				asset.model_category = mainComponent.modelCategory;
				asset.quantity = 1;
				// we know main components can't be consumables
				components.splice(masterIndex, 1);
				// and attach all future assets to it
				attachToAsset = true;
			} else {
				// items are bundled but not attached together, redirect current
				// asset to first component
				var firstComponent = components.shift();
				model = models[firstComponent.model];
				category = modelCategories[firstComponent.modelCategory];
				assetClass = this._getAssetClass(model, category);
				asset.sys_class_name = assetClass;
				asset.model = firstComponent.model;
				asset.model_category = firstComponent.modelCategory;
				asset.quantity = 1;
				// set consumable to Consumed
				if (assetClass == 'alm_consumable')
					asset.install_status = 10;
				// and don't attach future assets to it
				attachToAsset = false;
			}
		} else {
			// concrete bundle : asset stays as is and we attach all future
			// assets to it
			attachToAsset = true;
		}
		
		// asset relationship
		var parentId = '';
		if (attachToAsset == true)
			parentId = asset.sys_id.toString();
		else
			parentId = asset.parent.toString();
		
		// create and attach components
		var newAssetClass, component;
		for (var i = 0; i < components.length; i++) {
			component = components[i];
			// model and category of the component control the existence of
			// asset record and its class
			newAssetClass = this._getAssetClass(models[component.model],
			modelCategories[component.modelCategory]);
			if (newAssetClass !== '') {
				var newAsset = new GlideRecord(newAssetClass);
				newAsset.model = component.model;
				newAsset.model_category = component.modelCategory;
				newAsset.parent = parentId;
				// set consumable to Consumed
				if (newAssetClass == 'alm_consumable')
					newAsset.install_status = 10;
				// propagate state and assignment fields
				this._inheritInfoFromParentAsset(newAsset, asset, newAssetClass);
				// save structure
				newAsset.insert();
			}
		}
	},
	
	/*
 	* Helper that determines what kind of asset (if any) a model - category
 	* pair would instantiate
 	*/
	_getAssetClass : function(model, category) {
		var assetClass = '';
		if (model.assetStrategy == 'track_as_consumable')
			assetClass = 'alm_consumable';
		else if (model.assetStrategy == 'do_not_track')
			assetClass = '';
		else if (model.assetStrategy == 'leave_to_category') {
			if (category.bundle != 'true')
				assetClass = category.assetClass;
			else
				assetClass = 'alm_asset';
		}
		return assetClass;
	},
	
	/*
 	* Retrieves and stores the complete definition of a bundle
 	*/
	_getBundleDefinition : function(modelId) {
		var components = [];
		var masterIndex = -1;
		var grComponent = new GlideRecord('cmdb_m2m_model_component');
		grComponent.addQuery('parent', modelId);
		grComponent.query();
		while (grComponent.next()) {
			// retrieve component definition
			var component = {};
			component.model = grComponent.child.toString();
			component.modelCategory = grComponent.model_category.toString();
			// store component definition
			components.push(component);
			// mark the component to attach others to when appropriate
			if (grComponent.master.toString() == 'true') {
				if (masterIndex > -1) {
					// error situation
					gs.print('Bundle with model ID ' + modelId
					+ ' has more than one main component defined');
				}
				masterIndex = components.length - 1;
			}
		}
		// stick master index at the end of components list to retrieve master
		// component faster
		components.push(masterIndex);
		return components;
	},
	
	/*
 	* Helper that stores model information for all components of a bundle (no
 	* recursion) to limit number of queries
 	*/
	_getModelsDefinitions : function(components) {
		var ids = [];
		for ( var i = 0; i < components.length; i++)
			ids.push(components[i].model);
		var models = {};
		var grModel = new GlideRecord('cmdb_model');
		grModel.addQuery('sys_id', 'IN', ids.toString());
		grModel.query();
		while (grModel.next()) {
			var id = grModel.sys_id.toString();
			models[id] = {
				'assetStrategy' : grModel.asset_tracking_strategy.toString(),
				'bundle' : grModel.bundle.toString()
			};
		}
		return models;
	},
	
	/*
 	* Helper that stores category information for all components of a bundle
 	* (no recursion) to limit number of queries
 	*/
	_getCategoriesDefinitions : function(components) {
		var ids = [];
		for ( var i = 0; i < components.length; i++)
			ids.push(components[i].modelCategory);
		var categories = {};
		var grCategory = new GlideRecord('cmdb_model_category');
		grCategory.addQuery('sys_id', 'IN', ids.toString());
		grCategory.query();
		while (grCategory.next()) {
			var id = grCategory.sys_id.toString();
			categories[id] = {
				'assetClass' : grCategory.asset_class.toString(),
				'ciClass' : grCategory.cmdb_ci_class.toString(),
				'bundle' : grCategory.bundle.toString()
			};
		}
		return categories;
	},
	
	/*
 	* Return a model named 'Unknown' associated with the given category
 	* Create and return one such model if none exists yet
 	*/
	_getUnknownModel: function(modelCategory) {
		var model = new GlideRecord('cmdb_model');
		model.addQuery('name','Unknown');
		model.addQuery('cmdb_model_category','LIKE', modelCategory);
		model.query();
		if (model.next())
			return model.sys_id;
		
		model = new GlideRecord('cmdb_model');
		model.initialize();
		model.name = 'Unknown';
		model.cmdb_model_category = modelCategory;
		return model.insert();
	},
	
	type : 'AssetandCI'
};