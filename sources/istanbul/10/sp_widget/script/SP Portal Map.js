// populate the 'data' object
// e.g., data.table = $sp.getValue('table');
(function() {
	var map = data.map = [];
	var gr = new GlideRecord('sp_portal');
	var id = $sp.getParameter('p');
	if (!id) {
		var pref = gs.getPreference("sp.portal");
		if (pref == null)
			gr.addQuery('default', true);
		else
			gr.addQuery('url_suffix', pref);
	} else
		gr.addQuery('sys_id', id);
	
	gr.query();
	if (!gr.next())
		return;

	if (id)
		gs.getUser().setPreference("sp.portal", gr.getValue("url_suffix"));
	data.title = gr.getValue('title');
	data.sys_id = gr.getUniqueValue();
	var m = getO(gr);
	m.name = gr.getValue('title');
	map.push(m);

	var theme = gr.getValue('theme');
	if (theme) {
		var t = new GlideRecord('sp_theme');
		t.get(gr.getValue('theme'));
		m = getO(t, m.key);
		m.name = t.getValue('name');
		map.push(m);

		getWidget(t.getValue('header'), t.getUniqueValue());		
	}

	getMenuRectangle(gr.getValue('sp_rectangle_menu'), gr.getUniqueValue());

	function getRectangle(sys_id, parent) {
		if (!sys_id)
			return; 

		var gr = new GlideRecord('sp_header_footer');
		gr.get(sys_id);
		var m = getO(gr, parent);
		m.name = gr.getValue('name');
		map.push(m);

		getWidget(gr.getValue('sp_widget'), gr.getUniqueValue());
	}

	function getMenuRectangle(sys_id, parent) {
		if (!sys_id)
			return; 

		var gr = new GlideRecord('sp_instance_menu');
		gr.get(sys_id);
		var m = getO(gr, parent);
		m.name = gr.getValue('title');
		map.push(m);
		getMenuItems(gr.getUniqueValue(), gr.getUniqueValue());
	}

	function getMenuItems(sys_id, parent) {
		var gr = new GlideRecord('sp_rectangle_menu_item');
		gr.addQuery('sp_rectangle_menu', sys_id);
		gr.orderBy('order');
		gr.query();
		while (gr.next()) {
			var m = getO(gr, parent);
			m.name = gr.getValue('label');
			map.push(m);
		}
	}

	function getWidget(sys_id, parent) {
		if (!sys_id)
			return; 

		var gr = new GlideRecord('sp_widget');
		gr.get(sys_id);
		var m = getO(gr, parent);
		m.name = gr.getValue('name');
		map.push(m);
	}

	// object that goes in the array 
	// common vars table, key, sys_id
	function getO(gr, parent) {
		var c = {};
		c.table = gr.getTableName();
		c.key = gr.getValue('sys_id');
		c.sys_id = gr.getValue('sys_id');
		if (parent)
			c.parent = parent;

		return c;
	}

})();