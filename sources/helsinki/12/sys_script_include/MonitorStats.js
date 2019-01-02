gs.include("PrototypeServer");

var MonitorStats = Class.create();
MonitorStats.prototype = Object.extendsObject(InstanceStats, {
   
   
   /**
    * Gather stats and save to relevant tables
    */
   run: function() {
     // all our normal monitors
   	 var monitors = GlideInternalMonitor.get().getRegistered();
   	 for (var i = 0; i < monitors.size(); i++) {
   	 	var m = monitors.get(i);
   	 	this._writeMonitor(m);
   	 }

     // now the response time family
     this._writeResponse();

     // thread state family
     this._writeThread();

     // the linux memory monitor
     this._writeMemory();

     // the disk partition monitor
     this._writePartition();
   },
   
   _writeMonitor : function(monitor) {
   	 var n = monitor.getGraphName();
         if (!n)
             return;

   	 var gr = this._getMetric(n);
   	 if (!gr.isValid())
   	     return;
   	     
   	 this._writeMetrics(gr.getTableName(), n, monitor.getMinute());
   },
   
   _writeResponse : function() {
   	 this._createRecord('cmdb_metric_sql');
   	 var inserts = GlideSQLInsertMonitor.get().getMinute();
   	 var updates = GlideSQLUpdateMonitor.get().getMinute();
   	 var deletes = GlideSQLDeleteMonitor.get().getMinute();
   	 var selects = GlideSQLSelectMonitor.get().getMinute();
   	 var overall = GlideSQLResponseMonitor.get().getMinute();
   	 
   	 this._writeMetrics0('inserts', inserts);
   	 this._writeMetrics0('updates', updates);
	 this._writeMetrics0('deletes', deletes);
   	 this._writeMetrics0('selects', selects);
	 this._writeMetrics0('overall', overall);
	 this.gr.insert();
   },

   _writeThread : function() {
         if (!GlideTableDescriptor.isValid('cmdb_metric_thread'))
             return;

   	 this._createRecord('cmdb_metric_thread');
   	 var total = GlideSysThreadMonitor.get().getMinute();
   	 var cpu = GlideSysCPUThreadMonitor.get().getMinute();
   	 var db = GlideSysDBThreadMonitor.get().getMinute();
   	 var net = GlideSysNetThreadMonitor.get().getMinute();
   	 var br = GlideSysBRThreadMonitor.get().getMinute();
         var wt = GlideSysConcurrencyMonitor.get().getMinute();
   	 
   	 this._writeMetrics0('total', total);
   	 this._writeMetrics0('cpu', cpu);
	 this._writeMetrics0('db', db);
   	 this._writeMetrics0('network', net);
	 this._writeMetrics0('business_rule', br);
         this._writeMetrics0('concurrency', wt);
	 this.gr.insert();
   },


   _writeMemory : function() {
   	 this._createRecord('cmdb_metric_linux_memory');
   	 var cache = GlideMemoryCache.get().getMinute();
   	 var active = GlideMemoryActive.get().getMinute();
   	 var total = GlideMemoryTotal.get().getMinute();
   	 var swap = GlideMemorySwap.get().getMinute();
   	 
   	 this._writeMetrics1('cache', cache);
         this._writeMetrics1('active', active);
	 this._writeMetrics1('total', total);
   	 this._writeMetrics1('swap', swap);
	 this.gr.insert();
   },

   _writePartition : function() {
        this.monitor = GlideIOMonitor.get();

        var length = this.monitor.getLength();
        for (var i=0; i < length; i++){
             if (this.monitor.getName(i) == 'system') {
                  this._createRecord('cmdb_metric_partition');
             } else {
	          this._createMIRecord('cmdb_metric_partition', this.monitor.getName(i));
             }
	     var read_requests = this.monitor.getPartitionMonitor(i).getReadMonitor().getMinute();
	     var write_requests = this.monitor.getPartitionMonitor(i).getWriteMonitor().getMinute();
	     var read_bytes = this.monitor.getPartitionMonitor(i).getReadBytesMonitor().getMinute();
	     var write_bytes = this.monitor.getPartitionMonitor(i).getWriteBytesMonitor().getMinute();
	
	     this._writeMetrics0('read_requests', read_requests);
             this._writeMetrics0('write_requests', write_requests);
	     this._writeMetrics0('read_bytes', read_bytes);
   	     this._writeMetrics0('write_bytes', write_bytes);
	     this.gr.insert();
        }
   },
   
   _getMetric : function(name) {
     var gr = new GlideRecord('cmdb_metric_'+name);
     return gr;
   },
   
   _writeMetrics: function(table, prefix, stats) {
      this._createRecord(table);
      this._writeMetrics0(prefix, stats);
      this.gr.insert();
   },

   _writeMetrics0: function(prefix, stats) {
      this._setValue('count', prefix, stats.getCount());
     
      if (stats.getCount() > 0) {
      	 this._setValue('mean', prefix, stats.getMean());
         this._setValue('median', prefix, stats.getMedian());
      	 this._setValue('max', prefix, stats.getMax());
      	 this._setValue('min', prefix, stats.getMin());
      } 
   },
   
    // writeMetrics function to convert data size to MBs
   _writeMetrics1: function(prefix, stats) {
      var k = 1024;
      this._setValue('count', prefix, stats.getCount());

      if (stats.getCount() > 0) {
      	 this._setValue('mean', prefix, stats.getMean() / k);
         this._setValue('median', prefix, stats.getMedian() / k);
      	 this._setValue('max', prefix, stats.getMax() / k);
      	 this._setValue('min', prefix, stats.getMin() / k);
      } 
   },

   _setValue : function(field, prefix, value) {
   	  var s = null;
          var sa = prefix.split('_');
   	  if (this.gr.isValidField(field))
   	  	s = field;
   	  else if (this.gr.isValidField(prefix + '_' + field))
   	    s = prefix + '_' + field;
          else if (sa.length > 1 && this.gr.isValidField(sa[1] + '_' + field))
            s = sa[1] + '_' + field;
   	    
   	  if (s)
   	  	this.gr.setValue(s, value); 	
   },
   
   z: null
});