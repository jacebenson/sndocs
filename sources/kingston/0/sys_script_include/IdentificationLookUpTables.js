var IdentificationLookUpTables = Class.create();
IdentificationLookUpTables.prototype = {
	getLookupTables: function(className) {
		var map = {};
		var tables = j2js(new TableUtils(className).getTables());
        for (var i = 0; i < tables.length; i++) {
            var refTables = this._getReferencingTables(tables[i]);
            for (var j = 0; j < refTables.length; j++)
                map[refTables[j]] = '';
        }

        var result = [];
        result.push(className);
        for (var tab in map)
            if (tab != className)
                result.push(tab);

        result = this._filterTable(result);
        return result;
	},

	getLookupTablesForClassManager: function(className) {
		var result = [];
	    var lookupTables = this.getLookupTables(className);
		for (var i = 0; i < lookupTables.length; i++) {
			var entry = {};
      entry.value = lookupTables[i];
			entry.name = this._getClassLabel(lookupTables[i]);
			result.push(entry);
		}
		return result;
	},

	process: function() {
        var parent = '' + current.identifier.applies_to;
        var map = {};
        if (GlideStringUtil.nil(current.identifier) || GlideStringUtil.nil(parent)) {
            parent = 'cmdb_ci'; // the only viable default
            var extensions = j2js(new TableUtils(parent).getTableExtensions());
            for (var i = 0; i < extensions.length; i++) // add all CI types
                map[extensions[i]] = '';
        }
        var tables = j2js(new TableUtils(parent).getTables());
        for (var i = 0; i < tables.length; i++) {
            var refTables = this._getReferencingTables(tables[i]);
            for (var j = 0; j < refTables.length; j++)
                map[refTables[j]] = '';
        }

        var result = [];
        result.push(parent);
        for (var tab in map)
            if (tab != parent)
                result.push(tab);

        result = this._filterTable(result);
        return result;
    },

    _filterTable: function(tables) {
		var excluded = ['ecc_event', 'discovery_log', 'cmdb_metric'];
        var filtered = [];
        for (var i = 0; i < tables.length; i++) {
            var tbl = tables[i];
			var j=0;
			while (j<excluded.length) {
				if (tbl.indexOf(excluded[j])==0)
					break;
				j++;
			}
			if (j==excluded.length)
	            filtered.push(tbl);
        }
        return filtered;
    },

    _getReferencingTables: function(table) {
        var referencingTables = [];
        var gr = new GlideAggregate('sys_dictionary');
        gr.addQuery('reference', table);
        gr.addAggregate('count');
        gr.orderByAggregate('count');
        gr.groupBy('name');
        gr.query();
        while (gr.next())
            referencingTables.push('' + gr.name);
        return referencingTables;
    },

	_getClassLabel : function(className) {
		var descriptor = GlideTableDescriptor.get(className);
		return descriptor.getLabel();
	},

    type: 'IdentificationLookUpTables'
};