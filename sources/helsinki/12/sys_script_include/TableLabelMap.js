var TableLabelMap = (function() {
	
	return {
		labelsForTables : function(tableNames) {
			var gr = new GlideRecord('sys_documentation');
			gr.addQuery('name', 'IN', tableNames);
			gr.addQuery('language', 'IN', [gs.getSession().getLanguage(), 'en']);
			gr.addNullQuery('element');
			gr.query();
			return _gr(gr).reduce(function(memo, row) {
				var name = row.getValue('name');
				if (memo[name] && row.getValue('language') === 'en')
					return memo; // short-circuit if we already have a non-English, user-language label
				
				memo[name] = row.getValue('label');
				return memo;
			}, {});
		}
	};
	
})();