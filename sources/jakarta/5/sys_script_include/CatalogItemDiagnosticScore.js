var CatalogItemDiagnosticScore = Class.create();
CatalogItemDiagnosticScore.prototype = Object.extendsObject(DiagnosticScore, {
    SELECT_BOX_TYPE: 5,
    TABLE_VARIABLE: 'item_option_new',
    TABLE_CATALOG_CLIENT_SCRIPT: 'catalog_script_client',

    process: function(gr, catItemSysId) {
		this.check('checkBalancedContainers', this.checkBalancedContainers, gr, catItemSysId);
        this.check('checkDuplicateVariables', this.checkDuplicateVariables, gr, catItemSysId);
        this.check('checkAJAX', this.checkClientScriptsForAjax, gr, catItemSysId);
        this.check('checkDOMManipulation', this.checkClientScriptsForDom, gr, catItemSysId);
        this.check('checkSelectBoxUnique', this.checkSelectBoxUniqueLookup, gr, catItemSysId);
    },

    /* Check for Balanced Containers */
    checkBalancedContainers: function(catItemGR, catItemSysId) {
		var containerStart = 0;
		var containerEnd = 0;
		var notIndented = 0;
		var options = GlideappCatalogItem.get(catItemSysId).getVariables();
		while(options.next()) {
			if(options.type == 19)
				containerStart++;
			else if(options.type == 20)
				containerEnd++;
			if(containerEnd > containerStart)
				notIndented = 1;
		}
		var res = [];
		var diff = Math.abs(containerStart - containerEnd);
		if(diff || notIndented) {
			var resObj = {};
			resObj.details = "'Container Start' variables : " + containerStart + ".<br/>'Container End' variables : " + containerEnd + ".<br/><strong>*Both types of variables must be paired & indented for normal behaviour.<br/>*If there are more 'Container End' before 'Container Start', then, they are not finely indented.)</strong>";
			res.push(resObj);
		}
        return {result: res, score: diff + notIndented, table: this.TABLE_VARIABLE};
    },

    /* Check for duplicate variables */
    checkDuplicateVariables: function(catItemGR, catItemSysId) {
        var variablesDictionary = {};
        var variableSets = this._getItemVariableSets(catItemSysId);

        var catItemQuery = {column: 'cat_item', value: catItemSysId, or:[]};
        this._forEach(variableSets, function(variableSet) {
            catItemQuery.or.push({column: 'variable_set', value: variableSet});
        });

        /* Store all associated variables in a hash table with the name as key */
        this._forEachGR(this.TABLE_VARIABLE, [catItemQuery, {column:'active', value:'true'}], function(gr) {
			// Skipping duplicate check for 'formatter' variables
			if(gr.type == 12 || gr.type == 20 || gr.type == 24)
				return;
            var name = gr.name+'';
            if (variablesDictionary[name] == undefined) {
                variablesDictionary[name] = [];
            }
            variablesDictionary[name].push({name:name, sys_id:gr.sys_id+'', variableSet: gr.variable_set+'', variableSetName: gr.variable_set.name+''});
        });

        var duplicateVariables = [];
        for (var key in variablesDictionary) {
            if (variablesDictionary.hasOwnProperty(key) && variablesDictionary[key].length > 1) {

                this._forEach(variablesDictionary[key], (function (record) {
                    var resultObj = {name: key, sys_id: record.sys_id};
                    if (record.variableSet.length)
                        resultObj.details = "Duplicate name for variable '" + key + "' associated with the variable set: '" + record.variableSetName + "'";
                    else
                        resultObj.details = "Duplicate name for variable '" + key + "' associated with this catalog item";

                    duplicateVariables.push(resultObj);
                }).bind(this));
            }
        }

        return {result: duplicateVariables, score: duplicateVariables.length, table: this.TABLE_VARIABLE};
    },

    /* Check client scripts for AJAX calls */
    checkClientScriptsForAjax: function(catItemGR, catItemSysId) {
        /* Search strings are escaped for being used as RegExp */
        var searchStrings = ['GlideRecord', '\\$http', 'GlideAjax', '\\$\\.get', '\\$\\.post', '\\$\\.ajax'];
        var matchedScripts =  this.searchCode(catItemSysId, this.TABLE_CATALOG_CLIENT_SCRIPT, searchStrings);

        return {result: matchedScripts, score: matchedScripts.length, table: this.TABLE_CATALOG_CLIENT_SCRIPT};
    },

    /* Check client scripts for DOM Manipulation */
    checkClientScriptsForDom: function(catItemGR, catItemSysId) {
        var searchStrings = ['^\\$\\$\\(', '\\$\\$\\(', '\\$j\\(', 'getElementById', 'getElementsByClassName', 'getElementsByTagName', 'getElementsByName', 'gel\\('];
        var matchedScripts = this.searchCode(catItemSysId, this.TABLE_CATALOG_CLIENT_SCRIPT, searchStrings);

        return {result: matchedScripts, score: matchedScripts.length, table: this.TABLE_CATALOG_CLIENT_SCRIPT};
    },

    /* Check for select box variables for unique-lookup-checkbox */
    checkSelectBoxUniqueLookup: function(catItemGR, catItemSysId) {
        var messedUpVariables = [];
        var associatedVariableSets = this._getItemVariableSets(catItemSysId);

        /* Build the query: CAT_ITEM is catItemSysId OR VARIABLE_SET is any of the associated vsets */
        var catItemQuery = {column: 'cat_item', value: catItemSysId, or: []};
        this._forEach(associatedVariableSets, function(variableSet) {
            catItemQuery.or.push({column: 'variable_set', value: variableSet});
        });

        /* Check all the variables associated with the catalog item or any of its variable sets */
        var queries = [catItemQuery,
                       {column: 'type', value: this.SELECT_BOX_TYPE},
                       {column: 'lookup_unique', value: true}];

        this._forEachGR(this.TABLE_VARIABLE, queries, function(gr) {
            messedUpVariables.push({
                name: gr.name+'',
                sys_id: gr.sys_id+'',
                details: "Variable '" + gr.name + "' has the unique lookup attribute enabled. This may lead to performance issues."
            });
        });

        return {result: messedUpVariables, score: messedUpVariables.length, table:this.TABLE_VARIABLE};
    },

    searchCode: function(catItemSysId, table, searchStrings) {
        /* Get associated variable sets */
        var variableSets = this._getItemVariableSets(catItemSysId);

        /* Build the query: CAT_ITEM is thisItem OR VARIABLE_SET is anyAssociatedSet */
        var catItemQuery = {column: 'cat_item', value: catItemSysId, or:[]};
        this._forEach(variableSets, function(variableSet) {
            catItemQuery.or.push({column: 'variable_set', value: variableSet});
        });
        var queries = [catItemQuery];

        return this._searchCode(table, queries, 'script', searchStrings);
    },

    _getItemVariableSets: function(catItemSysId) {
        var variableSets = [];

        // Query all variable sets that are associated with this catalog item
        this._forEachGR('io_set_item', [{column: 'sc_cat_item', value: catItemSysId}], function(gr) {
            variableSets.push(gr.variable_set+'');
        });

        return variableSets;
    },

    type: 'CatalogItemDiagnosticScore'
});