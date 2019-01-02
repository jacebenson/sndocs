var UICustomizationDebugAjax = Class.create();
UICustomizationDebugAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	getUIDebugInfo: function() {
		this._setUIElementByName(this.getParameter('ui_page_name'), "page");
		var ui_macro_sys_id_list = new JSON().decode(this.getParameter('ui_macro_sys_id_list'));
		for (var i = 0; i < ui_macro_sys_id_list.length; i++) {
			this._setUIElementByID(ui_macro_sys_id_list[i], "macro");
		}
	},

	_getSysID: function(name, type) {
		var gr1 = new GlideRecord('sys_ui_' + type);
		gr1.addQuery('name', name);
		gr1.query();
		gr1.next();
		return gr1.getValue('sys_id');
	},

	_getName: function(sys_id, type) {
		var gr1 = new GlideRecord('sys_ui_' + type);
		gr1.addQuery('sys_id', sys_id);
		gr1.query();
		gr1.next();
		return gr1.getValue('name');
	},

	_getBorderColor: function(sys_id, type) {
		var firstRecordVisited = false;
		var lastUpdateTime;
		var gr2 = new GlideRecord('sys_update_version');
		gr2.addQuery('name', 'sys_ui_' + type + '_' + sys_id);
		gr2.orderByDesc('sys_updated_on');
		gr2.query();
		if (!gr2.hasNext())
			return "Unchanged";

		while (gr2.hasNext()) {
			gr2.next();
			if (!firstRecordVisited) {
				if (gr2.getValue('source_table') == "sys_upgrade_history" && gr2.getValue('state') == "current")
					return "Unchanged";

				lastUpdateTime = gr2.getValue('sys_updated_on');
				firstRecordVisited = true;
			}
			if (gr2.getValue('source_table') == "sys_upgrade_history") {
				if (gr2.getValue('state') == "previous")
					return "Customized";

				if (!this._isReplaced(sys_id, type, gr2.getValue('sys_updated_on')))
					return "Skipped";

				if (gr2.getValue('sys_updated_on') == lastUpdateTime)
					return "Unchanged";
			}
		}
		return "New";
	},

	_isReplaced: function(sys_id, type, sys_updated_on) {
		var gr3 = new GlideRecord('sys_update_version');
		gr3.addQuery('name', 'sys_ui_' + type + '_' + sys_id);
		gr3.addQuery('source_table', 'sys_update_set');
		gr3.addQuery('sys_updated_on', sys_updated_on);
		gr3.query();
		return gr3.hasNext();
	},

	_setUIElementByID: function(sys_id, type) {
		var name = this._getName(sys_id, type);
		this._setUIElement(sys_id, name, type);
	},

	_setUIElementByName: function(name, type) {
		var sys_id = this._getSysID(name, type);
		this._setUIElement(sys_id, name, type);
	},

	_setUIElement: function(sys_id, name, type) {
		var item = this.newItem("ui_" + type);
		var state = this._getBorderColor(sys_id, type);
		item.setAttribute("sys_id", sys_id);
		item.setAttribute("name", name);
		item.setAttribute("state", state);
	},

	type: "UICustomizationDebugAjax"
});