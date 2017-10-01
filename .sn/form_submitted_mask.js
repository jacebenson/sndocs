/*! RESOURCE: /scripts/doctype/form_submitted_mask.js */
addLoadEvent(function() {
    var isDoctype = document.documentElement.getAttribute('data-doctype') == 'true';
    if (!isDoctype)
        return;
    CustomEvent.observe('glide:form_submitted', function() {
        $(document.body).addClassName('submitted');
        setTimeout(function() {
            CustomEvent.fireTop('glide:nav_form_stay', window);
        }, 750);
    })
    CustomEvent.observe('glide:nav_form_stay', function(originWindow) {
        var ga = new GlideAjax('AJAXFormLoad');
        ga.addParam('sysparm_name', 'canFormReload');
        if (window.g_form && g_form.isNewRecord()) {
            ga.addParam('sysparm_table', g_form.getTableName());
            ga.addParam('sysparm_sys_id', g_form.getUniqueValue());
        }
        ga.getXMLAnswer(function(answer) {
            if (answer == 'submitted') {
                jslog("Record already submitted, not re-enabling form controls");
                return;
            }
            enableFormControls(originWindow);
        })
    });

    function enableFormControls(originWindow) {
        if (originWindow != self)
            return;
        $(document.body).removeClassName('submitted');
        if (window.g_form)
            g_form.submitted = false;
        if (window.g_submitted)
            g_submitted = false;
    }
});