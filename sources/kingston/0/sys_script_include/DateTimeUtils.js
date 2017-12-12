var DateTimeUtils = Class.create();

DateTimeUtils.prototype = Object.extendsObject(AbstractAjaxProcessor, {
   
   /**
    * Convert Microsoft AD integer8 DateTime format to GlideDateTime
    * Integer8 is also known as Microsoft Filetime format
    * Commonly used when importing AD user's date fields such as expiration date
    */
   int8ToGlideDateTime : function(int8Date) {
      var msDate = new Packages.org.apache.poi.hpsf.Util.filetimeToDate(int8Date);
      var gDate = new GlideDateTime();
      gDate.setValue(msDate);
      return gDate;
   },
   
   /**
    * Convert milliseconds to GlideDateTime...client usage below:
    *
    * var ga = new GlideAjax('DateTimeUtils');
    * ga.addParam('sysparm_name','msToGlideDateTime');
    * ga.addParam('sysparm_value', MILLISECONDSVALUE);
    * ga.getXMLWait();
    * var newGDT = ga.getAnswer();
    *
    * newGDT is your newly converted GlideDateTime
    */
   msToGlideDateTime : function() {
      var ms = this.getValue();
      var gDate = new GlideDateTime();
      gDate.setValue(parseInt(ms, 10));
      return gDate;
   },
   
   formatCalendarDate : function() {
      // applies a correction since the time the calendar may be sending us may be off by an hour
      // it includes the DST correction for NOW, but the date in question may not need a DST correction
      var d = GlideStringUtil.parseLong(this.getValue());
      var gDate = new GlideDateTime();
      var offsetNow = gDate.getTZOffset();
      gDate.setNumericValue(d);
      var offsetDate = gDate.getTZOffset();
      gDate.setNumericValue(d + (offsetNow - offsetDate));
      return gDate.getDisplayValue();
   },
   
   /**
    * Given a GlideDateTime get the first day of that week, used for time cards to set first day of the time card period
    * defaults to Sunday, can override by providing second parameter (1=Monday, 7=Sunday)
    *
    *@returns GlideDate
    */
   getWeekStart : function(/*GlideDateTime*/dt, /*int*/ firstDay) {
      if (!firstDay || isNaN(firstDay))
         firstDay = 7; //Sunday
      
      if (firstDay < 1 || firstDay > 7)
         firstDay = 7; //Sunday
      
      var temp = new GlideDateTime(dt);
      while (temp.getDayOfWeek() != firstDay) {
         temp.addDays(-1);
      }
      
      return temp.getLocalDate();
   }
   
});