var LiveFeedNetwork = Class.create();
LiveFeedNetwork.prototype = {
	// tables
	LIVE_FOLLOW: "live_follow",
	LIVE_PROFILE: "live_profile",
	
	// columns
	FOLLOWER_COUNT: "follower_count",
	FOLLOWING: "following",
	FOLLOWING_COUNT: "following_count",
	NAME: "name",
	SHORT_DESCRIPTION: "short_description",
	STATUS: "status",
	USER: "user",
	
	_getFollowingByIds: function(profileIds) {
		var gr = new GlideRecord(this.LIVE_FOLLOW);
		gr.addQuery(this.USER, this.getSessionProfile());
		gr.addQuery(this.FOLLOWING, profileIds);
		gr.query();
		return gr;
	},
	
	_getFollowersByIds: function(profileIds) {
		var gr = new GlideRecord(this.LIVE_FOLLOW);
		gr.addQuery(this.USER, profileIds);
		gr.addQuery(this.FOLLOWING, this.getSessionProfile());
		gr.query();
		return gr;
	},
	
	initialize: function() {
		this.util = new LiveFeedCommon();
		var liveFeedUtil = new LiveFeedUtil();
		this.profile = liveFeedUtil.getSessionProfile();
		// convert from java string to javascript string
		this.profile = this.profile+'';
	},
	
	getSessionProfile: function() {
		return this.profile;
	},
	
	processFollowEvent: function(followingGr) {
		var gr = new GlideRecord(this.LIVE_PROFILE);
		if(!gr.get(followingGr.following))
			return;
		gr.follower_count = gr.follower_count+1;
		gr.update();
		gr.get(followingGr.user);
		gr.following_count = gr.following_count+1;
		gr.update();
	},
	
	processUnFollowEvent: function(followingGr) {
		var gr = new GlideRecord(this.LIVE_PROFILE);
		if(!gr.get(followingGr.following))
			return;
		gr.follower_count = gr.follower_count-1;
		gr.update();
		gr.get(followingGr.user);
		gr.following_count = gr.following_count-1;
		gr.update();
	},
	
	canFollow: function(followingId) {
		if(this.getSessionProfile() == followingId)
			return false;
		return true;
	},
	
	follow: function(followingId) {
		if(!this.canFollow(followingId))
			return false;
		var following = this._getFollowingByIds(followingId);
		if(following.next())
			return false;
		following = new GlideRecord(this.LIVE_FOLLOW);
		following.user = this.getSessionProfile();
		following.following = followingId;
		following.insert();
		var msg = gs.getMessage("You are now following {0}", [following.following.name]);
		gs.addInfoMessage(msg);
		return true;
	},
	
	unfollow: function(followingId) {
		var following = this._getFollowingByIds(followingId);
		if(!following.next())
			return false;
		var user = following.following.name;
		following.deleteRecord();
		var msg = gs.getMessage("You are no longer following {0}", [user]);
		gs.addInfoMessage(msg);
		return true;
	},
	
	getFollowing: function(params) {
		if(!params)
			params = {};
		var view_profile = params.profile_id || this.getSessionProfile();
		var following = new GlideRecord(this.LIVE_FOLLOW);
		following.addQuery(this.USER, view_profile);
		if(this.util.TEXTQUERY in params) {
			var userCond = following.addJoinQuery(this.LIVE_PROFILE, this.FOLLOWING, this.util.SYS_ID);
			var qc = this.util.addExpressionCondition(userCond, this.NAME, params);
			this.util.addExpressionOrCondition(qc, this.SHORT_DESCRIPTION, params);
		}
		var orderBy = ["following.name"];
		this.util.setOrderBy(following, params, orderBy);
		this.util.setLimit(following, params);
		following.query();
		return following;
	},
	
	getFollowingJSON: function(params) {
		if(!params)
			params = {};
		this.util.defaultQueryLimit(params);
		var following = this.getFollowing(params);
		var that = this;
		var liveFeedAPI = new SNC.LiveFeedApi();
		var jsonAPI = new JSON();
		var json = this.util.listJSON(following, function(following) {
			return jsonAPI.decode(liveFeedAPI.getProfileDetails(following.getValue(that.FOLLOWING), that.util.PROFILE_MODE_STATS));
		}, params);
		if(json.length == 0)
			return { more: false, following: json }
		var ids = [];
		for(var i=0;i<json.length;i++)
			ids.push(json[i].sys_id);
		var hjson = this.util.listToHashJSON(json);
		var myfollowers = this._getFollowersByIds(ids);
		while(myfollowers.next()) {
			var profileId = myfollowers.getValue(this.USER);
			hjson[profileId].follower = true;
		}
		
		if(params.profile_id == this.getSessionProfile()) {
			for(var i=0;i<json.length;i++)
				json[i].following = true;
		}
		else {
			var myfollowing = this._getFollowingByIds(ids);
			while(myfollowing.next()) {
				var profileId = myfollowing.getValue(this.FOLLOWING);
				hjson[profileId].following = true;
			}
		}
		json = { more: following.hasNext(), following: json };
		return json;
	},
	
	getFollowers: function(params) {
		if(!params)
			params = {};
		var view_profile = params.profile_id || this.getSessionProfile();
		var followers = new GlideRecord(this.LIVE_FOLLOW);
		followers.addQuery(this.FOLLOWING, view_profile);
		if(this.util.TEXTQUERY in params) {
			var userCond = followers.addJoinQuery(this.LIVE_PROFILE, this.USER, this.util.SYS_ID);
			var qc = this.util.addExpressionCondition(userCond, this.NAME, params);
			this.util.addExpressionOrCondition(qc, this.SHORT_DESCRIPTION, params);
		}
		var orderBy = ["user.name"];
		this.util.setOrderBy(followers, params, orderBy);
		this.util.setLimit(followers, params);
		followers.query();
		return followers;
	},
	
	getFollowersJSON: function(params) {
		if(!params)
			params = {};
		this.util.defaultQueryLimit(params);
		var followers = this.getFollowers(params);
		var that = this;
		var liveFeedAPI = new SNC.LiveFeedApi();
		var jsonAPI = new JSON();
		var json = this.util.listJSON(followers, function(follower) {
			return jsonAPI.decode(liveFeedAPI.getProfileDetails(follower.getValue(that.USER), that.util.PROFILE_MODE_STATS));
		}, params);
		if(json.length == 0)
			return { more: false, followers: json };
		var ids = [];
		for(var i=0;i<json.length;i++)
			ids.push(json[i].sys_id);
		var hjson = this.util.listToHashJSON(json);
		
		var myfollowing = this._getFollowingByIds(ids);
		while(myfollowing.next()) {
			var profileId = myfollowing.getValue(this.FOLLOWING);
			hjson[profileId].following = true;
		}
		if(params.profile_id == this.getSessionProfile()) {
			for(var i=0;i<json.length;i++)
				json[i].follower = true;
		}
		else {
			var myfollowers = this._getFollowersByIds(ids);
			while(myfollowers.next()) {
				var profileId = myfollowers.getValue(this.USER);
				hjson[profileId].follower = true;
			}
		}
		json = { more: followers.hasNext(), followers: json };
		return json;
	},
	
	type: 'LiveFeedNetwork'
}