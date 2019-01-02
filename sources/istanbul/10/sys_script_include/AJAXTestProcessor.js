var AJAXTestProcessor = Class.create();


AJAXTestProcessor.prototype = Object.extendsObject(AbstractAjaxProcessor, {
   MAX_RECURSION: 5,	
   
   /* A whitelist of test definitions, mapping name to scriptable object, 
    * because eval-ing a param from the client exposes a vulnerability  */
   TEST_DEFINITIONS: {
      "SncGatewayConnectionTest": SncGatewayConnectionTest,
      "GlideDBPoolTest": GlideDBPoolTest
   },
   		   
   startTest: function() {
      var test_subject = this.getParameter('sysparm_test_subject');
	  var test_definition = this.getParameter('sysparm_test_definition');
	  
	  if (typeof test_definition === "undefined")
	     return;
	  
	  var def = this.TEST_DEFINITIONS[test_definition+''];
	  if (def && typeof def.runTest === 'function')
	     return def.runTest(test_subject)
	  
	  gs.logWarning("An unhandled test_definition was passed to AJAXTestProcessor: [" + test_definition + "]");
	  return "";
   },
   
   getStatus: function() {
      var hct = new GlideRecord("test_execution");
      hct.get(this.getParameter('sysparm_execution_id'));
	  var status = this.getStatusLayer(hct, 1);
      return new JSON().encode(status);
   },
   
   getStatusLayer: function(gr, rec) {
	  if (rec > this.MAX_RECURSION)
		 return;
	  
      var obj = {};
	  obj.name = gr.name.toString();
	  obj.state = gr.state.toString();
	  obj.message = gr.message.toString();
	  obj.sys_id = gr.sys_id.toString();
	  if (gr.isValidField('percent_complete'))
	      obj.percent_complete = gr.percent_complete.toString();
	  obj.results = [];
      var hctrs = new GlideRecord("test_execution");
      hctrs.addQuery("parent", gr.sys_id);
      hctrs.orderBy("order");
      hctrs.query();
      while (hctrs.next()) {
         obj.results.push(this.getStatusLayer(hctrs));
      }
	  
	  return obj;
   }
   
   
});


