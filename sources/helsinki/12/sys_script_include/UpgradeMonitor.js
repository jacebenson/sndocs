var UpgradeMonitor = Class.create(); 
 
  UpgradeMonitor.prototype = Object.extendsObject(AbstractAjaxProcessor, { 
 
    get_status: function() { 
      return GlideUpgradeMonitor().get().getStatus();
    },
  });