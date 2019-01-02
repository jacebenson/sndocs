var PortalSummary = Class.create();

PortalSummary.prototype = {
  initialize : function() {
  },

  summarize : function(portal) {
    var gr = new GlideRecord('sys_portal_preferences');
    gr.addQuery('portal_section', portal.sys_id);
    gr.addQuery('name', 'title');
    gr.query();
    if (gr.next()) 
       return gr.value + '';
 
    return gs.getMessage('No summary available');
    
  }
}