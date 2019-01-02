function showSLATimeline() {
    var gr = new GlideRecord("task_sla");
    gr.addQuery("sys_id", rowSysId);
    gr.query(function(slaGR) {
        if (slaGR.next()) {
            var url = GlideURLBuilder.newGlideUrl("sla_timeline.do");
            url.addParam('sysparm_timeline_sla', slaGR.sla);
            url.addParam('sysparm_timeline_task', slaGR.task);
            url.addParam("sysparm_nostack", "yes");

            var o = new GlideModal("sla_timeline", false, 'modal-95');
            o.setTitle(g_i18n.getMessage("SLA Timeline"));
            o.setAutoFullHeight(true);
            o.renderIframe(url.getURL());
        }
    });
}