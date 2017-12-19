/**
 * This is only used to handle Request Items with a Delivery Plan or a Workflow.
 */
gs.include("PrototypeServer");

var WorkflowIconsSCR = Class.create();
WorkflowIconsSCR.prototype = Object.extendsObject(WorkflowIconsStages, { 
   
   initialize: function(ref) {
      this.elementName = ref;
      this.element = eval(ref);
      this.gr = this.element.getGlideRecord();
      if (!this.gr.cat_item.workflow || this.gr.cat_item.workflow.nil()) {
         this.handler = new GlideappRequestItemWorkflow(this.gr);
      } else {
         this.handler = null;
      }
   },
   
   process: function(cl) {
	  if (isError(cl))
		  return cl;
	   
      if (this.handler)
         return this.handler.generateChoices(cl);

      return WorkflowIconsStages.prototype.process.call(this, cl);
	   
	  function isError(cl) {
		  if (cl.getSize() == 1)
			  if (cl.getChoice(0).value == 'error')
				  return true;
		  return false;
	  }
   },
 
   type: "WorkflowIconsSCR"
});