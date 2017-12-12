(function() {
  /* populate the 'data' object */
  /* e.g., data.table = $sp.getValue('table'); */
	// implement resource here
	data.categoriesList = [];
	data.showAll = gs.getMessage("Show All");
	data.pleaseWait = gs.getMessage("Please wait... fetching categories");
	var categoryId = JSUtil.nil($sp.getParameter('sys_id')) ? "" : $sp.getParameter('sys_id') + "";
	var catalogID = $sp.getValue('sc_catalog') + "";
	var viewType = '';
	var checkCanView = false;
	var nestedLayout = (options.category_layout !== "Flat");
	var dynamicCategory = false;
	var catalog = new sn_sc.Catalog(catalogID);
	if (!catalog.canView()) {
		return;
	}
	
	checkCanView = (options.check_can_view == 'true');
	
	var categoriesGr = new GlideRecord('sc_category');
	categoriesGr.addQuery("sc_catalog", catalogID);
	if (!dynamicCategory)
		categoriesGr.addQuery("sys_class_name", "sc_category");
	categoriesGr.addActiveQuery();
	categoriesGr.orderBy('order');
	categoriesGr.orderBy('title');
	if (nestedLayout)
		categoriesGr.addNullQuery("parent");
	categoriesGr.query();
	var totalCount = categoriesGr.getRowCount();

	var startWindow = 0;
	var windowSize = options.number_of_categories_to_load || 15;
	
	if (input && input.getAll)
		windowSize = -1 ;
	data.total = totalCount;
	windowSize = JSUtil.nil(windowSize) ? 10 : windowSize;
	data.windowSize = windowSize;
	var itemIndex = 0;
	if (totalCount == 0) {
		return;
	}

	if (startWindow >= totalCount) {
		return;
	}
	
	while (categoriesGr.next() && itemIndex != startWindow)
		itemIndex += 1;

	itemIndex = 0;
	while ( (windowSize == -1 || itemIndex < windowSize) && categoriesGr.isValidRecord()) {
		var categoryJS = new sn_sc.CatCategory(categoriesGr.getUniqueValue() + '');
		if (!categoryJS.canView()) {
            data.total = data.total - 1;
			if(!categoriesGr.next())
				break;
			continue;
		}
		
		var categoryDetails = getCategory(categoryJS, 0);
		categoryDetails.sys_id = categoriesGr.getUniqueValue();
		data.categoriesList.push(categoryDetails);
		
		itemIndex = itemIndex + 1;
		if (!categoriesGr.next())
			break;
	}
	
	
	data.loadAllMsg = gs.getMessage("Showing {0} of {1} categories", [data.categoriesList.length + "", data.total + ""]);
	data.categoryId = categoryId;
	
	function getCategory(categoryJS, level) {
		var categoryDetails = {};
		var showChildren = false;
		if (!categoryJS) {
			return categoryDetails;
		}
		categoryDetails.title = categoryJS.getTitle();
		categoryDetails.level = level;
		categoryDetails.description = categoryJS.getDescription();
		categoryDetails.full_description = categoryJS.getFullDescription();
		categoryDetails.icon = categoryJS.getIconSRC();
		categoryDetails.header_icon = categoryJS.getHeaderIconSRC();
		categoryDetails.homepage_image = categoryJS.getHomepageImageSRC();
		categoryDetails.sys_id = categoryJS.getID();
		categoryDetails.showChildren = (categoryDetails.sys_id === categoryId);
		
		if (checkCanView)
				categoryDetails.count = categoryDetails.totalCount = categoryJS.getViewableItemsCount(true);
			else
				categoryDetails.count = categoryDetails.totalCount = categoryJS.getItemsCount(true);
		
		
		var subCategoryCounts = 0;
		if (nestedLayout) {
			var subcategories = categoryJS.getViewableSubCategories();
			
			if (subcategories.length == 0) {
				categoryDetails.subcategories = [];
			} 
			else {
					categoryDetails.subcategories = [];
					subcategories.forEach(function(subCategory) {
						var subCategoryJS = new sn_sc.CatCategory(subCategory.sys_id + '');
						var category = getCategory(subCategoryJS, level + 1);
						categoryDetails.totalCount = categoryDetails.totalCount + category.totalCount;
						categoryDetails.subcategories.push(category);
						categoryDetails.showChildren = categoryDetails.showChildren || category.showChildren;
					});
				}
		}
		return categoryDetails;
	}
})();