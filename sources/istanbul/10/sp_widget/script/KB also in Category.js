var gr = GlideRecord("kb_knowledge");
gr.get($sp.getParameter('sys_id'));
var kbu = new KBKnowledgeSNC();
data.isvalid = gr.isValidRecord() && kbu.canRead(gr) && !gr.kb_category.nil();
data.category = gr.getDisplayValue('kb_category');
data.category_id = gr.getValue('kb_category');
data.alsoInMsg = gs.getMessage("Also in {0}", data.category);

data.articles = [];
if (data.isvalid) {
	var z = new GlideRecord('kb_knowledge');
	z.addQuery('kb_category', gr.getValue('kb_category'));
	z.addQuery('workflow_state', 'published');
	z.addQuery('valid_to', '>=', (new GlideDate()).getLocalDate().getValue());
	z.orderByDesc('sys_view_count');
	z.query();
	data.count = z.getRowCount();
	var count = 0;
	while (z.next() && count < 5) {
	  if (z.sys_id == gr.sys_id)
	    continue;
      
      if (!z.canRead())
        continue;
	  
	  count++;
	  var a = {};
		$sp.getRecordValues(a, z, 'sys_id,short_description,sys_view_count')
	  a.published = z.getDisplayValue('published');
	  data.articles.push(a);
	}
}