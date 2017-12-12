var CardboardAjax = Class.create();
CardboardAjax.prototype =  Object.extendsObject(AbstractAjaxProcessor, {
   
   process: function() {
      var parentId = this.getParameter('sysparm_id');
      var ids = this.getParameter('sysparm_items') + '';
      if (!ids || !parentId)
         return;
      
      var gr = new GlideRecord('planned_task');
      gr.addQuery('sys_id', 'IN', ids.split(','));
      gr.query();
      while (gr.next()) {
         // make sure this user can update the item
         if (!gr.parent.canWrite()) {
            continue;
         }
            
         gr.parent = parentId;
         gr.update();
      } 
   },
	
	/**
	 * Prevents public access to this processor
	 */
	isPublic: function() {
		return false;
	},
   
   type: "CardboardAjax"
});