gs.include("PrototypeServer");

var ServerStats = Class.create();
ServerStats.prototype = Object.extendsObject(InstanceStats, {
   
   
   /**
    * Gather stats and save to relevant tables
    */
   run: function() {
      var include = "memory,os,scheduler,servlet,transactions";
      var xml = "";
      this.xmlUtil = GlideXMLUtil;

      if (this.url) {
         // Get xml stats from the specified url
         var getMethod = new Packages.org.apache.commons.httpclient.methods.GetMethod(this.url + "/xmlstats.do");
         getMethod.setQueryString("include=" + include);
         var httpClient = new GlideHTTPClient();
         
         if (this.userName)
            httpClient.setBasicAuth(this.userName, this.userPassword);
         
         var result = httpClient.executeMethod(getMethod);
         if (result != 200)
            throw new Error("SOAPRequest failed: " + result + " (" + this.endpoint + ")");
         
         xml = getMethod.getResponseBodyAsString();
         this.xmlDoc = this.xmlUtil.parse(xml);
      } else {
         // Get the xml stats from the XMLStats object
         var stats = new GlideXMLStats();
         this.xmlDoc = stats.toDocumentWithInclude(include);
      }
      
      if (this.xmlDoc)                
         this._parseStats();
      
   },
   
   _parseStats: function() {
      this._parseMemory();
      this._parseCPU();
      this._parseLoad();
      this._parseServlet();
   },
   
   _parseMemory: function() {
      this._createRecord('cmdb_metric_java');
      this._setValue("system.memory.max", "memory_max");
      this._setValue("system.memory.total", "memory_total");
      this._setValue("system.memory.in.use", "memory_in_use");
      this.gr.insert();

      this._createRecord('cmdb_metric_java_permgen');
      this._setValue("system.memory_permgen.max", "permgen_max", 0);
      this._setValue("system.memory_permgen.total", "permgen_total", 0);
      this._setValue("system.memory_permgen.in.use", "permgen_in_use", 0);
      this.gr.insert();
      
      this._createRecord("cmdb_metric_garbage_collection");
      this._setValue("servlet.metrics/garbage_collection/one/@mean", "percent", 0);
      this.gr.insert();
   },
   
   _parseCPU: function() {
      this._createRecord('cmdb_metric_cpu');
      this._setValueWithDivisor("os.stats/stat.cpu.user", "user", 10);
      this._setValueWithDivisor("os.stats/stat.cpu.system", "system", 10);
      this._setValueWithDivisor("os.stats/stat.cpu.nice", "nice", 10);
      this._setValueWithDivisor("os.stats/stat.cpu.idle", "idle", 10);
      this._setValueWithDivisor("os.stats/stat.cpu.iowait", "iowait", 10);
      this.gr.insert();
   },
   
   _parseLoad: function() {
      this._createRecord('cmdb_metric_load');
      this._setValue("os.stats/load.1.minute", "one_minute");
      this._setValue("os.stats/load.5.minute", "five_minutes");
      this._setValue("os.stats/load.15.minute", "fifteen_minutes");
      this.gr.insert();
   },
   
   _parseServlet: function() {
      this._createRecord('cmdb_metric_service_now');
      this._setValue("servlet.processor.transactions", "transactions");
      this._setValue("servlet.active.sessions", "active_sessions");
      this._setValue("scheduler.total.jobs", "jobs_processed");
      this._setValue("scheduler.queue.length", "job_queue_length");
      this.gr.insert();
   },
   
   z: null
});