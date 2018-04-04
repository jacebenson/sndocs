/*! RESOURCE: /scripts/classes/WFStageSet.js */
var WFStageSet = (function() {
  function getWorkflowVersionFromQuery(qry) {
    if (!qry)
      return null;
    var exps = qry.split("^");
    for (var i = 0; i < exps.length; i++) {
      var exp = exps[i];
      var parts = exp.split('=');
      if (parts.length == 2 && parts[0].trim() == 'workflow_version' && parts[1].trim() != '')
        return parts[1].trim();
    }
    return null;
  }

  function exportStageSet(setName, workflowVersionId, filter) {
    var ga = new GlideAjax('WFStageSet');
    ga.addParam('sysparm_name', 'exportStageSet');
    ga.addParam('sysparm_set_name', setName);
    ga.addParam('sysparm_workflow', workflowVersionId);
    if (filter != null)
      ga.addParam('sysparm_filter', filter);
    ga.getXMLWait();
    return ga.getAnswer();
  }

  function importStages(source, workflowVersionId, setId) {
    var ga = new GlideAjax('WFStageSet');
    ga.addParam('sysparm_name', 'import' + source);
    ga.addParam('sysparm_set_id', setId);
    ga.addParam('sysparm_workflow', workflowVersionId);
    ga.getXMLWait();
    return ga.getAnswer();
  }

  function incrementCounter(table, column, sys_id, increment) {
    var ga = new GlideAjax('WFStageSet');
    ga.addParam('sysparm_name', 'incrementCounter');
    ga.addParam('sysparm_sys_id', sys_id);
    ga.addParam('sysparm_table', table);
    ga.addParam('sysparm_column', column);
    ga.addParam('sysparm_increment', increment);
    ga.getXMLWait();
    return ga.getAnswer();
  }

  function warnNoWorkflow(msg) {
    var dialog = new GlideDialogWindow('glide_warn');
    var msgs = new GwtMessage();
    dialog.setPreference('title', msgs.getMessage('Operation not supported.') +
      '<br/>' +
      msgs.getMessage(msg));
    dialog.render();
    return 'ok';
  }
  return {
    getWorkflowVersionFromQuery: getWorkflowVersionFromQuery,
    exportStageSet: exportStageSet,
    importStages: importStages,
    incrementCounter: incrementCounter,
    warnNoWorkflow: warnNoWorkflow
  }
}());;