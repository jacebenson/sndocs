var TransferOrderHelper = Class.create();
TransferOrderHelper.prototype = {
    initialize: function() {
    },
	
	countTransferOrderLine : function(sys_id) {
		var tol = new GlideAggregate('alm_transfer_order_line');
		tol.addQuery('transfer_order', sys_id);
		tol.addAggregate('COUNT');
        tol.query();
		
		if (tol.next() && tol.getAggregate('COUNT') > 0){
			return false;
		}else
			return true;
	},

    type: 'TransferOrderHelper'
}