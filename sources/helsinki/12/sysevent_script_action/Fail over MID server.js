/* Do the following if the MID server just went down */

failOver();

function failOver() {
    var midSysId = current.sys_id
    var midName = current.name+'';

    var msc = new MIDServerCluster(current, "Failover");
    if (!msc.clusterExists())
        return;
    
	var newAgentName = msc.getClusterAgent();
	if (JSUtil.nil(newAgentName))
		return;
	
    failOverTasks(midName, newAgentName);
}

function failOverTasks(downAgent, newAgentName) {			
    var eccgr = new GlideRecord("ecc_queue");	
    eccgr.addQuery("agent", "mid.server." + downAgent);
	
	// Exclude it for certain types of probes... 
	eccgr.addQuery("topic", "NOT IN", ["systemCommand", "HeartbeatProbe", "config.file", "Command"]);
	
	// Pick up ready or processing
    var qc = eccgr.addQuery("state", "ready");
    qc.addOrCondition("state", "processing");

	// Bound the ECC queue query by picking up only the entries between the last 30 days and now.
	var s = new GlideDateTime();
	s.subtract(3600 * 1000 * 24 * 30); //1 hour * 24 hours * 30 days
	eccgr.addQuery("sys_created_on", '>=', s);
	eccgr.addQuery("sys_created_on", '<=', new GlideDateTime());				   
		
    eccgr.query();
    while (eccgr.next()) {
        eccgr.agent = "mid.server." + newAgentName;
        eccgr.state = "ready";
        eccgr.update();
    }

	new MIDServerManage().resetQueryWindow(newAgentName);
}




