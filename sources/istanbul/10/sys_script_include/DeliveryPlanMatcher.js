gs.include("PrototypeServer");
var DeliveryPlanMatcher = Class.create();

DeliveryPlanMatcher.prototype = {
   initialize : function(/*GlideRecord*/ gr) {
      this.toMatch = gr;
      this.tableName = gr.getRecordClassName() + '';
   },
   
   getPlan : function() {
      var plans = new GlideRecord('sc_cat_item_delivery_plan');
      plans.addQuery('parent_table', this.tableName);
      plans.orderBy('order');
      plans.query();
      while (plans.next()) {
         if (this._matchMe(plans))
            return plans.sys_id + '';
      }
      return null;
   },
   
   _matchMe : function(/*GlideRecord*/ plan) {
      if (plan.condition.nil())
         return true;
         
      return GlideFilter.checkRecord(this.toMatch, plan.condition);
   }
}
