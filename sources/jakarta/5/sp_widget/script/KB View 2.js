var kb = $sp.getValue("kb_knowledge_base");  // portal catalog
data.kb = kb;
var gr = new GlideRecord('kb_knowledge_base');
gr.get(kb);
data.kb_title = gr.getDisplayValue();
$sp.getRecordValues(data, gr, 'title,description');
data.categories = getCategories(kb);
data.documents = getDocuments(kb);
data.filterMsg = gs.getMessage("Filter...");

function getDocuments(kb) {
	var d = [];
	var gr = new GlideRecord('kb_knowledge');
	gr.addQuery('kb_knowledge_base', kb);
	gr.addQuery('workflow_state', 'published');
	gr.addQuery('valid_to', '>=', (new GlideDate()).getLocalDate().getValue());
	gr.orderBy('short_description');
	gr.query();
	while (gr.next()) {
		var n = {};
		$sp.getRecordValues(n, gr, 'sys_id,number,short_description,kb_category');
		n.topCat = $sp.getKBTopCategoryID(n.kb_category);
		d.push(n);
	}
	return d;
}

function getCategories(id) {
	var c = [];
	addCategories(c, id);
	return c;
}

function addCategories(c, id) {
	var gr = new GlideRecord('kb_category');
	gr.addQuery('parent_id', id);
	gr.orderBy('label');
	gr.query();
	while (gr.next()) {
		var n = {};
		$sp.getRecordValues(n, gr, 'sys_id,label,value,parent_id');
		c.push(n);
		//addCategories(c, gr.getValue('sys_id'));
	}
}