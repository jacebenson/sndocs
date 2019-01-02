var LiveFeedMembers = Class.create();
LiveFeedMembers.prototype = {

	/* constants begin { */
	// role
	LIVE_FEED_ADMIN: "live_feed_admin",
	// tables
	LIVE_CONVERSATION: "live_group_profile",
	LIVE_CONVERSATION_MEMBER: "live_group_member",
	LIVE_PROFILE: "live_profile",
	LIVE_TEAM: "live_group_profile",
	LIVE_TEAM_MEMBER: "live_group_member",

	// fields
	CONVERSATION: "group",
	GROUP: "group",
	TEAM: "team",
	MEMBER: "member",
	MEMBER_TYPE: "member_type",
	NAME: "name",
	STATE: "state",
	TABLE: "table",
	TYPE: "type",
	DOCUMENT: "document",
	USER: "user",

	// state values
	ADMIN: "admin",
	ACTIVE: "active",
	INACTIVE: "inactive",
	INVITED: "invited",
	REQUEST: "request",

	/* constants end } */

    initialize: function() {
		this.util = new LiveFeedCommon();
    },

	getVisibleMembers: function(params) {
		if(!params)
			params = {};
		var json = [];
		var profile = new GlideRecord(this.LIVE_PROFILE);
		var qc = profile.addQuery(this.TYPE, this.USER);
		if(params[this.util.TEXTQUERY]) {
			this.util.addExpressionQuery(profile, this.NAME, params);
		}
		if(params[this.TEAM]) {
			var lfg = new LiveFeedTeam();
			var teams = lfg.getTeams(params);
			var teamIds = [];
			while(teams.next()) {
				teamIds.push(teams.getValue(this.util.SYS_ID));
			}

			if(teamIds.length > 0) {
				qc.addOrCondition(this.DOCUMENT, teamIds);
			}
		}
		var orderBy = ["name"];
		this.util.setOrderBy(profile, params, orderBy);
		this.util.setLimit(profile, params);
		profile.query();
		return profile;
	},

	getMemberDetails: function(members) {
		var api = new SNC.LiveFeedApi();
		for(var i=0;i<members.length;i++)
			members[i].member.initials = api.getInitials(members[i].member.name);
		var ids = [];
		for(var i=0;i<members.length;i++)
			ids.push(members[i].member.id);
		var images = this.util.getImages(ids);
		for(var i=0;i<ids.length;i++)
			members[i].member.image = images[ids[i]];
	},
	
	getMembersJSON: function(params) {
		if(!params)
			params = {};
		if(params.conversation) {
			var lfc = new LiveFeedFeed();
			var json = lfc.getAllMembersJSON(params);
			this.getMemberDetails(json.members);
			return json;
		}
		else {
			var profiles = this.getVisibleMembers(params);
			var that = this;
			var json = this.util.listJSON(profiles, function(member) { return that.memberJSON(member); }, params);
			this.getMemberDetails(json);
			json = { more: profiles.hasNext(), 'members': json };
			return json;
		}
	},

	memberJSON: function(member) {
		var json = {};
		json.member = {};
		json.member.id = member.getValue(this.util.SYS_ID);
		json.member.name = member.getDisplayValue(this.NAME);
		json.type = this.util.choicevalue(member, "type");
		return json;
	},

    type: 'LiveFeedMembers'
};