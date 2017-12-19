(function() {
	options.category_layout = options.category_layout || "Nested";
options.omit_badges = options.omit_badges == "true" || options.omit_badges == true;
options.hide_xs = options.hide_xs == "true" || options.hide_xs == true;

if (options.page) {
	var pageGR = new GlideRecord("sp_page");
	options.page = (pageGR.get(options.page)) ? pageGR.getValue("id") : null;
} else
		options.page = $sp.getDisplayValue("sc_category_page") || 'sc_category';

data.sc_catalog = $sp.getValue('sc_catalog');

var categoryID = $sp.getParameter("sys_id");

// If the selected category is a subcategory, we need to open all it's parent categories
if (input && input.action === "retrieve_parent_hierarchy") {
	data.categories = input.categories;
	if(!input.cur_category)
		return;
	var categoryJS = new sn_sc.CatCategory(input.cur_category);
	if (!categoryJS)
		return;
	var parentArr;
	if (options.category_layout !== "Nested" || !categoryJS.getParent())
		parentArr = data.categories;
	else
		parentArr = openParent(categoryJS.getParent());

	var selectedCategoryItem = findElementBySysID(parentArr, input.cur_category);
	if (selectedCategoryItem)
		selectedCategoryItem.selected = true;
}
else {
	data.categories = [];
	data.selected_category = $sp.getParameter("sys_id");
}
})();

function openParent(cat_id) {
	var catItem;
	var categoryJS = new sn_sc.CatCategory(cat_id);
	if (!cat_id || !categoryJS)
		return;
	if (!categoryJS.getParent())
		catItem = findElementBySysID(data.categories, cat_id);
	else {
		var parentCategoryArr = openParent(categoryJS.getParent());
		catItem = findElementBySysID(parentCategoryArr, cat_id);
	}

	if (!catItem)
		return [];
	var subcategoryArr = buildSubcategoryArr(catItem.sys_id);
	catItem.subcategories = retrieveCategoriesFromArr(subcategoryArr);
	catItem.showSubcategories = true;
	return catItem.subcategories;
}

function findElementBySysID(arr, id) {
	var foundElements = arr.filter(function(item) {
		return item.sys_id === id;
	});

	return (foundElements.length > 0) ? foundElements[0] : null;
}

function retrieveCategoriesFromArr(arr) {
	var categories = [];
	for (var i = 0; i < arr.length; i++) {
		var cat = retrieveCategoryFromArr(arr[i].sys_id);
		if (cat)
			categories.push(cat);
	}
	return categories;
}

function retrieveCategoryFromArr(cat_id) {
	var categoryJS = new sn_sc.CatCategory(cat_id);
	if (!categoryJS || !categoryJS.canView())
		return null;
	var item_count = 0;
	if (options.check_can_view != true && options.check_can_view != "true")
		item_count = categoryJS.getItemsCount();
	else if (options.check_can_view == true || options.check_can_view == "true")
		item_count = categoryJS.getViewableItemsCount();

	if (item_count) {
		var cat = {};
		cat.title = categoryJS.getTitle();
		cat.sys_id = cat_id;
		cat.count = item_count;
		cat.parent = categoryJS.getParent();
		if (options.category_layout === "Nested")
			cat.isParentCategory = categoryJS.getViewableSubCategories().length > 0;
		return cat;
	}

	return null;
}

function buildSubcategoryArr(parentID) {
	var categoryJS = new sn_sc.CatCategory(parentID);
	return categoryJS.getViewableSubCategories();
}