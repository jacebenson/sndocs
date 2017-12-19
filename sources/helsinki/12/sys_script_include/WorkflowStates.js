gs.include("PrototypeServer");

var WorkflowState = Class.create();
WorkflowState.prototype = {

  initialize: function(grState) {
     if (!grState)
         return;

     var t = grState;
     this.state = t.state;
     // activity sys_id
     this.activity = new String(t.activity);
     this.primary = t.primary;
     this.name = t.activity.name;
     this.executing = false;
     this.count = 0;
     this.status = "never";
     this.ola = t.ola.getDisplayValue();
  }, 

  colors :  {
     never : "red",
     Completed :  "LightGreen",
     Executing :  "LimeGreen",
     Pending : "LightGoldenRodYellow",
     Bypassed : "SkyBlue",
     Regressed : "LightCyan"
  },

  getColor: function() {
    return this.colors[this.status];
  }
}

var WorkflowStates = Class.create();
WorkflowStates.prototype = {
  initialize: function() {
     this.states = new Array(); 
     this.executing = 9999; 
  }, 

  setWorkflow: function(sys_id) {
    this.workflow = sys_id;
    var t = new GlideRecord('wf_activity_state'); 
    t.addQuery('workflow', sys_id); 
    t.orderBy('order'); 
    t.query(); 
    while (t.next()) {
	var s = new WorkflowState(t);
	this.states.push(s);
     }	
  },

  setContext: function(gr) {
    this.context = gr.sys_id;
    this.setWorkflow(gr.workflow);
    this.addHistory();
    this.addExecuting();
    this.setStatus();
  },

  setStatus: function() {
    var index = -1;
    for (var i = 0; i != this.states.length; i++) {
      if ( this.states[i].executing) { 
        index = i;
        break;
      }
     }	
    
    for (var i = 0; i != this.states.length; i++) {
    var a = this.states[i];
    if (i > index) {
      if (a.count > 0) 
        a.status = "Regressed";
      else 
        a.status = "Pending";
    } else if (i == index ) {
      a.status = "Executing";
    } else {
      if (a.count > 0) 
       a.status = "Completed";
      else 
       a.status = "Bypassed";
    }
   }	  
  },

  addExecuting: function() {
    var h = new GlideRecord('wf_executing'); 
    h.addQuery('context', this.context ); 
    h.query(); 
    while (h.next()) {
       var s = this.findActivity(h.activity);
       s.executing = true;
    }
  },

  addHistory: function() {
    var h = new GlideRecord('wf_history'); 
    h.addQuery('context', this.context ); 
    h.addOrderBy('started'); 
    h.query(); 
    while (h.next()) {
       var s = this.findActivity(h.activity);
       s.count++;
    }
  }, 

  findActivity: function(a) {
    for (var i = 0; i != this.states.length; i++) {
      if (a == this.states[i].activity) 
         return this.states[i];
     }
     gs.log("Did not find: " + a);
     return null;
   }, 

  log: function() {
    for (var i = 0; i != this.states.length; i++) {
      var a = this.states[i];
      gs.log(a.activity + " " + a.name + " " + a.executing + " " + a.count + " " + a.status);
     }		
   }
  
}