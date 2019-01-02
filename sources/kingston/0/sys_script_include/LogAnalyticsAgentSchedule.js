var LogAnalyticsAgentSchedule = Class.create();
LogAnalyticsAgentSchedule.prototype = {
    initialize: function() {
		this.event_id = "agent.schedule";
    },
	
	logAnalytics: function(data) {
		if(sn_uapaf.ScopedAnalyticsFramework.isDisabled())
			return;
		var streamId = "com.snc.agent_schedule";
		var obfuscationList = [];
		data['event.type'] = this.event_id;
		var sendStatus;
		status = sn_uapaf.ScopedAnalyticsFramework.open(streamId);
		if (status === 0) {
			sendStatus = sn_uapaf.ScopedAnalyticsFramework.sendJSON(streamId, obfuscationList, JSON.stringify(data));
			status = sn_uapaf.ScopedAnalyticsFramework.close(streamId);
		}
		if(new global.CSMUtil().isDebugOn())
			gs.info("logAnalytics status = " + sendStatus + "; logAnalytics streamId=" + streamId + " data=" + JSON.stringify(data));
	},

    type: 'LogAnalyticsAgentSchedule'
};