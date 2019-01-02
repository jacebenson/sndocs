var RestCatalogUtil = Class.create();
RestCatalogUtil.prototype = {
    initialize: function() {
    },

	getClientScripts: function(itemId, uiType) {
		var onLoad = [];
		var onChange = [];
		var onSubmit = [];
		var resp = {};
		var viewType = '0';//desktop view type by default

		var globalSCatUtil = new global.GlobalServiceCatalogUtil();
		var scripts = new GlideRecord('catalog_script_client');
		scripts.addActiveQuery();
		scripts.addQuery('cat_item', itemId);
		scripts.query();
		if(uiType == 'mobile')
			viewType = '1';
		else if(uiType == 'both')
			viewType = '10';

		while (scripts.next()) {
			if(scripts.getValue('ui_type') !== '10' && scripts.getValue('ui_type') !== viewType)
					continue;
			var type = scripts.type;
			if (type == 'onLoad') {
				
				var load_obj = {};
				load_obj.appliesTo = scripts.applies_to+'';
				load_obj.condition = scripts.condition+'';
				load_obj.type = scripts.type+'';
				load_obj.script = globalSCatUtil.stripScriptComments(scripts.script+'');
				load_obj.fieldName = scripts.cat_variable+'';
				load_obj.variable_set = scripts.variable_set+'';
				load_obj.ui_type = scripts.getDisplayValue('ui_type');
				load_obj.sys_id = scripts.sys_id+'';

				onLoad.push(load_obj);

			} else if (type  == 'onChange') {

				var change_obj = {};
				change_obj.appliesTo = scripts.applies_to+'';
				change_obj.condition = scripts.condition+'';
				change_obj.type = scripts.type+'';
				change_obj.script = globalSCatUtil.stripScriptComments(scripts.script+'');
				change_obj.fieldName = scripts.cat_variable+'';
				change_obj.variable_set = scripts.variable_set+'';
				change_obj.ui_type = scripts.getDisplayValue('ui_type');
				change_obj.sys_id = scripts.sys_id+'';

				onChange.push(change_obj);

			} else if (type == 'onSubmit') {

				var submit_obj = {};
				submit_obj.appliesTo = scripts.applies_to+'';
				submit_obj.condition = scripts.condition+'';
				submit_obj.type = scripts.type+'';
				submit_obj.script = globalSCatUtil.stripScriptComments(scripts.script+'');
				submit_obj.fieldName = scripts.cat_variable+'';
				submit_obj.variable_set = scripts.variable_set+'';
				submit_obj.ui_type = scripts.getDisplayValue('ui_type');
				submit_obj.sys_id = scripts.sys_id+'';

				onSubmit.push(submit_obj);

			}
		}

		resp['onChange'] = onChange ;
		resp['onSubmit'] = onSubmit;
		resp['onLoad'] = onLoad;
		return resp;
	},

	checkMandatoryVariables: function(itemId, variables) {
		variables = variables || {};
		var varGr = new GlideRecord('item_option_new');
		var qr = varGr.addQuery('cat_item', itemId);
		var variableSet = new sn_sc.CatItem(itemId).getVariableSet();
		if(variableSet.length > 0)
			qr.addOrCondition("variable_set", variableSet);
		varGr.addActiveQuery();
		varGr.addQuery('mandatory', true);
		varGr.query();
		while(varGr.next()) {
			if((varGr.type == 7 && variables[varGr.getValue('name')] != 'true') || !variables[varGr.getValue('name')])
				return false;
		}
		return true;
	},

	isValidItem: function(itemId, type) {
		type = type || 'sc_cat_item';
		var gr = new GlideRecord(type);

		if(gr.get(itemId))
			return true;
		else
			return false;
	},

	canAddItemToWishlist: function(cat_item_id) {
		var catItemCatalogM2M = new GlideRecord("sc_cat_item_catalog");
		catItemCatalogM2M.addQuery("sc_cat_item", cat_item_id);
		catItemCatalogM2M.addQuery("sc_catalog.enable_wish_list", true);
		catItemCatalogM2M.query();
		if (catItemCatalogM2M.next())
			return true;
		return false;
		
	},

    type: 'RestCatalogUtil'
};