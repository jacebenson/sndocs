function clickLoadDemoData() {
  // the following is what we have to do to make this client
  // script work from a list and form, with today's code
  if (typeof rowSysId == 'undefined')
     sysId = g_document.getElement('#sys_uniqueValue').value;
  else
     sysId = rowSysId;
     
  var listView = !(g_document.getElement('#sys_uniqueValue') != null);


  var map = g_i18n.getMessages(["Load Demo Data Only", "Plugin not found"]);
  var gr = new GlideRecord("v_plugin");
  gr.addQuery("sys_id", sysId);
  gr.query();
  if(gr.next()) {
    var dd = new GlideModal("load_demo_data_confirm_ui16");
    dd.setTitle(map["Load Demo Data Only"]);
    dd.setPreference('sysparm_plugin_id', gr.id);
    dd.setPreference('sysparm_plugin_desc', gr.description);
    dd.setPreference('sysparm_plugin_name', gr.name);
    dd.setPreference('sysparm_plugin_help', gr.help);
    dd.setPreference('sysparm_list_view', listView);
    dd.setWidth(400);
    dd.render();
  } else {
    alert(map["Plugin not found"] + ": " + sysId);
  }
}