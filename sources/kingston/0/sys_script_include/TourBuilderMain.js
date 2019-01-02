var TourBuilderMain = Class.create();
TourBuilderMain.prototype = {
	
	_tbd : new TourBuilderDetails(),
	_tbu : new TourBuilderUtility(),
	
    initialize: function() {
    },

	process: function(payload) {
		if (!payload || payload == "null")
            return "invalid input.";

        var args = new global.JSON().decode(payload);
        var action = args.action;
		
		gs.debug('tourId: '+args.tour_id+', action: '+ args.action);
		
        if (action == 'tourdetails') {
            try {
                if(this._tbu.isValidTour(args.tour_id)){
					var gtbRecordingDisabled = gs.getProperty('sn_tourbuilder.gtb.disable.gtb.recording','true');
					return {id :args.tour_id,options:"",steps : this._tbd.getTourDetails(args),"gtbPlaybackDisabled":gtbRecordingDisabled=="true"};
				} else{
					var msg = gs.getMessage("Inactive or Invalid tour");
					return {"status" : "error", "message" : msg + " : " + args.tour_id};
				}
            } catch(e1) {
                return {"status" : "error", "message" : e1};
            }
        } else{
            return "Invalid action";
        }
	},
	
    type: 'TourBuilderMain'
};