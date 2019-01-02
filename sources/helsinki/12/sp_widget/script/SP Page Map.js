(function() {
	data.placeholderMsg = gs.getMessage("Select Page yo...");
  var map = data.map = [];
  var gr = new GlideRecord('sp_page');
  var id = $sp.getParameter('p');
	
	if (!id) {
		data.id = null;
		return;
	}
	
  gr.addQuery('id', id);
  gr.query();
  gr.next();

	data.id = gr.getValue('id');
	data.title = gr.getValue('title');
  var m = getO(gr);
  m.name = gr.getValue('id');
  map.push(m);
  getContainers(map, gr.getValue('sys_id')); 
  
  function getContainers(map, sys_id) {
    var t = getGR('sp_container', 'sp_page', sys_id);
    while (t.next()) {
      var c = getO(t, sys_id);
      c.name = t.getValue('name');
      map.push(c);
      getRows(map, t.getValue('sys_id'));
    }
  }

  function getRows(map, sys_id) {
    var n = 1;
    var t = getGR('sp_row', 'sp_container', sys_id);
    while (t.next()) {
      var c = getO(t, sys_id);
      c.name = "Row " + n++;
      map.push(c);
      getColumns(map, t.getValue('sys_id'));
    }
  }

  function getColumns(map, sys_id) {
    var n = 1;
    var t = getGR('sp_column', 'sp_row', sys_id);
    while (t.next()) {
      var c = getO(t, sys_id);
      c.name = "Column " + n++;
      map.push(c);
      getWidgetInstances(map, t.getValue('sys_id'));
			getNestedRows(map, t.getValue('sys_id'))
    }
  }

	function getNestedRows(map, sys_id) {
		var n = 1;
		var t = getGR('sp_row', 'sp_column', sys_id);
		while (t.next()) {
			var c = getO(t, sys_id);
			c.name = "Nested Row " + n++;
			map.push(c);
			getColumns(map, t.getValue('sys_id'));
		}

	}
	
  function getWidgetInstances(map, sys_id) {
    var n = 1;
    var t = getGR('sp_instance', 'sp_column', sys_id);
    while (t.next()) {
      var c = getO(t, sys_id);
      c.sys_class_name = t.getRecordClassName();
      c.name = t.getValue("title") || "Instance " + n;
      n++;
      map.push(c);
      getWidget(map, t.getValue('sys_id'), t.getValue('sp_widget'));
    }
  }

  function getWidget(map, parent, sys_id) {
    var t = new GlideRecord('sp_widget');
    t.get(sys_id);
		if (!t.isValidRecord()) {
			gs.log(">>> missing widget " + sys_id);
			return;
		}
    var c = getO(t, parent);
    c.name = t.getValue('name');
    map.push(c);
  }
  
  function getGR(table, parentField, parentID) {
    var t = new GlideRecord(table);
    t.addQuery(parentField, parentID);
    t.orderBy('order');
    t.query();
    return t;
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