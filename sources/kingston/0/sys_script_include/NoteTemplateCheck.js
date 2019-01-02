var NoteTemplateCheck = Class.create();
NoteTemplateCheck.prototype = {
    initialize: function() {
    },
	
	hasAvailableTemplate : function (currentTable, sysId) {
		var curr = new GlideTableHierarchy(currentTable).getBase();
		var prev = currentTable;
		var parentList = [];
		parentList.push(prev);
		while ( curr != prev) {
			parentList.push(curr);
			prev = curr;
			curr = new GlideTableHierarchy(prev).getBase();
		}
		var tableAncestors = parentList.join();
		
		var noteTempGR = new GlideRecord("sn_templated_snip_note_template");
		noteTempGR.addEncodedQuery("tableIN" + tableAncestors);
		noteTempGR.query();
		while (noteTempGR.next()) {
			var condition = noteTempGR.getValue("condition") == null? "" : noteTempGR.getValue("condition").toString();
			var gr = new GlideRecord(currentTable);
			gr.addEncodedQuery(condition);
			gr.query();
			while (gr.next()) {
				if (gr.getValue("sys_id").toString() == sysId) 
					return true;	
			}
		}
		return false;
	},
	
	isHrTable : function (table) {
		var tablesGR = new GlideRecord("sys_db_object");
		tablesGR.addQuery("name", table);
		tablesGR.query();
		if (tablesGR.next()) {
			var tableScope = tablesGR.sys_scope.toString();
			var sysApps = new GlideRecord("sys_scope");
			sysApps.addEncodedQuery("scopeSTARTSWITHsn_hr");
			sysApps.query();
			while (sysApps.next()) {
				if (tableScope == sysApps.sys_id)
					return true;
			}
		}
		return false;
	},

    type: 'NoteTemplateCheck'
};