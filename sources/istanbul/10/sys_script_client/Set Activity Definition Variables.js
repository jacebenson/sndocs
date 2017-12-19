function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   g_form.clearOptions('variable');
    var activity = g_form.getValue('activity_definition');    
    if (activity != '') {
        var send = 'xmlhttp.do?sysparm_processor=SysMeta&sysparm_type=column&sysparm_vars_id=' + activity;
        send += '&sysparm_value=wf_ui_policy';
        serverRequest(send, adResponse);
    }
}

function adResponse(request, args) {
    var current_val = g_form.getValue('variable');
    if (current_val == '' || current_val == 'undefined') {
        var widgetName = 'sys_original.wf_ui_policy_action.variable';
        var widget = gel(widgetName);
        if (widget)
             current_val = widget.value;
    }
    var items = request.responseXML.getElementsByTagName("item");
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var value = item.getAttribute("value");
        var label = item.getAttribute("label");
        jslog('value = ' + value + ' label = ' + label);
        g_form.addOption('variable', value, label);
    }
    g_form.setValue('variable', current_val);
}