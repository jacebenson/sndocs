/*! RESOURCE: /scripts/doctype/GlidePopupInterface.js */
(function(exports) {
  function isApiLoaded(m) {
    return exports.nowapi && exports.nowapi.g_popup_manager && exports.nowapi.g_popup_manager[m];
  }

  function popListDiv(evt, target, sys_id, view, width, showOpenButton, trapFocus) {
    var onReady = function() {
      nowapi.g_popup_manager.popListDiv(
        evt,
        target,
        sys_id,
        view,
        width,
        showOpenButton,
        trapFocus
      );
    };
    if (isApiLoaded("popListDiv"))
      onReady();
    else
      ScriptLoader.getScripts("scripts/classes/nowapi/ui/GlidePopup.js", onReady);
  }

  function popReferenceDiv(evt, inputId, view, form, refKey) {
    var onReady = function() {
      nowapi.g_popup_manager.popReferenceDiv(
        evt,
        inputId,
        view,
        form,
        refKey,
        true
      );
    };
    if (isApiLoaded("popReferenceDiv"))
      onReady();
    else
      ScriptLoader.getScripts("scripts/classes/nowapi/ui/GlidePopup.js", onReady);
  }

  function popForm(evt, target, sys_id, view, width) {
    ScriptLoader.getScripts(
      "scripts/classes/nowapi/ui/GlidePopup.js",
      function() {
        nowapi.g_popup_manager.popForm(
          evt,
          target,
          sys_id,
          view,
          width
        );
      }
    );
  }

  function popDiv(evt, sys_id) {
    ScriptLoader.getScripts(
      "scripts/classes/nowapi/ui/GlidePopup.js",
      function() {
        nowapi.g_popup_manager.popDiv(evt, sys_id);
      }
    );
  }

  function popCatDiv(evt, sys_id) {
    ScriptLoader.getScripts(
      "scripts/classes/nowapi/ui/GlidePopup.js",
      function() {
        nowapi.g_popup_manager.popCatDiv(evt, sys_id);
      }
    );
  }

  function popKnowledgeDiv(evt, sys_id) {
    ScriptLoader.getScripts(
      "scripts/classes/nowapi/ui/GlidePopup.js",
      function() {
        nowapi.g_popup_manager.popKnowledgeDiv(evt, sys_id);
      }
    );
  }

  function popRecordDiv(evt, table, sys_id, view, width) {
    var onReady = function() {
      nowapi.g_popup_manager.popRecordDiv(
        evt,
        table,
        sys_id,
        view,
        width
      );
    };
    if (isApiLoaded("popRecordDiv"))
      onReady();
    else
      ScriptLoader.getScripts("scripts/classes/nowapi/ui/GlidePopup.js", onReady);
  }

  function popLightWeightReferenceDiv(evt, inputid, hideOpenButton) {
    ScriptLoader.getScripts(
      "scripts/classes/nowapi/ui/GlidePopup.js",
      function() {
        nowapi.g_popup_manager.popLightWeightReferenceDiv(evt, inputid, hideOpenButton);
      }
    );
  }

  function popIssueDiv(evt, issues) {
    ScriptLoader.getScripts(
      "scripts/classes/nowapi/ui/GlidePopup.js",
      function() {
        nowapi.g_popup_manager.popIssueDiv(evt, issues);
      }
    );
  }

  function popReportInfoDiv(evt, sys_id) {
    ScriptLoader.getScripts(
      "scripts/classes/nowapi/ui/GlidePopup.js",
      function() {
        nowapi.g_popup_manager.popReportInfoDiv(evt, sys_id);
      }
    );
  }

  function popHistoryDiv(evt, table, sys_id, checkpoint, internalCP) {
    ScriptLoader.getScripts(
      "scripts/classes/nowapi/ui/GlidePopup.js",
      function() {
        nowapi.g_popup_manager.popHistoryDiv(
          evt,
          table,
          sys_id,
          checkpoint,
          internalCP
        );
      }
    );
  }

  function lockPopup(e) {
    nowapi.g_popup_manager.destroypopDiv(e);
  }

  function lockPopupID(e, sys_id) {}
  exports.popListDiv = popListDiv;
  exports.popReferenceDiv = popReferenceDiv;
  exports.popForm = popForm;
  exports.popHistoryDiv = popHistoryDiv;
  exports.lockPopup = lockPopup;
  exports.lockPopupID = lockPopupID;
  exports.popDiv = popDiv;
  exports.popCatDiv = popCatDiv;
  exports.popKnowledgeDiv = popKnowledgeDiv;
  exports.popReportInfoDiv = popReportInfoDiv;
  exports.popRecordDiv = popRecordDiv;
  exports.popIssueDiv = popIssueDiv;
  exports.popLightWeightReferenceDiv = popLightWeightReferenceDiv;
})(window);;