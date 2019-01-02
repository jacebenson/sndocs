var TransferOrderReturn = Class.create();

/*
 * TOL = transfer order line we are returning things from (inbound) RTO = return
 * transfer order (created here) RTOL = return transfer order line (created
 * here)
 */
TransferOrderReturn.prototype = {
   initialize : function() {
   },
   
   transferOrderLineHasReturnables : function(tol) {
      // Don't return RTOs.
      if ('' !== tol.return_from_tol.toString())
         return false;
      
      if (tol.stage != 'delivered' && tol.quantity_received > tol.quantity_returned)
         return true;
      
      return false;
   },
   
   /*
    * Create RTOL and associated it with a RTO.
    */
   returnItemsFromTransferOrderLine : function(tol, quantity, reason, isDefective) {
      var rto = this._findOrCreateRTO(tol);
      var rtol = this._addNewRTOLtoRTO(tol, rto, quantity, reason, isDefective);
      return rtol;
   },
   
   /*
    * If a draft RTO exists for TO from which TOL belongs, use it, otherwise
    * create a new one.
    */
   _findOrCreateRTO : function(tol) {
      var rto = new GlideRecord('alm_transfer_order');
      rto.addQuery('return_from_transfer_order', tol.transfer_order);
      rto.query();
      while (rto.next()) {
         if ('draft' == rto.stage)
            return rto;
      }
      
      var to = new GlideRecord('alm_transfer_order');
      to.get(tol.transfer_order);
      rto = new GlideRecord('alm_transfer_order');
      rto.initialize();
	   
	  if (rto.getElement('service_order_task') != null)
	      rto.service_order_task = to.service_order_task;
      rto.return_from_transfer_order = to.sys_id;
      // return to sender
      rto.from_stockroom = to.to_stockroom;
      rto.to_stockroom = to.from_stockroom;
      rto.from_location = to.to_location;
      rto.to_location = to.from_location;
      rto.type = to.type;
      rto.stage = 'draft';
      rto.insert();
      return rto;
   },
   
   /*
    * Create return transfer order line and add it to return transfer order.
    * This code should *not* assign to rtol.asset prior to insert as that would
    * prevent execution of BRs that manage asset state.
    */
   _addNewRTOLtoRTO : function(tol, rto, quantity, reason, isDefective) {
      
      var rtol = new GlideRecord('alm_transfer_order_line');
      rtol.initialize();
      rtol.return_from_tol = tol.sys_id;
      rtol.transfer_order = rto.sys_id;
      rtol.return_reason = reason;
      rtol.model = tol.model;
      
      // For pre allocated assets, if returning less than available, split the asset
      // For real assets, we need to copy the asset, otherwise
      // we need to leave the asset blank so as to trigger the
      // asset management BRs.
      if (tol.asset.substatus == 'pre_allocated' && (quantity < (tol.quantity_received - tol.quantity_returned))) {
         var paa = new PreAllocatedAssets();
         var sys_id = paa.splitRecord(tol.asset, parseInt(quantity));
         rtol.asset = sys_id;
      } else if ('alm_consumable' != tol.asset.sys_class_name) {
         rtol.asset = tol.asset;
      } else {
         rtol.asset = '';
      }
      
      // return quantity is the quantity we received
      rtol.quantity_requested = quantity;
      rtol.stage = 'draft';
      rtol.insert();
      
      // For consumables, asset is only available after insert, so
      // handle specification of defective substatus post-insert.
      if (isDefective) {
         asset = new GlideRecord('alm_asset');
         asset.addQuery('sys_id', rtol.asset);
         asset.query();
         if (asset.next()) {
            asset.substatus = 'defective';
            asset.update();
         }
      }
      
      // record that we've returned the quantity we received
      var quantity_int = parseInt(quantity, 10);
      var quantity_returned_int = parseInt(tol.quantity_returned, 10);
      tol.quantity_returned = quantity_returned_int + quantity_int;
      tol.update();
      return rtol;
   },
   
   type : 'TransferOrderReturn'
};