var DatabaseDiagnostics = Class.create();

DatabaseDiagnostics.prototype = {
  initialize : function() {
      this.dbi = null;
  },

  ping: function(size) {
      size = (size>0? size : 60);
      var randomString = GlideStringUtil.getRandomString(size);
      var gr = new GlideRecord("diagnostics_test");
      gr.data = randomString;
      var sw = new GlideStopWatch();

      var sys_id = gr.insert();
      gr.initialize();
      gr.addQuery("sys_id", sys_id);
      gr.query();
      gr.next();
      gr.deleteRecord();

      return sw.getTime();
  },

  pingFriendly: function(count, size) {
      var results = new Array();

      if (!count)
          count = 10;

      for(var i = 0; i < count; i++) {
          results.push(this.ping(size));
      }

      this._printFriendlyPing(results);
  },

  getDBI: function() {
      if (!this.dbi)
          this.dbi = new GlideDBConfiguration.getDBI('sys_dictionary');

      return this.dbi;
  },

  isOracle: function() {
      return this.getDBI().isOracle();
  },

  getURL: function() {
      return this.getDBI().getConnectionString();
  },

  getName: function() {
      return this.getDBI().getDatabaseName();
  },

  getDriver: function() {
      return this.getDBI().getDriverClassName();
  },

  getType: function() {
      return this.getDBI().getDatabaseType();
  },

  getUser: function() {
      return this.getDBI().getUser();
  },

  getPassword: function() {
      return this.getDBI().getPassword();
  },

  getJDBC: function() {
      var con = Packages.java.sql.DriverManager.getConnection(this.getDBI().getURL(), this.getUser(), this.getPassword());
      return con.getMetaData().getDriverVersion();
  },

  getVersion: function() {
      var rs;

      if (this.getDBI().isMySQL()) {
          rs = this.getDBI().executeStatement("select version()");
      } else if (this.getDBI().isOracle()) {
          rs = this.getDBI().executeStatement("select * from v$version");
      } else if (this.getDBI().isSqlServer()) {
          rs = this.getDBI().executeStatement("select @@version");
      }

      if (rs && rs.next()) {
          var count = rs.getMetaData().getColumnCount();
          var version = rs.getString(1);
          rs.close();
          return version;
      }

      return "unknown";
  },

  getConnections: function() {
      var connections = new Array();
	  var dbCfgMgr = GlideDBConfigurationManager.get();
	  var poolNames = dbCfgMgr.getPoolNames();

      for (var i = poolNames.iterator(); i.hasNext();) {
          var name = i.next();
          var pool = dbCfgMgr.getPool(name);
          var pcons = pool.getConnections();
          for(var p = 0; p < pcons.length; p++) {
              connections.push(pcons[p]);
          }
      }

      return connections;
  },

  getConnectionsCount: function() {
      return parseInt(this.getConnections().length);
  },

  getConnectionDetails: function(connections, i) {
      var c = connections[i];
      var details = { status: "free", sql: "*unknown*" };

      if (!c || c == null)
          return details;

      if (c.getLastSQL())
          details.sql = c.getLastSQL();
      
      if (!c.isAvailable())
          details.status = "in use (" + c.getUseTime() + " ms)";

      return details;
  },

  destroy: function() {
    if (!this.dbi)
       return;

    this.dbi.close();
    this.dbi = null;
  },

  _printFriendlyPing: function(results) {
      var low = 99999, high = 0, avg = 0;

      for(var i = 0; i < results.length; i++) {
          var result = results[i];
          if (result < low)
              low = result;
          if (result > high)
              high = result

          avg += result;
          gs.log("ping db: " + result + "ms");
      }

      gs.log("ping low: " + low + "ms, high: " + high + "ms, avg: " + parseInt(avg/results.length) + "ms");
  },

  type: "DatabaseDiagnostics"
}