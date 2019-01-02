var LiveFeedProfile = Class.create();

LiveFeedProfile.prototype = {
	LIVE_PROFILE: 'live_profile',
	SHORT_DESCRIPTION: 'short_description',
	STATUS: 'status',

	initialize: function(sys_id) {
		this.sys_id = sys_id;
		this.liveFeedApi = new SNC.LiveFeedApi();
		this.util = new LiveFeedCommon();
	},

	getDetails: function(){
		var json = this.liveFeedApi.getProfileDetails(this.sys_id, this.util.PROFILE_MODE_BASIC);
		return new JSON().decode(json);
	},
	
	getStatsDetails: function(){
		var json = this.liveFeedApi.getProfileDetails(this.sys_id, this.util.PROFILE_MODE_STATS);
		return new JSON().decode(json);
	},
	
	getFullDetails: function(){
		var json = this.liveFeedApi.getProfileDetails(this.sys_id, this.util.PROFILE_MODE_FULL);
		return new JSON().decode(json);
	},

	update: function(updateData){
		if(this.sys_id){
			var gr = new GlideRecord(this.LIVE_PROFILE);
			if(gr.get(updateData.sys_id)){
				var updated = false;
				if(gr.getElement(this.SHORT_DESCRIPTION).canWrite()){
					gr.short_description = updateData.aboutme;
					updated = true;
				}
				if(gr.getElement(this.STATUS).canWrite()){
					gr.status = updateData.status;
					updated = true;
				}
				if(updated){
					gr.update();
					return true;
				}
			}
		}
		return false;
	},

	type: 'LiveFeedProfile'
};