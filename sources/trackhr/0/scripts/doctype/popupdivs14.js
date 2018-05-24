/*! RESOURCE: /scripts/doctype/popupdivs14.js */
function popListDiv(e, tableName, sys_id, viewName, width, showOpenButton) {
  ScriptLoader.getScripts('scripts/doctype/GlidePopup.js', function() {
    g_popup_manager.popListDiv(e, tableName, sys_id, viewName, width, !!showOpenButton);
  })
}

function popReferenceDiv(e, inputid, viewName, formTable, refKey) {
  ScriptLoader.getScripts('scripts/doctype/GlidePopup.js', function() {
    g_popup_manager.popReferenceDiv(e, inputid, viewName, formTable, refKey);
  })
}

function popForm(e, tableName, sys_id, viewName, width) {
  ScriptLoader.getScripts('scripts/doctype/GlidePopup.js', function() {
    g_popup_manager.popForm(e, tableName, sys_id, viewName, width);
  })
}

function popHistoryDiv(e, tableName, sys_id, checkpoint, internalCP) {
  ScriptLoader.getScripts('scripts/doctype/GlidePopup.js', function() {
    g_popup_manager.popHistoryDiv(e, tableName, sys_id, checkpoint, internalCP);
  })
}

function lockPopup(e) {
  if (window.g_popup_manager)
    g_popup_manager.exitPopup(e);
  else
    window.NOW.popupLock = true;
}

function lockPopupID(e, sys_id) {
  if (!window.g_popup_manager)
    return;
  g_popup_manager.sys_id = sys_id;
  lockPopup(e);
}

function popDiv(e, sys_id) {
  ScriptLoader.getScripts('scripts/doctype/GlidePopup.js', function() {
    g_popup_manager.popDiv(e, sys_id);
  })
}

function popCatDiv(e, sys_id) {
  ScriptLoader.getScripts('scripts/doctype/GlidePopup.js', function() {
    g_popup_manager.popCatDiv(e, sys_id);
  })
}

function popKnowledgeDiv(e, sys_id) {
  ScriptLoader.getScripts('scripts/doctype/GlidePopup.js', function() {
    g_popup_manager.popKnowledgeDiv(e, sys_id);
  })
}

function popReportInfoDiv(e, reportId) {
  ScriptLoader.getScripts('scripts/doctype/GlidePopup.js', function() {
    g_popup_manager.popReportInfoDiv(e, reportId);
  })
}

function popRecordDiv(e, tableName, sys_id, viewName, width) {
  ScriptLoader.getScripts('scripts/doctype/GlidePopup.js', function() {
    g_popup_manager.popRecordDiv(e, tableName, sys_id, viewName, width);
  })
}

function popIssueDiv(e, issues) {
  ScriptLoader.getScripts('scripts/doctype/GlidePopup.js', function() {
    g_popup_manager.popIssueDiv(e, issues);
  })
}

function popLightWeightReferenceDiv(e, inputid) {
  ScriptLoader.getScripts('scripts/doctype/GlidePopup.js', function() {
    g_popup_manager.popLightWeightReferenceDiv(e, inputid);
  })
};