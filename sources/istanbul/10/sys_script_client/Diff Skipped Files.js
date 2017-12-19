function onLoad() {
   if (g_form.getValue("update_set") != "" || g_form.getValue("disposition") != "4" && g_form.getValue("disposition") != "5" || g_form.getValue("payload_diff") != "" ) 
      return;
  
   var ga = new GlideAjax("DiffAjax");
   ga.addParam("sysparm_name", "diffUpgradeHistory");
   ga.addParam("sysparm_sys_id", g_form.getUniqueValue());
   ga.getXMLWait();
   var diff = ga.getAnswer();
   g_form.setValue("payload_diff", diff);
}
