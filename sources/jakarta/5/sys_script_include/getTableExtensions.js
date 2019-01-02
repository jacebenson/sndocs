function getTableExtensions(objectName) {
	var list = GlideDBObjectManager.get().getTableExtensions(objectName);
	list.add(objectName);
	return list;
}