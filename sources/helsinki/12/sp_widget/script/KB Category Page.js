// populate the 'data' variable
data.category = $sp.getParameter("kb_category");
var kb_cat = new GlideRecord("kb_category");
data.categoryDisplay = gs.getMessage("Select a category");
data.items = [];
data.categoryExists = false;
if (kb_cat.get(data.category)) {
  data.categoryExists = true;
  data.categoryDisplay = kb_cat.getDisplayValue();
  data.items = $sp.getKBCategoryArticles(data.category);
}
data.kb_knowledge_page = $sp.getDisplayValue("kb_knowledge_page") || "kb_view";

data.breadcrumbs = [{label: data.categoryDisplay, url: '#'}];
var rec = kb_cat.parent_id.getRefRecord();
while (rec.getRecordClassName() == "kb_category") {
  data.breadcrumbs.unshift({label: rec.getDisplayValue(), url: '?id=kb_category&kb_category=' + rec.getUniqueValue()});
  rec = rec.parent_id.getRefRecord();
}
data.breadcrumbs.unshift({label: gs.getMessage("Knowledge Base"), url: '?id=' + data.kb_knowledge_page});
