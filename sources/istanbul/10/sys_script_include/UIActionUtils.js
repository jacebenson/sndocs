gs.include("PrototypeServer");

var UIActionUtils = Class.create();

UIActionUtils.prototype = {
  initialize : function() {
  },

  approvalsNoLongerRequired : function(sysId) {
    var approve = new GlideRecord('sysapproval_approver');
    approve.addQuery('sysapproval', sysId);
    approve.addQuery('state', 'requested').addOrCondition('state', 'not requested');
    approve.query();
    while(approve.next()) {
      approve.state = 'not_required';
      approve.update();
    }
  }
}