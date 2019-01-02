var TableRotationScheduleEntry = Class.create();

TableRotationScheduleEntry.prototype = {

   initialize : function(rotation, tableName) {
      this.rotation = rotation;
      this.name = tableName;
      this._init();
   },

   _init: function() {
      var schedEntry = new GlideRecord('sys_table_rotation_schedule');
      schedEntry.addQuery('name', this.rotation.getID());
      schedEntry.addQuery('table_name', this.name);
      schedEntry.query();
      this.record = schedEntry;
      if (!schedEntry.next()) {
         schedEntry.name = this.rotation.getID();
         schedEntry.table_name = this.name;
      }
   },
  
   getTable: function() {
      return this.record.table_name + '';
   },

   getRotationID: function() {
      return this.record.name + '';
   },

   getStartTime: function() {
      return this.record.valid_from + '';
   },

   getNumericStartTime: function() {
      return this.record.valid_from.dateNumericValue();
   },

   getNumericEndTime: function() {
      return this.record.valid_to.dateNumericValue();
   },

   setEndNumericValue: function(endTime) {
      this.record.valid_to.setDateNumericValue(endTime);
   },

   setStartNumericValue: function(startTime) {
      this.record.valid_from.setDateNumericValue(startTime);
   },

   update: function() {
      this.record.update();
   },

   getEndTime: function() {
      return this.record.valid_to + '';
   },

   getType : function() {
      return "TableRotationScheduleEntry";
   }

};