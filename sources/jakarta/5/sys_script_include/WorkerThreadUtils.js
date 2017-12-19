var WorkerThreadUtils = Class.create();

WorkerThreadUtils.prototype = {
  initialize: function() {
  },

  start: function() {
      GlideWorkerThreadManager.get().init();
  },

  restart: function() {
      this.stop();
      gs.sleep(1000);
      this.start();
  },

  status: function() {
      GlideWorkerThreadManager.get().status();
  },

  stop: function() {
      GlideWorkerThreadManager.get().shutdown();
  },

  getDefaultWorker: function() {
      return gs.getProperty('glide.worker.startup');
  },

  setDefaultWorker: function(name) {
      gs.setProperty("glide.worker.startup", name);
  },

  type: "WorkerThreadUtils"
}