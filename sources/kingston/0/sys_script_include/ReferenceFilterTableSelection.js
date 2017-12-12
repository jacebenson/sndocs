var ReferenceFilterTableSelection = Class.create();
ReferenceFilterTableSelection.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	getRecords: function(){
		 var gp = [];
		var table = this.getParameter("sysparm_reference_table");
		var conditions = this.getParameter("sysparm_reference_conditions");

		
		var grp = new GlideRecord(table);
		grp.addActiveQuery()
		if(conditions)
		  grp.addEncodedQuery(conditions);
        grp.setLimit(10000);
		grp.query();
		while(grp.next()) {
			gp.push(this.getRecordJSON(grp))
		}
		var result = this.newItem("result");
        result.setAttribute("record", JSON.stringify(gp));
		return JSON.stringify(gp);
	
	},
	
	getRecordJSON: function(gr){
		var record = {};
		record.key =gr.getDisplayValue("sys_id");
		record.value = gr.getDisplayValue(gr.getDisplayName())
		
		return record;
	},

    type: 'ReferenceFilterTableSelection'
});