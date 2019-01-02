// this is the REST and JSON Catch All quota rule. 
var catchAll = new GlideRecord('sysrule_quota');
catchAll.get('84622fa19f1122005cf3ffa4677fcf1f');

// if there is an active integration quota rule (i.e old or new) we make catchAll rule active

// for instances which started REST functionality from geneva or later (i.e zbooted from geneva or upgraded from dublin directly to geneva or later) 
// new integration rules comes direcly from unload folder. we check for such rules using sys_id

// for instances which started REST functionality from fuji (i.e zbooted from fuji or upgraded from dublin to fuji) old integration rule
// is added and from geneva we add four quota rules programatically uisng a fix script. we check for such rules using name.

// for instances which started REST functionality from eureka (i.e zbooted from eureka or upgraded from dublin to eureka) catch all 
// rule should not be active.

var integration = new GlideRecord('sysrule_quota'); 
var qc = integration.addQuery('sys_id','IN','55841f53ff2102003434ffffffffff39,20c02b419f232100ef4afa7dc67fcf9e,4f807f12ff2102003434ffffffffff80,bb207f12ff2102003434ffffffffffa8,f17b97d2ff2102003434ffffffffff52');
qc.addOrCondition('name','IN','REST Table API request timeout,REST Import Set API request timeout,REST Aggregate API request timeout,REST Attachment API request timeout');
integration.addQuery('active',true);
integration.query();
if (integration.next()){
    catchAll.active = true;
    catchAll.setWorkflow(false);
    catchAll.setUseEngines(false);
    catchAll.update();
}
    