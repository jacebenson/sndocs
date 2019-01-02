function UpdateFieldInternalType(table, field, expectedCurrentType, newType) {
	if (GlideStringUtil.nil(table)) {
		gs.warn("UpdateFieldInternalType: invalid parameter table is empty");
		return;
	}

	if (GlideStringUtil.nil(field)) {
		gs.warn("UpdateFieldInternalType: invalid parameter field is empty");
		return;
	}

	if (GlideStringUtil.nil(expectedCurrentType)) {
		gs.warn("UpdateFieldInternalType: invalid parameter expectedCurrentType is empty");
		return;
	}

	if (GlideStringUtil.nil(newType)) {
		gs.warn("UpdateFieldInternalType: invalid parameter newType is empty");
		return;
	}

	var dic = new GlideRecord("sys_dictionary");
	dic.addQuery("name", table);
	dic.addQuery("element", field);
	dic.query();
	if (!dic.next()) {
		gs.warn("UpdateFieldInternalType: unable to locate dictionary for " + table + "." + field);
		return;
	}

	if (dic.internal_type == newType) {
		gs.warn("UpdateFieldInternalType: already desired internal type for " + table + "." + field);
		return;
	}

	if (dic.internal_type != expectedCurrentType) {
		gs.warn("UpdateFieldInternalType: unexpected current type " + dic.internal_type + " for " + table + "." + field);
		return;
	}

	gs.info("UpdateFieldInternalType: updating type for " + table + "." + field);
	dic.internal_type = newType;
	dic.setWorkflow(false);
	dic.update();
	GlideTableManager.invalidateTable(table);

	var shards = new SncTableRotation(table).getTablesInRotation();
	if (shards && shards.size() > 0) {
		for (var i = 0; i < shards.size(); i++) {
			UpdateFieldInternalType(shards.get(i), field, expectedCurrentType, newType);
		}
	}
}