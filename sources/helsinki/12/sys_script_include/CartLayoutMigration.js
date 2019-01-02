var CartLayoutMigration = Class.create();
CartLayoutMigration.prototype = {
    initialize : function() {
    },

    _fileNames : [
                  'content_block_programmatic_6383c75c0a0a0b2d00e934ac988bc484',  // dynamic content: Catalog cart
                  'sys_ui_page_98994abcc0a800270045342cbcf2e25e',                 // ui page: com.glideapp.servicecatalog_category_view
                  'sys_ui_page_7731be740a0a0b0800956cf8f9539f0d',                 // ui page: com.glideapp.servicecatalog_cart_view (edit cart)
                  'sys_ui_page_988e5075c0a80027004c16fe098e17c1',                 // ui page: com.glideapp.servicecatalog_checkout_view (order status)
                  'sys_ui_page_5f5b0d9d0a0a0b030017d906de006b1d',                 // ui page: servicecatalog_checkout_one
                  'sys_ui_macro_346e9ef10a0a0aa7004b1a7011746bc0',                // ui macro: sc_catalog_homepage_cart
                  'sys_ui_macro_3472af410a0a0aa700c6948c65a1e761',                // ui macro: sc_catalog_requested_for
                  'sys_ui_macro_7259c663d7222100f2d224837e610367',                // ui macro: sc_catalog_requested_for_v2
                  'sys_ui_macro_770989b10a0a0b0800b1333d892e2cdd',                // ui macro: catalog_item
                  'sys_ui_macro_9ce4bb30d7212100f2d224837e61033c',                // ui macro: catalog_cart_v2
                  'sys_ui_macro_8c012cf20a0a0b2400e8cb630e37eddf',                // ui macro: catalog_cart_default
                  'sys_ui_macro_af8ce6720a0a0b1200cae8c84a25bb98',                // ui macro: sc_cart_main
                  'sys_ui_macro_742a59150a0a0b03001337c345583d8b'                 // ui macro: servicecatalog_cart_template
     ],

    _useLayoutProperty : 'glide.sc.use_cart_layouts',
    _allowCloneProperty : 'glide.sc.allow.checkout.clone',
    _showReqNumberProperty : 'glide.sc.checkout.request.number',
    _showBackButtonTwoStepProperty : 'glide.sc.checkout.twostep.back',

    _useLayout : function() {
        return this._getBooleanProperty(this._useLayoutProperty);
    },

    _allowClone : function() {
        return this._getBooleanProperty(this._allowCloneProperty);
    },

    _showReqNumber : function() {
        return this._getBooleanProperty(this._showReqNumberProperty);
    },

    _showBackButtonTwoStep : function() {
        if (gs.getProperty(this._showBackButtonTwoStepProperty, 'true') + '' == 'true')
            return true;
        return false;
    },
    
    _getBooleanProperty : function(propertyName) {
        if (gs.getProperty(propertyName, 'false') + '' == 'false')
            return false;
        return true;
    },
	
    _createCategoryM2M : function() {
		var propertySysId = '';
        var gr = new GlideRecord('sys_properties');
        gr.addQuery('name', this._useLayoutProperty);
        gr.query();
        if (gr.next()) {
            propertySysId = gr.sys_id;
            gr.description = 'Use the sc_layout driven cart macros (default true)';
            gr.type = 'boolean';
            gr.update();
        }

        if (JSUtil.nil(propertySysId))
            return;

        gs.log("SC Layout creating sys_properties_category_m2m record");
        gr = new GlideRecord('sys_properties_category_m2m');
        gr.initialize();
        gr.category = '886026c40a0a0b500062d82758e1c116';
        gr.property = propertySysId;
        gr.order = '2250';
        gr.insert();
    },

    _updateScLayout : function(target, column, value) {
        var scLayoutGr = new GlideRecord('sc_layout');
        scLayoutGr.setWorkflow(false);
        scLayoutGr.addQuery('target', target);
        scLayoutGr.query();
        if (scLayoutGr.next()) {
            scLayoutGr.setValue(column, value);
            scLayoutGr.update();
        }
    },
    
    _updateCatalogItemRecords : function(encQuery, value) {
        var items = new GlideRecord('sc_cat_item');
        items.setWorkflow(false);
        items.setSystem(true);
        items.addQuery('use_sc_layout', '!=' , value);
        items.addEncodedQuery(encQuery);
        items.query();
        while (items.next()) {
            items.setValue('use_sc_layout', value);
            gs.log("SC Layout setting Catalog Item [" + items.sys_id + "] sc_cat_item.use_sc_layout=" + value);
            items.update();
        }
    },

    // Find all items that have had custom settings and set their use_layout boolean to false
    _setLegacyConfigItems : function() {
        var encQuery = 'custom_cartISNOTEMPTY^ORno_cart=true' +
            '^ORno_order=true^ORno_proceed_checkout=true' +
            '^ORno_quantity=true^ORno_order_now=true^ORomit_price=true';
        this._updateCatalogItemRecords(encQuery, 'false');
    },

    // Checks to see if files have been customized and if not, sets layouts to true
    configureLayoutProperty : function() {
        // if property is false configuration is necessary
        if (!this._useLayout()) {            
            var updates = new GlideRecord('sys_update_xml');
            updates.addQuery('name', this._fileNames);
            updates.query();
            if (updates.next()) {
                var customisations = updates.name + "";
                while (updates.next())
                    customisations += ", " + updates.name;
                gs.log("SC Layout Property Change Unsuccessful. Customization of UI Pages/Macros found [" + customisations + "]. Property " + this._useLayoutProperty + " set as: false");
                gs.setProperty(this._useLayoutProperty, 'false');
            } else {
                gs.log("SC Layout Property Change Successful. Property " + this._useLayoutProperty + " set to: true");
                gs.setProperty(this._useLayoutProperty, 'true');
            }
			this._createCategoryM2M();
        }
        else {
            gs.log("SC Layout Property " + this._useLayoutProperty + " left as: " + this._useLayout());
        }
    },
    
    // Find all catalog items that do not have a layout set at all, set use_layout boolean to true, but legacy config items set to false
    upgradeCatalogItems : function() {
        this._setLegacyConfigItems();
        this._updateCatalogItemRecords('use_sc_layoutISEMPTY', 'true');
    },
    
    // Migrates customer defined global properties to sc_layout attributes
    migrateProperties : function() {
        if (this._allowClone())
            this._updateScLayout('order_status', 'sc_clone_checkout_button', this._allowClone());

        if (this._showReqNumber())
            this._updateScLayout('order_status', 'sc_req_item_number_column', this._showReqNumber());

        if (!this.showBackButtonTwoStep())
            this._updateScLayout('cart_view_two_step', 'sc_back_catalog_button', this._showBackButtonTwoStep());
    },
    
    _setPortalPreference : function() {
    	new ShowHideShoppingCartWidgetTitle().updateUserPreference(!this._useLayout());
    },
    
    migrate : function() {
        this.configureLayoutProperty();
        this.upgradeCatalogItems();
        this.migrateProperties();
        this._setPortalPreference();
    },

    type : 'CartLayoutMigration'
};