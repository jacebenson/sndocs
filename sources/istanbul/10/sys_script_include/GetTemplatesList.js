var GetTemplatesList = Class.create();
GetTemplatesList.prototype = Object.extendsObject( AbstractAjaxProcessor, {
	returnList: function(){
		var table = this.getParameter('sysparm_table_name');
		var tt = new GlideRecord("sys_template");
		var common = 'table=' + table + '^active=true';
		var global = 'global=true';
		var mine = 'user=javascript:gs.getUserID()^ORgroup=javascript:getMyGroups()';
		var query = common + "^" + global + "^NQ" + common + "^" + mine;
		tt.addQuery(query);
		tt.orderBy('name');
		tt.query();
		while (tt.nextRecord()) {
			this._addTemplate(tt)
		}
	},
	
	_addTemplate:function(record){
		var template = this.newItem("template");
		template.setAttribute("name", record.name);
		template.setAttribute("sys_id", record.sys_id);
		template.setAttribute("application", record.sys_scope);
		template.setAttribute("show_on_template_bar", record.getValue('show_on_template_bar'));
	},
    type: 'GetTemplatesList'
});