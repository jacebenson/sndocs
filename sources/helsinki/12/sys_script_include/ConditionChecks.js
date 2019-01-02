//This class handles checking for any condition checks that are defined on a contract
gs.include("PrototypeServer");

var ConditionChecks = Class.create();
ConditionChecks.prototype = {
    
    initialize: function() {
        this.checks = new Array(); // 2 dimension array [field].[check]
        this.tableNames = {};
        this.debug = false;
    },
    
    /**
     * Check conditions for the specified table
     */
    check: function(tableName) {
        this._getChecks(tableName);
        var gr = new GlideRecord(tableName);
        if (gr.isValid()) {
            gr.query();
            while (gr.next()) {
                this._checkRecord(gr);
            }
        }
    },
    
    /**
     * Check conditions for all tables specified in the clm_condition_check table
     */
    checkAll: function() {
        this._getTableNames();
        for (tableName in this.tableNames) {
            this.check(tableName);
        }
    },
    
    
    /**
     * Check the condition for a single record, record should be an instanceOf(tb)
     */
    checkRecord: function(gr, cls) {
        if (JSUtil.nil(gr))
            return;
        
        if (cls == undefined){
            this._getChecks( gr.getTableName());
        } else {
            if (!gr.instanceOf(cls)) {
                gs.log("***** ERROR *****: The GlideRecord passed to checkRecord has to be the instance of the class passed as parameter");
                return;
            }
            this._getChecks(cls);
        }
        this._checkRecord(gr);
    },
    
    /**
     * Check the condition for a single record when we have already read the condition checks for the table
     * DSZ - checks are grouped by check.field and executed until the first check for the field is triggered
     *
     */
    _checkRecord: function(gr) {
        var check = null;
        var checksLen = 0;
        var fieldType = '';
        
        // loop through the field name array
        for (var f in this.checks) {
            checksLen = this.checks[f].length;
            // loop through the checks for field and stop at first natching
            for (var j = 0; j < checksLen; j++) {
                check = this.checks[f][j];
                if (this._checkFilter(gr, check.table, check.filter)) {
                    //if (check.matcher.match(gr, true)) {
                        fieldType = gr[check.field].getED().getInternalType();
                        
                        // already matching this condition check?
                        if (fieldType == 'reference' && gr[check.field] != check.sys_id) {
                            gr[check.field] = check.sys_id;
                            gr.update();
                            // Notify email notifications
                            if (check.event_name) {
                                gs.eventQueue(check.event_name, gr, check.sys_id, check.name);
                            }
                        } else if(fieldType != 'reference' && gr[check.field] != check.name) {
                            gr[check.field] = check.name;
                            gr.update();
                            // Notify email notifications
                            if (check.event_name) {
                                gs.eventQueue(check.event_name, gr, check.sys_id, check.name);
                            }
                        }
                        break;
                    }
                } // for through checks
            } // for through field
        },
        
        _checkFilter: function(gr, table, filter) {
            var cr = new GlideRecord(table);
            cr.addEncodedQuery(filter);
            cr.addQuery('sys_id', gr.sys_id);
            cr.query();
            if (cr.getRowCount() == 1)
                return true;
            else
                return false;
        },
        
        /**
         * Get all of the tables that are specified in the expiration definition
         */
        _getTableNames: function() {
            this.tableNames = {};
            var gr = new GlideRecord("clm_condition_check");
            gr.query();
            while (gr.next()) {
                this.tableNames[gr.table.toString()] = true;
            }
        },
        
        /**
         * Get the condition checks for the specified table
         * DSZ - added the loop if many checks for the same table
         */
        _getChecks: function(tableName) {
            this.checks = [];
            var eventName = '';
            // see if the condition has an overall event name
            var gr = new GlideRecord('clm_condition_check');
            gr.initialize();
            gr.addQuery('table', tableName);
            gr.orderBy('order');
            gr.query();
            while (gr.next()) {
                eventName = gr.event_name.toString();
                checkSysId = gr.sys_id.toString();
                var fieldName = gr.condition_field.toString();
                this.checks[fieldName] = new Array();
                // now get the checks and put them in sub-array
                var grCh = new GlideRecord('clm_condition_checker');
                grCh.initialize();
                grCh.addQuery('condition_check', checkSysId);
                grCh.orderBy('order');
                grCh.query();
                while (grCh.next()) {
                    var check = {}; //create new object
					check.name = grCh.name.toString();
                    check.sys_id = (check.name == '')? '' : grCh.sys_id.toString();
                    check.field = fieldName;
                    check.table = grCh.table;
                    check.filter = grCh.condition.toString();
                    check.matcher = new GlideFilter(grCh.condition, "condition");
                    if (grCh.event_name) {
                        check.event_name = grCh.event_name.toString();
                    } else {
                        check.event_name = eventName;
                    }
                    this.checks[fieldName].push(check);
                }
            }
        },
        
        z: null
    };