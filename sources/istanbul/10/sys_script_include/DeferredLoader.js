var DeferredLoader = Class.create();

DeferredLoader.prototype = {
   load: function(pluginName, dir) {
      GlidePluginManager.loadPluginData(pluginName, dir); 
   }
}