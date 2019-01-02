updateTransformHistoryOnError();

function updateTransformHistoryOnError() {
	var importSetRunGR = new GlideRecord('sys_import_set_run');
	importSetRunGR.get(event.instance);
	var curState = importSetRunGR.getValue('state');
	
	if(curState == 'running') {
		var parm1Json = JSON.parse(event.parm1);
		
		if(parm1Json) {
			importSetRunGR.setValue('state', parm1Json.state);
			setRunTime(parm1Json.completed);
		}
		setStats();
		
		importSetRunGR.update();
	}
	
	function setRunTime(completed) {
		var startTime = new GlideDateTime(importSetRunGR.getValue('sys_created_on'));
		var completeTime = new GlideDateTime(completed);
		importSetRunGR.setValue('completed', completeTime);
		var duration = GlideDateTime.subtract(startTime, completeTime);
		importSetRunGR.setValue('run_time', duration);
	}
	
	function setStats(){
		var parm2Json =  JSON.parse(event.parm2);
		
		if(parm2Json) {
			importSetRunGR.setValue('total', parm2Json.total);
			importSetRunGR.setValue('inserts', parm2Json.inserts);
			importSetRunGR.setValue('updates', parm2Json.updates);
			importSetRunGR.setValue('skipped', parm2Json.skipped);
			importSetRunGR.setValue('ignored', parm2Json.ignored);
			importSetRunGR.setValue('errors', parm2Json.errors);
			
			if(parm2Json.sys_transform_map)
				importSetRunGR.setValue('errors', parm2Json.sys_transform_map);
		}
		
	}
}