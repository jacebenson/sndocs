var GuidedTourDesignerHelper = Class.create();
GuidedTourDesignerHelper.prototype = {
    initialize: function() {
    },
	
	getCurrentDomain : function(){
		var currentDomain ;
		
		if(gs.getUser().getDomainDisplayValue() == 'global')
			currentDomain = 'global';
		else
			currentDomain = gs.getUser().getDomainID();
		
		return currentDomain;
	},
	
	getUserUI16Preference : function(){
		return gs.getPreference('use.concourse');
	},

    type: 'GuidedTourDesignerHelper'
};