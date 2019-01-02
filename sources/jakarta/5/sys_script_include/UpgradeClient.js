gs.include("PrototypeServer");

var UpgradeClient = Class.create();

// This variable is used in upgrade_complete.js to check if upgrade_complete was invoked from upgrade client or directly
var upgradeStartedByUpgradeClient = true;

/**
 * There are several entry points on this script:
 * 
 * 1) process <- DistUpgrade, the process of upgrading code (ie: WAR)
 * 2) upgradeScript <- DataUpgrade, the process of upgrading data on the first boot with the new code (ie: DB records, etc.)
 * 3) runUpdateScript <- A partial DistUpgrade used for cluster upgrades (called via ClusterMessage)
 * 
 * This will be separated into two scripts (upgrade vs. update) when war upgrade functionality is removed (and only dist functionality is available).
 */
UpgradeClient.prototype = {
   UPGRADE_VERSION : 'glide.war.assigned',
   WAR_VERSION : 'glide.war',
   BUILD_VERSION: 'glide.node.dist',
   NO_UPGRADE_VERSION : 'glide.war.no_upgrade', // set by Rollback
   UPGRADE_SCRIPT : gs.getProperty("glide.sys.upgrade_script"),
   LOGGER : new UpgradeLogger(),
   
   initialize: function() {
      this.upgrade_server_url = gs.getProperty("upgrade_server_url");
      this.instance_id = gs.getProperty("instance_id");
   },
   
   // Called from event: Upgrade
   upgradeScript : function() {
      this.LOGGER.log('Checking to see if upgrade script needs to be run');
      if (gs.isPaused()) {
          this.LOGGER.log('Upgrade not run because system is already paused');
          return;
      }
      if (!this.shouldRunUpgrade()) {
          this.LOGGER.log('Upgrade not run after checking WAR versions');
          return;
      }
      var desired = gs.getProperty(this.UPGRADE_VERSION);
      this.LOGGER.log('Running upgrade script ' + this.UPGRADE_SCRIPT + ' for ' + desired);

      // the only exceptions we will be catching here are Java Rhino engine exceptions (e.g. java.lang.StackOverflowError)
      // regular Javascript exceptions are handled within scripts
      try {
         this.execUpgrade();
         this.notifySuccess(desired);
      } catch(e) {
         this.LOGGER.log("Failed to upgrade to " + desired);
         this.LOGGER.log(this.UPGRADE_SCRIPT + " caused " + e.toString());
         gs.eventQueue("system.upgrade.failed", null, "update.js");
      }
   },
   
   execUpgrade : function() {
      gs.loadBatchScript("sys.scripts/" + this.UPGRADE_SCRIPT);
   },
   
   notifySuccess : function(desired) {
      this.LOGGER.log('Notifying HI that upgrade has completed');
      var myname = gs.getProperty("glide.db.name");
      var mynameonly = new String(myname);
      mynameonly = mynameonly.split("_")[0];
      
      var r = new GlideRemoteGlideRecord(this.upgrade_server_url, "ecc_queue");
      r.initialize();
      r.setValue("agent", "Service-now deployer");
      r.setValue("name", "system.update.confirm");
      r.setValue("source", mynameonly);
      r.setValue("queue", "input");
      r.setValue("payload", "<update><url>" + mynameonly + "</url><war>" + desired + "</war><instance_id>" + this.instance_id + "</instance_id></update>");
      r.insert();
      this.LOGGER.log('Notification sent');
   },
   
   // Since .zip.war's are not "first-class" artifacts, and since older glide
   // UpgradeClient versions (which cannot be changed since we must support a
   // one-step upgrade) write .zip.war into these DB properties, they need to 
   // be "corrected" to .zip before they are read by the new UpgradeClient
   // version.
   sanitizeDBProperties: function() {
      var war_version = gs.getProperty(this.WAR_VERSION)
      if (war_version != null && war_version.match(/\.zip\.war$/)) {
         this.LOGGER.log("Converting " + this.WAR_VERSION + " from .zip.war to a .zip (" + war_version + ")");
         war_version = war_version.replace(/\.zip\.war$/, ".zip");
	     gs.setProperty(this.WAR_VERSION, war_version, "Current Version");
	  }
      var upgrade_version = gs.getProperty(this.UPGRADE_VERSION)
      if (upgrade_version != null && upgrade_version.match(/\.zip\.war$/)) {
         this.LOGGER.log("Converting " + this.UPGRADE_VERSION + " from .zip.war to a .zip (" + upgrade_version + ")");
         upgrade_version = upgrade_version.replace(/\.zip\.war$/, ".zip");
	     gs.setProperty(this.UPGRADE_VERSION, upgrade_version, "Assigned version");
	  }	   
   },
   
   // Called from script include: UpgradeClient
   process: function() {
	  if (this._shouldSkip()) {
	      return;
	  }

	  var t = null;
	  var isUncancelable = false;
	  try {
		  t = GlideTransaction.get();
		  if (t != null) {
			  isUncancelable = t.isUncancelable();
		  t.setCannotCancel(true);
		  }
		  var artifact_file = this.getWarFile();
		  if (artifact_file == null || artifact_file == "" || artifact_file == "not_found") {
			  this.LOGGER.log("Instance not managed by the upgrade server (" + this.upgrade_server_url + "). No war file retrieved.");
			  return;
		  }
		  
		  this.sanitizeDBProperties();
	          
		  if (artifact_file == gs.getProperty(this.WAR_VERSION)) {
			  this.LOGGER.log("Upgrade check: instance already running assigned version: " + artifact_file);
			  return;
		  }
		  
		  var revertedFrom = gs.getProperty(this.NO_UPGRADE_VERSION);
		  if (artifact_file == revertedFrom) {
			  this.LOGGER.log('Desired war matches reverted war specified by property [' + this.NO_UPGRADE_VERSION + ']. New dist will NOT be downloaded.');
			  return;
		  }
		  
		  this.LOGGER.log("New upgrade artifact file: " + artifact_file + " is required. Downloading it");
		  
          if (artifact_file.match(".war$")) {
        	  this.processWar(artifact_file);
          } else if (artifact_file.match(".zip$")) {
        	  this.processDist(artifact_file);
          } else {
        	  this.LOGGER.log("Unknown upgrade artifact: " + artifact_file);
          } 
          
	  } catch (err) {
		  this.LOGGER.error("Upgrade check failed: " + err + " (" + this.upgrade_server_url + ")");
	  } finally {
		  if (t != null) t.setCannotCancel(isUncancelable);
	  }
   },
   
   processWar: function(war_file) {
         var ujob = new GlideWarDownloader();
         var success = ujob.downloadWar(war_file);
         if (success)
            this.LOGGER.log("Successful download of " + war_file);
         else {
            this.LOGGER.log("Failed to download " + war_file + ". Will retry in 1 hour");
            return;
         }
         gs.setProperty(this.UPGRADE_VERSION, war_file, "Assigned version");
         new GlideWarDeleter().deleteOldWars(war_file);
         
         this.shutdownAndRestart(war_file);
   },
   
   processDist: function(dist_file) {
	   var manager = new GlideUpgradeArtifactManager();
	   var success = manager.download(dist_file);
	   if (success)
		   this.LOGGER.log("Successful download of " + dist_file);
	   else {
		   this.LOGGER.log("Failed to download " + dist_file + ". Will retry in 1 hour");
		   return;
	   }
	   gs.setProperty(this.UPGRADE_VERSION, dist_file, "Assigned version");
	   manager.deleteArtifactsExcept(dist_file);
	   
	   this.shutdownAndRestart(dist_file);
   },
   
   shutdownAndRestart : function(artifact_filename) {
      // find our startup Job and set it to run on our node on next restart
      this.LOGGER.log("Assigning upgrade startup job to this cluster node, " + GlideServlet.getSystemID());
      this.setStartupJob();
      
      // reschedule the upgrade job in the future... this needs to happen before the scheduler
      // is shutdown, otherwise the recover stuck jobs code will revert our schedule/claimed_by
      this.LOGGER.log("Rescheduling the upgrade job");
      this.setUpgradeJob();

      this.LOGGER.log("Shutting down workers and cluster synchronizer");
      // shut down everything
      GlideSystemStatus.setShuttingDown();
      GlideWorkerThreadManager.get().shutdownEverything();
      gs.sleep(10000); // wait 10 seconds to give things an opportunity to shut down gracefully
      
      // Tell our peer cluster nodes and replication slaves that a new war has arrived,
      // and they need to follow suit.
      this.notifyPeers(artifact_filename);
      
      this.runUpdateScript(artifact_filename);
   },
   
   // Tell our peer cluster nodes and replication slaves that a new war has arrived,
   // and they need to follow suit.
   notifyPeers: function(artifact_filename) {
	  this.LOGGER.log("Instructing replication slaves and cluster peers to upgrade");
	  var action = "zzSpecialUpgradeyy";
	  SncReplicationEngine.specialTransaction(action, artifact_filename);
	  this.postClusterMessages(action, artifact_filename);
   },

   // Post ClusterMessages to peers, telling them to upgrade.
   postClusterMessages: function(action, artifact_filename) {
	  // ClusterMessage.post delay (15 minutes)
	  var job_start_time_delay = 900 * 1000;
	
	  // post directed ClusterMessages to primary nodes
	  var schedulers = "any";
	  var gr = this.getClusterNodes(schedulers);
	  this.postDirectedClusterMessages(gr, action, artifact_filename, job_start_time_delay);

	  // post directed ClusterMessages to failover nodes
	  schedulers = "specified";
	  gr = this.getClusterNodes(schedulers);
	  this.postDirectedClusterMessages(gr, action, artifact_filename, job_start_time_delay);
	
	  // post undirected ClusterMessage as a precaution
	  job_start_time_delay = job_start_time_delay * 2;
      GlideClusterMessage.postDelayed(action, artifact_filename, job_start_time_delay);
   },

   // To get primary nodes: schedulers = "any"
   // To get failover nodes: schedulers = "specified"
   getClusterNodes: function(schedulers) {
	  var gr = new GlideRecord("sys_cluster_state");
	  gr.addQuery("schedulers", schedulers);
	  gr.addQuery("system_id", "!=", GlideServlet.getSystemID());
	  gr.query();
	  
	  return gr;
   },

   // Posts messages to cluster nodes. Half have a job_start_time of now, and half
   // at now + job_start_time_delay.
   postDirectedClusterMessages: function(gr, action, artifact_filename, job_start_time_delay) {
	  var count = 0;
	  while (gr.next()) {
	    if ((count % 2) == 0)
		  GlideClusterMessage.postDirectedDelayed(action, artifact_filename, gr.system_id, job_start_time_delay);
     	    else
	  	  GlideClusterMessage.postDirected(action, artifact_filename, gr.system_id);

	    count++;
  	  }
   },
   
   // Called from Upgrade
   runUpdateScript: function(artifact_filename) {
      // shut ourselves down
      var SYSTEMUTIL = GlideSystemUtil;
      this.LOGGER.log("Running background script to shut down JVM and unpack new war");

      var myname = gs.getProperty("glide.db.name");
      
      if (artifact_filename.match(".war$")) {
    	  
    	     // based on the OS, compute the correct update script to run
          var scriptName = "shell.scripts/update-instance.sh";
          if (SYSTEMUTIL.isWindows()) {
            scriptName = "shell.scripts/update-instance.bat";
            myname = myname.replace("_", ""); // windows service name does not allow non alphanumeric
          }

          var sa = new SecurelyAccess("com.glide.core", scriptName);
          sa.setBackground(true);
          sa.setQuiet(false);
          sa.runCommand([myname, artifact_filename]);    
          
      } else if (artifact_filename.match(".zip$")) {
    	  
    	  var fq_dist_file = "../webapps/glide/itil/WEB-INF/update/" + artifact_filename;
    	  var fq_current_dir = "..";
   	   	  var runner = GlideDistUpgradeRunner.createForGlideWar(fq_dist_file, fq_current_dir);
    	  runner.runDistUpgrade();
   	      
      } else {
    	  this.LOGGER.log("Unknown upgrade artifact: " + artifact_filename);
      } 
      
      this.LOGGER.log("Background script run. Shutdown in progress");
      
      return true;
   },
   
   setStartupJob : function() {
      var gr = new GlideRecord("sys_trigger");
      gr.addQuery("name", "Check Upgrade Script");
      gr.query();
      if (gr.next()) {
         var myID = GlideServlet.getSystemID();
         gr.system_id = myID;
         gr.update();
      }
   },
   
   setUpgradeJob : function() {
      var nextAction = gs.hoursAgo(-1); // set the next action to be an hour ahead
      this.LOGGER.log('Rescheduling next action for ' + nextAction);

      // Access the global schedule record:
      if (typeof g_schedule_record != 'undefined') {
        var gr = g_schedule_record;

        gr.next_action.setValue(nextAction); 
        gr.claimed_by = null;
        gr.state = 0;
        gr.update();

      } else {
        gs.log("WARNING: 'g_schedule_record' is undefined, unable to reschedule upgrade job")
      }
   },
   
   getWarFile: function() {
      // create the soap document
      var soapdoc = new SOAPEnvelope("GetWarFile", "http://www.service-now.com/");
      soapdoc.setFunctionName("execute");
      soapdoc.addFunctionParameter("instance_id", this.instance_id);
      soapdoc.addFunctionParameter("current_war", SNC.UpgradeUtil.getCurrentBuild());
      
      // post the request
      var soapRequest = new SOAPRequest(this.upgrade_server_url + "GetWarFile.do?SOAP");
      var soapResponse = soapRequest.post(soapdoc);
      var war_file = gs.getXMLText(soapResponse, "//executeResponse/war_file");
      
      return war_file;
   },

   // Check if it is a developer instance or if the instance id is null.
   // Return true if the instance has no id or it is a developer instance, otherwise, return false.
   // Error will be logged in case of null instance id.
   _shouldSkip: function() {
      if (this._isDeveloperInstance()) {
        this.LOGGER.log("Developer instance - skipped upgrade");
        return true;
      } else if (GlideJSUtil.isNilJavaObject(this.instance_id)) {
        this.LOGGER.error("Instance ID is null - skipped upgrade");
        return true;
      }
      return false;
   },

   // Check if the instance is a developer instance - test seam
   _isDeveloperInstance: function() {
      return GlideUtil.isDeveloperInstance();
   },

	/**
	 * Checks the current, assigned and revertedFrom WAR values and determines if upgrade needs to run
 	 * @returns {boolean} true if upgrade needs to be run, false otherwise
	 */
	shouldRunUpgrade: function() {
		var desired = gs.getProperty(this.UPGRADE_VERSION);
		if (!desired) {
			this.LOGGER.log('No desired war specified. Upgrade will not run');
			return false;
		}
		var current = gs.getProperty(this.WAR_VERSION);
		var revertedFrom = gs.getProperty(this.NO_UPGRADE_VERSION);
		if (!current) {
			this.LOGGER.log('No current war specified. Upgrade will run and set current war');
		} else if (current == desired) {
			this.LOGGER.log('Already on desired war ' + desired +'. Upgrade will NOT run');
			return false;
		} else if (desired == revertedFrom) {
			this.LOGGER.log('Desired war matches reverted war specified by property [' + this.NO_UPGRADE_VERSION + ']. Upgrade script will NOT run');
			return false;
		}

		// check if glide.war.assigned matches the distribution build version in glide.dist.node.
		var build_version = GlideProperties.get(this.BUILD_VERSION);
		// skip comparing if build version is not set
		if (!build_version)
			return true;

		// glide.dist.node doesn't contain .war or .zip suffix, so we ignore comparing that part
		var desired_no_suffix = desired.replace(/\.war$/, "");
		desired_no_suffix = desired_no_suffix.replace(/\.zip$/, "");
		if (desired_no_suffix != build_version) {
		    this.LOGGER.error('The desired war does not match distribution build. Upgrade will not run');
			return false;
		}
		return true;
	},
   
};