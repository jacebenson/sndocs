var TableRotation = Class.create();

TableRotation.prototype = {

   initialize : function(tableName) {
      this.objectManager = new GlideDBObjectManager.get();
      this.valid = false;
      this.record = null;
      this.delayed = new Array();
      this.createScheduleEntry = false;
      this._init(tableName);
   },

   _init: function(tableName) {
      this.name = tableName;
      var r = new GlideRecord('sys_table_rotation');
      r.addQuery('name', tableName);
      r.query();
      if (r.next()) {
         this.valid = true;
         this.record = r;
      }
   },

   synchronize : function() {
      if (this.record.initialized == false) {
         gs.log("Synchonize of " + this.name + " ignored as it is not initialized");
         return;
      }

      var list = this._getDirectClassExtensions();
      this._synchronizeClassExtension(this.getName());
      for (var i = 0; i < list.length; i++) 
            this._synchronizeClassExtension(list[i]);

      for (var i = 0; i < this.delayed.length; i++)
            this._createScheduleEntryNow(this.delayed[i]);
      
   },

   getDefinition : function() {
      return SncTableRotationExtensions.get().getExtension(this.name);
   },

   getBase : function() {
      return new TableRotationScheduleEntry(this, this.name);
   },

   getDuration : function() {
      return this.record.duration.dateNumericValue()
   },

   getCurrentRotations : function() {
      var answer = new Array();        
      var schedEntry = new GlideRecord('sys_table_rotation_schedule');
      schedEntry.addQuery('name', this.getID());
      schedEntry.orderBy('valid_from');
      schedEntry.query();
      while (schedEntry.next()) {
         var entry = new TableRotationScheduleEntry(this, schedEntry.table_name);
         answer.push(entry);
      }

      return answer;
   },

   _getDirectClassExtensions : function() {
      var answer = new Array();
      var list = this.objectManager.getAllChildrenOf(this.getName());
      for (var i = 0; i < list.size(); i++) {
          var to = list.get(i);
          if (to.getParent() == null)
             continue;

          if (to.getParent().getName() == this.getName())
             answer.push(to.getName());
      }

      return answer;
   },

   _synchronizeClassExtension : function(classExtensionName) {
      var wanted = this.getExtensionsWanted();
      var exist = this._getExtensionsDefined(classExtensionName);
      if (exist >= wanted) {
         this._syncDefinitions(classExtensionName, exist);
         return;
      }

      if (this.isExtension() && exist > 0) {
         this._syncDefinitions(classExtensionName, exist);
         return;
      }

      if (this.isExtension())
         wanted = 2;

      this._syncDefinitions(classExtensionName, exist);
      var needed = wanted - exist;

      gs.log("Going to create " + needed + " extensions for " + classExtensionName);
      this.createScheduleEntry = true;
      for (; exist < wanted; exist++)
         this._createRotation(classExtensionName, this.getName(), exist);
   },

   _syncDefinitions : function(classExtensionName, exist) {
      this.createScheduleEntry = false;
      for (var i = 0; i < exist; i++) {
         this._createRotation(classExtensionName, this.getName(), i);
      }
   },

   _createRotation : function(tableName, parentName, exist) {
      var suffix = this._generateSuffix(exist);
      var tName = this._getRotationName(tableName, suffix);

      var gr = new GlideRecord(tableName);
      gr.initialize();
      var td = GlideTableDescriptor.get(tableName);
      this.displayName = td.getDisplayName();
      var tLabel = gr.getLabel();
      this.creator = new TableDescriptor(tName, tLabel);
      var parent = parentName;
      var schName = tName;
      if (parent != null  && parent != tableName) {
         schName = this._getRotationName(parent, suffix);
         this.creator.setExtends(schName);
      }

      this.creator.setFields(gr);
      this.creator.copyAttributes(td);
      this.creator.setRoles(td);
      this.creator.create();
      this.creator.copyIndexes(tableName, tName);
      this._addScheduleEntry(schName);
   },

   _addScheduleEntry : function(name) {
         if (!this.createScheduleEntry)
            return;

         var schedEntry = new GlideRecord('sys_table_rotation_schedule');
         schedEntry.addQuery('name', this.getID());
         schedEntry.addQuery('table_name', name);
         schedEntry.query();
         if (schedEntry.hasNext())
            return;

         this.delayed.push(name+'');
   },

   _createScheduleEntryNow : function(name) {
         var schedEntry = new GlideRecord('sys_table_rotation_schedule');
         schedEntry.addQuery('name', this.getID());
         schedEntry.addQuery('table_name', name);
         schedEntry.query();
         if (schedEntry.hasNext())
            return;

         schedEntry.name = this.getID();
         schedEntry.table_name = name;
         schedEntry.valid_from = this._getNextStartTime();
         schedEntry.valid_to.setDateNumericValue(schedEntry.valid_from.dateNumericValue() + this.record.duration.dateNumericValue());
         gs.log("Schedule created for " + name + " from " + schedEntry.valid_from + " to " + schedEntry.valid_to);
         schedEntry.insert();
   },

   _getRotationName : function(name, suffix) {
      return name + suffix;
   },

   _generateSuffix : function(rotation) {
      rotation = rotation + '';
      while (rotation.length < 4)
         rotation = '0' + rotation;

      return rotation;
   },

   getExtensionsWanted : function() {
      if (!this.isValid())
         return 0;

      return this.record.rotations * 1;
   },

   _getExtensionsDefined: function(name) {
      name = name + '';
      var xx = new GlideRecord('sys_dictionary');
      xx.addQuery('name', 'STARTSWITH', name);
      xx.addQuery('name', 'DOES NOT CONTAIN', name + "_");
      xx.addNullQuery('element');
      xx.orderByDesc('name');
      xx.query();
      xx.next();
      var answer = xx.name.toString();
      answer = answer.substring(name.length);
      if (answer.length == 0)
         return 0;

      return answer * 1 + 1;
   },

   _getNextStartTime : function() {
      var gr = new GlideRecord('sys_table_rotation_schedule');
      gr.addQuery('name', this.getID());
      gr.orderByDesc('valid_to');
      gr.query();
      if (!gr.next()) 
         return gs.nowDateTime();
  
      var now = new GlideDateTime();
      if (now.getNumericValue() > gr.valid_to.dateNumericValue()) {
         now.setNumericValue(now.getNumericValue() + 60000);
         var answer = now.getDisplayValue();
         gr.valid_to = answer;
         gr.update();
         return answer;
      }

      return gr.valid_to.getDisplayValue();
   },

   isExtension : function() {
      if (!this.isValid())
         return false;

      return this.record.type == 'extend';
   },

   getID : function() {
      return this.record.sys_id.toString();
   },

   getName : function() {
      if (!this.isValid())
         return "Invalid " + this.name;

      return this.record.name.toString();
   },

   isValid : function() {
      return this.valid;
   },

   getType : function() {
      return "TableRotation";
   }

};