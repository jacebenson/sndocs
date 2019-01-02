var jTemplate = Class.create();

jTemplate.prototype =Object.extendsObject(AbstractAjaxProcessor, {
  ajaxFunction_getFullLabel: function () {
    return new CompositeElement(this.getParameter('sysparm_full_name')).getFullLabel();
  },

  ajaxFunction_getHomepages: function() { 
    return getUserHomepages();
  },

  ajaxFunction_getUserDashboards: function() {
    return getUserDashboards();
  }

});