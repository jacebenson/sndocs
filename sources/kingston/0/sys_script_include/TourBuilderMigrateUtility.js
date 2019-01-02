var TourBuilderMigrateUtility = Class.create();
TourBuilderMigrateUtility.prototype = {
    initialize: function() {},
	
	_whoColumns: ['sys_id',
				  'sys_created_on',
				  'sys_mod_count',
				   'sys_updated_on'],

    copyData: function(copyObject) {

        var update_params = [];
        var query_params = copyObject.query_params;
        var fromColumns = this._getColumns(copyObject.fromTable);
        var toColumns = this._getColumns(copyObject.toTable);
        var copyToobj = {};


        //create a record for FromTable and use the sysId to update the columns
		if(gs.nil(copyObject.embeddedHelpSysid)){
        copyToobj.sysId = this._createRecord(copyObject.toTable);
		}
		else
			{
				copyToobj.sysId = copyObject.embeddedHelpSysid;
		
			}
        copyToobj.tableName = copyObject.toTable;

        //Intialize a record for toTable
        var copyFrom = new GlideRecord(copyObject.fromTable);
        if (!gs.nil(query_params)) {
            var k;
            for (k = 0; k < query_params.length; k++) {
                copyFrom.addQuery(query_params[k].column, query_params[k].value);
            }
        }
        copyFrom.query();

        while (copyFrom.next()) {
            for (var i = 0; i < fromColumns.length; i++) {
                for (var j = 0; j < toColumns.length; j++) {
                    if ((fromColumns[i].name == toColumns[j].name)  && (this._whoColumns.indexOf(toColumns[j].name) <= -1) ) {
							update_params.push({
                            column: toColumns[j].name,
                            value: copyFrom.getValue(toColumns[j].name.toString())
                        });
							
                        copyToobj.update_params = update_params;
                        this._updateRecord(copyToobj);

                    }
                }
            }

        } //Main loop ends here

        return copyToobj.sysId;

    },

    _getColumns: function(tableName) {
        var tableColumns = [];
        var element = {};
        var fromTable = new GlideRecord('sys_dictionary');
        fromTable.addQuery('name', tableName);
        fromTable.query();
        while (fromTable.next()) {
            tableColumns.push({
                name: fromTable.element.toString()
            });

        }
        return tableColumns;
    },

    _createRecord: function(tableName) {
        var gr = new GlideRecord(tableName);
        gr.initialize();
        var sysId = gr.insert();
        return sysId;
    },

    _updateRecord: function(copyToobj) {
        var gr = new GlideRecord(copyToobj.tableName);
        gr.addQuery('sys_id', copyToobj.sysId);
        gr.query();
        while (gr.next()) {

            gr.autoSysFields(false);

            for (k = 0; k < copyToobj.update_params.length; k++) {
                gr.setValue(copyToobj.update_params[k].column, copyToobj.update_params[k].value);
            }
            gr.update();
        }

    },

    type: 'TourBuilderMigrateUtility'
};