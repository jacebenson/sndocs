var t = data;
var z = new GlideRecord('kb_knowledge');
var kbCat = options.kb_category || "0a86f3cbff0221009b20ffffffffff81";
z.addQuery('kb_category', kbCat);
z.addQuery('workflow_state', 'published');
z.addQuery('valid_to', '>=', (new GlideDate()).getLocalDate().getValue());
z.orderByDesc('published');
z.setLimit(options.max_number || 5);
z.query();
t.rowCount = z.getRowCount();
t.articles = [];

while (z.next()) {
  var a = {};
  a.short_description = z.getValue('short_description');
  a.sys_view_count = z.getValue('sys_view_count');
  a.sys_id = z.getValue('sys_id');
  a.published = z.getValue('published');
  a.published_display = gs.getMessage("Published {0}", z.getDisplayValue('published'));
  t.articles.push(a);
}
