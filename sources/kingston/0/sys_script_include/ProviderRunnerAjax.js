var ProviderRunnerAjax = Class.create();

ProviderRunnerAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

  execute: function() {
    var providerSysId = this.getParameter("sysparm_provider_sys_id");
    var input = this.getParameter("sysparm_input");
    var activityName = this.getParameter("sysparm_activity_name");
    var activityDefSysId = this.getParameter("sysparm_activity_def_sys_id");
    var target = new GlideRecord('wf_element_provider');
    target.addQuery("sys_id", providerSysId);
    target.query();

    if (target.next()) {
      var providerClassName = target.getValue('provider');
      return SNC.ProviderRunner.execute(providerClassName, input, activityName, activityDefSysId);
    }
  },
  probeComplete: function() {
    var providerSysId = this.getParameter("sysparm_provider_sys_id");
    var newEccId = this.getParameter("sysparm_newEccId");
    var target = new GlideRecord('wf_element_provider');
    target.addQuery("sys_id", providerSysId);
    target.query();
    if (target.next()) {
      var providerClassName = target.getValue('provider');
      return SNC.ProviderRunner.probeComplete(providerClassName, newEccId);
    }
  },
  type: "ProviderRunnerAjax"
});