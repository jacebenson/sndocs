restartMID();

function restartMID() {
	if (event.parm1 != "com.snc.discovery" && event.parm1 != "com.snc.runbook_automation" 
		&& event.parm1 != "com.snc.service-watch")
		return;
	
	gs.log("Plugin " + event.parm1 + " has just been activated/reloaded. Notify MID servers to restart");
	
	var script = "var gr = new GlideRecord('ecc_queue');";
	script    += "gr.initialize();";
	script    += "gr.setValue( 'agent',  'mid.server.*'  );";
	script    += "gr.setValue( 'source', 'restart'    );";
	script    += "gr.setValue( 'topic',  'SystemCommand' );";
	script    += "gr.setValue( 'queue',  'output'        );";
	script    += "gr.setValue( 'state',  'ready'         );";
	script    += "gr.setValue( 'priority',  '0'          );";
	script    += "gr.insert();";
	GlideRunScriptJob.scheduleScript(script);
}


