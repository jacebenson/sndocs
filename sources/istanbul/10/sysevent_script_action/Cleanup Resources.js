// react to logout and cleanup any sys_poll data that may be left over
cleanupResources(event.instance);
cleanupReportViews(event.parm1);

function cleanupResources(id) {
    var gr = new GlideRecord('sys_poll');
    gr.addQuery('session_id', id);
    gr.query();
    if (gr.hasNext())
        gs.print("Cleaning resources for: " + id);

    while (gr.next()) 
        gr.deleteRecord();
}

function cleanupReportViews(userID) {
   var rpt = new GlideReportViewManagement();
   rpt.cleanTempViews(userID);
}
