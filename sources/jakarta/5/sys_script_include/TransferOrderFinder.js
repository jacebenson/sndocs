var TransferOrderFinder = Class.create();
TransferOrderFinder.prototype = {
    initialize: function() {
    },
    
    findTransferOrder : function(tol, type) {
        var transferOrder = this._findTransferOrderWithModel(tol, type);
        if (transferOrder != null) {
            // if there is a similar TO under the same WOT that is in 'Draft' mode attach the TOL under that TO
            tol.setValue('from_stockroom', '');
            tol.setValue('to_stockroom', '');
            tol.setValue('transfer_order', transferOrder.sys_id);
        } else {
            var grTO = new GlideRecord('alm_transfer_order');
            grTO.initialize();
            if (type == 'WM') {
                grTO.setValue('service_order_task', tol.part_requirement.service_order_task.sys_id);
				grTO.setValue('type', 'field_service');
			}
            else if (type == 'FSM') {
                grTO.setValue('service_order', tol.part_requirement.service_order.sys_id);
				grTO.setValue('type', 'field_service_management');
			}
			else if (type == 'RM')
				grTO.setValue('type', 'procurement');
            grTO.setValue('from_stockroom', tol.from_stockroom.sys_id);
            grTO.setValue('to_stockroom', tol.to_stockroom.sys_id);
            grTO.setValue('from_location', tol.from_stockroom.location.sys_id);
            grTO.setValue('to_location', tol.to_stockroom.location.sys_id);
            grTO.setValue('stage', 'draft');
            grTO.setValue('sys_domain', tol.sys_domain);
            grTO.insert();
            
            tol.setValue('from_stockroom', '');
            tol.setValue('to_stockroom', '');
            tol.setValue('transfer_order', grTO.sys_id);
        }
    },
    
    _findTransferOrderWithModel: function(transferOrderLine, type) {
        var grTO = new GlideRecord('alm_transfer_order');
        if (type == 'WM')
            grTO.addQuery('service_order_task', transferOrderLine.part_requirement.service_order_task);
        else if (type == 'FSM')
            grTO.addQuery('service_order', transferOrderLine.part_requirement.service_order);
        else if(type == 'RM')
			grTO.addQuery('type', 'procurement');
        grTO.addQuery('from_stockroom', transferOrderLine.from_stockroom);
        grTO.addQuery('to_stockroom', transferOrderLine.to_stockroom);
        grTO.addQuery('stage', 'draft');
        grTO.query();
        
        if (grTO.next())
            return grTO;
        
        return null;
    },
    
    type: 'TransferOrderFinder'
}