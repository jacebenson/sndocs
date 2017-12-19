var LiveFeedTeam = Class.create();
LiveFeedTeam.prototype = {

	/* constants begin { */
	// role
	LIVE_FEED_ADMIN: "live_feed_admin",
	// tables
	LIVE_FAVORITE: "live_favorite",
	LIVE_CONVERSATION: "live_group_profile",
	LIVE_CONVERSATION_MEMBER: "live_group_member",
	LIVE_PROFILE: "live_profile",
	LIVE_TEAM_MEMBER: "live_group_member",
	LIVE_TEAM: "live_group_profile",

	
	// fields
	DOCUMENT: "document",
	GROUP: "group",
	TEAM: "team",
	IMAGE: "image",
	MEMBER: "member",
	MEMBER_TYPE: "member_type",
	NAME: "name",
	NOTIFICATION: "notification",
	PHOTO: "photo",
	PUBLIC_GROUP: "public_group",
	SHORT_DESCRIPTION: "short_description",
	STATE: "state",
	SYS_CREATED_ON: "sys_created_on",
	SYS_ID: "sys_id",
	TABLE: "table",
	TYPE: "type",
	USER: "user",
	VISIBLE_GROUP: "visible_group",
	
	// state values
	ADMIN: "admin",
	ACTIVE: "active",
	INACTIVE: "inactive",
	INVITED: "invited",
	REQUEST: "request",
	
	// UI actions
	JOIN: "join",
	ACCEPT: "accept",
	REJECT: "reject",
	REVOKE_ADMIN: "revoke_admin",
	/* constants end } */

	/* private methods begin { */

	_getMember: function(teamId, memberId) {
		var member = new GlideRecord(this.LIVE_TEAM_MEMBER);
		member.setWorkflow(false);
		member.addQuery(this.GROUP, teamId);
		member.addQuery(this.MEMBER, memberId);
		member.query();
		member.setWorkflow(true);
		if(member.next())
			return member;
	},

	_createMember: function(teamId, memberId, state) {
		var member = new GlideRecord(this.LIVE_TEAM_MEMBER);
		member.initialize();
		member.group = teamId;
		member.member = memberId;
		member.state = state;
		return member.insert();
	},

	_createSessionMember: function(teamId, state) {
		return this._createMember(teamId, this.getSessionProfile(), state);
	},

	_createTeamProfile: function(gr) {
		var profileGr = new GlideRecord(this.LIVE_PROFILE);
		profileGr.initialize();
		profileGr.type = this.TEAM;
		profileGr.name = gr.name;
		profileGr.short_description = gr.short_description;
		profileGr.table = this.LIVE_TEAM;
		profileGr.document = gr.sys_id;
		profileGr.insert();
	},

	_getTeamProfile: function(teamId) {
		var profileGr = new GlideRecord(this.LIVE_PROFILE);
		profileGr.addQuery(this.TABLE, this.LIVE_TEAM);
		profileGr.addQuery(this.TYPE, this.TEAM);
		profileGr.addQuery(this.DOCUMENT, teamId);
		profileGr.query();
		if(profileGr.next())
			return profileGr;
	},

	_getTeamProfileId: function(teamId) {
		var profileGr = this._getTeamProfile(teamId);
		if(profileGr)
			return profileGr.getValue(this.SYS_ID);
	},

	_createTeam: function(name, description, public_team, visible_team) {
		if(public_team)
			visible_team = true;
		var gr = new GlideRecord(this.LIVE_TEAM);
		gr.initialize();
		gr.name = name;
		gr.short_description = description;
		gr.type = this.TEAM;
		gr.public_group = public_team;
		gr.visible_group = visible_team;
		if(gr.canCreate()) {
			var teamId = gr.insert();
			this._createTeamProfile(gr);
			return teamId;
		}
	},

	_updateTeam: function(teamId, name, description, public_team, visible_team) {
		if(public_team)
			visible_team = true;
		var gr = this.getTeam(teamId);
		if(!gr)
			return false;
		if(!this.isAdmin(teamId)) {
			var errMsg = gs.getMessage("User is not admin");
			gs.addErrorMessage(errMsg);
			return false;
		}
		gr.name = name;
		gr.short_description = description;
		gr.public_group = public_team;
		gr.visible_group = visible_team;
		gr.update();
		return true;
	},

	_getVisibleStates: function() {
		return [this.ACTIVE, this.ADMIN, this.INVITED, this.REQUEST];
	},

	_getPendingStates: function() {
		return [this.INVITED, this.REQUEST];
	},

	_getVisibleStatesStr: function() {
		return this._getVisibleStates().join(',');
	},
	
	_getDetailsVisibleStates: function() {
		return [this.ACTIVE, this.ADMIN, this.INVITED];
	},
	
	_getDetailsVisibleStatesStr: function() {
		return this._getDetailsVisibleStates().join(',');
	},
	
	_getMemberCount: function(teams) {
		var member = new GlideAggregate(this.LIVE_TEAM_MEMBER);
		member.addAggregate(this.util.COUNT);
		member.addQuery(this.GROUP,teams);
		member.addQuery(this.STATE,this._getVisibleStates());
		member.groupBy(this.GROUP);
		member.query();
		return member;
	},
	
	_getPendingMemberCount: function(teams) {
		var member = new GlideAggregate(this.LIVE_TEAM_MEMBER);
		member.addAggregate(this.util.COUNT);
		member.addQuery(this.GROUP, teams);
		member.addQuery(this.STATE,this._getPendingStates());
		member.groupBy(this.GROUP);
		member.query();
		return member;
	},

	_getConversationCount: function(teams) {
		var member = new GlideAggregate(this.LIVE_CONVERSATION_MEMBER);
		member.addAggregate(this.util.COUNT);
		member.addQuery(this.MEMBER,teams);
		member.addQuery(this.STATE,this._getVisibleStates());
		member.groupBy(this.MEMBER);
		member.query();
		return member;
	},
	
	_getFavoriteTeams: function(teams) {
		var favorite = new GlideRecord(this.LIVE_FAVORITE);
		favorite.addQuery(this.USER, this.getSessionProfile());
		favorite.addQuery(this.DOCUMENT, teams);
		favorite.query();
		return favorite;
	},
	
	_getMembership: function(teams) {
		var member = new GlideRecord(this.LIVE_TEAM_MEMBER);
		member.addQuery(this.GROUP, teams);
		member.addQuery(this.MEMBER, this.getSessionProfile());
		member.query();
		return member;
	},
	
	_getConversationMembership: function(conversations, teamId) {
		var member = new GlideRecord(this.LIVE_CONVERSATION_MEMBER);
		member.addQuery(this.GROUP, conversations);
		member.addQuery(this.MEMBER, teamId);
		member.query();
		return member;
	},
	
	_getAdminCount: function(teamId) {
		var member = new GlideAggregate(this.LIVE_TEAM_MEMBER);
		member.addAggregate(this.util.COUNT);
		member.addQuery(this.GROUP, teamId);
		member.addQuery(this.STATE, this.ADMIN);
		member.query();
		member.next();
		return member.getAggregate(this.util.COUNT);
	},
	
	_setNotification: function(teamId, preference) {
		var member = this._getMember(teamId, this.getSessionProfile());
		if(!member)
			return false;
		if(member.notification == preference)
			return false;
		member.notification = preference;
		member.update();
		return true;
	},
	
	
	_adjustTeams: function(gr, profile) {
		var sq = new GlideSubQuery(this.LIVE_TEAM_MEMBER, this.SYS_ID, this.GROUP);
		var sqc = sq.addCondition(this.MEMBER, profile);
		sqc.addCondition(this.STATE,this.util.IN,this._getVisibleStatesStr());
		var cond = gr.addQuery(this.VISIBLE_GROUP,true);
		cond.addOrCondition(sq);
	},
	
	_adjustSessionTeams: function(gr) {
		if(gs.hasRole(this.LIVE_FEED_ADMIN))
			return;
		this._adjustTeams(gr, this.getSessionProfile());
	},
	

	_convertTeamToProfileId: function(teamIds) {
		var gr = new GlideRecord(this.LIVE_PROFILE);
		gr.addQuery(this.TYPE, this.TEAM);
		gr.addQuery(this.TABLE, this.LIVE_TEAM);
		gr.addQuery(this.DOCUMENT, teamIds);
		gr.query();
		var teamProfileIds = [];
		while(gr.next()) {
			teamProfileIds.push([gr.getValue(this.DOCUMENT),gr.getValue(this.SYS_ID)]);
		}
		return teamProfileIds;
	},

	/* this is being used by LiveFeedFeed and ideally is a protected/package scope */
	_convertProfileToTeamId: function(teamProfileIds) {
		var gr = new GlideRecord(this.LIVE_PROFILE);
		gr.addQuery(this.TYPE, this.TEAM);
		gr.addQuery(this.TABLE, this.LIVE_TEAM);
		gr.addQuery(this.SYS_ID, teamProfileIds);
		gr.query();
		var teamIds = [];
		while(gr.next()) {
			teamIds.push([gr.getValue(this.SYS_ID),gr.getValue(this.DOCUMENT)]);
		}
		return teamIds;
	},
	
	/* get visible team member ids with teams passed as member ids */
	_getVisibleTeamMemberIds: function(teamProfileIds, states) {
		var pgIds = this._convertProfileToTeamId(teamProfileIds);
		var teamIds = [];
		var teams = {};
		for(var i=0;i<pgIds.length;i++) {
			teams[pgIds[i][1]] = pgIds[i][0];
			teamIds.push(pgIds[i][1]);
		}
		if(teamIds.length == 0)
			return teamIds;
		var params = { sys_id : teamIds };
		if(states)
			params.state = states;
		params[this.util.QUERY_LIMIT] = teamIds.length;
		params[this.util.ORDER_BY] = [];
		var teamGr = this.getTeams(params);
		teamIds = [];
		while(teamGr.next()) {
			teamIds.push(teams[teamGr.getValue(this.SYS_ID)]);
		}
		return teamIds;
	},
	
	/* get visible team ids with teams passed as member ids */
	_getVisibleTeamIds: function(teamProfileIds, states) {
		var gr = new GlideRecord(this.LIVE_PROFILE);
		gr.addQuery(this.SYS_ID, teamProfileIds);
		gr.query();
		var teamIds = [];
		while(gr.next()) {
			teamIds.push(gr.getValue(this.DOCUMENT));
		}
		var params = { sys_id : teamIds };
		if(states)
			params.state = states;
		params[this.util.QUERY_LIMIT] = teamIds.length;
		params[this.util.ORDER_BY] = [];
		var teamsGr = this.getTeams(params);
		teamIds = [];
		while(teamsGr.next()) {
			teamIds.push(teamsGr.getValue(this.SYS_ID));
		}
		return teamIds;
	},
	
	/* get membership team member ids with teams passed as member ids */
	_getMembershipTeamMemberIds: function(teamProfileIds, states) {
		var pgIds = this._convertProfileToTeamId(teamProfileIds);
		var teamIds = [];
		var teams = {};
		for(var i=0;i<pgIds.length;i++) {
			teams[pgIds[i][1]] = pgIds[i][0];
			teamIds.push(pgIds[i][1]);
		}
		if(teamIds.length == 0)
			return teamIds;
		var params = { sys_id : teamIds };
		params.member_teams = true;
		if(states)
			params.state = states;
		params[this.util.QUERY_LIMIT] = teamIds.length;
		params[this.util.ORDER_BY] = [];
		var teamGr = this.getTeams(params);
		teamIds = [];
		while(teamGr.next()) {
			teamIds.push(teams[teamGr.getValue(this.SYS_ID)]);
		}
		return teamIds;
	},
	
	_getAllMemberTeamIds: function(profile, states) {
		if(!states)
			states = this._getVisibleStates();
		var member = new GlideRecord(this.LIVE_TEAM_MEMBER);
		member.setWorkflow(false);
		member.addQuery(this.MEMBER, profile);
		member.addQuery(this.STATE, this.util.IN, states);
		var qc = member.addJoinQuery(this.LIVE_TEAM, this.GROUP, this.SYS_ID);
		qc.addCondition(this.TYPE,this.util.EQUALS,this.TEAM);
		member.query();
		member.setWorkflow(true);
		var teamIds = [];
		while(member.next()) {
			teamIds.push(member.getValue(this.GROUP));
		}
		return teamIds;
	},
	
	_getAllMemberTeams: function(profile, states) {
		var teamIds = this._getAllMemberTeamIds(profile, states);
		return this._convertTeamToProfileId(teamIds);
	},
	
	_getAllMemberTeamProfileIds: function(profile, states) {
		var teams = this._getAllMemberTeams(profile, states);
		var teamProfiles = [];
		for(var i=0;i<teams.length;i++)
			teamProfiles.push(teams[i][1]);
		return teamProfiles;
	},
	
	/* private methods end } */
	
	/* public methods begin { */
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
	
	createTeam: function(params) {
		if(!params.name) {
			var errMsg = gs.getMessage("Live Feed Team name is required");
			gs.addErrorMessage(errMsg);
			return;
		}
		var name = params.name;
		var short_description = params.short_description;
		var public_team = params.public_team;
		var visible_team = params.visible_team;
		return this._createTeam(name, short_description, public_team, visible_team);
	},
	
	updateTeam: function(data) {
		if(!data.name) {
			var errMsg = gs.getMessage("Live Feed Team name is required");
			gs.addErrorMessage(errMsg);
			return false;
		}
		return this._updateTeam(data.sys_id, data.name, data.short_description, data.public_team, data.visible_team);
	},
	
	syncTeamProfile: function(teamGr) {
		var profileGr = this._getTeamProfile(teamGr.sys_id);
		if(!profileGr)
			return;
		profileGr.name = teamGr.name;
		profileGr.short_description = teamGr.short_description;
		profileGr.update();
	},
	
	getTeam: function(teamId) {
		var gr = new GlideRecord(this.LIVE_TEAM);
		gr.get(teamId);
		return gr;
	},
	
	getMembership: function(teams) {
		return this._getMembership(teams);
	},
	
	/* membership actions begin { */
	join: function(teamId) {
		var team = this.getTeam(teamId);
		var state = this.REQUEST;
		if(team.public_group)
			state = this.ACTIVE;
		else if(!team.visible_group)
			return false;
		var member = this._getMember(teamId, this.getSessionProfile());
		if(member) {
			if(member.state == this.INACTIVE) {
				member.state = state;
				member.update();
			}
			else
				return false;
		}
		else {
			this._createSessionMember(teamId, state);
		}
		return true;
	},
	
	leave: function(teamId) {
		var member = this._getMember(teamId, this.getSessionProfile());
		if(!member) return;
			if(member.state == this.ADMIN) {
			var adminCount = this._getAdminCount(teamId);
			// single admin cannot leave the team
			if(adminCount == 1) {
				var errMsg = gs.getMessage("At least one administrator needed to manage the team");
				gs.addErrorMessage(errMsg);
				return false;
			}
		}
		member.state = this.INACTIVE;
		member.update();
		return true;
	},
	
	request: function(teamId) {
		var team = this.getTeam(teamId);
		if(!team.visible_group && !gs.hasRole(this.LIVE_FEED_ADMIN)) {
			var errMsg = gs.getMessage("This team can only be joined by invitation");
			gs.addErrorMessage(errMsg);
			return false;
		}
		var member = this._getMember(teamId, this.getSessionProfile());
		var state = this.REQUEST;
		if(team.public_group)
			state = this.ACTIVE;
		if(member) {
			if(member.state != this.INACTIVE)
				return false;
			member.state = state;
			member.update();
			return true;
		}
		return this._createMember(teamId, this.getSessionProfile(), state);
	},
	
	acceptInvitation: function(teamId) {
		var member = this._getMember(teamId, this.getSessionProfile());
		if(!member)
			return false;
		if(member.state != this.INVITED)
			return false;
		member.state = this.ACTIVE;
		member.update();
		return true;
	},
	
	rejectInvitation: function(teamId) {
		var member = this._getMember(teamId, this.getSessionProfile());
		if(!member)
			return false;
		if(member.state != this.INVITED)
			return false;
		member.state = this.INACTIVE;
		member.update();
		return true;
	},
	
	joinConversation: function(teamId, conversationId) {
		if(!this.isAdmin(teamId))
			return false;
		var teamProfileId = this._getTeamProfileId(teamId);
		var lfFeed = new LiveFeedFeed();
		return lfFeed.teamJoin(conversationId, teamProfileId);
	},
	
	leaveConversation: function(teamId, conversationId) {
		if(!this.isAdmin(teamId))
			return false;
		var teamProfileId = this._getTeamProfileId(teamId);
		var lfFeed = new LiveFeedFeed();
		return lfFeed.teamLeave(conversationId, teamProfileId);
	},
	
	requestConversation: function(teamId, conversationId) {
		if(!this.isAdmin(teamId))
			return false;
		var teamProfileId = this._getTeamProfileId(teamId);
		var lfFeed = new LiveFeedFeed();
		return lfFeed.teamRequest(conversationId, teamProfileId);
	},
	
	acceptConversationInvitation: function(teamId, conversationId) {
		if(!this.isAdmin(teamId))
			return false;
		var teamProfileId = this._getTeamProfileId(teamId);
		var lfFeed = new LiveFeedFeed();
		return lfFeed.acceptTeamInvitation(conversationId, teamProfileId);
	},
	
	rejectConversationInvitation: function(teamId, conversationId) {
		if(!this.isAdmin(teamId))
			return false;
		var teamProfileId = this._getTeamProfileId(teamId);
		var lfFeed = new LiveFeedFeed();
		return lfFeed.rejectTeamInvitation(conversationId, teamProfileId);
	},
	
	updateMyMembership: function(teamId, membership) {
		if(membership === this.JOIN)
			this.join(teamId);
		else if(membership === this.INACTIVE)
			this.leave(teamId);
		else if(membership === this.REQUEST)
			this.request(teamId);
		else if(membership === this.ACCEPT)
			this.acceptInvitation(teamId);
		else if(membership === this.REJECT)
			this.rejectInvitation(teamId);
		var member = this._getMember(teamId, this.getSessionProfile());
		return member.getValue(this.STATE);
	},
	
	updateConversationMembership: function(teamId, conversationId, membership) {
		if(!this.isAdmin(teamId))
			return;
		if(membership === this.JOIN)
			return this.joinConversation(teamId, conversationId);
		else if(membership === this.INACTIVE)
			return this.leaveConversation(teamId, conversationId);
		else if(membership === this.REQUEST)
			return this.requestConversation(teamId, conversationId);
		else if(membership === this.ACCEPT)
			return this.acceptConversationInvitation(teamId, conversationId);
		else if(membership === this.REJECT)
			return this.rejectConversationInvitation(teamId, conversationId);
	},
	
	invite: function(teamId, memberId) {
		if(!this.isAdmin(teamId))
			return false;
		var member = this._getMember(teamId, memberId);
		var state = this.INVITED;
		if(member) {
			if(member.state != this.INACTIVE) {
				var errMsg = gs.getMessage("User is already a member of the team");
				gs.addErrorMessage(errMsg);
				return false;
			}
			member.state = state;
			member.update();
			return true;
		}
		return this._createMember(teamId, memberId, state);
	},
	
	acceptRequest: function(teamId, memberId) {
		if(!this.isAdmin(teamId))
			return false;
		var member = this._getMember(teamId, memberId);
		if(!member)
			return false;
		if(member.state != this.REQUEST)
			return false;
		member.state = this.ACTIVE;
		member.update();
		return true;
	},
	
	rejectRequest: function(teamId, memberId) {
		if(!this.isAdmin(teamId))
			return false;
		var member = this._getMember(teamId, memberId);
		if(!member)
			return false;
		if(member.state != this.REQUEST)
			return false;
		member.state = this.INACTIVE;
		member.update();
		return true;
	},
	
	grantAdmin: function(teamId, memberId) {
		if(!this.isAdmin(teamId))
			return false;
		var member = this._getMember(teamId, memberId);
		if(!member)
			return false;
		member.state = this.ADMIN;
		member.update();
		return true;
	},
	
	revokeAdmin: function(teamId, memberId) {
		if(!this.isAdmin(teamId))
			return false;
		var adminCount = this._getAdminCount(teamId);
		// single admin cannot leave the team
		if(adminCount == 1) {
			var errMsg = gs.getMessage("At least one administrator needed to manage the live feed team");
			gs.addErrorMessage(errMsg);
			return false;
		}
		var member = this._getMember(teamId, memberId);
		if(!member)
			return false;
		member.state = this.ACTIVE;
		member.update();
		return true;
	},
	
	administrateMembership: function(teamId, memberId, membership) {
		if(membership === this.INVITED)
			this.invite(teamId, memberId);
		else if(membership === this.ACCEPT)
			this.acceptRequest(teamId, memberId);
		else if(membership === this.REJECT)
			this.rejectRequest(teamId, memberId);
		else if(membership == this.ADMIN)
			this.grantAdmin(teamId, memberId);
		else if(membership == this.REVOKE_ADMIN)
			this.revokeAdmin(teamId, memberId);
		var member = this._getMember(teamId, memberId);
		if(member)
			return member.getValue(this.STATE);
	},
	/* membership actions end } */
	
	subscribe: function(teamId) {
		this._setNotification(teamId, true);
	},
	
	unsubscribe: function(teamId) {
		this._setNotification(teamId, false);
	},
	
	setNotificationPreference: function(teamId, notification) {
		if(notification)
			this.subscribe(teamId);
		else
			this.unsubscribe(teamId);
	},
	
	setConversationNotificationPreference: function(teamId, conversationId, notification) {
		if(!this.isAdmin(teamId))
			return false;
		var teamProfileId = this._getTeamProfileId(teamId);
		var lfFeed = new LiveFeedFeed();
		lfFeed.setTeamNotificationPreference(conversationId, teamProfileId, notification);
	},
	
	favorite: function(teamId) {
		var favorite = new LiveFeedFavorite();
		return favorite.favorite(this.LIVE_TEAM, teamId);
	},
	
	unfavorite: function(teamId) {
		var favorite = new LiveFeedFavorite();
		return favorite.unfavorite(this.LIVE_TEAM, teamId);
	},
	
	getTeams: function(params) {
		if(!params)
			params = {};
		var teams = new GlideRecord(this.LIVE_TEAM);
		if(teams.isValidField(this.TYPE))
			teams.addQuery(this.TYPE,this.TEAM);
		var view_profile = params.profile_id || this.getSessionProfile();

		// for security
		this._adjustSessionTeams(teams);
		
		// for user profile being viewed
		if(view_profile !== this.getSessionProfile())
			this._adjustTeams(teams, view_profile);

		this.util.addQueryParam(teams, this.util.SYS_ID, params.sys_id);
		if(params.favorite) {
			var fqc = teams.addJoinQuery(this.LIVE_FAVORITE, this.SYS_ID, this.DOCUMENT);
			fqc.addCondition(this.USER, this.util.EQUALS, this.getSessionProfile());
		}
		this.util.addBooleanQueryParam(teams, this.PUBLIC_GROUP, params.public_team);

		var mqc = null;
		if(params.member_teams || params.membership_type) {
			mqc = teams.addJoinQuery(this.LIVE_TEAM_MEMBER, this.SYS_ID, this.GROUP);
			mqc.addCondition(this.MEMBER, this.util.EQUALS, view_profile);
		}

		if(params.membership_type)
			this.util.addCondition(mqc, this.STATE, params.membership_type);
		else if(params.member_teams)
			mqc.addCondition(this.STATE, this.util.IN, this._getVisibleStatesStr());

		if(params[this.util.TEXTQUERY]) {
			var qc = this.util.addExpressionQuery(teams, this.NAME, params);
			this.util.addExpressionOrCondition(qc, this.SHORT_DESCRIPTION, params);
		}
		var orderBy = [this.NAME];
		this.util.setOrderBy(teams,params,orderBy);
		this.util.setLimit(teams,params);
		teams.query();
		return teams;
	},
	
	getTeamsJSON: function(params) {
		if(!params)
			params = {};
		this.util.defaultQueryLimit(params);
		var teams = this.getTeams(params);
		var that = this;
		var json = this.util.listJSON(teams, function(team) { return that.teamJSON(team); }, params);
		if(json.length == 0)
			return { more: false, teams: json };
		var ids = [];
		for(var i=0;i<json.length;i++)
			ids.push(json[i].sys_id);
		var hjson = this.util.listToHashJSON(json);
		if(params.favorites) {
			if(params.favorite) {
				for(var i=0;i<json.length;i++)
					json[i].favorite = true;
			}
			else {
				var favorites = this._getFavoriteTeams(ids);
				while(favorites.next()) {
					var id = favorites.document;
					hjson[id].favorite = true;
				}
			}
		}
		if(params.membership) {
			var membership = this._getMembership(ids);
			while(membership.next()) {
				var team = membership.group;
				var state = membership.getValue(this.STATE);
				if(state != this.INACTIVE)
					hjson[team].membership = state;
				hjson[team].notification = this.util.toBoolean(membership.getValue(this.NOTIFICATION));
			}
		}
		if(params.stats) {
			var memberCount = this._getMemberCount(ids);
			while(memberCount.next()) {
				var id = memberCount.group;
				if(!hjson[id].metrics)
					hjson[id].metrics = {};
				hjson[id].metrics.member_count = memberCount.getAggregate(this.util.COUNT);
			}
			var teamIds = this._convertTeamToProfileId(ids);
			var p2g = {};
			var profileIds = [];
			for(var i=0;i<teamIds.length;i++) {
				p2g[teamIds[i][1]] = teamIds[i][0];
				profileIds.push(teamIds[i][1]);
			}
			var conversationCount = this._getConversationCount(profileIds);
			while(conversationCount.next()) {
				var id = p2g[conversationCount.member];
				if(!hjson[id].metrics)
					hjson[id].metrics = {};
				hjson[id].metrics.conversation_count = conversationCount.getAggregate(this.util.COUNT);
			}
		}
		if (params.extended_stats) {
			var pendingMemberCount = this._getPendingMemberCount(ids);
			while(pendingMemberCount.next()) {
				var id = pendingMemberCount.group;
				if(!hjson[id].metrics)
					hjson[id].metrics = {};
				hjson[id].metrics.pending_member_count = pendingMemberCount.getAggregate(this.util.COUNT);
			}
		}
		json = { more: teams.hasNext(), teams: json };
		return json;
	},
	
	getMembers: function(params) {
		if(!params)
			params = {};
		var members = new GlideRecord(this.LIVE_TEAM_MEMBER);
		if(!params.team)
			return;
		members.addQuery(this.GROUP, params.team);
		if (params.memberId) {
			this.util.addQueryParam(members, this.MEMBER, params.memberId);
		}
		if(params[this.util.TEXTQUERY]) {
			this.util.addExpressionQuery(members, "member.name", params);
		}
		this.util.addQueryParam(members, this.STATE, params.state);
		this.util.addBooleanQueryParam(members, this.NOTIFICATION, params.notification);
		var orderBy = ["member.name"];
		this.util.setOrderBy(members,params,orderBy);
		this.util.setLimit(members,params);
		members.query();
		return members;
	},
	
	getMembersJSON: function(params) {
		if(!params)
			params = {};
		this.util.defaultQueryLimit(params);
		var members = this.getMembers(params);
		var that = this;
		var json = this.util.listJSON(members, function(member) { return that.memberJSON(member); }, params);
		if(json.length == 0)
			return { more: false, members: json };
		var api = new SNC.LiveFeedApi();
		var ids = [];
		for(var i=0;i<json.length;i++)
			ids.push(json[i].member.id);
		var memberDetails = this.util.getMemberDetails(ids);
		for(var i=0;i<ids.length;i++) {
			var details = memberDetails[ids[i]];
			json[i].member.name = details.name;
			json[i].member.status = details.status;
			json[i].member.image = details.image;
		}
		for(var i=0;i<json.length;i++)
			json[i].member.initials = api.getInitials(json[i].member.name);
		json = { more: members.hasNext(), members: json };
		return json;
	},
	
	getTeamAdmins: function(teamId) {
		return this.getMembers({ team : teamId , state : this.ADMIN });
	},

	getTeamNotificationUsers: function(teamId) {
		return this.getMembers({ team : teamId, notification: true });
	},

	getTeamNotificationUsersById: function(teamId) {
		var mr = this.getTeamNotificationUsers(teamId);
		var members = [];
		while (mr.next()){
			if (mr.getValue(this.MEMBER_TYPE) == 'user') {
				var userId = new LiveFeedUtil().getProfileUserID(mr.member);
				if(userId)
					members.push(userId);
			}
		}
		return members;
	},

	getConversations: function(params) {
		if(!params)
			params = {};
		if(!params.team)
			return;
		var teamId = this._getTeamProfileId(params.team);
		var conversations = new GlideRecord(this.LIVE_CONVERSATION);
		if(params.membership_type) {
			var mqc = conversations.addJoinQuery(this.LIVE_CONVERSATION_MEMBER, this.SYS_ID, this.CONVERSATION);
			mqc.addCondition(this.MEMBER, teamId);
			mqc.addCondition(this.STATE, params.membership_type);
		}
		var memberQc = conversations.addJoinQuery(this.LIVE_CONVERSATION_MEMBER, this.SYS_ID, this.GROUP);
		memberQc.addCondition(this.MEMBER, this.util.EQUALS, teamId);
		var visibleStates = [this.ACTIVE, this.ADMIN, this.INVITED, this.REQUEST].join(',');
		memberQc.addCondition(this.STATE, this.util.IN, visibleStates);
		if(params[this.util.TEXTQUERY]) {
			this.util.addExpressionQuery(conversations, this.NAME, params);
		}
		conversations.query();
		return conversations;
	},

	getConversationsJSON: function(params) {
		if(!params)
			params = {};
		if(!params.team)
			return;
		var conversations = this.getConversations(params);
		var conversationIds = [];
		while(conversations.next()) {
			conversationIds.push(conversations.getValue(this.SYS_ID));
		}
		if(conversationIds.length == 0)
			return { more: false, conversations: [] };
		var cparams = { sys_id: conversationIds, membership: params.membership, stats: params.stats };
		this.util.defaultQueryLimit(cparams);
		var lfFeed = new LiveFeedFeed();
		var json = lfFeed.getConversationsJSON(cparams);
		var conversations = json.conversations;
		for(var i=0;i<conversations.length;i++) {
			var conversation = conversations[i];
			for(var j=0;j<conversation.membership_via_team.length;j++)
				if(conversation.membership_via_team[j].team == params.team) {
					conversation.team = conversation.membership_via_team[j];
					break;
				}
		}
		return json;
	},

	isAdmin: function(teamId) {
		if(gs.hasRole(this.LIVE_FEED_ADMIN))
			return true;
		var members = this.getMembers({ team: teamId, memberId: this.getSessionProfile(), state: this.ADMIN});
		members.query();
		return members.next();
	},

	canCreate: function() {
		var gr = new GlideRecord(this.LIVE_TEAM);
		gr.type = this.TEAM;
		return gr.canCreate();
	},

	canView: function(gr) {
		if(gs.hasRole(this.LIVE_FEED_ADMIN))
			return true;
		var team;
		if(gr.getTableName() === this.LIVE_TEAM) {
			team = gr;
		}
		else if(gr.getTableName() === this.LIVE_PROFILE) {
			team = new GlideRecord(this.LIVE_TEAM);
			if(!team.get(gr.document))
				return false;
		}
		if(!team)
			return false;
		if(team.public_group)
			return true;
		if(team.visible_group)
			return true;
		if(this._getMember(team.sys_id,this.getSessionProfile()))
			return true;
	},

	deleteTeamMembers: function(teamId) {
		var members = this.getMembers({ team: teamId });
		members.deleteMultiple();
	},

	removeTeamMember: function (teamId, memberId) {
		if (!this.isAdmin(teamId))
			return false;
		var member = this._getMember(teamId, memberId);
		if(!member)
			return false;
		if(member.state == this.ADMIN) {
			if(this._getAdminCount(teamId) == 1)
				return false;
		}
		member.state = this.INACTIVE;
		member.update();
		return true;
	},

	deleteTeamConversations: function(teamId) {
		var conversations = this.getConversations({team:teamId});
		conversations.deleteMultiple();
	},

	deleteTeam: function(teamId) {
		if(!this.isAdmin(teamId))
			return false;
		var team = this.getTeam(teamId);
		if(!team.isValidRecord())
			return false;
		var teamProfile = this._getTeamProfile(teamId);
		if(teamProfile)
			teamProfile.deleteRecord();
		team.deleteRecord();
		return true;
	},

	memberJSON: function(member) {
		var json = {};
		json.member = {id: member.getValue(this.MEMBER)};
		json.state = this.util.idvalue(member, this.STATE);
		return json;
	},

	teamJSON: function(team) {
		var json = {};
		json.sys_id = team.getValue(this.SYS_ID);
		json.name = team.getDisplayValue(this.NAME);
		json.short_description = team.getDisplayValue(this.SHORT_DESCRIPTION);
		json.public_team = this.util.toBoolean(team.getValue(this.PUBLIC_GROUP));
		json.visible_team = this.util.toBoolean(team.getValue(this.VISIBLE_GROUP));
		json.sys_created_on = team.getDisplayValue(this.SYS_CREATED_ON);
		var image = team.getDisplayValue(this.PHOTO);
		if(!image)
			image = team.getDisplayValue(this.IMAGE);
		json.image = image;
		return json;
	},

	conversationJSON: function(conversation) {
		var json = {};
		json.sys_id = conversation.getValue(this.SYS_ID);
		json.name = conversation.getDisplayValue(this.NAME);
		json.short_description = conversation.getDisplayValue(this.SHORT_DESCRIPTION);
		json.public_conversation = this.util.toBoolean(conversation.getValue(this.PUBLIC_GROUP));
		json.visible_conversation = this.util.toBoolean(conversation.getValue(this.VISIBLE_GROUP));
		json.sys_created_on = conversation.getDisplayValue(this.SYS_CREATED_ON);
		var image = conversation.getDisplayValue(this.PHOTO);
		if(!image)
			image = conversation.getDisplayValue(this.IMAGE);
		json.image = image;
		return json;
	},
	/* public methods end } */

	type: 'LiveFeedTeam'
}