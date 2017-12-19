var HTHDAjax = Class.create();

HTHDAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
  ajaxFunction_isDevceHistoryForHTHD: function() {
    var sysId = this.getParameter("sysparm_sys_id");
    var gr = new GlideRecord("discovery_device_history");
    if (!gr.get(sysId))
        return false;

    if (gr.status.sys_class_name == "discovery_status_hthd")
        return true;

    return false;
  },

});