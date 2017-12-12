(function() {

	data.i18n = {};
	data.i18n.tabPanelAriaLabel = gs.getMessage('Tab panel for current Change {0}');

	var tabs = [];
	var optTabs = JSON.parse(options.tabs);
	if (!optTabs || optTabs.length < 2)
		gs.addErrorMessage(gs.getMessage('vcab_change_tab: More than 1 tab is required.'));
	else {
		optTabs.forEach(function (t, idx) {
			var cols = [];
			t.cols.forEach(function (w) {
				cols.push({
					widget_data: w.widget_id ?
						($sp.getWidget(w.widget_id, w.widget_opt || {}))
						: null,
					col_span: w.col_span
				});
			});
			tabs.push({
				id: idx,
				icon_class: t.icon_class,
				cols: cols,
				tooltip: t.tooltip
			});
		});
	}
	data.tabs = tabs;
	data.sys_id = $sp.getParameter('sys_id'); // meeting id
})();