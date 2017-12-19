// This class provides support for Schedule Page server script code that is called to
// provide the schedule items to be displayed for a Schedule Page
gs.include("PrototypeServer");

var SchedulePage = Class.create();
SchedulePage.prototype = {
   
   initialize: function() {
   },

   /**
    * Set the AJAXSchedulePage we will be using to keep track of the AJAXScheduleItem's as we create them
    */
   setPage: function(page) {
      this.page = page;
   },
	
   getPage: function() {
	   return this.page;
   },
	
   clear: function() {
	   this.page.clear();
   },
    
   /**
   * Get a request parameter
   */
   getParameter: function(name) {
      return this.page.getParameter(name);
   },

   /**
    * Get a color based on an id (so that we can get the same color for the id later on)
    */
   getColor: function(id) {
      return this.page.getColor(id);
   },
   
   /**
    * Darken a color to provide some contrast
    */
   darkenColor: function(color) {
      return this.page.darkenColor(color);   
   },
   
   /**
    * Add the items for a schedule
    */
   addSchedule: function(sysId, color, query, editable) {
      if (!query) 
         query = "";
         
      if (!color)
         color = "";
      
      var readOnly = !editable;
      this.page.setReadOnly(readOnly);

      return this.page.addSchedule(sysId, color, query, editable);
   },
   
   /**
    * Add a schedule span item to the calendar display
    */
   addScheduleSpan: function(gr, scheduleTZ, altName, color) {
      return this.page.addScheduleSpan(gr, scheduleTZ, altName, color);
   },
   
   /**
    * Add a Schedule object that was returned by createSchedule()
    */
   addScheduleObject: function(schedule, name, color) {
      return this.page.addScheduleObject(schedule, name, color, false);
   },
   
   /**
    * Add a Schedule object that was returned by createSchedule()
    * ignoring any items that have the same start and end time
    */
   addScheduleObjectIgnoreEmpty: function(schedule, name, color) {
      return this.page.addScheduleObject(schedule, name, color, true);
   },
   
   /**
    * Create a schedule object
    */
   createSchedule: function(sysId) {
      return GlideSchedule(sysId + '');
   },
   
   /**
    * Add a schedule item from a glide record and a start and end date/time
    * (start and end date/times are passed as a string in yyyy-mm-dd hh:mm:ss format)
    */
   addItem: function(record, start, end, altName, color) {
      if (end == '')
         end = null;
      return this.page.addItem(record, start, end, altName, color);
   },
    
   z: null,

   type: "SchedulePage"
};

