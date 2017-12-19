function getFormUIAction(tableName) {
	if (GlideStringUtil.nil(tableName)) {
		return "table=global^form_action=true^active=true";
	}
	var currentAndParentTables = GlideDBObjectManager.get().getTables(tableName);
	var str = currentAndParentTables.toString();
	var tables = str.substring(1, str.length() - 1);
	tables += ", global";
	var stringQuery = "tableIN" + tables + "^form_action=true^active=true";
	return stringQuery;
}