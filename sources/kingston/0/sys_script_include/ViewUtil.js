var ViewUtil= Class.create();

ViewUtil.prototype = {

  initialize : function() {
  },

  completeView : function() {
    var gt = new GlideRecord('sys_db_view_table');
    gt.addQuery('view',current.sys_id);
    gt.query();
    var allExist = true;
    while(gt.next() && allExist)
        if (!system.tableExists(gt.table))
           allExist = false;
    return allExist;
  },
   
   isValid : function(current) {
	  var dbi = GlideDBConfiguration.getDBI(current.name);
	  var view = new GlideDBView(dbi, current.name);
	  var v = view.isValidView();
	  dbi.close();
	  return v;
   },

};