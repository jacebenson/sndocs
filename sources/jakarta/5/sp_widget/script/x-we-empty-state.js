(function() {
	var widget = new GlideRecord("sp_widget");
	data.canCreate = widget.canCreate();
	data.recentWidgets = [];
	var recentWidgetsGR = new GlideRecord("sp_widget");
	recentWidgetsGR.orderByDesc("sys_updated_on");
	recentWidgetsGR.setLimit(5);
	recentWidgetsGR.query();
	while (recentWidgetsGR.next()) {
		data.recentWidgets.push({
			name: recentWidgetsGR.getValue("name"),
			sys_id: recentWidgetsGR.getUniqueValue()
		});
	}
})();