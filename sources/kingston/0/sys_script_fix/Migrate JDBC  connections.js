if (isJDBCExtendsConnection()) { // If jdbc_connection extends from sys_connection, it upgrades from G instance
	gs.info('Upgrade from G instance ....');
	migrateDataSourceToJDBCAndUpgradeActivities();
} else { // it upgrades from H/I instance
	gs.info('Upgrade from H/I instance ....');
	reparentJDBCConnection();
}


function isJDBCExtendsConnection() {
	var table = new TableUtils('jdbc_connection');
	return table.getAbsoluteBase() == 'sys_connection' ? true : false;	
}

function reparentJDBCConnection() {
	// Fix job for H/I upgrade has 4 steps: fix connection names; re-parent to sys_connection; 
	// migrate JDBC data and create alias; drop redundant data
	fixNameUniquenessAndMandatory();
	reparentJDBCTable();	
	reconcileJDBCDataAndCreateConnectionAlias();
	dropRedundantData();
}

// Fix the mandatory and uniqueness check for name on child table
function fixNameUniquenessAndMandatory() {
	var jdbc_table_name = 'jdbc_connection';
	var agg = new GlideAggregate(jdbc_table_name);
	agg.addAggregate('count');
	agg.groupBy('name');
	agg.query();
	
	while (agg.next()) {		
		var name = agg.name;
		var count = agg.getAggregate('count');
		gs.info('Name in JDBC Connection Table:' + (name ? name:"null") + ' Number of Records found: ' + count );
		
		if(count > 1 || !name) {			
			var suffix =0;
			var gr = new GlideRecord(jdbc_table_name);
			gr.addQuery('name',name);
			gr.query();
			while(gr.next()) {
				if(name) {
					gr.name = name + suffix;
				} else {
					gr.name = 'JDBC'+ suffix;
				}
				gr.update();
				gs.info('Updated Name:' + gr.name + ' for Sys id:' + gr.getUniqueValue());
				suffix++;
			}
		}
	}
}

function reparentJDBCTable() {
	SNC.CMDBUtil.reParentTable('jdbc_connection', 'sys_metadata', 'sys_connection');
}

function reconcileJDBCDataAndCreateConnectionAlias() {
	var jdbcGr = new GlideRecord('jdbc_connection');
	jdbcGr.query();
	while(jdbcGr.next()) {		
		// Create alias records based on the new name field
		var alias = createAlias(jdbcGr.name);
		
		jdbcGr.active = true;
		jdbcGr.connection_alias = alias;
		jdbcGr.host = jdbcGr.jdbc_server;
		jdbcGr.port = jdbcGr.database_port;
		jdbcGr.update();
	}
}

function createAlias(name){
	var alias = new GlideRecord('sys_alias');
	alias.initialize();
	alias.name = name;
	alias.type = 'connection';
	alias.connection_type = 'jdbc_connection';
	alias.insert();
	return alias.getUniqueValue();
}

function dropRedundantData() {	
	gs.dropColumn('jdbc_connection', 'jdbc_server');
	gs.dropColumn('jdbc_connection', 'database_port');
	gs.dropColumn('jdbc_connection', 'sys_scope');
	gs.dropColumn('jdbc_connection', 'sys_policy');
	gs.dropColumn('jdbc_connection', 'sys_package');
}

