// populate the 'data' variable with catalog item, variables, and variable view
(function() {
	// portal can specify a catalog and catalog category home page
	data.sc_catalog_page = $sp.getDisplayValue("sc_catalog_page") || "sc_home";
	data.sc_category_page = $sp.getDisplayValue("sc_category_page") || "sc_category";

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
	m.renameSuccessMsg = gs.getMessage("Attachment renamed successfully");
	m.deleteSuccessMsg = gs.getMessage("Attachment deleted successfully");

	if (input)
		data.sys_id = input.sys_id;
	else if (options.sys_id)
		data.sys_id = options.sys_id;
	else
		data.sys_id = $sp.getParameter("sys_id") || $sp.getParameter('sl_sys_id');

	if (!data.sys_id)
		return;

	data._attachmentGUID = gs.generateGUID();
	var validatedItem = new sn_sc.CatItem('' + data.sys_id);
	if (!validatedItem.canView())
		return;

	data.sc_cat_item = $sp.getCatalogItem(data.sys_id, true);
	if (data.sc_cat_item.category) {
		var categoryJS = new sn_sc.CatCategory(data.sc_cat_item.category);
		data.category = {
			name: categoryJS.getTitle(),
			url: '?id='+data.sc_category_page+'&sys_id=' + data.sc_cat_item.category
		}
	}

	$sp.logStat('Catalog View', data.sc_cat_item.sys_class_name, data.sys_id, data.sc_cat_item.name);
})()