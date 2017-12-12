var DiagnosticScore = Class.create();
DiagnosticScore.prototype = {
    DIAGNOSTICS_METADATA: 'application_diagnostic',
    DIAGNOSTIC_CHECK_METADATA: 'diagnostic_rule',
    DIAGNOSTICS_HISTORY: 'diagnostics_history',
    DIAGNOSTICS_RESULT: 'diagnostics_result',
    checkTypes: {},
    itemScores: [],

    initialize: function(tableName, appId) {
        this.tableName = tableName;
        this.appId = appId;
        this.timestamp = gs.nowDateTime();
    },

    /* Invoke this function for a full run */
    run: function() {
        var _this = this;
        this._forEachGR(this.tableName, [], function(gr) {
            _this.processItem(gr, gr.sys_id+'');
        });
    },

    /* Invoke this function for a single run */
    processItem: function(gr) {
        this.itemScores = [];
        this.deleteExistingResults(gr);
        this.process(gr, gr.sys_id+'');
        return this._saveResultSummary(gr);
    },

    deleteExistingResults: function(itemGR) {
        var gr = new GlideRecord(this.DIAGNOSTICS_RESULT);
        gr.addQuery('item', itemGR.sys_id+'');
        gr.deleteMultiple();

        //!FIXME
        gr = new GlideRecord(this.DIAGNOSTICS_HISTORY);
        gr.addQuery('item', itemGR.sys_id+'');
        gr.deleteMultiple();
    },

    _saveResultSummary: function(itemGR) {
        var gr = new GlideRecord(this.DIAGNOSTICS_RESULT);
        gr.application = this.appId;
        gr.timestamp = this.timestamp;
        gr.table_name = this.tableName;
        gr.item = itemGR.sys_id+'';
        gr.score = this._getWeightedScore(this.itemScores);
        return gr.insert();
    },

    _getWeightedScore: function(scores) {
        var weightedScore = 0;
        this._forEach(scores, function(score) {
            weightedScore += score.score * score.weight;
        });
        return weightedScore;
    },

    process: function(gr, itemSysId) {
        /* Main function that will be invoked to do the processing. Please OVERRIDE! */
    },

    check: function(checkType, checkFunction, gr, itemSysId) {
        /* A decorator function that invokes the argument function and saves its result in the corresponding table */
        var results = checkFunction.call(this, gr, itemSysId);
        this._saveResults(results, checkType, gr.sys_id+'');
        return results;
    },

    _saveResults: function(results, checkType, itemSysId) {
        var itemCheckType = this._getCheckType(checkType);

        this._forEach(results.result, (function(res) {
            var gr = new GlideRecord(this.DIAGNOSTICS_HISTORY);
            gr.application = this.appId;
            gr.timestamp = this.timestamp;
            gr.check_type = itemCheckType.sysId;
            gr.item_table_name = this.tableName;
            gr.item = itemSysId;
            gr.result = (typeof(res.details) == "string") ? res.details : (new JSON()).encode(res.details);
            gr.document_id = res.sys_id;
            gr.table_name = results.table;
            gr.score = (res.count && res.count > 0) ? res.count : 1;

            gr.insert();
        }).bind(this));

        var score = results.score;
        this.itemScores.push({score:score, weight:parseInt(itemCheckType.weight)});
    },

    _getCheckType: function(type) {
        var checkType = this.checkTypes[type];
        if (!checkType || !checkType.length) {
            this._forEachGR(this.DIAGNOSTIC_CHECK_METADATA, [{column:'check_type', value:type}], function(gr) {
                checkType = {sysId: gr.sys_id+'', weight: gr.weight+''};
            });
            this.checkTypes[type] = checkType;
        }

        return checkType;
    },

    _searchCode: function(table, queries, columnName, searchStrings) {
        var matchedScripts = [];

        if (!queries)
            queries = [];

        /* STEP #1: Build the query (if any) to search for string patterns */
        if (searchStrings.length) {

            // add the first one
            var searchQuery = {column: columnName, operator: 'CONTAINS', value: searchStrings[0], or: []};

            // Do an 'OR' for the remaining strings
            this._forEach(searchStrings.slice(1), function(searchString) {
                searchQuery.or.push({column: columnName, operator: 'CONTAINS', value: searchString});
            });
            queries.push(searchQuery);
        }
		queries.push({column:'active', value:'true'});

        this._forEachGR(table, queries, (function(gr) {
            var script = gr[columnName];
            var resultSet = {name: gr.name+'', sys_id: gr.sys_id+'', details:[], count: 0};

            /* For each search pattern find all occurences and add to the details array for this script */
            this._forEach(searchStrings, function(searchString) {

                /* Do a global regex match for this searchString */
                var regex = new RegExp(searchString, "g");
                var matchFound;
                while ((matchFound = regex.exec(script))) {

                /* IF a proper match is found, add the line and line number to the details array */
                    var index = matchFound.index;
                    if (index != -1) {
                        var lineNo = script.substring(0, index).split('\n').length;
                        var line = script.split('\n')[lineNo-1];
                        resultSet.details.push({lineNo: lineNo+'', line: line+''});
                    }
                }
            });

            /* Count indicating number of lines */
            resultSet.count = resultSet.details.length;

            /* Sort details by line number */
            resultSet.details.sort(function(res1, res2) {return parseInt(res1.lineNo) - parseInt(res2.lineNo);});

            /* Convert to string */
            resultSet.details = this._map(resultSet.details, function(item) {
                return '<p>#' + item.lineNo + ':&nbsp;&nbsp;&nbsp;&nbsp;' + item.line + '</p>';
            }.bind(this)).join('');

            /* Add each script details to the array */
            matchedScripts.push(resultSet);

        }).bind(this));

        return matchedScripts;
    },

    // Abstracted function to perform GlideRecord query.
    // Queries the @table by applying @queries
    // Calls the @callback function for each result GR.
    _forEachGR: function(table, queries, callback, additionalQueryFunction) {
        var gr = GlideRecord(table);
        var _forEach = this._forEach;

        /* Add the queries */
        _forEach(queries, function(query) {
            var qc = null;
            if (!query.operator || query.operator == '')
                query.operator = '=';
            qc = gr.addQuery(query.column, query.operator, query.value);

            /* Add OR queries */
            if (query.or && query.or.length) {
                _forEach(query.or, function(orQuery) {
                    if (!orQuery.operator || orQuery.operator == '')
                        orQuery.operator = '=';
                    qc.addOrCondition(orQuery.column, orQuery.operator, orQuery.value);
                });
            }
        });

        if (additionalQueryFunction)
            additionalQueryFunction(gr);

        /* Perform the query */
        gr.query();
        while (gr.next()) {
            callback(gr);
        }
    },

    _forEach: function(array, callback) {
        for (var i=0; i<array.length; i++) {
            callback(array[i]);
        }
    },

    _map: function(array, mapper) {
        var out = [];
        this._forEach(array, function(item) {
            out.push(mapper(item));
        });
        return out;
    },

    type: 'DiagnosticScore'
};