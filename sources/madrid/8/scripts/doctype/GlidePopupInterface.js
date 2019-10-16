/*! RESOURCE: /scripts/doctype/GlidePopupInterface.js */
(function(exports) {
    function popListDiv(
      evt,
      target,
      sys_id,
      view,
      width,
      showOpenButton,
      trapFocus
    ) {
      ScriptLoader.getScripts(
        "scripts/classes/nowapi/ui/GlidePopup.js",
        function() {
          nowapi.g_popup_manager.popListDiv(
            evt,
            target,
            sys_id,
            view,
            width,
            showOpenButton,
            trapFocus
          );
        }
      );
    }

    function popReferenceDiv(evt, inputId, view, form, refKey) {
      ScriptLoader.getScripts(
        "scripts/classes/nowapi/ui/GlidePopup.js",
        function() {
          nowapi.g_popup_manager.popReferenceDiv(
            evt,
            inputId,
            view,
            form,
            refKey,
            true
          );
        }
      );
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
      ScriptLoader.getScripts(
        "scripts/classes/nowapi/ui/GlidePopup.js",
        function() {
          nowapi.g_popup_manager.popRecordDiv(
            evt,
            table,
            sys_id,
            view,
            width
          );
        }
      );
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
            nowapi.g_popup_manag