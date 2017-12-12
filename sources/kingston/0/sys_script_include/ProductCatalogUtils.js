var ProductCatalogUtils = Class.create();
ProductCatalogUtils.prototype = {
    initialize: function() {
    },
    
    createChildProductCatalog: function(parent, type) {
        var gr = new GlideRecord('cmdb_m2m_model_component');
        gr.addQuery('parent', parent.sys_id);
        gr.query();
        while (gr.next()) {
            var source = new GlideRecord('cmdb_model');
            source.get(gr.child);
            if (source.product_catalog_item.nil()) {
                if (source.sys_class_name == 'cmdb_hardware_product_model' || source.sys_class_name == 'cmdb_consumable_product_model')
                    source.product_catalog_item = (new ProductCatalogUtils()).createProductCatalog(source, parent.product_catalog_item.category, 'model', 'pc_hardware_cat_item');
                else if (source.sys_class_name == 'cmdb_software_product_model')
                    source.product_catalog_item = (new ProductCatalogUtils()).createProductCatalog(source, parent.product_catalog_item.category, 'model', 'pc_software_cat_item');
                else
                    source.product_catalog_item = (new ProductCatalogUtils()).createProductCatalog(source, parent.product_catalog_item.category, 'model', 'pc_product_cat_item');
                source.update();
            }
            var sc_cat = new GlideRecord('sc_cat_item_children');
            sc_cat.child = source.product_catalog_item;
            sc_cat.parent = parent.product_catalog_item;
            sc_cat.insert();
        }
    },
    
    createProductCatalog: function(source, category, type, table) {
        var destination = new GlideRecord(table);
        this._syncRows(destination, source, category, type);
        var sys_id = destination.insert();
        this._syncPicture(source, table, sys_id);
        return sys_id
    },
    
    updateProductCatalog: function(source, type, table) {
        var destination = new GlideRecord(table);
        destination.get(source.product_catalog_item);
        this._syncRows(destination, source, '', type);
        destination.update();
    },
    
	_getVendorItemDescription: function(item) {
		var description = '';
		if(item.description) // not null and not empty string
			description = item.description;
		else if (item.model)
			description = item.model.description;

		return description;
	},
	
	_getVendorItemPrice: function(item) {
		var priceCurrency = 'USD'; 
		var priceValue = '0.00';
		
		if(item.price && item.price != '0' && item.price != '0.00') { 
		    //not null, undefined, or 0
			priceCurrency = item.price.getReferenceCurrencyCode();
			priceValue = item.price.getReferenceValue();
		} 
		else if (item.model && item.model.cost != null) {
			priceCurrency = item.model.cost.getReferenceCurrencyCode();
			priceValue = item.model.cost.getReferenceValue();
		}
		
		return priceCurrency + ';' + priceValue
	},
	
    _syncRows: function(destination, source, category, type) {
        destination.setDisplayValue('description', source.description.getDisplayValue());
        destination.short_description = source.short_description;
        destination.auto_created = true;
        if (category != '') {
            destination.category = category;
			destination.sc_catalogs = GlideappCategory.get(category).getCatalog();
		}
        
        if (type == 'vendor') {
			destination.description = this._getVendorItemDescription(source);
            if (destination.name == '')
                destination.name = source.name;
            destination.product_id = source.product_id;
            if (destination.price == 0)
                destination.price = this._getVendorItemPrice(source);
            destination.cost = source.price;
            destination.vendor = source.vendor;
            destination.vendor_catalog_item = source.sys_id;
            destination.specs = source.specs;
            destination.features = source.features;
            destination.model = source.model;
            destination.upc = source.upc;
        } else {
            if (destination.name == '')
                destination.name = source.name;
            destination.product_id = source.model_number;
            if (destination.price == 0)
                destination.price = source.cost;
            destination.cost = source.cost;
            destination.model = source.sys_id;
            if (destination.vendor.nil())
                destination.vendor = source.manufacturer;
        }
    },
    
    _syncPicture: function(gr, table, link) {
        var sa = new GlideRecord('sys_attachment');
        sa.addQuery('table_sys_id', gr.sys_id);
        sa.query();
        
        while (sa.next()) {
            var sys_id = sa.sys_id.toString();
            sa.table_name = 'ZZ_YY' + table;
            sa.table_sys_id = link;
            sa.insert();
            var image = sa.sys_id.toString();
            
            var fr = new GlideRecord('sys_attachment_doc');
            fr.addQuery('sys_attachment', sys_id);
            fr.query();
            while (fr.next()) {
                fr.sys_attachment = image;
                fr.insert();
            }
        }
        
    },
    
    type: 'ProductCatalogUtils'
}