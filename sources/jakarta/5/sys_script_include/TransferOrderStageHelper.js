var TransferOrderStageHelper = Class.create();

TransferOrderStageHelper.prototype = {
    initialize: function() {
    },

    /*
     * Helper method for transferOrder
     */
    getStageTO: function(stage) {
        if (stage == 'draft' || stage == 0)
            return {sequence:0, stage:'draft'};
        else if (stage == 'requested' || stage == 1)
            return {sequence:1, stage:'requested'};
        else if (stage == 'shipment_preparation' || stage == 2)  
            return {sequence:2, stage:'shipment_preparation'};
        else if (stage == 'partially_shipped' || stage == 3) 
            return {sequence:3, stage:'partially_shipped'};
        else if (stage == 'fully_shipped' || stage == 4)
            return {sequence:4, stage:'fully_shipped'};
        else if (stage == 'received' || stage == 5)
            return {sequence:5, stage:'received'};
        else if (stage == 'delivered' || stage == 6)
            return {sequence:6, stage:'delivered'};
    },

    /*
     * Helper method to get numeric stages for transferOrderLine
     */
    getStageTOL: function(stage) {
        if (stage == 'draft' || stage == 0)
            return {sequence:0, stage:'draft'};
        else if (stage == 'requested' || stage == 1)
            return {sequence:1, stage:'requested'};
        else if (stage == 'shipment_preparation' || stage == 2)  
            return {sequence:2, stage:'shipment_preparation'};
        else if (stage == 'in_transit' || stage == 3) 
            return {sequence:3, stage:'in_transit'};
        else if (stage == 'received' || stage == 4)
            return {sequence:4, stage:'received'};
        else if (stage == 'delivered' || stage == 5)
            return {sequence:5, stage:'delivered'};
    },

    type: 'TransferOrderStageHelper'
}