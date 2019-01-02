var WorkerThread = Class.create();

WorkerThread.prototype = {
  initialize : function(name) {
      this.name = name;
  },

  start: function(runFunction) {
      var WorkerThread = GlideWorkerThread;

      var r = new Packages.java.lang.Runnable() {
          run: runFunction
      };

      var WorkerThreadManager = GlideWorkerThreadManager;
      var manager = WorkerThreadManager.get();

      var worker = new GlideWorkerThread(r, this.name);
      worker.start()
      manager.addWorker(worker);
  },

  type: "WorkerThread"
}