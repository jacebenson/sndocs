gs.include("PrototypeServer");

var InstanceStats = Class.create();
InstanceStats.prototype = {
   
   initialize: function(instanceName, userName, userPassword) {
      this.instanceName = GlideServlet.getSystemID();
      this.snc_mi = this._getMI(this.instanceName);
      
      if (userName)
         this.userName = userName;
      
      if (userPassword)
         this.userPassword = userPassword;
   },
   
   /**
    * Gather stats and save to relevant tables
    */
   run: function() {
     // implement me
   },

   _createRecord: function(tableName) {
      this.gr = new GlideRecord(tableName);
      this.gr.snc_mi =  this.snc_mi;
   },

   _createMIRecord: function(tableName, partition) {
      this.gr = new GlideRecord(tableName);
      this.gr.snc_mi = this._getMI(this.instanceName + partition);
   },
   
   _setValue: function(xPath, dataStoreName, defaultValue) {
      var v = this._getValue(xPath, dataStoreName);

      if (gs.nil(v) && !gs.nil(defaultValue))
          v = defaultValue;

      this._setValueInGR(dataStoreName, v);
   },
   
   _setValueWithMultiplier: function(xPath, dataStoreName, multiplier) {
      var v = this._getValue(xPath, dataStoreName);
      if (isNaN(v)) {
         this._setValueInGR(dataStoreName, v);
         return;
      }
      
      try {
         this._setValueInGR(dataStoreName, v * multiplier);
      } catch (ex) {}
   },
   
   _setValueWithDivisor: function(xPath, dataStoreName, divisor) {
      var v = this._getValue(xPath, dataStoreName);
      if (isNaN(v)) {
         this._setValueInGR(dataStoreName, v);
         return;
      }
      
      try {
         this._setValueInGR(dataStoreName, v / divisor);
      } catch (ex) {}
   },
   
   _setValueInGR: function(dataStoreName, v) {
      this.gr.setValue(dataStoreName, v);
   },
   
   _getValue: function(xPath, dataStoreName) {
      var node = this.xmlUtil.selectSingleNode(this.xmlDoc, '/xmlstats/' + xPath);
      return this.xmlUtil.getAllText(node) + '';
   },
   
   _getMI: function(name) {
      // this code must run exclusively, as we have to atomically check/insert...
      var mutexName = '<<<--Instance Stats Mutex-->>>';
      var mutex = new GlideMutex(mutexName, mutexName);
      // limit our attempt to get a mutex to 10 seconds...
      mutex.setSpinWait(10);
      mutex.setMaxSpins(1000);  
      if (mutex.get()) {
          try{
              return this._getMI_critical_section(name);
          }
          finally {
              mutex.release();
          }
      }
   },
   
   _getMI_critical_section: function(name) {
      // first we look in the table where we hope to find it...
      var gr = this._lookForMI(name, 'snc_monitorable_item');
      if (gr.next())
          return gr.getUniqueValue();
         
      
      // we don't have this record, so create it...
      gr = new GlideRecord('snc_monitorable_item');

	  // first, let's look for the same in the legacy table      
      var legacyCISncComponentGR = new GlideRecord('cmdb_ci_snc_component');
      if (legacyCISncComponentGR.isValid()) {
      	legacyCISncComponentGR = this._lookForMI(name, 'cmdb_ci_snc_component');
      	// if found use its sys_id for the corresponding record in snc_monitorable_item table. 
      	// this way we make sure that the same jrobin database record is used for recording rrd data after upgrade to geneva
      	if (legacyCISncComponentGR.next()) 
      		gr.setNewGuidValue(legacyCISncComponentGR.sys_id); 
      }
      gr.name = name;
      gr.setWorkflow(false);
      return gr.insert();
   },
   
   _lookForMI: function(name, table) {
      gr = new GlideRecord(table);
      gr.addQuery('name', name);
      gr.setWorkflow(false);
      gr.query();
      return gr;
   },
   
   z: null
};