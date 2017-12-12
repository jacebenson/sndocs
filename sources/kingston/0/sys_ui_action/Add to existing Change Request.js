function showSelectChangeDialog() {
    var title = g_list.getTitle();
    var listID = g_list.listID;
    var cis = g_list.getChecked().toString();
    
    if (cis) {
        var o = new GlideModal('select_change_dialog_ui');
        o.setTitle(getMessage('Choose a Change Request'));
        o.setPreference('selected_cis', cis);
        o.setPreference('table_label', g_list.getTitle());
        o.render();

        CustomEvent.observe("chg.addToExisting.associate", function(answer) {
            if (answer) {
                answer = answer.evalJSON();

                if (answer.processedCount != 0) {
                    var url = new GlideURL('change_request.do');
                    url.addParam('sys_id', answer.changeId);
                    GlideUI.get().addOutputMessage({
                        msg: new GwtMessage().getMessage('{0} were related to Change Request <a href="{1}">{2}</a>', title, url.getURL(), answer.displayValue),
                        type: "info"
                    });

                    var checkedIds = cis.split(',');
                    for (var i = 0; i < checkedIds.length; i++)
                        $('check_' + listID + '_' + checkedIds[i]).checked = false;
                    $("allcheck_" + listID).checked = false;
                }
            }
            o.destroy();
        });

        CustomEvent.observe("chg.addToExisting.cancel", function() {
            o.destroy();
        });

        o.on('beforeclose', function() {
            CustomEvent.unAll("chg.addToExisting.cancel");
            CustomEvent.unAll("chg.addToExisting.associate");
        });
    }
}