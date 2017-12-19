gs.include("PrototypeServer");

var JRobinUtils = Class.create();

JRobinUtils.prototype = {
    initialize : function() {
        var parms = new GlideDBUtil.getPrimaryDBConfigurationParms();
        this.rdbms = parms.getRDBMS();
        this.runningFromWorker = false;
    },

    process: function(restoreID) {
        // If I come in this way then I am running with a Progress Worker
        this.runningFromWorker = true;

        // Initial Status
        var startStatus = gs.getMessage('Rebuilding') + " " + gs.getMessage('JRobin Databases');
        worker.setProgressState("running");
        this.addMessage(startStatus);

        // Rebuild
        this.rebuild();

        // Final Status
        var status = gs.getMessage('Rebuilt') + " " + gs.getMessage('JRobin Databases');
        worker.setProgressState("complete");
        this.addMessage(status);
    },

    /**
     * Rebuild all JRobin Definitions/Databases - used when things have gone beyond repair
     */
    rebuild : function() {
        var mutex = new GlideMutex('JRobinUtils:rebuild', 'Rebuild JRobinUtils');
        mutex.setSpinWait(10);
        mutex.setMaxSpins(1000);
        if (mutex.get()) {
            try {
                for (var i = 0; i < 60; i++) {
                    if (this.canRebuild()) {
                        this.deleteJRobin();
                        break;
                    }

                    // Wait and try again.  Scheduled jobs are running
                    gs.sleep(1000);
                }
            } finally {
                mutex.release();
            }
        }   
    },

    /**
     * To rebuild the stats jobs must be in a non-running state
     */
    canRebuild : function() {
        var sj = this.getStatsJobs(false, false);            
        // No scheduled jobs then rebuild
        if (sj.getRowCount() == 0)
            return true;

        var sja = this.getStatsJobs(true, false);
        // I have scheduled jobs but none are "active" then rebuild
        if (sj.getRowCount() > 0 && sja.getRowCount() == 0)
            return true;

        var sjr = this.getStatsJobs(true, true);
        // If my active job count == my ready job count then rebuild
        if (sja.getRowCount() == sjr.getRowCount())
            return true;

        return false;
    },

    deleteJRobin : function() {
        // Prep work
        this.deactivate();

        // Delete all JRobin
        this.deleteJRobinData();

        // Upgrade JRobin Plugins
        this.upgradeJRobinPlugins();

        // Cleanup
        this.reactivate();
    },

    deactivate : function() {
        // Disable Script Includes
        this.updateStatsScriptIncludes(false);

        // Disable Schedule Jobs so we don't write to Definition/Database records during rebuild
        this.disableStatsJobs();
    },

    reactivate : function() {
        // Enable Script Includes
        this.updateStatsScriptIncludes(true);

        // Enable Stats Jobs
        this.enableStatsJobs();
    },

    /**
     * Disable/Enable Script Includes during rebuild
     */
    updateStatsScriptIncludes : function(active) {
        var si = new GlideRecord('sys_script_include');
        si.addQuery('name', '!=', 'XMLStats');
        si.addQuery('name', 'CONTAINS', 'Stats');
        si.query();
        while (si.next()) {
            si.setWorkflow(false);
            si.active = active;
            si.update();

            this.addMessage("JRobinUtils:  Setting Script Include " + si.name + " to active=" + active);
        }
    },

    getStatsJobs : function(checkActive, checkRunning) {
        var sj = new GlideRecord('sys_trigger');
        sj.addQuery('name', 'STARTSWITH', 'Stats:');
        if (checkActive)
            sj.addQuery('trigger_type', 1);

        if (checkRunning) {
            sj.addQuery('state', '!=', 1);
            sj.addQuery('state', '!=', 2);
        }

        sj.query();
        return sj;
    },

    /**
     * Disable Scheduled Jobs before rebuild
     */
    disableStatsJobs : function(triggerType) {
        var sj = this.getStatsJobs(false, false);
        while (sj.next()) {
            sj.setWorkflow(false);
            sj.trigger_type = 2;
            sj.update();

            this.addMessage("JRobinUtils:  Updating Scheduled job " + sj.name + " trigger_type=" + triggerType);
        }
    },

    /**
     * Enable Scheduled Jobs after rebuild
     */
    enableStatsJobs : function() {
        var name = "Stats: Servlet";
        var script = "gs.include('ServerStats'); new ServerStats().run();";
        this.insertOrUpdateStatsJobs0(name, script);

        if (this.rdbms != 'oracle') {
            name = "Stats: mySQL";
            script = "gs.include('MySQLStats'); new MySQLStats().run();";
            this.insertOrUpdateStatsJobs0(name, script);
        } else {
            name = "Stats: Oracle";
            script = "gs.include('OracleStats2'); new OracleStats2().run();";
            this.insertOrUpdateStatsJobs0(name, script);
        }
    },

    insertOrUpdateStatsJobs0: function(name, script) {
        var sj = new GlideRecord('sys_trigger');
        sj.addQuery('name', name);
        sj.query();
        if (sj.next()) {
           // I may have a job that isn't running - make it run
           sj.trigger_type = 1;
           sj.setWorkflow(false);
           sj.update();
           this.addMessage("JRobinUtils:  Activated Scheduled job " + sj.name);
        } else {
           sj.initialize();
           sj.name = name;
           sj.trigger_type = 1;
           sj.script = script;
           sj.repeat.setDisplayValue("0 00:01:00");
           sj.insert();
           this.addMessage("JRobinUtils:  Inserted Scheduled job " + sj.name);
        }
    },

    // Complete Wipe of all JRobin data then Re-create by Plugin Upgrade
    deleteJRobinData : function() {
        var jr_table = ["jrobin_definition", "jrobin_datasource", 
                        "jrobin_database", "jrobin_archive",  
                        "jrobin_graph", "jrobin_graph_line",
                        "jrobin_graph_set", "jrobin_graph_set_member"];

        for (var t = 0; t < jr_table.length; t++ ) {
            this.deleteJRobinData0(jr_table[t]);
        }
    },

    deleteJRobinData0 : function(tableName) {
        this.addMessage("JRobinUtils:  Deleting data from " + tableName);

        var jrd = new GlideRecord(tableName);
        if (tableName == 'jrobin_definition')
            jrd.addQuery('name', '!=', 'DEFAULT_ARCHIVE_DEFINITION');
        jrd.setWorkflow(false);
        jrd.deleteMultiple();
    },

    /**
     * Get JRobin database/definition/graph (etc...) back to OOB
     */
    upgradeJRobinPlugins : function() {
        var jr_plugin = ["com.snc.db.replicate", "com.snc.discovery", 
                         "com.snc.jrobin", "com.snc.metric.itil", "com.snc.metric.oracle", 
                         "com.snc.server_health", "com.snc.server_health2"];

        for (var p = 0; p < jr_plugin.length; p++ ) {

            if (GlidePluginManager.isRegistered(jr_plugin[p])) {
                this.addMessage("JRobinUtils:  Upgrading JRobin data from plugin " + jr_plugin[p]);
                GlidePluginManager.loadPluginData(jr_plugin[p], 'unload');
                GlidePluginManager.loadPluginData(jr_plugin[p], 'unload.demo');
                new GlideUpdateManager2().load(jr_plugin[p], 'update');
                this.addMessage("JRobinUtils:  Upgraded JRobin data from plugin " + jr_plugin[p]);
            }
        }
    },

    /**
     *  Description:  Add a message to the worker - only done regarding first level restore
     */
    addMessage: function(message) {
        gs.print(message);
        gs.log(message, "PRB599161");
        if (this.runningFromWorker)
            worker.addMessage(message);
    },

    z : function() {
    }
}