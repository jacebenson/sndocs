// populate the 'data' variable with catalog item, variables, and variable view
(function() {
	options.show_add_cart_button = (options.show_add_cart_button == "true");

	if (options.page) {
		var pageGR = new GlideRecord("sp_page");
		options.page = (pageGR.get(options.page)) ? pageGR.getValue("id") : null;
	}

	if (options.table) {
		var tableGR = new GlideRecord("sys_db_object");
		options.table = (tableGR.get(options.table)) ? tableGR.getValue("name") : null;
	}

	options.url = options.url || "?id={page}&table={table}&sys_id={sys_id}";
	data.showPrices = $sp.showCatalogPrices();
	var m = data.msgs = {};
	m.submitMsg = gs.getMessage("Submit");
	m.submittedMsg = gs.getMessage("Submitted");
	m.createdMsg = gs.getMessage("Created");
	m.trackMsg = gs.getMessage("track using 'Requests' in the header or");
	m.clickMsg = gs.getMessage("click here to view");
	m.dialogTitle = gs.getMessage("Delete Attachment");
	m.dialogMessage = gs.getMessage("Are you sure?");
	m.dialogOK = gs.getMessage("OK");
	m.dialogCancel = gs.getMessage("Cancel");
	m.largeAttachmentMsg = gs.getMessage("Attached files must be smaller than {0} - please try again", "24MB");

	if (input)
		data.sys_id = input.sys_id;
	else if(options.sys_id)
		data.sys_id = options.sys_id;
	else
		data.sys_id = $sp.getParameter("sys_id") || $sp.getParameter('sl_sys_id');

	data._attachmentGUID = gs.generateGUID();
	// portal can specify a catalog home page
	data.sc_catalog_page = $sp.getDisplayValue("sc_catalog_page") || "sc_home";
	var validatedItem = new GlideappCatalogItem.get(data.sys_id);
	if (!validatedItem.canView())
		return;

	data.sc_cat_item = $sp.getCatalogItem(data.sys_id, true);
	if (data.sc_cat_item.category) {
		var categoryGR = new GlideRecord('sc_category');
		categoryGR.get(data.sc_cat_item.category);
		data.category = {
			name: categoryGR.getDisplayValue('title'),
			url: '?id=sc_category&sys_id=' + categoryGR.sys_id
		}
	}

	$sp.logStat('Catalog View', data.sc_cat_item.sys_class_name, data.sys_id, data.sc_cat_item.name);
})()