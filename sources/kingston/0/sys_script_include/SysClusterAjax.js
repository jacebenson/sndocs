var SysClusterAjax = Class.create();

SysClusterAjax.prototype =  Object.extendsObject(AbstractAjaxProcessor, {

  runScript: function() {
    if (!gs.hasRole("admin")) {
        gs.log("Missing admin role, skipping");
        return;
    }

    var script = this.getParameter('sysparm_script');
    var node = this.getParameter('sysparm_node');

    GlideClusterMessage.postScript(script, node);         
  },
  
  isPublic: function() {
    return false;
  },

  type: "SysClusterAjax"
});