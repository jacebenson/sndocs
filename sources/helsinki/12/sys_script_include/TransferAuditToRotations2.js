var TransferAuditToRotations2 = Class.create();

TransferAuditToRotations2.prototype = {
  initialize : function() {
  },
  process: function(idEnds) {
     this.idEnds = idEnds;
     this.messages = new Array();
     this.total = 0;
     this._transferData(); 
  },

  _transferData: function() {
     var query = '';
     if (this.idEnds != '') {
        var ids = this.idEnds.split(",");
        for (var i = 0; i < ids.length; i++) {
           ids[i] = "sys_idENDSWITH" + ids[i];
        }

        query = "record_checkpoint!=0^";
        query += ids.join("^OR");
     }

     this.addMessage(query);
     var t = new GlideTransferAuditDataHelper(worker, query);
     this.total = t.transfer();
  },

  addMessage: function(msg) {
     gs.log(msg);
     this.messages.push(msg);
     if (this.messages.length >= 10)
        this.messages.shift();

     worker.addMessage(this.messages.join("\n"));
  },
}