function migrateDataSourceToJDBCAndUpgradeActivities() {
	
    function getPaddedNumber(num, size) {
        var s = num + '';
        while (s.length < size) s = '0' + s;
        return s;
    }

    function writeLog(seq, separator, msg) {
        gs.log('[JDBC_ACTIVITY_UPGRADE] ' + getPaddedNumber(seq, 4) + separator + msg);
    }

    function refactorDataSource(gr, seq, name) {
        var result = {};

        var grCred = new GlideRecord('jdbc_credentials');
        grCred.name = name;
        grCred.user_name = gr.jdbc_user_name;
        grCred.password = gr.jdbc_password;
        result.credSysId = grCred.insert();
        if (result.credSysId == null) {
            writeLog(seq, separator2, '*** Failed to create a JDBC credential for ' + gr.name + '!');
        } else {
            writeLog(seq, separator2, 'JDBC credential (' + grCred.sys_id + ') for the "' + gr.name + '" data source is created.');
        }

        var grConn = new GlideRecord('jdbc_connection');
        grConn.connection_timeout = gr.connection_timeout;
        grConn.connection_url = gr.connection_url;
        grConn.database_name = gr.database_name;
        grConn.port = gr.database_port;
        grConn.format = gr.format;
        grConn.instance_name = gr.instance_name;
        grConn.host = gr.jdbc_server;
        grConn.name = name;   // name need to unique and mandatory
        grConn.oracle_port = gr.oracle_port;
        grConn.oracle_sid = gr.oracle_sid;
        grConn.query_timeout = gr.query_timeout;
		grConn.connection_alias = createAlias(name);
		if (result.credSysId != null) 
			grConn.credential = result.credSysId;	
        result.connSysId = grConn.insert();
        if (result.connSysId == null) {
            writeLog(seq, separator2, '*** Failed to create a JDBC connection for ' + gr.name + '!');
        } else {
            writeLog(seq, separator2, 'JDBC connection (' + grConn.sys_id + ') for the "' + gr.name + '" data source is created.');
        }

        return result;
    }
	
	function getUniqueName(nameToTest, nameHash, count){
		var name = '';

		if (!nameToTest) {
			name = 'JDBC'+ count.emptyNameSeq;
			nameHash[name] = name;
			count.emptyNameSeq++;
			return name;
		}

		if (gs.nil(nameHash[nameToTest])){
			nameHash[nameToTest] = nameToTest;
			return nameToTest;
		}

		if (gs.nil(count[nameToTest])){
			count[nameToTest] = {};
			count[nameToTest].duplicateNameSeq = 0;
		}

		name = nameToTest + count[nameToTest].duplicateNameSeq;
		nameHash[name] = name;
		count[nameToTest].duplicateNameSeq++;

		return name;		
	}
	

    var seqNr = 0;
    var separator1 = ' - ';
    var separator2 = '   ';
    var processedDataSources = {};
	
	var nameHash = {};
	var count = {};
	count.emptyNameSeq = 0;	
	
    writeLog(seqNr, separator2, 'Fix job started .....');
    var grActivity = new GlideRecord('wf_element_activity');
    grActivity.addQuery('base_provider.name', 'JDBC');
    grActivity.addQuery('input_transform', 'CONTAINS', 'data_source');
    grActivity.query();
    while (grActivity.next()) {
        var inputTransform = JSON.parse(grActivity.input_transform);
        if (inputTransform.hasOwnProperty('data_source')) {
            seqNr++;
            writeLog(seqNr, separator1, "Upgrading the '" + grActivity.name + "' JDBC Activity ...");
            var grDataSource = new GlideRecord('sys_data_source');
            if (! grDataSource.get(inputTransform.data_source)) {
                writeLog(seqNr, separator2, "*** Could not find a data source with sys_id = '" + inputTransform.data_source + "'!");
                continue;
            }
            if (! processedDataSources.hasOwnProperty(grDataSource.sys_id)) {
				var name = getUniqueName(grDataSource.name, nameHash, count); 
                processedDataSources[grDataSource.sys_id] = refactorDataSource(grDataSource, seqNr, name);
            } else {
                writeLog(seqNr, separator2, "The '" + grDataSource.name + "' data source is already refactored.");
            }
            inputTransform.jdbc_connection = processedDataSources[grDataSource.sys_id].connSysId;
            inputTransform.fixed_credential_id = processedDataSources[grDataSource.sys_id].credSysId;
            grActivity.input_transform = JSON.stringify(inputTransform);
            grActivity.setWorkflow(false);
            if (null == grActivity.update()) {
                writeLog(seqNr, separator2, "*** Failed to update the '" + grActivity.name + "' JDBC activity!");
            } else {
                writeLog(seqNr, separator2, "The '" + grActivity.name + "' JDBC activity is updated.");
            }
        }
    }
    writeLog(++seqNr, separator2, 'Fix job done.');
}

