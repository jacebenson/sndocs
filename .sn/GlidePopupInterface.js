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
                    refKey
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

    function popLightWeightReferenceDiv(evt, inputid) {
        ScriptLoader.getScripts(
            "scripts/classes/nowapi/ui/GlidePopup.js",
            function() {
                nowapi.g_popup_manager.popLightWeightReferenceDiv(evt, inputid);
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