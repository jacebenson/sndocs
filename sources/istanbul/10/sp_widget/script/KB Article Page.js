var t = data;
data.kb_knowledge_page = $sp.getDisplayValue("kb_knowledge_page") || "kb_view";
var articleGR = GlideRecord("kb_knowledge");
articleGR.get($sp.getParameter('sys_id'));
var recordIsValid = articleGR.isValidRecord();
var canReadArticle = articleGR.canRead();
t.isvalid = recordIsValid && canReadArticle;

if (canReadArticle) {
  articleGR.incrementViewCount(); // update sys_view_count immediately on kb_knowledge record
  var art = new GlideRecord("kb_use");
  if (art.isValid()) {
    art.article = articleGR.getUniqueValue();
    art.user = gs.getUserID();
    art.viewed = true;
    art.insert(); // kb_use records are aggregated to update sys_view_count nightly
    $sp.logStat('KB Article View', "kb_knowledge", articleGR.getUniqueValue(), articleGR.short_description);
  }

  t.category = articleGR.getValue('kb_category');
  t.sys_id = $sp.getParameter('sys_id');
  t.showAttachments = false;
  if (articleGR.display_attachments)
    t.showAttachments = true;
  t.categoryDisplay = articleGR.getDisplayValue('kb_category');
  t.short_description = articleGR.getValue('short_description');
  t.text = articleGR.getValue('text');
  t.sys_view_count = articleGR.getDisplayValue('sys_view_count');
  t.author = articleGR.getDisplayValue('author');
  t.publishedUtc = articleGR.getValue('published');
  t.number = articleGR.getValue('number');
  t.rating = articleGR.getValue('rating');
	t.direct = false;
	if (articleGR.direct)
		t.direct = true;

  t.breadcrumbs = [{label: t.short_description, url: '#'}];
  if (!articleGR.kb_category.nil()) { 
    var rec = articleGR.kb_category.getRefRecord();
    while (rec.getRecordClassName() == "kb_category") {
      t.breadcrumbs.unshift({label: rec.getDisplayValue(), url: '?id=kb_category&kb_category=' + rec.getUniqueValue()});
      rec = rec.parent_id.getRefRecord();
    }
  }
  t.breadcrumbs.unshift({label: gs.getMessage("Knowledge Base"), url: '?id=' + t.kb_knowledge_page});
}
