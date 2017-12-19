// policyTableName is the name of the table the UI Policy
// applies to
function getAvailableUIPolicyViews(policyTableName) {
  var viewIDs = [];
  var gr = new GlideRecord('sys_ui_view');
  gr.addQuery('title', '!=', 'Default view');
  gr.query();
  while (gr.next()) {
    var addedViewID = false;
    var gf = new GlideRecord('sys_ui_form');
    gf.addQuery('view', gr.sys_id);
    gf.query();
    while (gf.next()) {
      if (gf.name == policyTableName) {
        viewIDs.push(gr.sys_id.toString());
        addedViewID = true;
        break;
      }
    }
    
    if (!addedViewID) {
      var grs = new GlideRecord('sys_ui_section');
      grs.addQuery('view', gr.sys_id);
      grs.query();
      while (grs.next()) {
        if (grs.name == policyTableName) {
          viewIDs.push(gr.sys_id.toString());
          break;
        }
      }
    }
  }
  
  return viewIDs;
}