var LiveFeedUtilAjax = Class.create();

LiveFeedUtilAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

   deleteGroup: function() {
      var sysId = "" + this.getParameter('sysparm_sys_id');
      return new LiveFeedUtil().deleteGroup(sysId);
   },
   
   toString: function() { return 'LiveFeedUtilAjax'; }
});