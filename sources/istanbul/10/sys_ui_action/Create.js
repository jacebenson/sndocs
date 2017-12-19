answer = current.insert();
gs.include('ActionUtils');
var au = new ActionUtils();
au.postInsert(current);

if (answer != null && current.getLastErrorMessage == null) {
  gs.addInfoMessage("Table '" + current.label + "' (" + current.name + ") created");

  // add new table to custom tables list
  var appModule = new GlideApplicationModule();
  appModule.setTableName(current.name);
  appModule.setTableLabel(current.label);
  appModule.setCreateApplication(false);
  appModule.setCreateModule(true);

  if (current.application_name.nil()) {
    appModule.setModuleOrder(8050); // always 8050
    appModule.setApplicationName("sysdef");
  } else {
    appModule.setApplicationName(current.application_name);
    appModule.setIcon(current.module_icon);
  }

  appModule.create();
}
