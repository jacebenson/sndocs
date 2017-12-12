var TestIMAPConnectionWorker = Class.create();

TestIMAPConnectionWorker.prototype = {
  initialize : function() {
    this.outputSummary = "";
    gs.log('TestIMAPConnectionWorker initializing....');
  },
  
  process: function(account_id) {
     var msg = "";
     var agr = new GlideRecord("sys_email_account");
     gs.log('TestIMAPConnectionWorker.process() = ' + account_id);
     agr.get(account_id);

     worker.setProgressState("running");
     worker.addMessage("Testing " + agr.name);
     var auth = agr.getValue('authentication');

     var p = new GlideEmailReader.getEmailReader(agr);
     if ( p == null ){
       gs.log("Error retrieving EmailReader, EmailReader is null.");
       return;
     }

     this._addMessage("Connecting to message store");
     var store = p.getStore();
     if (store == null) {
       this._setError("Connection failed");
       return;
     }

     var isConnected = store.isConnected();
     if (!isConnected) {
       this._setError("Connection failed");
       return;
     }
     this._addMessage("- Connected to message store");

     this._addMessage("Getting folder INBOX");
     var folder = store.getFolder("INBOX");
     if (folder == null) {
       this._setError("Cannot get INBOX folder");
       return;
     }
     this._addMessage("- Got folder INBOX");

     folder.open(2); // Folder.READ_WRITE
     if (!folder.isOpen()) {
       this._setError("Cannot open INBOX folder");
       return;
     }

     var kount = folder.getMessageCount();
     this._addMessage(kount + " message(s) is waiting in the INBOX");

     store.close();
     worker.addMessage("Testing complete");
     worker.setProgressState("complete");

     worker.setOutputSummary(this.outputSummary);
  },

  _addMessage : function (msg) {
    worker.addMessage(msg);
    this.outputSummary += msg + "\n";
  },

  _setError : function (msg) {
     msg += ": ";
     worker.setProgressState("error");
     worker.setProgressStateCode("error");
     var sgr = new GlideRecord("sys_status");
     sgr.addQuery("name", "glide.imap.status");
     sgr.query();
     if (sgr.next())
       msg += sgr.value;
  
     worker.addMessage(msg);
  }
}