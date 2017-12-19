// Show the workflow context in a new window
function showWorkflowContext() {
   var id = g_form.getUniqueValue().toString();
   var url = new GlideURL('context_workflow.do');
   url.addParam('sysparm_stack', 'no');
   url.addParam('sysparm_table', g_form.getTableName());
   url.addParam('sysparm_document', id);
   g_navigation.open(url.getURL(), "_blank")
}