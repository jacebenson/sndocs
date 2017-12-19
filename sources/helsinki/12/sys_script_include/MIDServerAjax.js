var MIDServerAjax = Class.create();

MIDServerAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
 
   ajaxFunction_restartMID: function() { 
     var mm = new MIDServerManage();
     mm.restart(this.getParameter('sysparm_agent_name'));
   },

   ajaxFunction_stopMID: function() { 
     var mm = new MIDServerManage();
     mm.stop(this.getParameter('sysparm_agent_name'));
   },
   
   ajaxFunction_grabMIDLog: function() {
     var mm = new MIDServerManage();
     mm.grab_logs(this.getParameter('sysparm_agent_name'), 'wrapper.log,agent0.log.0');
   },
   
   ajaxFunction_upgradeMID: function() {
     var mm = new MIDServerManage();
     mm.upgrade(this.getParameter('sysparm_agent_name'));
   },

   ajaxFunction_testProbe: function() {
     var mm = new MIDServerManage();
     var sys_id = mm.test_probe(
                  this.getParameter('sysparm_agent_name'),
                  this.getParameter('sysparm_probe_id'),
                  this.getParameter('sysparm_topic'),
                  this.getParameter('sysparm_ename'),
                  this.getParameter('sysparm_source'));

	 session.getUser().setPreference('test_probe.ip', this.getParameter('sysparm_source')); 
	 session.getUser().setPreference('test_probe.midserver_name', this.getParameter('sysparm_agent_name'));  
   
	 return sys_id;
   },
	
   ajaxFunction_addRelatedList: function() { 
     var arl = new AddStandardCIRelatedLists(); 
     arl.process();    
   }
	
});