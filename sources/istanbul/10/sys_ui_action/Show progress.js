function popDialog() {
    var sysId = g_form.getValue("sys_execution_tracker");

    var dd = new GlideModal("simple_progress_viewer", false, "40em", "10.5em");
    dd.setTitle(getMessage("Repair SLAs"));
    dd.setPreference('sysparm_progress_name', getMessage("Repairing SLAs"));
    dd.setPreference("sysparm_renderer_expanded_levels", "0"); // collapsed root node by default
    dd.setPreference("sysparm_renderer_hide_drill_down", true);
    dd.setPreference('sysparm_renderer_execution_id', sysId);
    dd.setPreference("sysparm_button_close", getMessage("Close"));

    dd.on("executionComplete", function(trackerObj) {
        var closeBtn = $("sysparm_button_close");
        if (closeBtn) {
            closeBtn.onclick = function() {
                dd.destroy();
            };
        }
    });

    dd.on("beforeclose", function() {
        if (!this.callback) {
            window.location.reload();
            return;
        }

        this.callback();
    }.bind(this));

    dd.render();
}