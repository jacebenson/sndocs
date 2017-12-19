gs.include("PrototypeServer");

var OracleStatFactory = Class.create();
OracleStatFactory.prototype = {

    _METRICS : {

       // from v$sgastat
       "shared pool" : 'shared_pool',
       "large pool" : 'large_pool',
       "java pool" : 'java_pool',


       // from v$sysstat
       "redo log space requests" : 'log_waits',
       "redo buffer allocation retries" : 'log_retries',

       // from v$sysmetric
       2000 : 'buffer_ratio',
       2004 : 'reads_per_second',
       2006 : 'writes_per_second',
       2050 : 'cursor_ratio',
       2054 : 'noparse_ratio',
       2115 : 'pga_ratio',
       2112 : 'library_ratio',
       2104 : 'open_cursors',
       2103 : 'logins',

       all_sessions : 'sessions',
       active : 'sessions_active', 
       inactive : 'sessions_inactive',
       "user i/o" : 'sessions_user_io',
       "system i/o" : 'sessions_system_io',
       network : 'sessions_network',
       idle : 'sessions_idle'
   },
   
   initialize: function(/* DBI */ dbi) {
      this._dbi = dbi;
   },
   
   /**
    * Gather stats and save to cmdb_metric_oracle
    */
   getStats: function() {
        this.stats = this._initStats();
        var dbi = this._getDBI();
        try {
        	this._getMetrics(dbi);
        	this._getLogBuffer(dbi);
        	this._getSGA(dbi);
        	this._getSessions(dbi);
        } finally {
        	dbi.close();
        }
        return this.stats;
   },

   _initStats: function() {
        var stats = new Object();
        for (key in this._METRICS) 
           stats[this._METRICS[key]] = 0;
        
        return stats;
   },

   _getSGA: function(dbi) {
		var rs = SncOracleStatsSqlFactory.getSGA();
		this._loadMetrics(rs);
    },

   _getLogBuffer: function(dbi) {
 	  	var rs = SncOracleStatsSqlFactory.getLogBuffer();
 	  	this._loadMetrics(rs);
    },

    _getMetrics: function(dbi) {
    	var rs = SncOracleStatsSqlFactory.getMetrics();
		this._loadMetrics(rs);
   },

   _loadMetrics: function(query) {
       	while(rs.next())
   		   this._setStats(rs);
		rs.close();
   },

   _getSessions : function() {
        var rs = SncOracleStatsSqlFactory.getSessions();
        this._loadMetrics(rs);
       	
        var rs = SncOracleStatsSqlFactory.getSessionsGroupByStatus();
        this._loadMetrics(rs);
        
        var rs = SncOracleStatsSqlFactory.getSessionsGroupByWaitClass();
        this._loadMetrics(rs);
   },

   _getDBI: function() {
		return this._dbi;
   },

   _setStats: function(rs) {
      var id = rs.getString('METRIC_ID');
      id = id.toLowerCase();
      if (!this._METRICS[id])
         return;

      try {
        this.stats[this._METRICS[id]] =  rs.getString('VALUE');
      } catch (e) {
        gs.log("Exception adding metric: " + this._METRICS[id]);
      }
   },

   z: null
};