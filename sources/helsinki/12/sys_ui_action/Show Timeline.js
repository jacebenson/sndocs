function showWFTimeline() {
    var selected = g_list.getChecked();

    var url = new GlideURL('show_schedule_page.do');
    url.addParam('sysparm_page_schedule_type', 'workflow_context');
    
    // Add only the client options to prevent another AJAX call
    url.addParam('sysparm_timeline_history', 'wf_history' + selected);

    var w = getTopWindow();
    var newWindow = w.open(url.getURL(), "_blank");
    newWindow.focus();
}