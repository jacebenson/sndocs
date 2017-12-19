var CheckCurrentHub = Class.create();
CheckCurrentHub.prototype = {
	initialize: function() {
	},
	
	isHubCurrent: function (hubId) {
		var curHubInstanceId = GlideProperties.get('glide.apps.hub.current');
		if(hubId == null || hubId == "" ||curHubInstanceId == null || curHubInstanceId == "")
			return false;
		return (hubId == curHubInstanceId);
	},
	
	type: 'CheckCurrentHub'
};