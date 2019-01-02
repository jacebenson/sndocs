var sc_ic_CatalogItemRecordProducer = Class.create();
sc_ic_CatalogItemRecordProducer.prototype = Object.extendsObject(sc_ic_CatalogItem,{
    initialize: function(_gr,_gs) {
        sc_ic_Base.prototype.initialize.call(this,_gr,_gs);

    },
	
	_copyFields: function(item) {
		sc_ic_CatalogItem.prototype._copyFields.call(this,item);  // Do the default copy
		
		// Copy specific things for the producer
		this._gr.group = item.fulfillment_group;
		this._gr.fulfillment_user = item.fulfillment_user;
		this._gr.table_name = item.table_name;
		this.workflow = "";
		return this;
	},
	
    type: 'sc_ic_CatalogItemRecordProducer'
});

/**
 * Creates a regular Catalog Item from a Item Creator definition.
 *
 * Parameters: simpleItem - The GlideRecord of the Item to use as a base.
 * Returns: GlideRecord("sc_cat_item") that represents the new catalog item.
 */
sc_ic_CatalogItemRecordProducer.create = function(item) {
	if (item == null || item.getRowCount() == 0 || item.getTableName()+"" !== sc_ic.ITEM_STAGING)
		return null;
	
	var ci = new GlideRecord("sc_cat_item_producer");
	var catItem = sc_ic_Factory.wrap(ci);
	catItem._copyFields(item);
	ci.insert();
	catItem._copyTranslations(item);
	catItem._copyCategories(item);
	catItem._copyAttachments(item);
	catItem._copyApprovals(item);
	catItem._copyTasks(item);
	catItem._copyVariables(item);
	ci.update();
	return ci;
};

sc_ic_CatalogItemRecordProducer.createFrom = sc_ic_CatalogItemRecordProducer.create;