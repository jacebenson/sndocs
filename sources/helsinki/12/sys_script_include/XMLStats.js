var XMLStats = Class.create();

XMLStats.prototype = {
  initialize : function(inc) {
      this.includes = inc.split(",");
      this.ArrayUtil = new ArrayUtil();
  },

  write: function() {
    if (this.ArrayUtil.contains(this.includes, "memory"))
        this.writeMemory();

    if (this.ArrayUtil.contains(this.includes, "jvm")) {
        this.writeJVM();
        this.writeGC();
    }
  },

  writeMemory: function() {
        try {
            var jserver = Packages.java.lang.management.ManagementFactory.getPlatformMBeanServer();
            var metaSpace  = Packages.java.lang.management.ManagementFactory.newPlatformMXBeanProxy(jserver, "java.lang:type=MemoryPool,name=Metaspace", Packages.java.lang.management.MemoryPoolMXBean);

            this.mw.createElement("system.memory_metaspace.max", parseInt(metaSpace.getUsage().getMax() / 1024 / 1024));
            this.mw.createElement("system.memory_metaspace.total", parseInt(metaSpace.getUsage().getCommitted() / 1024 / 1024));
            this.mw.createElement("system.memory_metaspace.in.use", parseInt(metaSpace.getUsage().getUsed() / 1024 / 1024));
        } catch (e) { } // we have no JMX stuff 
  },

  writeJVM: function() {
        try {
            this.mw.createElement("jvm.version", gs.getJavaVersion());
            var upTime = (new Packages.java.util.Date().getTime() - GlideServlet.getServlet().getStartTime().getTime());
            var friendlyJVMTime = new String(GlideDateUtil.getDateTimeString(parseInt(upTime/1000), false));
            this.mw.createElement("jvm.time", upTime);
            this.mw.createElement("jvm.time_friendly", friendlyJVMTime);
            this.mw.createElement("jvm.java_opts", this._getJavaOpts());

            var jserver = Packages.java.lang.management.ManagementFactory.getPlatformMBeanServer();
            var cpuTime = jserver.getAttribute(this._getObj("java.lang:type=OperatingSystem"), "ProcessCpuTime");
            cpuTime = cpuTime / (1000*1000);
            var friendlyCPU = new String(GlideDateUtil.getDateTimeString(parseInt(cpuTime / 1000), false));
            this.mw.createElement("jvm.cpu.time", cpuTime);
            this.mw.createElement("jvm.cpu.time_friendly", friendlyCPU);

            this.mw.createElement("jvm.cpu.count", GlideSystemUtil.getAvailableProcessors());

            var classLoading  = Packages.java.lang.management.ManagementFactory.newPlatformMXBeanProxy(jserver, "java.lang:type=ClassLoading", Packages.java.lang.management.ClassLoadingMXBean);
            this.mw.createElement("jvm.classes.loaded", classLoading.getLoadedClassCount());
            this.mw.createElement("jvm.classes.unloaded", classLoading.getUnloadedClassCount());
            this.mw.createElement("jvm.classes.verbose", classLoading.isVerbose());
        } catch (e) { } // we have no JMX stuff 
  },

  _getJavaOpts: function() {
      var javaopts = "";

      try {
          javaopts = jserver.getAttribute(this._getObj("java.lang:type=Runtime"), "InputArguments");
          javaopts = GlideStringUtil.join(javaopts, " ");
      } catch(e) {
          javaopts = GlideSystemUtil.getJavaOpts();
      }

      return javaopts;
  },

  writeGC: function() {
        this.mw.open("jvm.gc");
        try {
            var jserver = Packages.java.lang.management.ManagementFactory.getPlatformMBeanServer();
            var names = jserver.queryNames(null, null);
            var it = names.iterator();

            while(it.hasNext()) {
                var mbeanKey = it.next();
                mbeanKey = mbeanKey.toString();

                if (mbeanKey.indexOf("GarbageCollector") == -1)
                    continue;

                this._writeGCAttributes(jserver, mbeanKey);
            }
        } catch (e) { } // we have no JMX stuff 

        this.mw.close("jvm.gc");
  },

  _writeGCAttributes: function(jserver, mbeanKey) {
    var count = jserver.getAttribute(this._getObj(mbeanKey), "CollectionCount");
    var time = jserver.getAttribute(this._getObj(mbeanKey), "CollectionTime");

    var friendlyTime = new String(GlideDateUtil.getDateTimeString(parseInt(time / 1000), false));

    this.mw.open("gc");

    if (mbeanKey.indexOf('name=') > -1)
        mbeanKey = mbeanKey.substring(mbeanKey.indexOf('name=') + 5);

    this.mw.createElement("name", mbeanKey);

    var upTime = (new Packages.java.util.Date().getTime() - GlideServlet.getServlet().getStartTime().getTime());
    var upTimeMin = (upTime/1000)/60;
    var fiveMinutes = upTimeMin / 5;

    this.mw.createElement("run_count", count);
    this.mw.createElement("run_count_per_fivemin", this._formatNum(count/fiveMinutes));
    this.mw.createElement("run_time", time);
    this.mw.createElement("run_time_readable", friendlyTime);
    this.mw.createElement("avg_run_time", (time / count)/1000);

    this.mw.close("gc");
  },

  _getObj: function(name) {
      return new Packages.javax.management.ObjectName(name);
  },

  _formatNum: function(num) {
      return num.toFixed(3);
  },

  setMarkupWriter: function(mw) {
      this.mw = mw;
  },

  type: "XMLStats"
}