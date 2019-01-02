var PAUsageUtil = Class.create();
PAUsageUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	getSysIDs:function(){
		var gra = new GlideAggregate('sys_portal_page');
		gra.groupBy('user');
		gra.query();
		var userIDs = [];
		while (gra.next()) {
			userIDs.push(gra.user.toString());
		}
		return userIDs;
	},
	
	getUserIDs: function(count){
		var gra = new GlideAggregate('sys_report');
		gra.groupBy('sys_updated_by');
		if (count) {
			gra.addHaving('COUNT','>',count);
		}
		gra.query();
		var userNames = [];
		while (gra.next()) {
			userNames.push(gra.sys_updated_by.toString());
		}
		return userNames;
	},
	
	getReportTables: function(){
		var gra = new GlideAggregate('sys_report');
		gra.groupBy('table');
		gra.addHaving('COUNT', '>', 5);
		gra.query();
		var reportTables = [];
		while (gra.next()) {
			reportTables.push(gra.table.toString());
		}
		return reportTables;
	},
		
	type: 'PAUsageUtil'
});