var TransferAuditToRotations = Class.create();

TransferAuditToRotations.prototype = {
  initialize : function() {
  },
  
  process: function(startMsg) {
     this.messages = new Array();
     this.addMessage("Checking how much data is involved....");
     if (!SncTableRotationExtensions.isRotated("sys_audit")) {
        worker.addMessage("The sys_audit table must be defined as a rotated table first");
        return;
     }

     this.total = 0;
     this.recordCount = 0;
     this.minDate = '';
     this.rotation = new TableRotation('sys_audit');
     this.base = this.rotation.getBase();
     this.currentRotations = this.rotation.getCurrentRotations();
     this._pruneRotations();
     this._determineRotations();
     if (this.recordCount == 0 || this.minDate == '')
        return;

     this._createRotations();
     this._createScheduleEntries(); 
     this._transferData(); 
     this.addMessage("***** Going to delete creation entries from current rotations");
     this._removeModZeroEntries();
     this.addMessage("Background processes started to transfer data into the new rotations");
  },

  _pruneRotations: function() {
     var answer = new Array();
     for (var i = 0; i < this.currentRotations.length; i++) {
        var entry = this.currentRotations[i];
        if (entry.getTable().startsWith("sys_audit_"))
           continue;

        answer.push(entry);
     }

     this.currentRotations = answer;
  },
  
  _determineRotations: function() {
     this._setAuditMetrics();
     if (this.recordCount == 0 || this.minDate == '') {
        this.addMessage("No data to transfer");
        return;
     }

     this._setRotationCount();
     this.addMessage("There are " + this.recordCount + " possible records to be transferred to " + this.rotationCount + " rotations with a starting date of " + this.minDate);
  },

  _setAuditMetrics: function() {
  	  var rm = new SncTransferAuditToRotationsSqlFactory().getNumRecordsInSysAudit();
      this.recordCount = rm.get("count");
      this.minDate = rm.get("min_created_date");
  },

  _setRotationCount: function() {
     for (var i = 0; i < this.currentRotations.length; i++) {
        var entry = this.currentRotations[i];
        if (i == 1)
           this.firstRotationStart = entry.getNumericStartTime();

        gs.log("Rotation " + entry.getTable() + " from: " + entry.getStartTime() + " to: " + entry.getEndTime());
     }

     this.newRotations = new Array();
     var startTime = new GlideDateTime();
     startTime.setValue(this.minDate);
     var startMilliSeconds = startTime.getNumericValue();
     this.base.setEndNumericValue(startMilliSeconds);
     this.startMilliSeconds = startMilliSeconds;
     this.rotationCount = 0;
     var duration = this.rotation.getDuration();
     while (startMilliSeconds < this.firstRotationStart) {
        this.rotationCount += 1;
        var endMilliSeconds = startMilliSeconds + duration;
        if (endMilliSeconds > this.firstRotationStart)
           endMilliSeconds = this.firstRotationStart
        
        var entry = new TableRotationScheduleEntry(this.rotation, "sys_audit" + "_" + this.rotationCount);
        entry.setStartNumericValue(startMilliSeconds);
        entry.setEndNumericValue(endMilliSeconds);
        this.addMessage("Rotation " + this.rotationCount + " will go from " + entry.getStartTime() + " to " + entry.getEndTime());
        startMilliSeconds = endMilliSeconds;
        this.newRotations.push(entry);
     }
  },
  
  _createRotations: function() {  
     for (var i = 0; i < this.newRotations.length; i++) {
        var entry = this.newRotations[i]; 
        this._createRotation(entry.getTable());
     }
  },

  _createRotation : function(tName) {
      var xx = new GlideRecord(tName);
      xx.initialize();
      if (xx.isValid()) {
         //var dbi = GlideDBConfiguration.getDBI(tName);
         //dbi.truncateTable(tName);
         //dbi.close();
         return;
      }

      this.addMessage("Creating rotation table " + tName);
      var gr = new GlideRecord('sys_audit');
      gr.initialize();
      var td = GlideTableDescriptor.get('sys_audit');
      this.displayName = td.getDisplayName();
      var tLabel = gr.getLabel();
      this.creator = new TableDescriptor(tName, tLabel);
      this.creator.setFields(gr);
      this.creator.copyAttributes(td);
      this.creator.create();
      this.creator.copyIndexes('sys_audit', tName); 
  },

  _transferData: function() {
     this._transfer("0,1");
     this._transfer("2,3");
     this._transfer("4,5");
     this._transfer("6,7");
     this._transfer("8,9");
     this._transfer("a,b");
     this._transfer("c,d");
     this._transfer("e,f");
     this._transfer("");
  },

  _transfer: function(idsEnd) {
      var worker = new GlideScriptedProgressWorker();
      worker.setProgressName("Move audit data into rotations ");
      worker.setName('TransferAuditToRotations2');
      worker.addParameter(idsEnd);
      worker.setBackground(true);
      worker.start();
  },

  _getDate: function(timeValue) {
     var dt = new GlideDateTime();
     dt.setNumericValue(timeValue);
     return dt.getValue();
  },

  _createScheduleEntries: function() {  
     this.base.update();
     for (var i = 0; i < this.newRotations.length; i++) {
        var entry = this.newRotations[i]; 
        entry.update();
     }
  },

  _removeModZeroEntries: function() {
     for (var i = 0; i < this.currentRotations.length; i++) {
        var entry = this.currentRotations[i];
        var table = entry.getTable();
        if (table == 'sys_audit')
           continue;

        var start = entry.getNumericStartTime();
        var end = entry.getNumericEndTime();
        var removed = 0;
        while (start < end) {
           var iend = start + 24*60*60*1000;
           if (iend > end)
             iend = end;

           var remove = new GlideRecord(table);
           remove.addQuery('sys_created_on', '>=', this._getDate(start));
           remove.addQuery('sys_created_on', '<', this._getDate(end));
           remove.addQuery('record_checkpoint', '=', '0');
           remove.deleteMultiple();
           removed += remove.getRowCount();
           start = iend;
        }
        this.addMessage("Removed " + removed + " creation records from " + table);
     }
  },

  addMessage: function(msg) {
     gs.log(msg);
     this.messages.push(msg);
     if (this.messages.length >= 10)
        this.messages.shift();

     worker.addMessage(this.messages.join("\n"));
  },
}