gs.include("PrototypeServer");

var Transform = Class.create();

Transform.prototype = {
    initialize : function() {
    },

    transformMapCanRunImport : function(mgr) {
      // soap tables cannot be transformed because they are
      // transformed on-demand, without an import set
      if (mgr.source_table.toString().startsWith("soap_"))
        return false;

      var tgr = new GlideRecord("sys_transform_entry");
      tgr.addQuery("map",  mgr.sys_id);
      tgr.query();
      if (tgr.next())
        return true;

      if(mgr.run_script)
        return true; 

      return false;
    }
}