var InstanceCloneScheduler = Class.create();
InstanceCloneScheduler.prototype = {
	initialize: function() {
		this.clone_server_url = gs.getProperty("glide.db.clone.instance_clone_server");
	},
	
	type: 'InstanceCloneScheduler',
	
	/** Notify instance clone schedule server by calling web service - response might cause the record to be updated */
	notifyServer: function(cloneRecord){
		var notified = false;
		var standbyInstance = this._getInstanceRecord(cloneRecord.source_instance);
		var targetInstance = this._getInstanceRecord(cloneRecord.target_instance);
		var originalSysModCount = cloneRecord.sys_mod_count;
		var sourceName = SncCloneUtils.getSourceInstanceName();
		var sourceUrl = SncCloneUtils.getSourceInstanceUrl();
		
		// developer installs and localhost: source/target should not contact production url clone.service-now.com
		if (this._shouldSkip(sourceName, targetInstance.instance_name))
			return notified;
		
		var s = new SOAPMessage('Instance Clone Schedule', 'execute');
		s.setStringParameter('clone_id', cloneRecord.sys_id);
		s.setStringParameter('date', cloneRecord.scheduled || new GlideDateTime());
		s.setStringParameter('state', cloneRecord.state || 'Draft');
		s.setStringParameter('cluster_node',
							 this._getSystemId(cloneRecord.cluster_node));
		s.setStringParameter('user_name', cloneRecord.sys_created_by);
		s.setStringParameter('user_maint', this._isMaint(cloneRecord.sys_created_by));
		s.setStringParameter('user_email', cloneRecord.email);
		s.setStringParameter('security_token', cloneRecord.security_token||'');
		
		// instance details
		s.setStringParameter('source_instance_id', gs.getProperty('instance_id'));
		s.setStringParameter('source_instance_name', gs.getProperty('instance_name') 
							 || sourceName);
		s.setStringParameter('source_instance_url', sourceUrl);
		s.setStringParameter('target_instance_id', targetInstance.instance_id);
		s.setStringParameter('target_instance_name', targetInstance.instance_name);
		s.setStringParameter('target_instance_url', targetInstance.instance_url);
		
		// version details
		s.setStringParameter('source_version',
							 this._formatVersion(gs.getProperty('glide.war')));
		s.setStringParameter('target_version',
							 this._formatVersion(targetInstance.war_version));
		
		// jdbc details
		var primaryParms = GlideDBUtil.getPrimaryDBConfigurationParms();
		var primaryIP = GlideUtil.isDeveloperInstance() ? "localhost" :
		GlideHostUtil.getPublicIPAddress();
		var sourceJDBCUrl = primaryParms.getURL().replace("localhost", primaryIP);
		var sourceDBName = primaryParms.getDatabaseName();
		
		var targetJDBCUrl = targetInstance.database_url.replace("localhost",
																primaryIP);
		var targetDBName = targetInstance.database_name;
		var standbyJDBCUrl = standbyInstance == null ? "" :
		standbyInstance.database_url.replace("localhost", primaryIP);
		var standbyDBName = standbyInstance == null ? "" :
		standbyInstance.database_name;
		
		s.setStringParameter('source_jdbc_url', sourceJDBCUrl);
		s.setStringParameter('source_db_server', this._formatDBServer(sourceJDBCUrl));
		s.setStringParameter('source_db_name', sourceDBName);
		s.setStringParameter('target_jdbc_url', targetJDBCUrl);
		s.setStringParameter('target_db_server', this._formatDBServer(targetJDBCUrl));
		s.setStringParameter('target_db_name', targetDBName);
		s.setStringParameter('standby_jdbc_url', standbyJDBCUrl);
		s.setStringParameter('standby_db_server',
							 this._formatDBServer(standbyJDBCUrl));
		s.setStringParameter('standby_db_name', standbyDBName);
		s.setStringParameter('validation_error', targetInstance.validation_error);
		
		// timing and metric details
		s.setStringParameter('mb_to_copy', cloneRecord.megabytes_to_copy);
		s.setStringParameter('mb_copied', cloneRecord.megabytes_copied);
		s.setStringParameter('kb_per_second', cloneRecord.kilobytes_per_second);
		s.setStringParameter('duration', cloneRecord.duration);
		s.setStringParameter('started', cloneRecord.started);
		s.setStringParameter('completed', cloneRecord.completed);
		s.setStringParameter('cancelled', cloneRecord.canceled); // clone.xml is mis-spelled, but it is what it is at this point
		//reservation details
		s.setStringParameter('check_for_available_reservation','false');
		var endpoint = this.clone_server_url;
		gs.log("InstanceCloneScheduler: calling instance clone scheduler server: " + endpoint);
		if (endpoint)
			s.setSoapEndPoint(endpoint);
		
		// use custom authorization
		s.setRequestHeader("Authorization", "Clone " + gs.getProperty('instance_id') + ":" + primaryIP);
		
		var response = s.post();
		if (s.httpStatus != 200)
			SncCloneLogger.log("InstanceClone", cloneRecord.sys_id, null, /*info*/0, "Unable to contact server for confirmation");
		else {
			notified = true;
			var doc = new GlideXMLDocument();
			doc.parse(response);
			
			// Verify that our record sys_mod_count is still the same. If not, the record has been modified while we were
			// waiting for the web service and we need to ignore this response (another WS request has probably been sent)
			var currentCloneRecord = new GlideRecord("clone_instance");
			currentCloneRecord.get(cloneRecord.sys_id);
			if (originalSysModCount != currentCloneRecord.sys_mod_count) {
				gs.log("InstanceClone", "Server response received, however record has been modified - no change applied");
				return notified;
			}
			
			var state = this._getText(doc, 'state')+'';
			var description = this._getText(doc, 'description')+'';
			
			var scheduled = cloneRecord.scheduled;
			if (!gs.nil(this._getText(doc, 'date')))
				scheduled = new GlideDateTime(this._getText(doc, 'date')); // GMT
			
			var newStandbyJDBCUrl = this._getText(doc, 'standby_jdbc_url')+'';
			var newStandbyDBName = this._getText(doc, 'standby_db_name')+'';
			var newClusterNode = this._getText(doc, 'cluster_node')+'';
			var cloneEstimationMessage =
				this._getText(doc,'clone_estimation_message')+'';
			var cloneValidationRules =
				this._getText(doc,'clone_request_validation_rules')+'';
			var isReservationAvailableForCloning =
				this._getText(doc,'is_reservation_available')+'';
			
			gs.log("InstanceClone", "Received server response: state '" + state + "', scheduled @"+scheduled.getDisplayValue() + ", clusterNode " + newClusterNode + ", standbyDB " + newStandbyJDBCUrl);
			
			var stateChanged = !gs.nil(state) && cloneRecord.state != state;
			var dateChanged = cloneRecord.scheduled.getDisplayValue() !=
				scheduled.getDisplayValue();
			var standbyChanged = !gs.nil(newStandbyJDBCUrl) && (gs.nil(standbyJDBCUrl)
																|| standbyJDBCUrl !=
																newStandbyJDBCUrl);
			var nodeChanged = !gs.nil(newClusterNode) &&
				(gs.nil(cloneRecord.cluster_node) 
				 || cloneRecord.cluster_node !=
				 newClusterNode);
			
			var oldState = cloneRecord.state;
			var oldScheduled = cloneRecord.scheduled;
			var oldClusterNode = cloneRecord.cluster_node||'';
			var update = false;
			
			if ( stateChanged ) {
				gs.log("InstanceClone", "Schedule Server changed state from " 
					   + oldState + " to " + state + " (" + description + ")");
				cloneRecord.state = state;
				if (state == 'Hold')
					cloneRecord.message = description;
				update = true;
			}
			
			if ( dateChanged ) {
				gs.log("InstanceClone", "Schedule Server changed date from " +
					   oldScheduled.getDisplayValue() + " to " +
					   scheduled.getDisplayValue() + " (" + description + ")");
				cloneRecord.setValue('clone_request_validation_rules',
					   this._getText(doc,'clone_request_validation_rules'));
				cloneRecord.setValue("scheduled", scheduled); // GMT
				cloneRecord.setValue("clone_estimation_message",
									 cloneEstimationMessage);
				cloneRecord.setValue("is_reservation_available",
									 isReservationAvailableForCloning);
				update = true;
			}
			
			if ( nodeChanged && this._setClusterNode(cloneRecord, newClusterNode) ) {
				update = true;
				gs.log("InstanceClone", 
					   "Schedule Server changed cluster node from " +
					   oldClusterNode + " to " + newClusterNode + 
					   " (" + description + ")");
			}
			
			if ( standbyChanged &&
				this._setStandbySource(cloneRecord, newStandbyJDBCUrl,
									   newStandbyDBName) ) {
				update = true;
				gs.log("InstanceClone", 
					   "Schedule Server changed standby db from " + 
					   standbyJDBCUrl + "." + standbyDBName + " to " +
					   newStandbyJDBCUrl + "." + newStandbyDBName + 
					   " (" + description + ")");
			}
			
			if ( update ) {
				var workflowBookmark = cloneRecord.isWorkflow();
				cloneRecord.setWorkflow(false); // do not recontact server
				cloneRecord.update();
				cloneRecord.setWorkflow(workflowBookmark);
			}
		}
		return notified;
	},
	
	// Piggy Back the same service Call with additional paramter for checking Reservation
	
	notifySchedulingServerForCheckingReservation: function(cloneRecord) {
		var s = new SOAPMessage('Instance Clone Schedule', 'execute');
		s.setStringParameter('clone_id', cloneRecord.sys_id);
		s.setStringParameter('date', cloneRecord.scheduled || new GlideDateTime());
		s.setStringParameter('check_for_available_reservation','true');
		var endpoint = this.clone_server_url;
		gs.log("InstanceCloneScheduler: calling instance clone scheduler server: " +
			   endpoint);
		var primaryIP = GlideUtil.isDeveloperInstance() ? "localhost" :
		GlideHostUtil.getPublicIPAddress();
		if (endpoint)
			s.setSoapEndPoint(endpoint);
		// use custom authorization
		s.setRequestHeader("Authorization", "Clone " + 
						   gs.getProperty('instance_id') + ":" + primaryIP);
		var response = s.post();
		if (s.httpStatus != 200)
			SncCloneLogger.log("InstanceClone",
							   cloneRecord.sys_id, null, /*info*/0, 
							   "Unable to contact server for confirmation");
		else {
			var doc = new GlideXMLDocument();
			doc.parse(response);
			var isReservationAvailableForCloning =
				this._getText(doc,'is_reservation_available');
			var scheduled = new GlideDateTime(this._getText(doc, 'date')); // GMT
			var cloneEstimationMessage = this._getText(doc,'clone_estimation_message');
			cloneRecord.setValue("scheduled", scheduled); // GMT
			cloneRecord.setValue("clone_estimation_message",cloneEstimationMessage);
			cloneRecord.setValue("is_reservation_available",
								 isReservationAvailableForCloning);
			cloneRecord.setWorkflow(false);//Don't trigger any BR
			cloneRecord.update();
			
		}
		
	},
	
	/** Notify instance clone schedule server by calling web service - response might cause the record to be updated */
	scheduleNotifyServer: function(cloneRecord) {
		var schedule = new ScheduleOnce();
		schedule.setLabel("Notify instance clone scheduler");
		schedule.script = "new InstanceCloneScheduler()._notifyServerByCloneId('" +
			cloneRecord.sys_id + "');";
		return schedule.schedule();
	},

	/** Notify instance clone schedule server by calling web service - response might cause the record to be updated */
	_notifyServerByCloneId: function(cloneId) {
		var cloneRecord = new GlideRecord("clone_instance");
		if (cloneRecord.get(cloneId))
			this.notifyServer(cloneRecord);
	},
	
	_isMaint: function(user_id) {
		if (gs.hasRole('maint'))
			return true;
		
		var gr = new GlideRecord("sys_user");
		gr.addQuery("user_name", user_id);
		gr.query();
		if (gr.next()) {
			var user = GlideUser.getUserByID(gr.sys_id);
			return user != null ? user.hasRole("maint") : false;
		}
		return false;
	},
	
	_formatVersion: function(version) {
		if (gs.nil(version))
			return "";
		
		if (version == 'null')
			return "";
		
		if (version.length > 4 && version.indexOf('.') > -1)
			return version.substring(0, version.length-4);
		
		return version;
	},
	
	_formatDBServer: function(jdbcUrl) {
		if (gs.nil(jdbcUrl))
			return "";
		
		// jdbc:mysql://servername:port/
		// jdbc:sqlserver://servername:portnum/
		var answer = jdbcUrl;
		var idx = answer.indexOf('://');
		if (idx > -1) {
			answer = answer.substring(idx+3).replace('/', '');
			
			idx = answer.indexOf(':');
			if (idx > -1)
				answer = answer.substring(0, idx);
		}
		
		// jdbc:oracle:thin:@host.com:1521:sidname
		idx = jdbcUrl.indexOf(':@');
		if (idx > -1) {
			answer = answer.substring(idx+2).replace('/', '');
			
			idx = answer.indexOf(':');
			if (idx > -1)
				answer = answer.substring(0, idx);
		}
		
		return answer;
	},
	
	_getText: function(doc, tag) {
		var el = doc.getElementByTagName(tag);
		if (el && el != null)
			return el.getTextContent();
		
		return "";
	},
	
	_getSystemId: function(clusterStateSysId) {
		if (gs.nil(clusterStateSysId))
			return "";
		
		var gr = new GlideRecord("sys_cluster_state");
		if (gr.get(clusterStateSysId))
			return gr.system_id;
		
		return "";
	},
	
	_setClusterNode: function(cloneRecord, clusterNode) {
		if (gs.nil(clusterNode))
			return false;
		
		var gr = new GlideRecord("sys_cluster_state");
		gr.addQuery("status", "online"); // only allow change to online nodes
		// we can receive cluster node input in three variations
		var qc = gr.addQuery("sys_id", clusterNode);
		qc.addOrCondition("node_id", clusterNode);
		qc.addOrCondition("system_id", clusterNode);
		gr.query();
		if ( gr.next() && (gs.nil(cloneRecord.cluster_node) || 
						   cloneRecord.cluster_node != gr.sys_id) ) {
			cloneRecord.cluster_node = gr.sys_id;
			return true;
		}
		
		return false;
	},
	
	_getInstanceRecord: function(instanceSysId) {
		if (gs.nil(instanceSysId))
			return null;
		
		var gr = new GlideRecord('instance');
		if (gr.get(instanceSysId) && gr.primary == false) // don't return the primary setup record
			return gr;
		
		return null;
	},
	
	_setStandbySource: function(cloneRecord, jdbcUrl, dbName) {
		if (gs.nil(jdbcUrl) || gs.nil(dbName))
			return false;
		
		// First validate db connection
		var primaryParms = GlideDBUtil.getPrimaryDBConfigurationParms();
		var user = primaryParms.getUser();
		var clearPassword = primaryParms.getPassword();
		var encryptedPassword = this._encrypt(clearPassword);
		var rdbms = primaryParms.getRDBMS();
		var tablespace = null;
		
		try {
			var instance = new SncCloneInstance(dbName, user, encryptedPassword,
												jdbcUrl, rdbms, tablespace);
			
			// verify that the database exists
			if (!instance.instanceDatabaseExists()) {
				SncCloneLogger.log("InstanceClone", cloneRecord.sys_id,
								   null,
								   /*error*/2,
								   "Source cannot be cloned from: database does not "+
								   "exist");
				return false;
			}
			
			// verify that the alternative source can be cloned from
			if (!instance.canCloneFrom()) {
				SncCloneLogger.log("InstanceClone", 
								   cloneRecord.sys_id, null, 
								   /*error*/2, 
								   "Source cannot be cloned from: instance_id "+
								   "does not match primary database "+
								   "(it appears to be a different database)");
				return false;
			}
		} catch(e) {
			SncCloneLogger.log("InstanceClone", 
							   cloneRecord.sys_id, 
							   null, 
							   /*error*/2, 
							   "Source cannot be cloned from: unable "+
							   "to connect to database and verify instance_id: "+
							   e.toString());
			return false;
		}
		
		var isNew = false;
		var gr = new GlideRecord("instance");
		gr.addQuery("source", true);
		gr.addQuery("primary", false);
		gr.query();
		if (!gr.next()) {
			isNew = true;
			gr.initialize();
			gr.setValue("source", true);
			gr.setValue("primary", false);
		}
		
		gr.database_url = jdbcUrl;
		gr.database_name = dbName;
		gr.database_tablespace = tablespace;
		gr.database_type = rdbms;
		gr.database_user = user;
		gr.database_password = encryptedPassword;
		
		gr.instance_id = gs.getProperty("instance_id")+"";
		if (gs.nil(gr.instance_name))
			gr.instance_name = "Standby Database";
		if (gs.nil(gr.instance_url))
			gr.instance_url = gs.getProperty("glide.servlet.uri")+"";
		gr.production = gs.getProperty("glide.installation.production");
		gr.war_version = gs.getProperty("glide.war")+"";
		
		if (isNew)
			gr.insert();
		else
			gr.update();
		
		cloneRecord.source_instance = gr.sys_id;
		return true;
	},
	
	/* developer installs and localhost: source/target should not contact production url clone.service-now.com */
	_shouldSkip: function(sourceName, targetName) {
		var answer = false;
		var url = this.clone_server_url; // eg https://clone.service-now.com/InstanceCloneSchedule.do?SOAP
		if (gs.nil(url))
			return answer;
		
		var productionUrl = "https://clone.service-now.com/";
		var isDeveloper = GlideUtil.isDeveloperInstance() &&
			!GlideUtil.isProductionInstance();
		var isLocalHost = sourceName.indexOf("localhost") > -1 ||
			targetName.indexOf("localhost") > -1;
		// if we're trying to contact the production url and we're a local installation, do not pass go
		if (url.indexOf(productionUrl) > -1 && (isDeveloper || isLocalHost)) {
			answer = true;
			gs.print("InstanceCloneScheduler - this is a developer "+
					 "or localhost instance, production scheduling service is not "+
					 "supported: to resolve, change property "+
					 "glide.db.clone_server_url");
		}
		
		return answer;
	},
	
	_encrypt: function(unencryptedString) {
		if (gs.nil(unencryptedString))
			return "";
		
		var encryptor =  new GlideEncrypter();
		return encryptor.encrypt(unencryptedString);
	}
};