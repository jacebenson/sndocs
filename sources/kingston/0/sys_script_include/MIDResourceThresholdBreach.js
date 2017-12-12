var MIDResourceThresholdBreach = Class.create();

MIDResourceThresholdBreach.prototype = {
	
	initialize: function() {
		
		this.DEFAULT_DOMAIN = "global";
		
		this.EVENT_NAME = "mid.threshold.resource.breach";
		this.CPU_INSTANCE_SOURCE = "CpuMIDResourceThresholdBreach";
		this.MEMORY_INSTANCE_SOURCE = "MemoryMIDResourceThresholdBreach";

		// (3 * 10 minute metric collection interval) == 30 minutes aggregation interval
		this.DEFAULT_CPU_AGGREGATE_THRESHOLD_INTERVAL_SPAN = 3;
		this.DEFAULT_MEMORY_AGGREGATE_THRESHOLD_INTERVAL_SPAN = 3;
		
		// 10 minute Metric collection interval (milliseconds)
		this.METRIC_COLLECTIOM_INTERVAL_MILLISECONDS = 10 * 60 * 1000;
		
		// Generate event if aggregation value is >= specified percent limit
		this.DEFAULT_CPU_THRESHOLD_PERCENT = 95;
		this.DEFAULT_MEMORY_THRESHOLD_PERCENT = 95;		
	},
	
	//
	// PUBLIC function designed to monitor/generate a MID Server CPU threshold breach event
	//
	checkCpuUsage: function(current) {
		
		// Define cpu resource specific object parameters
		this.AGGREGATE_MEAN_TEXT = "'Mean CPU used %'";
		this.DEFAULT_AGGREGATE_THRESHOLD_INTERVAL_SPAN = this.DEFAULT_CPU_AGGREGATE_THRESHOLD_INTERVAL_SPAN;
		this.DEFAULT_THRESHOLD_PERCENT = this.DEFAULT_CPU_THRESHOLD_PERCENT;
		this.INSTANCE_SOURCE = this.CPU_INSTANCE_SOURCE;
		this.THRESHOLD_AGGREGATE_INTERVAL_SPAN = "mid.threshold.mean_cpu.aggregate_interval_span";
		this.THRESHOLD_PERCENT = "mid.threshold.mean_cpu.percent";
		this.METRIC_TABLE  = "ecc_agent_scalar_metric";
		this.STATUS_TABLE_AGGREGATE_COL_NAME = "mean_cpu";
		this.METRIC_TABLE_AGGREGATE_MEAN_COL = "mean";
		this.METRIC_TABLE_COL_NAME_VALUE = "cpu.use";
		this.TRIGGERED_RESOURCE = "cpu";
		
	    // Default - disable processing of CPU threshold alerts
		this.ALERT_FEATURE_ENABLE = "mid.threshold.resource.breach.enable.cpu.alerts";
		this.DEFAULT_ALERT_FEATURE_ENABLE = "false";
		
		// report cpu resource for threshold breach
		this._checkResourceUsage(current);
	},
	
	//
	// PUBLIC function designed to monitor/generate a MID Server Memory threshold breach event
	//
	checkMemoryUsage: function(current) {
		
		// Define cpu resource specific object parameters
		this.AGGREGATE_MEAN_TEXT = "Mean of Memory 'Max used %'";
		this.DEFAULT_AGGREGATE_THRESHOLD_INTERVAL_SPAN = this.DEFAULT_MEMORY_AGGREGATE_THRESHOLD_INTERVAL_SPAN;
		this.DEFAULT_THRESHOLD_PERCENT = this.DEFAULT_MEMORY_THRESHOLD_PERCENT;
		this.INSTANCE_SOURCE = this.MEMORY_INSTANCE_SOURCE;
		this.THRESHOLD_AGGREGATE_INTERVAL_SPAN = "mid.threshold.mean_max_memory.aggregate_interval_span";
		this.THRESHOLD_PERCENT = "mid.threshold.mean_max_memory.percent";
		this.METRIC_TABLE  = "ecc_agent_memory_metric";
		this.STATUS_TABLE_AGGREGATE_COL_NAME = "max_memory";
		this.METRIC_TABLE_AGGREGATE_MEAN_COL = "max_used_pct";
		this.METRIC_TABLE_COL_NAME_VALUE = "memory.use";
		this.TRIGGERED_RESOURCE = "memory";
		
	    // Default - disable processing of Memory threshold alerts
		this.ALERT_FEATURE_ENABLE = "mid.threshold.resource.breach.enable.memory.alerts";
		this.DEFAULT_ALERT_FEATURE_ENABLE = "false";
		
		// report cpu resource for threshold breach
		this._checkResourceUsage(current);
	},
	
	//
	//  PRIVATE FUNCTION
	//
	// 1) This is a PRIVATE common function is invoked by the following Business Rules
	//    a) 'Update cpu mean on MID Server Status' or
	//    b) 'Update max memory on MID Server Status'
	//    The common function is invoked every 10 minutes after a record has
	//    been inserted into the specified metric table.
	// 2) The purpose of the function is to
	//     a) update the [ecc_agent_status] aggregate mean metric field,
	//        'mean_cpu' or 'max_memory', based on resource being processed.
	//     b) identify the set of MID Servers whose average aggregate mean metric
	//        field(s) has met/exceeded threshold limit.
	// 3) If the threshold has been exceeded, it will generate an event if-and-only-if a record for
	//    specified MID Server does not exist or exists with a state of "Resolved" in the
	//    [ecc_agent_issue] table.
	// 4) To receive email notifications, the user should create a Notification for the event
	//    inserted into the [sysevent] table when an event is fired.
	//    To limit notification to this threshold breach, the filter condition can be configured
	//    to match a Parm1 value matching the triggeredResource value of "cpu" or "memory".
	//
	// To debug Aggregate Mean algorithm insert after database query
	// 		gs.info(midServerName + " : " +
	// 				this.AGGREGATE_MEAN_TEXT + ": after start datetime " +
	// 				new GlideDateTime(startIntervalSpan).getDisplayValue() +
	// 				" : " + intervalSpanMinutes + " minute interval span : " +
	// 				"thresholdAggregateIntervalSpan: " + thresholdAggregateIntervalSpan +
	// 				" : aggregateMean " + aggregateMean);
	_checkResourceUsage: function(current) {
		
		//
		// Determine the user configurable threshold parameters defined in the
		// MID Server specific [ecc_agent_config] table or the instance default [sys_properties] table.
		//
		
		// locate optional THRESHOLD_PERCENT configuration parameter
		var thresholdPercent = this._getConfigParameter(
		this.THRESHOLD_PERCENT,
		this.DEFAULT_THRESHOLD_PERCENT);
		
		// locate optional THRESHOLD_AGGREGATE_INTERVAL_SPAN configuration parameter
		var thresholdAggregateIntervalSpan = this._getConfigParameter(
		this.THRESHOLD_AGGREGATE_INTERVAL_SPAN,
		this.DEFAULT_AGGREGATE_THRESHOLD_INTERVAL_SPAN);
		
		//
		// Calculate average of the recorded aggregate mean metric field values over the
		// configured aggregation time interval.
		//   thresholdAggregateIntervalSpan = MID Server specific aggregate span interval
		//                                    (or default [sys_properties] value)
		//   thresholdPercent               = MID Server specific threshold
		//                                    (or default [sys_properties] value)
		//   averageMean                    = average of the aggregate mean metric field values
		//
		
		// Determine start of interval span in GMT timezone
		var intervalSpanMinutes = thresholdAggregateIntervalSpan * 10;
		var startIntervalSpan = new GlideDateTime();
		var bufferedIntervalSpanMilliseconds = 60 * 1000; // adjust start of interval to 1 minute earlier
		startIntervalSpan.subtract(bufferedIntervalSpanMilliseconds +
		(thresholdAggregateIntervalSpan * this.METRIC_COLLECTIOM_INTERVAL_MILLISECONDS));
		
		// Obtain average of the mean(s)
		var COL_AGENT = "agent";
		var COL_DOMAIN = "sys_domain";
		var COL_NAME = "name";
		var COL_SYS_CREATED_ON = "sys_created_on";
		var AGGREGATE_AVG = "AVG";
		var OPERATOR_GREATER_THAN = ">";
		
		var metricGlideAggregate = new GlideAggregate(this.METRIC_TABLE);
		metricGlideAggregate.addQuery(COL_AGENT, current.agent);
		metricGlideAggregate.addQuery(COL_NAME, this.METRIC_TABLE_COL_NAME_VALUE);
		metricGlideAggregate.addQuery(COL_SYS_CREATED_ON, OPERATOR_GREATER_THAN, startIntervalSpan);
		metricGlideAggregate.addAggregate(AGGREGATE_AVG, this.METRIC_TABLE_AGGREGATE_MEAN_COL);
		metricGlideAggregate.groupBy(COL_AGENT);
		metricGlideAggregate.query();
		
		// Cache MID Server name
		var midServerName = current.agent.getRefRecord().getValue(COL_NAME);
		
		// Store MID Server domain if defined otherwise use the default
		var domain = current.agent.getRefRecord().getValue(COL_DOMAIN);		
		if (gs.nil(domain)) 
			domain = this.DEFAULT_DOMAIN;
		
		if (! metricGlideAggregate.next()) {
			
			gs.error(
			"Unable to obtain average of " +
			this.AGGREGATE_MEAN_TEXT +
			" for MID Server " +
			midServerName +
			" over a " +
			intervalSpanMinutes +
			" minute interval span, occurring after start datetime " +
			new GlideDateTime(startIntervalSpan).getDisplayValue());
			
			// exit processing
			return;
		}
		
		var aggregateMean = Math.floor(
			metricGlideAggregate.getAggregate(AGGREGATE_AVG, this.METRIC_TABLE_AGGREGATE_MEAN_COL));
		
		//
		// Update [ecc_agent_status] table threshold statistics
		//
		var TABLE_ECC_AGENT_STATUS = "ecc_agent_status";
		
		var statusGlideRecord = new GlideRecord(TABLE_ECC_AGENT_STATUS);
		statusGlideRecord.addQuery(COL_AGENT, current.agent);
		statusGlideRecord.query();
		
		if (statusGlideRecord.next()) {
			statusGlideRecord.setValue(this.STATUS_TABLE_AGGREGATE_COL_NAME, aggregateMean);
			statusGlideRecord.update();
		} else {
			gs.error("[ecc_agent_status] table record missing for MID Server " + midServerName);
		}
		
		//
		// Exit if threshold has not been exceeded
		// (or has fallen below threshold in the past 10 minute interval)
		//
		if (aggregateMean < thresholdPercent)
			return;

		// Determine if the user has enabled alerts for the resource.
		// If defined, use the property defined in the [sys_properties] table.
		// If not defined, used the compiled default boolean value (true | false)
		//		
		var enableAlertFeature = gs.getProperty(
			this.ALERT_FEATURE_ENABLE, 
			this.DEFAULT_ALERT_FEATURE_ENABLE);
		
		// user must explicitly opt into the alert feature for the resource
		if (enableAlertFeature != "true") 
			return;
			
		//
		// Determine if unresolved record currently exists in the [ecc_agent_issue] table
		//
		var COL_MID_SERVER = "mid_server";
		var COL_SOURCE = "source";
		var COL_STATE = "state";
		var OPERATOR_NOT_EQUAL = "!=";
		var TABLE_ECC_AGENT_ISSUE = "ecc_agent_issue";
		var VALUE_RESOLVED = "resolved";
		
		var issueGlideRecord = new GlideRecord(TABLE_ECC_AGENT_ISSUE);
		issueGlideRecord.addQuery(COL_MID_SERVER, current.agent);
		issueGlideRecord.addQuery(COL_SOURCE, this.INSTANCE_SOURCE);
		issueGlideRecord.addQuery(COL_STATE, OPERATOR_NOT_EQUAL, VALUE_RESOLVED);
		issueGlideRecord.query();
		
		//
		// Add (or update existing) record in ecc_agent_issue table
		//
		var COL_COUNT = "count";
		var COL_LAST_DETECTED = "last_detected";
		
		// Update existing unresolved record?
		if (issueGlideRecord.next()) {
			
			// Bump the 'last_detected' and 'count' fields.
			issueGlideRecord.setValue(COL_COUNT, (+ issueGlideRecord.getValue(COL_COUNT)) + 1);
			issueGlideRecord.setValue(COL_LAST_DETECTED, new GlideDateTime());
			
			// update the domain in case it has changed
			issueGlideRecord.setValue(COL_DOMAIN, domain);
			
			if (issueGlideRecord.update() == null)
				gs.error("Table update failed: " + ECC_AGENT_ISSUE_TABLE);
			
			// Exit processing
			return;
		}
		
		//
		// Insert new [ecc_agent_issue] table record
		//
		var COL_MESSAGE = "message";
		
		var message =
		this.AGGREGATE_MEAN_TEXT +
		" has exceeded threshold (" +
		aggregateMean +
		" >= " +
		thresholdPercent +
		") for a " +
		intervalSpanMinutes +
		" minute interval span, occurring after start date " +
		new GlideDateTime(startIntervalSpan).getDisplayValue();
		
		issueGlideRecord = new GlideRecord(TABLE_ECC_AGENT_ISSUE);
		issueGlideRecord.setValue(COL_LAST_DETECTED, new GlideDateTime());
		issueGlideRecord.setValue(COL_MID_SERVER, current.agent);
		issueGlideRecord.setValue(COL_MESSAGE, message);
		issueGlideRecord.setValue(COL_SOURCE, this.INSTANCE_SOURCE);
		issueGlideRecord.setValue(COL_DOMAIN, domain);
		
		if (issueGlideRecord.insert() == null)
			gs.error("Table insert failed: " + ECC_AGENT_ISSUE_TABLE);
		
		//
		// Generate the Event
		//   instance = current
		//   parm1    = this.TRIGGERED_RESOURCE
		//   parm2    = json object
		//
		var parm2 = {};
			
			parm2["midServerName"] = midServerName;
			parm2["aggregateMean"] =  aggregateMean;
			parm2[this.THRESHOLD_PERCENT] = thresholdPercent;
			parm2[this.THRESHOLD_AGGREGATE_INTERVAL_SPAN] = thresholdAggregateIntervalSpan;
			parm2["intervalSpanMinutes"] = intervalSpanMinutes;
			parm2["message"] = message;
			
		// Trigger Event
		gs.eventQueue(this.EVENT_NAME, current, this.TRIGGERED_RESOURCE, JSON.stringify(parm2));
			
		},
		
		//
		// PRIVATE function designed to return user configured MID Server configuration property
		// value or an instance-wide system property
		//
		_getConfigParameter: function(paramNameValue, defaultParamNameValue) {
			
			var COL_ECC_AGENT = "ecc_agent";
			var COL_PARAM_NAME = "param_name";
			var COL_VALUE = "value";
			var TABLE_ECC_AGENT_CONFIG = "ecc_agent_config";
			
			// locate optional configuration parameter
			var configGlideRecord = new GlideRecord(TABLE_ECC_AGENT_CONFIG);
			configGlideRecord.addQuery(COL_ECC_AGENT, current.agent);
			configGlideRecord.addQuery(COL_PARAM_NAME, paramNameValue);
			configGlideRecord.query();
			
			if (configGlideRecord.next())
				return configGlideRecord.getValue(COL_VALUE);
			else
				return gs.getProperty(paramNameValue, defaultParamNameValue);
		},

		type: 'MIDResourceThresholdBreach'
	};