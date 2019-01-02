// populate the 'data' object
data.categories = [];
options.category_layout = options.category_layout || "Nested";

if (options.page) {
		var pageGR = new GlideRecord("sp_page");
		options.page = (pageGR.get(options.page)) ? pageGR.getValue("id") : null;
} else {
	options.page = 'sc_category';
}

if (input && input.action === "retrieve_nested_categories") {
	var childCategoriesGR = buildSubcategoryGR(input.parentID)
	data.subcategories = retrieveCategoriesFromGR(childCategoriesGR);
	return;
}

var sc = new GlideRecord('sc_category');
sc.addQuery('sys_class_name', 'sc_category');
sc.addActiveQuery();
sc.orderBy('title');
data.sc_catalog = $sp.getValue('sc_catalog');
if (data.sc_catalog)
	sc.addQuery('sc_catalog', data.sc_catalog);
if (options.category_layout === "Nested")
	sc.addQuery('parent', '');
sc.query();
data.categories = retrieveCategoriesFromGR(sc);

// If the selected category is a subcategory, we need to 
// open all it's parent categories
var selectedCategory = new GlideRecord("sc_category");
var categoryID = $sp.getParameter("sys_id");
if (!categoryID || !selectedCategory.get(categoryID))
	return;

var parentArr;
if (options.category_layout !== "Nested" || !selectedCategory.parent)
	parentArr = data.categories;
else
	parentArr = openParent(selectedCategory.getElement("parent").getRefRecord());

var selectedCategoryItem = findElementBySysID(parentArr, selectedCategory.getUniqueValue());
if (selectedCategoryItem)
	selectedCategoryItem.selected = true;

function openParent(gr) {
	var catItem;
	
	if (!gr.parent) {
		catItem = findElementBySysID(data.categories, gr.getUniqueValue());
	} else {
		var parentCategoryArr = openParent(gr.getElement("parent").getRefRecord());
		catItem = findElementBySysID(parentCategoryArr, gr.getUniqueValue());
	}
	
	if (!catItem)
		return [];
	
	var subcategoryGR = buildSubcategoryGR(catItem.sys_id);
	catItem.subcategories = retrieveCategoriesFromGR(subcategoryGR);
	catItem.showSubcategories = true;
	return catItem.subcategories;
}

function findElementBySysID(arr, id) {
	var foundElements = arr.filter(function(item) {
		return item.sys_id === id;
	});
	
	return (foundElements.length > 0) ? foundElements[0] : null;
}

function retrieveCategoriesFromGR(gr) {
	var categories = []
	while (gr.next()) {
		var category = retrieveCategoryFromGR(gr);
		if (category)
			categories.push(category);
	}
	
	return categories;
}

function retrieveCategoryFromGR(gr) {
	if (!$sp.canReadRecord("sc_category", gr.getUniqueValue()))
			return null;

	var isParentCategory = checkIsParentCategory(gr);
	
	if (options.check_can_view != true && options.check_can_view != "true") {
		// use GlideAggregate by way of GlideRecordCounter, doesn't check canView on each item
		var count = new GlideRecordCounter('sc_cat_item_category');
		prepQuery(count, gr.getUniqueValue());
		var item_count = count.getCount();
		if (item_count > 0 || (options.category_layout === "Nested" && isParentCategory)) {
			var cat = {};
			cat.title = gr.title.getDisplayValue();
			cat.sys_id = gr.getUniqueValue();
			cat.count = item_count;
			cat.parent = gr.parent.getDisplayValue();
			if (options.category_layout === "Nested")
				cat.isParentCategory = isParentCategory;
			return cat;
		}
	}

	if (options.check_can_view == true || options.check_can_view == "true") {
		// use GlideRecord, checking canView on each item
		var itemCat = new GlideRecord('sc_cat_item_category');
		prepQuery(itemCat, gr.getUniqueValue());
		itemCat.query();
		var validatedCount = 0;
		var checked = 0;
		while (itemCat.next()) {
			checked++;
			if ($sp.canReadRecord("sc_cat_item", itemCat.sc_cat_item))
				validatedCount++;

			// if user can't see the first 50 items in this category, give up
			if (validatedCount == 0 && checked == 50)
				break;

			// if omitting badges, and if we found one, work is done
			if (validatedCount > 0 && options.omit_badges)
				break;
		}

		if (validatedCount > 0 || (options.category_layout === "Nested" && isParentCategory)) {
			var cat = {};
			cat.title = gr.title.getDisplayValue();
			cat.sys_id = gr.getUniqueValue();
			cat.count = validatedCount;
			cat.parent = gr.parent.getDisplayValue();
			if (options.category_layout === "Nested")
				cat.isParentCategory = isParentCategory;
			return cat;
		}
	}
	
	return null;
}

function prepQuery(gr, scUniqueValue) {
		gr.addQuery('sc_category', scUniqueValue);
		gr.addQuery('sc_cat_item.active', true);
		gr.addQuery('sc_cat_item.visible_standalone', true);
		gr.addQuery('sc_cat_item.sys_class_name', 'NOT IN', 'sc_cat_item_wizard');
}

function checkIsParentCategory(cat) {
		var count = new GlideRecordCounter('sc_category');
		count.addQuery('active', true);
		count.addQuery('parent', cat.getUniqueValue());
		return count.getCount() > 0;
}

function buildSubcategoryGR(parentID) {
	var subcategoryGR = new GlideRecord("sc_category");
	subcategoryGR.addActiveQuery();
	subcategoryGR.orderBy('title');
	var sc_catalog = $sp.getValue('sc_catalog');
	if (sc_catalog)
		subcategoryGR.addQuery('sc_catalog', sc_catalog);
	subcategoryGR.addQuery('parent', parentID);
	subcategoryGR.query();
	return subcategoryGR;
}