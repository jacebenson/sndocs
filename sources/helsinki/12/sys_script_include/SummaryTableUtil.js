var SummaryTableUtil = Class.create();

SummaryTableUtil.prototype = {
  SUMMARY_SET : 'sys_report_summary',
  EXPIRES : 'expires',

  initialize : function() {
  },
  
  clean : function() {
      var ss = new GlideRecord(this.SUMMARY_SET);
      ss.addQuery(this.EXPIRES, "<", gs.nowNoTZ());
      ss.deleteMultiple();
  }
}