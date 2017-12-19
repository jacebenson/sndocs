var TransferOrderFilters = Class.create();
TransferOrderFilters.prototype = {
   initialize: function() {
   },
   
   getFromStockrooms: function(transferOrder) {
      if (transferOrder.drop_off == true)
         return 'sys_id!=' + transferOrder.to_stockroom + '^type.value=field_agent^manager=' + gs.getUserID();
      else
         return 'sys_id!=' + transferOrder.to_stockroom + '^type.value!=field_agent^ORmanager=' + gs.getUserID();
   },
   
   getToStockrooms: function(transferOrder) {
      if (SNC.AssetMgmtUtil.isPluginRegistered('com.snc.work_management'))
         return 'sys_id!=' + transferOrder.from_stockroom + '^type.value!=field_agent' + '^ORmanager=' + transferOrder.service_order_task.assigned_to;
      else if (SNC.AssetMgmtUtil.isPluginRegistered('com.snc.field_service_management'))
         return 'sys_id!=' + transferOrder.from_stockroom + '^type.value!=field_agent' + '^ORmanager=' + transferOrder.service_order.assigned_to;
   },
   
   type: 'TransferOrderFilters'
}