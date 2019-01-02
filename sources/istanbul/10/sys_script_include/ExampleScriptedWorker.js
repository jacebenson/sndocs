var ExampleScriptedWorker = Class.create();

ExampleScriptedWorker.prototype = {
  initialize : function() {
  },
  
  process: function(startMsg) {
     worker.addMessage(startMsg);
  }
}