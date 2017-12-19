function ($scope, spUtil) {
	var c = this;
	if (!c.options.table)
		return;
	
	spUtil.recordWatch($scope, c.options.table, c.options.filter);
}