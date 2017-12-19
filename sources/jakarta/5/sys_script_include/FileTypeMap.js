var FileTypeMap = (function() {
	var appExplorerStructure = AppExplorerStructure.create(),
		categoryTree = appExplorerStructure.categoryTree(),
		types = {};
	
	return {
		studioTypeForTable: function(tableName) {
			if (_.isEmpty(types)) {			 
				types = _.chain(categoryTree)
					.pluck('types')
					.flatten()
					.indexBy('id')
					.value();
			}
			return types[tableName];
		}
	};
})();
