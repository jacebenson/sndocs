var TransferOrderDateTimeAjax = Class.create();

TransferOrderDateTimeAjax.prototype = Object.extendsObject(AbstractAjaxProcessor , {

   /*
    * Compares two dates coming both from the client's timezone
    */
   compareDatesAjax: function() {
      var startDate = new GlideDateTime();
      startDate.setDisplayValue(this.getParameter('sysparm_startDate'));
      var endDate = new GlideDateTime();
      endDate.setDisplayValue(this.getParameter('sysparm_endDate'));
      return this.compareDates(endDate, startDate);
   },

   /*
    * Compares two dates from the same timezone
    */
   compareDates: function(/*GlideDateTime*/ date1, /*GlideDateTime*/ date2) {
      var diff = gs.dateDiff(date1, date2, true);
      return (diff <= 0);
   },

   /*
    * Compares a date in the server's timezone to now in the server timezone too
    */
   isDateBeforeNow: function(/*GlideDateTime*/ date) {
      var now = new GlideDateTime();
      now.setDisplayValue((new Date()).toString());
      return this.compareDates(now, date);
   },

   type: 'TransferOrderDateTimeAjax'
});
