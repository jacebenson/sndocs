(function() {
	data.catParam = $sp.getParameter("kb_category");
	data.kb = $sp.getValue("kb_knowledge_base");
	var cats = new GlideRecord("kb_category");
	if (data.catParam)
		cats = $sp.getKBSiblingCategories(data.catParam);
	else {
		cats.addActiveQuery();
		cats.addQuery("parent_id", data.kb);
		cats.query();
	}

	data.categories = [];
	while (cats.next()) {
		var articleCount = -1;
		var kbCount = $sp.getKBCount(data.kb);
		if (kbCount < 500) { // if more than 500 articles, don't iterate to get viewable counts
			var arts = $sp.getKBCategoryArticleSummaries(cats.getUniqueValue(), 0, 0);
			articleCount = arts.length;
		}
		data.categories.push({label: cats.getDisplayValue("label"), value: cats.getUniqueValue(), count: articleCount});
	}
})()
