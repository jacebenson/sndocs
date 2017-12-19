var PersonalizeAggregateUpdate = Class.create();

PersonalizeAggregateUpdate.prototype = Object.extendsObject(AbstractAjaxProcessor, {

  ajaxFunction_update: function() {  
    gs.include("PersonalizeAggregate");
    var v = new PersonalizeAggregate(); 
    v.setViewName(this.getParameter('sysparm_list_view'));
    v.setList(this.getParameter('sysparm_list'));
    v.setElement(this.getParameter('sysparm_list_element'));
    v.setParent(this.getParameter('sysparm_list_parent'));
    v.setRelationship(this.getParameter('sysparm_list_relationship'));
    v.setSum(this.getParameter('sysparm_sum_checked'));
    v.setMin(this.getParameter('sysparm_min_checked'));
    v.setMax(this.getParameter('sysparm_max_checked'));
    v.setAvg(this.getParameter('sysparm_avg_checked'));
    v.update();
  },

  ajaxFunction_getAggregates: function() {
   gs.include("PersonalizeAggregate");
    var v = new PersonalizeAggregate(); 
    v.setViewName(this.getParameter('sysparm_list_view'));
    v.setParent(this.getParameter('sysparm_list_parent'));
    v.setRelationship(this.getParameter('sysparm_list_relationship'));
    return v.getList(this.getParameter('sysparm_list'),this.getParameter('sysparm_list_element'));
  }

});