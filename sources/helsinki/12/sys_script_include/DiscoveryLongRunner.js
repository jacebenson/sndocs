var DiscoveryLongRunner = Class.create();

DiscoveryLongRunner.prototype = {
  initialize: function() {
  },
  
  start: function() {
     this.pollProbe();
  },
  
  running: function() {
     if (this.isRunning())
         return;
         
     this.pollProbe(true);
  },
  
  complete: function() {
     if (g_probe.hasParameter('repeat_cancel_error')) {
       // if our input has an error, we don't want to fire the complete code
       gs.log("Runbook longrunner, skipping complete sensor");
       return;
     }

     var probe = new SncProbe();
     probe.setTopic("SSHCommand");
     probe.setName("sh /tmp/" + this.getRunDirectory() + "/complete");
     probe.setSource(g_probe.getSource());
     probe.setCorrelator(g_probe.getCorrelator());
     probe.addParameter("probe", g_probe.getParameter("previous.probe"));
     probe.copy(g_probe);  // copy other probe parameters that may be of interest
     probe.addParameter("must_sudo", g_probe.getParameter("complete_must_sudo"));
     probe.create(g_probe.getAgent(), g_probe.getEccQueueId());
  },

  pollProbe: function(cancel) {
     var runDirectory = this.getRunDirectory();
     if (!runDirectory)
         return;
     
     var probe = new SncProbe();
     probe.setTopic("SSHCommand");
     probe.setName("sh -c \"if [ -f /tmp/" + runDirectory + "/running ]; then echo still running; else echo not running; fi\"");
     probe.setSource(g_probe.getSource());
     probe.addParameter("run_directory", runDirectory);

     if (cancel) {
         probe.setCorrelator(g_probe.getCorrelator());
         probe.addParameter("repeat_cancel", "true");
         probe.addParameter("repeat_correlator", g_probe.getParameter("repeat_correlator"));
         probe.addParameter("long_sensor", "new DiscoveryLongRunner().complete();");
         probe.copy(g_probe);
     } else {
         probe.setCorrelator(g_probe.getCorrelator());
         probe.addParameter("repeat_interval", "30000");
         probe.addParameter("repeat_correlator", g_probe.getParameter("ssh_long_id"));
         probe.addParameter("long_sensor", "new DiscoveryLongRunner().running();");
         // "probe" parameter does not copy for free as it is in the Probe.NOT_TO_COPY list.
         probe.addParameter("previous.probe", g_probe.getParameter("probe"));
         probe.copy(g_probe);
         var params = probe.getParametersMap();
         if (JSUtil.toBoolean(probe.getParameter("use_snc_ssh")))
             params.remove("must_sudo"); // Don't need root just to poll for running
     }

     probe.create(g_probe.getAgent(), g_probe.getEccQueueId());
  },
  
  isRunning: function() {
     return (output.indexOf("still running") >= 0 || output.indexOf("not running") < 0);
  },
  
  getRunDirectory: function() {
     if (g_probe.getParameter("run_directory"))
         return g_probe.getParameter("run_directory");

     var lines = output.split(/\n/);
     
     for (var i = 0; i < lines.length; i++) {
         var line = lines[i];
         if (line == '')
             continue;

         var parts = line.split(":");
         var name = parts[0].trim();
         var value = parts[1].trim();
         
         if (name == "sncrun")
             return value;
     }
     
     return "";
  },
  
  type: "DiscoveryLongRunner"
};
