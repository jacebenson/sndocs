var LiveFeedFeed = Class.create();
LiveFeedFeed.prototype = {
	
	/* constants begin { */
	// role
	LIVE_FEED_ADMIN: "live_feed_admin",
	// tables
	LIVE_CONVERSATION: "live_group_profile",
	LIVE_CONVERSATION_MEMBER: "live_group_member",
	LIVE_FAVORITE: "live_favorite",
	LIVE_MESSAGE: "live_message",
	LIVE_MESSAGE_LIKE: "live_message_like",
	LIVE_PROFILE: "live_profile",
	LIVE_TEAM: "live_group_profile",
	LIVE_TEAM_MEMBER: "live_group_member",
	
	// fields
	CONVERSATION: "group",
	DOCUMENT: "document",
	DOCUMENT_CONVERSATION: "document_group",
	GROUP: "group",
	TEAM: "team",
	IMAGE: "image",
	MEMBER: "member",
	MEMBER_TYPE: "member_type",
	MESSAGE: "message",
	NAME: "name",
	NOTIFICATION: "notification",
	PHOTO: "photo",
	PUBLIC_CONVERSATION: "public_group",
	REPLY_TO: "reply_to",
	SHORT_DESCRIPTION: "short_description",
	STATE: "state",
	SYS_CREATED_ON: "sys_created_on",
	SYS_ID: "sys_id",
	TABLE: "table",
	TYPE: "type",
	USER: "user",
	VISIBLE_CONVERSATION: "visible_group",
	WORK_NOTES: "work_notes",
	
	// state values
	ADMIN: "admin",
	ACTIVE: "active",
	INACTIVE: "inactive",
	INVITED: "invited",
	REQUEST: "request",
	PUBLISHED: "published",
	
	// UI actions
	JOIN: "join",
	ACCEPT: "accept",
	REJECT: "reject",
	REVOKE_ADMIN: "revoke_admin",
	
	// constants
	TYPE_FEED: "group",
	/* constants end } */
	
	/* private methods begin { */
	_getMember: function(conversationId, memberId) {
		var member = new GlideRecord(this.LIVE_CONVERSATION_MEMBER);
		member.setWorkflow(false);
		member.addQuery(this.CONVERSATION, conversationId);
		member.addQuery(this.MEMBER, memberId);
		member.query();
		member.setWorkflow(true);
		if(member.next())
			return member;
	},
	
	_getConversation: function(conversationId) {
		var conversation = new GlideRecord(this.LIVE_CONVERSATION);
		conversation.setWorkflow(false);
		conversation.addQuery(this.util.SYS_ID, conversationId);
		conversation.query();
		conversation.setWorkflow(true);
		if(conversation.next())
			return conversation;
	},
	
	_getMemberType: function(memberId) {
		var member = new GlideRecord(this.LIVE_PROFILE);
		member.get(memberId);
		return member.getValue(this.TYPE);
	},
	
	_createMember: function(conversationId, memberId, state) {
		var member = new GlideRecord(this.LIVE_CONVERSATION_MEMBER);
		member.initialize();
		member.group = conversationId;
		member.member = memberId;
		member.state = state;
		var conversation = this.getConversation(conversationId);
		member.sys_domain = conversation.sys_domain;
		return member.insert();
	},
	
	_createSessionMember: function(conversationId, state) {
		return this._createMember(conversationId, this.getSessionProfile(), state);
	},
	
	_createConversation: function(name, description, public_conversation, visible_conversation) {
		if(public_conversation)
			visible_conversation = true;
		var gr = new GlideRecord(this.LIVE_CONVERSATION);
		gr.initialize();
		gr.type = this.TYPE_FEED;
		gr.name = name;
		gr.short_description = description;
		gr.public_group = public_conversation;
		gr.visible_group = visible_conversation;
		if(gr.canCreate()) {
			var conversationId = gr.insert();
			return conversationId;
		}
	},
	
	_updateConversation: function(conversationId, name, description, public_conversation, visible_conversation) {
		if(public_conversation)
			visible_conversation = true;
		var gr = this.getConversation(conversationId);
		if(!gr)
			return false;
		if(!this.isAdmin(conversationId)) {
			var errMsg = gs.getMessage("User is not admin");
			gs.addErrorMessage(errMsg);
			return false;
		}
		gr.name = name;
		gr.short_description = description;
		gr.public_group = public_conversation;
		gr.visible_group = visible_conversation;
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
	
	_getMemberCount: function(conversations) {
		var member = new GlideAggregate(this.LIVE_CONVERSATION_MEMBER);
		member.addAggregate(this.util.COUNT);
		member.addQuery(this.CONVERSATION, conversations);
		member.addQuery(this.MEMBER_TYPE, this.USER);
		member.addQuery(this.STATE, this._getVisibleStates());
		member.groupBy(this.CONVERSATION);
		member.query();
		return member;
	},

	_getPendingMemberCount: function(conversations) {
		var member = new GlideAggregate(this.LIVE_CONVERSATION_MEMBER);
		member.addAggregate(this.util.COUNT);
		member.addQuery(this.CONVERSATION, conversations);
		member.addQuery(this.MEMBER_TYPE, [this.USER, this.TEAM]);
		member.addQuery(this.STATE, this._getPendingStates());
		member.groupBy(this.CONVERSATION);
		member.query();
		return member;
	},
	
	_getMessageCount: function(conversations) {
		var member = new GlideAggregate(this.LIVE_MESSAGE);
		var wf = gs.getSession().setWorkflow(false);
		member.addAggregate(this.util.COUNT);
		member.addQuery(this.CONVERSATION, conversations);
		member.addNullQuery(this.REPLY_TO);
		member.addQuery(this.STATE, this.PUBLISHED);
		member.groupBy(this.CONVERSATION);
		member.query();
		gs.getSession().setWorkflow(wf);
		return member;
	},
	
	_getFavoriteConversations: function(conversations) {
		var favorite = new GlideRecord(this.LIVE_FAVORITE);
		favorite.addQuery(this.USER, this.getSessionProfile());
		favorite.addQuery(this.DOCUMENT, conversations);
		favorite.query();
		return favorite;
	},
	
	_getMembership: function(conversations) {
		var member = new GlideAggregate(this.LIVE_CONVERSATION_MEMBER);
		member.addQuery(this.CONVERSATION, conversations);
		member.addQuery(this.STATE, this._getVisibleStates());
		member.addQuery(this.MEMBER, this.getSessionProfile());
		member.query();
		return member;
	},
	
	_getAdminCount: function(conversationId) {
		var member = new GlideAggregate(this.LIVE_CONVERSATION_MEMBER);
		member.addAggregate(this.util.COUNT);
		member.addQuery(this.CONVERSATION, conversationId);
		member.addQuery(this.STATE, this.ADMIN);
		member.query();
		member.next();
		return member.getAggregate(this.util.COUNT);
	},

	_setNotificationForMember: function(conversationId, memberId, preference) {
		var member = this._getMember(conversationId, memberId);
		if(!member)
			return false;
		if(member.notification == preference)
			return false;
		member.notification = preference;
		member.update();
		return true;
	},

	_setNotification: function(conversationId, preference) {
		return this._setNotificationForMember(conversationId, this.getSessionProfile(), preference);
	},

	_setTeamNotification: function(conversationId, teamProfileId, preference) {
		return this._setNotificationForMember(conversationId, teamProfileId, preference);
	},
	
	_addSelfAndTeamMemberConversations: function(cond, profile) {
		var lfTeam = new LiveFeedTeam();
		var grpProfiles = lfTeam._getAllMemberTeamProfileIds(profile, this._getDetailsVisibleStatesStr());
		grpProfiles.push(profile);
		return cond.addCondition(this.MEMBER, this.util.IN, grpProfiles.join(','));
	},
	
	_adjustConversations: function(gr, profile) {
		var sq = new GlideSubQuery(this.LIVE_CONVERSATION_MEMBER, this.SYS_ID, this.CONVERSATION);
		this._addSelfAndTeamMemberConversations(sq, profile);
		sq.addCondition(this.STATE, this.util.IN, this._getVisibleStatesStr());
		var cond = gr.addQuery(this.VISIBLE_CONVERSATION,true);
		cond.addOrCondition(sq);
	},
	
	_adjustSessionConversations: function(gr) {
		if(gs.hasRole(this.LIVE_FEED_ADMIN))
			return;
		this._adjustConversations(gr, this.getSessionProfile());
	},
	
	_adjustSessionConversationMembers: function(gr) {
		if(gs.hasRole(this.LIVE_FEED_ADMIN))
			return;
		// Only see enrolled membership records
		gr.addQuery(this.STATE, this._getVisibleStates());
		// See members of all public conversations
		var sqg = gr.addJoinQuery(this.LIVE_CONVERSATION, this.CONVERSATION, this.SYS_ID);
		sqg.addCondition(this.VISIBLE_CONVERSATION,true);
		// See all members of all subscribed conversations
		var sqvg = new GlideSubQuery(this.LIVE_CONVERSATION_MEMBER, this.CONVERSATION, this.CONVERSATION);
		var profile = this.getSessionProfile();
		var lfTeam = new LiveFeedTeam();
		var grpProfiles = lfTeam._getAllMemberTeamProfileIds(profile, this._getDetailsVisibleStatesStr());
		grpProfiles.push(profile);
		sqvg.addCondition(this.MEMBER, this.util.IN, grpProfiles.join(','));
		sqg.addOrCondition(sqvg);
	},
	
	_getTeamMembers: function(conversationIds) {
		var gr = new GlideRecord(this.LIVE_CONVERSATION_MEMBER);
		gr.addQuery(this.CONVERSATION, conversationIds);
		gr.addQuery(this.MEMBER_TYPE, this.TEAM);
		gr.addQuery(this.state, this._getVisibleStatesStr());
		gr.query();
		return gr;
	},
	
	/* return conversation members that are teams : sys_ids from LIVE_PROFILE */
	_getVisibleTeamMembers: function(conversationIds) {
		var gr = this._getTeamMembers(conversationIds);
		var teamIds = [];
		while(gr.next()) {
			teamIds.push(gr.getValue(this.MEMBER));
		}
		if(teamIds.length == 0)
			return teamIds;
		var lfTeam = new LiveFeedTeam();
		teamIds = lfTeam._getVisibleTeamMemberIds(teamIds);
		return teamIds;
	},
	
	/* return conversation members that are teams : sys_ids from LIVE_PROFILE */
	_getMembershipTeamMembers: function(conversationIds) {
		var gr = this._getTeamMembers(conversationIds);
		var teamIds = [];
		while(gr.next()) {
			teamIds.push(gr.getValue(this.MEMBER));
		}
		if(teamIds.length == 0)
			return teamIds;
		var lfTeam = new LiveFeedTeam();
		teamIds = lfTeam._getMembershipTeamMemberIds(teamIds);
		return teamIds;
	},
	
	/* return conversation members that are teams : sys_ids from LIVE_USER_GROUP */
	_getVisibleTeams: function(conversationIds, states) {
		var gr = this._getTeamMembers(conversationIds);
		var teamIds = [];
		while(gr.next()) {
			teamIds.push(gr.getValue(this.MEMBER));
		}
		if(teamIds.length == 0)
			return teamIds;
		var lfTeam = new LiveFeedTeam();
		teamIds = lfTeam._getVisibleTeamIds(teamIds, states);
		return teamIds;
	},
	
	/* return conversation members that are teams : sys_ids from LIVE_USER_GROUP */
	_getMembershipTeams: function(conversationIds) {
		var gr = this._getTeamMembers(conversationIds);
		var teamIds = [];
		while(gr.next()) {
			teamIds.push(gr.getValue(this.MEMBER));
		}
		if(teamIds.length == 0)
			return teamIds;
		var lfTeam = new LiveFeedTeam();
		teamIds = lfTeam._getMembershipTeamIds(teamIds);
		return teamIds;
	},
	
	/*
	* Given a set of conversations
	* get all the visible teams which are members of the conversations
	* and return their conversation membership
	*/
	_getTeamMembership: function(conversationIds) {
		var teamMembers = this._getMembershipTeamMembers(conversationIds);
		var gr = new GlideRecord(this.LIVE_CONVERSATION_MEMBER);
		gr.addQuery(this.CONVERSATION, conversationIds);
		gr.addQuery(this.MEMBER, teamMembers);
		gr.addQuery(this.MEMBER_TYPE, this.TEAM);
		gr.query();
		return gr;
	},
	
	_inviteTeamToDocumentConversation: function(conversationId, memberId) {
		var lfTeam = new LiveFeedTeam();
		var teamId = lfTeam._convertProfileToTeamId([memberId]);
		if(teamId.length == 0)
			return false;
		teamId = teamId[0][1];
		var params = { team : teamId };
		params.state = this._getDetailsVisibleStates();
		params[this.util.ORDER_BY] = [];
		var teamMembers = lfTeam.getMembers(params);
		var count = 0;
		while(teamMembers.next()) {
			if(teamMembers.state == this.REQUEST)
				continue;
			var member = this._getMember(conversationId, teamMembers.member);
			if(member) {
				if(member.state == this.REQUEST)
					member.state = this.ACTIVE;
				else if(member.state == this.INACTIVE)
					member.state = this.INVITED;
				else
					continue;
				count++;
				member.update();
			} else {
				this._createMember(conversationId, teamMembers.member, this.INVITED);
				count++;
			}
		}
		var msg = gs.getMessage("{0} members added to the conversation", count.toString());
		gs.addInfoMessage(msg);
		return count > 0;
	},
	
	_canAccessWorkNotes: function(conversation) {
		var gr = new GlideRecord(conversation.table);
		if(!gr.isValid())
			return false;
		gr.get(conversation.document);
		if(gr.isValidField(this.WORK_NOTES))
			return gr.getElement(this.WORK_NOTES).canWrite();
		return false;
	},
	
	_canReadDocument: function(conversation) {
		var gr = new GlideRecord(conversation.table);
		if(gr.isValid() && gr.get(conversation.document))
			return gr.canRead();
		return false;
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
	
	/* TODO: get rid of this backward compatible method */
	getMembership: function(conversationId, profileId) {
		var gr = new GlideRecord(this.LIVE_CONVERSATION_MEMBER);
		gr.addQuery(this.CONVERSATION, conversationId);
		gr.addQuery(this.MEMBER, profileId);
		gr.query();
		gr.next();
		return {state: gr.getValue(this.STATE), document_conversation: gr.getDisplayValue('group.document_group')};
	},
	
	createConversation: function(params) {
		if(!params.name) {
			var errMsg = gs.getMessage("Live Feed Conversation name is required");
			gs.addErrorMessage(errMsg);
			return;
		}
		var name = params.name;
		var short_description = params.short_description;
		var public_conversation = params.public_conversation;
		var visible_conversation = params.visible_conversation;
		var conversationId = this._createConversation(name, short_description, public_conversation, visible_conversation);
		if(params.team) {
			var lfug = new LiveFeedTeam();
			var teamProfileId = lfug._getTeamProfileId(params.team);
			if(teamProfileId)
				this.invite(conversationId, teamProfileId);
		}
		return conversationId;
	},
	
	updateConversation: function(data) {
		if(!data.name) {
			var errMsg = gs.getMessage("Live Feed Conversation name is required");
			gs.addErrorMessage(errMsg);
			return false;
		}
		return this._updateConversation(data.sys_id, data.name, data.short_description, data.public_conversation, data.visible_conversation);
	},
	
	getConversation: function(conversationId) {
		var gr = new GlideRecord(this.LIVE_CONVERSATION);
		gr.get(conversationId);
		return gr;
	},
	
	/* membership actions begin { */
	requestDocumentConversation: function(conversation) {
		var canReadDocument = this._canReadDocument(conversation);
		if(!conversation.visible_group && !canReadDocument) {
			var errMsg = gs.getMessage("This conversation can only be joined by invitation");
			gs.addErrorMessage(errMsg);
			return false;
		}
		var conversationId = conversation.sys_id;
		var canAccessWorkNotes = this._canAccessWorkNotes(conversation);
		var state = this.REQUEST;
		if(canAccessWorkNotes)
			state = this.ADMIN;
		else if(canReadDocument)
			state = this.ACTIVE;
		var member = this._getMember(conversationId, this.getSessionProfile());
		if(member) {
			if(member.state != this.INACTIVE)
				return false;
			member.state = state;
			member.update();
			return true;
		}
		return this._createSessionMember(conversationId, state);
	},
	
	join: function(conversationId) {
		var conversation = this._getConversation(conversationId);
		if(conversation.document_group)
			return this.requestDocumentConversation(conversation);
		var state = this.REQUEST;
		if(conversation.public_group)
			state = this.ACTIVE;
		else if(!conversation.visible_group  && !gs.hasRole(this.LIVE_FEED_ADMIN)) {
			var errMsg = gs.getMessage("This conversation can only be joined by invitation");
			gs.addErrorMessage(errMsg);
			return false;
		}
		var member = this._getMember(conversationId, this.getSessionProfile());
		if(member) {
			if(member.state == this.INACTIVE) {
				member.state = state;
				member.update();
			}
			else
				return false;
		}
		else {
			this._createSessionMember(conversationId, state);
		}
		return true;
	},
	
	leave: function(conversationId) {
		var member = this._getMember(conversationId, this.getSessionProfile());
		if(!member)
			return false;
		var conversation = this.getConversation(conversationId);
		if(!conversation.document_group && member.state == this.ADMIN) {
			var adminCount = this._getAdminCount(conversationId);
			// single admin cannot leave the conversation
			if(adminCount == 1) {
				var errMsg = gs.getMessage("At least one administrator needed to manage the conversation");
				gs.addErrorMessage(errMsg);
				return false;
			}
		}
		member.state = this.INACTIVE;
		member.update();
		return true;
	},
	
	request: function(conversationId) {
		var conversation = this.getConversation(conversationId);
		if(conversation.document_group)
			return this.requestDocumentConversation(conversation);
		if(!conversation.visible_group && !gs.hasRole(this.LIVE_FEED_ADMIN)) {
			var errMsg = gs.getMessage("This conversation can only be joined by invitation");
			gs.addErrorMessage(errMsg);
			return false;
		}
		var member = this._getMember(conversationId, this.getSessionProfile());
		var state = this.REQUEST;
		if(conversation.public_group)
			state = this.ACTIVE;
		if(member) {
			if(member.state != this.INACTIVE)
				return false;
			member.state = state;
			member.update();
			return true;
		}
		return this._createSessionMember(conversationId, state);
	},
	
	
	acceptDocumentConversation: function(conversation) {
		var conversationId = conversation.sys_id;
		var canAccessWorkNotes = this._canAccessWorkNotes(conversation);
		var state = this.ACTIVE;
		if(canAccessWorkNotes)
			state = this.ADMIN;
		var member = this._getMember(conversationId, this.getSessionProfile());
		if(member) {
			if(member.state != this.INVITED)
				return false;
			member.state = state;
			member.update();
			return true;
		}
	},
	
	acceptInvitation: function(conversationId) {
		var conversation = this.getConversation(conversationId);
		if(conversation.document_group)
			return this.acceptDocumentConversation(conversation);
		var member = this._getMember(conversationId, this.getSessionProfile());
		if(!member)
			return false;
		if(member.state != this.INVITED)
			return false;
		member.state = this.ACTIVE;
		member.update();
		return true;
	},
	
	rejectInvitation: function(conversationId) {
		var member = this._getMember(conversationId, this.getSessionProfile());
		if(!member)
			return false;
		if(member.state != this.INVITED)
			return false;
		member.state = this.INACTIVE;
		member.update();
		return true;
	},
	
	teamJoin: function(conversationId, teamProfileId) {
		var conversation = this.getConversation(conversationId);
		var state = this.REQUEST;
		if(conversation.public_group)
			state = this.ACTIVE;
		else if(!conversation.visible_group)
			return false;
		var member = this._getMember(conversationId, teamProfileId);
		if(member) {
			if(member.state == this.INACTIVE) {
				member.state = state;
				member.update();
			}
			else
				return false;
		}
		else {
			this._createMember(conversationId, teamProfileId, state);
		}
		return true;
	},
	
	teamLeave: function(conversationId, teamProfileId) {
		var member = this._getMember(conversationId, teamProfileId);
		if(!member)
			return;
		var conversation = this.getConversation(conversationId);
		member.state = this.INACTIVE;
		member.update();
		return true;
	},
	
	teamRequest: function(conversationId, teamProfileId) {
		var conversation = this.getConversation(conversationId);
		if(!conversation.visible_group) {
			var errMsg = gs.getMessage("This conversation can only be joined by invitation");
			gs.addErrorMessage(errMsg);
			return false;
		}
		var member = this._getMember(conversationId, this.getSessionProfile());
		var state = this.REQUEST;
		if(conversation.public_group)
			state = this.ACTIVE;
		if(member) {
			if(member.state != this.INACTIVE)
				return false;
			member.state = state;
			member.update();
			return true;
		}
		return this._createMember(conversationId, teamProfileId, state);
	},
	
	acceptTeamInvitation: function(conversationId, teamProfileId) {
		var member = this._getMember(conversationId, teamProfileId);
		if(!member)
			return false;
		if(member.state != this.INVITED)
			return false;
		member.state = this.ACTIVE;
		member.update();
		return true;
	},
	
	rejectTeamInvitation: function(conversationId, teamProfileId) {
		var member = this._getMember(conversationId, teamProfileId);
		if(!member)
			return false;
		if(member.state != this.INVITED)
			return false;
		member.state = this.INACTIVE;
		member.update();
		return true;
	},
	
	updateMyMembership: function(conversationId, membership) {
		if(membership === this.JOIN)
			this.join(conversationId);
		else if(membership === this.INACTIVE)
			this.leave(conversationId);
		else if(membership === this.REQUEST)
			this.request(conversationId);
		else if(membership === this.ACCEPT)
			this.acceptInvitation(conversationId);
		else if(membership === this.REJECT)
			this.rejectInvitation(conversationId);
		var member = this._getMember(conversationId, this.getSessionProfile());
		return member.getValue(this.STATE);
	},
	
	invite: function(conversationId, memberId) {
		if(!this.isAdmin(conversationId))
			return false;
		var conversation = this.getConversation(conversationId);
		var member = this._getMember(conversationId, memberId);
		var memberType = this._getMemberType(memberId);
		if(conversation.document_group && memberType == this.TEAM) {
			return this._inviteTeamToDocumentConversation(conversationId, memberId);
		}
		var state = this.INVITED;
		if(memberType === this.TEAM) {
			var lfTeam = new LiveFeedTeam();
			var teamId = lfTeam._convertProfileToTeamId([memberId]);
			teamId = teamId[0][1];
			if(lfTeam.isAdmin(teamId))
				state = this.ACTIVE;
		}
		if(member) {
			if(member.state == this.REQUEST) {
				member.state = this.ACTIVE;
			}
			else if(member.state != this.INACTIVE) {
				var errMsg = "";
				if(memberType === this.USER) {
					errMsg = gs.getMessage("User is already a member of the conversation");
					gs.addErrorMessage(errMsg);
				}
				else if(memberType === this.TEAM) {
					errMsg = gs.getMessage("Team is already a member of the conversation");
					gs.addErrorMessage(errMsg);
				}
				else {
					errMsg = gs.getMessage("Unknown member type");
					gs.addErrorMessage(errMsg);
				}
				return false;
			}
			member.state = state;
			member.update();
			return true;
		}
		return this._createMember(conversationId, memberId, state);
	},
	
	acceptRequest: function(conversationId, memberId) {
		if(!this.isAdmin(conversationId))
			return false;
		var member = this._getMember(conversationId, memberId);
		if(!member)
			return false;
		if(member.state != this.REQUEST)
			return false;
		member.state = this.ACTIVE;
		member.update();
		return true;
	},
	
	rejectRequest: function(conversationId, memberId) {
		if(!this.isAdmin(conversationId))
			return false;
		var member = this._getMember(conversationId, memberId);
		if(!member)
			return false;
		if(member.state != this.REQUEST)
			return false;
		member.state = this.INACTIVE;
		member.update();
		return true;
	},
	
	grantAdmin: function(conversationId, memberId) {
		if(!this.isAdmin(conversationId))
			return false;
		var conversation = this.getConversation(conversationId);
		if(conversation.document_group)
			return false;
		var member = this._getMember(conversationId, memberId);
		if(!member)
			return false;
		if(this._getMemberType(memberId) == this.GROUP)
			return false;
		member.state = this.ADMIN;
		member.update();
		return true;
	},
	
	revokeAdmin: function(conversationId, memberId) {
		if(!this.isAdmin(conversationId))
			return false;
		var conversation = this.getConversation(conversationId);
		if(!conversation.document_group) {
			var adminCount = this._getAdminCount(conversationId);
			// single admin cannot leave the conversation
			if(adminCount == 1) {
				var errMsg = gs.getMessage("At least one administrator needed to manage the live feed user conversation");
				gs.addErrorMessage(errMsg);
				return false;
			}
		}
		var member = this._getMember(conversationId, memberId);
		if(!member)
			return false;
		member.state = this.ACTIVE;
		member.update();
		return true;
	},

	removeConversationMember: function (conversationId, memberId) {
		if (!this.isAdmin(conversationId))
			return false;
		var member = this._getMember(conversationId, memberId);
		if(!member)
			return false;
		if(member.state == this.ADMIN) {
			if(this._getAdminCount(conversationId) == 1)
				return false;
		}
		member.state = this.INACTIVE;
		member.update();
		return true;
	},
	
	administrateMembership: function(conversationId, memberId, membership) {
		if(membership === this.INVITED)
			this.invite(conversationId, memberId);
		else if(membership === this.ACCEPT)
			this.acceptRequest(conversationId, memberId);
		else if(membership === this.REJECT)
			this.rejectRequest(conversationId, memberId);
		else if(membership == this.ADMIN)
			this.grantAdmin(conversationId, memberId);
		else if(membership == this.REVOKE_ADMIN)
			this.revokeAdmin(conversationId, memberId);
		var member = this._getMember(conversationId, memberId);
		if(member)
			return member.getValue(this.STATE);
	},
	/* membership actions end } */
	
	subscribe: function(conversationId) {
		return this._setNotification(conversationId, true);
	},
	
	unsubscribe: function(conversationId) {
		return this._setNotification(conversationId, false);
	},
	
	setNotificationPreference: function(conversationId, notification) {
		if(notification)
			this.subscribe(conversationId);
		else
			this.unsubscribe(conversationId);
	},

	setTeamNotificationPreference: function(conversationId, teamProfileId, notification) {
		return this._setTeamNotification(conversationId, teamProfileId, notification);
	},
	
	favorite: function(conversationId) {
		var favorite = new LiveFeedFavorite();
		return favorite.favorite(this.LIVE_CONVERSATION, conversationId);
	},
	
	unfavorite: function(conversationId) {
		var favorite = new LiveFeedFavorite();
		return favorite.unfavorite(this.LIVE_CONVERSATION, conversationId);
	},
	
	adjustSessionConversations: function(gr) {
		this._adjustSessionConversations(gr);
	},
	
	adjustSessionConversationMembers: function(gr) {
		this._adjustSessionConversationMembers(gr);
	},
	
	getConversations: function(params) {
		if(!params)
			params = {};
		
		/* This is a special case to support glide.live_feed.auto_join_document_group = false */
		if(typeof params.sys_id === 'string') {
			var gr = this._getConversation(params.sys_id);
			if(gr.document_group) {
				if(gr.visible_group || this._canReadDocument(gr)) {
					gr = new GlideRecord(this.LIVE_CONVERSATION);
					gr.setWorkflow(false);
					gr.addQuery(this.util.SYS_ID, params.sys_id);
					gr.query();
					return gr;
				}
			}
		}
		
		var conversations = new GlideRecord("live_group_profile");
		conversations.addQuery(this.TYPE, "!=", "team");
		
		var view_profile = params.profile_id || this.getSessionProfile();
		
		// for security
		this._adjustSessionConversations(conversations);
		
		// for user profile being viewed
		if(view_profile !== this.getSessionProfile())
			this._adjustConversations(conversations, view_profile);
		
		this.util.addQueryParam(conversations, this.util.SYS_ID, params.sys_id);
		if(params.favorite) {
			var fqc = conversations.addJoinQuery(this.LIVE_FAVORITE, this.SYS_ID, this.DOCUMENT);
			fqc.addCondition(this.USER, this.util.EQUALS, this.getSessionProfile());
		}
		this.util.addBooleanQueryParam(conversations, this.PUBLIC_CONVERSATION, params.public_conversation);
		if(params.member_conversations) {
			var mqc = conversations.addJoinQuery(this.LIVE_CONVERSATION_MEMBER, this.SYS_ID, this.CONVERSATION);
			this._addSelfAndTeamMemberConversations(mqc, view_profile);
			if(params.membership_type)
				this.util.addCondition(mqc, this.STATE, params.membership_type);
			else
				mqc.addCondition(this.STATE, this.util.IN, this._getVisibleStatesStr());
		} else if(params.membership_type) {
			var mqc = conversations.addJoinQuery(this.LIVE_CONVERSATION_MEMBER, this.SYS_ID, this.CONVERSATION);
			mqc.addCondition(this.MEMBER, view_profile);
			this.util.addCondition(mqc, this.STATE, params.membership_type);
		}
		if(params[this.util.TEXTQUERY]) {
			var qc = this.util.addExpressionQuery(conversations, this.NAME, params);
			this.util.addExpressionOrCondition(qc, this.SHORT_DESCRIPTION, params);
		}
		this.util.addBooleanQueryParam(conversations, this.DOCUMENT_CONVERSATION, params.document_conversation);
		var orderBy = [this.NAME];
		this.util.setOrderBy(conversations,params,orderBy);
		this.util.setLimit(conversations,params);
		conversations.query();
		return conversations;
	},
	
	getConversationsJSON: function(params) {
		if(!params)
			params = {};
		this.util.defaultQueryLimit(params);
		var conversations = this.getConversations(params);
		var that = this;
		var json = this.util.listJSON(conversations, function(conversation) { return that.conversationJSON(conversation); }, params);
		if(json.length === 0)
			return { more: false, conversations: json };
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
				var favorites = this._getFavoriteConversations(ids);
				while(favorites.next()) {
					var id = favorites.document;
					hjson[id].favorite = true;
				}
			}
		}
		if(params.membership) {
			var membership = this._getMembership(ids);
			while(membership.next()) {
				var conversation = membership.getValue(this.GROUP);
				var state = membership.getValue(this.STATE);
				hjson[conversation].membership = state;
				hjson[conversation].notification = this.util.toBoolean(membership.getValue(this.NOTIFICATION));
			}
			membership = this._getTeamMembership(ids);
			var p2g = {};
			while(membership.next()) {
				var conversation = membership.getValue(this.CONVERSATION);
				var state = membership.getValue(this.STATE);
				var teamProfile = membership.getValue(this.MEMBER);
				p2g[teamProfile] = -1;
				var teamName = membership.getDisplayValue(this.MEMBER);
				if(!hjson[conversation].membership_via_team)
					hjson[conversation].membership_via_team = [];
				var teamMembership = { };
				teamMembership.team = teamProfile;
				teamMembership.name = teamName;
				teamMembership.state = state;
				teamMembership.notification = this.util.toBoolean(membership.getValue(this.NOTIFICATION));
				hjson[conversation].membership_via_team.push(teamMembership);
			}
			var lfug = new LiveFeedTeam();
			var teamProfileIds = [];
			for(var p in p2g)
				teamProfileIds.push(p);
			var gpIds = lfug._convertProfileToTeamId(teamProfileIds);
			var teamIds = [];
			for(var i=0;i<gpIds.length;i++) {
				p2g[gpIds[i][0]] = gpIds[i][1];
				teamIds.add(gpIds[i][1]);
			}
			var teams = lfug.getTeamsJSON({ sys_id: teamIds, membership : true });
			teams = this.util.listToHashJSON(teams.teams);
			for(var conversation in hjson) {
				var cjson = hjson[conversation];
				if(!cjson.membership_via_team)
					continue;
				for(var i=0;i<cjson.membership_via_team.length;i++) {
					cjson.membership_via_team[i].team = p2g[cjson.membership_via_team[i].team];
					cjson.membership_via_team[i].team_membership = teams[cjson.membership_via_team[i].team].membership;
				}
			}
		}
		if (params.extended_stats) {
			var pendingMemberCount = this._getPendingMemberCount(ids);
			while(pendingMemberCount.next()) {
				var id = pendingMemberCount.getValue(this.CONVERSATION);
				if(!hjson[id].metrics)
					hjson[id].metrics = {};
				hjson[id].metrics.pending_member_count = pendingMemberCount.getAggregate(this.util.COUNT);
			}
		}
		if(params.stats) {
			var memberCount = this._getMemberCount(ids);
			while(memberCount.next()) {
				var id = memberCount.getValue(this.CONVERSATION);
				if(!hjson[id].metrics)
					hjson[id].metrics = {};
				hjson[id].metrics.member_count = memberCount.getAggregate(this.util.COUNT);
			}
			var messageCount = this._getMessageCount(ids);
			while(messageCount.next()) {
				var id = messageCount.getValue(this.CONVERSATION);
				if(!hjson[id].metrics)
					hjson[id].metrics = {};
				hjson[id].metrics.message_count = messageCount.getAggregate(this.util.COUNT);
			}
		}
		json = { more: conversations.hasNext(), conversations: json };
		return json;
	},
	
	getMembers: function(params) {
		if(!params)
			params = {};
		if(!params.conversation)
			return;
		var members = new GlideRecord(this.LIVE_CONVERSATION_MEMBER);
		members.addQuery(this.CONVERSATION, params.conversation);
		
		if (params.member_type === this.USER) {
			members.addQuery(this.MEMBER_TYPE, this.USER);
		} else if (params.member_type === this.TEAM) {
			var visibleTeams = this._getVisibleTeamMembers(params.conversation);	
			members.addQuery(this.MEMBER, this.util.IN, visibleTeams);
		} else if (!params.member_type && !gs.hasRole(this.LIVE_FEED_ADMIN)) {
			var qc = members.addQuery(this.MEMBER_TYPE, this.USER);
			var visibleTeams = this._getVisibleTeamMembers(params.conversation);
			members.appendOrQuery(qc, this.MEMBER, this.util.IN, visibleTeams);
		}
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
		var grpProfiles = [];
		for(var i=0;i<json.length;i++) {
			if(json[i].type.id === 'team') {
				grpProfiles.push(json[i].member.id);
			}
		}
		if(grpProfiles.length > 0) {
			var hjson = {};
			for(var i=0;i<json.length;i++) {
				hjson[json[i].member.id] = json[i];
			}
			var lfTeam = new LiveFeedTeam();
			var teams = lfTeam._convertProfileToTeamId(grpProfiles);
			var teamIds = [];
			var g2p = {};
			for(var i=0;i<teams.length;i++) {
				teamIds.push(teams[i][1]);
				g2p[teams[i][1]] = teams[i][0];
			}
			var team_params = {};
			team_params.sys_id = teamIds;
			team_params.membership = true;
			team_params[this.util.QUERY_LIMIT] = teams.length;
			team_params.stats = true;
			var _teams = lfTeam.getTeamsJSON(team_params);
			_teams = _teams.teams;
			for(var i=0;i<_teams.length;i++) {
				var memberId = g2p[_teams[i].sys_id];
				hjson[memberId].team = _teams[i];
			}
		}
		var api = new SNC.LiveFeedApi();
		var ids = [];
		for(var i=0;i<json.length;i++)
			ids.push(json[i].member.id);
		var memberDetails = this.util.getMemberDetails(ids);
		for(var i=0;i<ids.length;i++) {
			var details = memberDetails[ids[i]];
			if(!details)
				continue;
			json[i].member.name = details.name;
			json[i].member.status = details.status;
			json[i].member.image = details.image;
		}
		for(var i=0;i<json.length;i++)
			json[i].member.initials = api.getInitials(json[i].member.name);
		json = { more: members.hasNext(), members: json };
		return json;
	},
	
	getAllMembers: function(params) {
		if(!params)
			params = {};
		if(!params.conversation)
			return;
		var members = new GlideRecord(this.LIVE_CONVERSATION_MEMBER);
		var lfTeam = new LiveFeedTeam();
		var teamIds = this._getVisibleTeams([params.conversation],this._getDetailsVisibleStates());
		teamIds.push(params.conversation);
		members.addQuery(this.GROUP, teamIds);
		members.addQuery(this.STATE, this.util.IN, this._getDetailsVisibleStatesStr());
		this.util.addQueryParam(members, this.MEMBER_TYPE, params[this.MEMBER_TYPE]);
		if(params[this.util.TEXTQUERY]) {
			this.util.addExpressionQuery(members, "member.name", params);
		}
		var orderBy = ["member.name"];
		this.util.setOrderBy(members,params,orderBy);
		this.util.setLimit(members,params);
		members.query();
		return members;
	},
	
	getAllMembersJSON: function(params) {
		if(!params)
			params = {};
		var members = this.getAllMembers(params);
		this.util.defaultQueryLimit(params);
		var limit = params[this.util.QUERY_LIMIT];
		var json = [];
		var more = false;
		while(members.next()) {
			if(json.length == 0) {
				var mjson = {};
				mjson.member = this.util.idvalue(members, this.MEMBER);
				if(members.getValue(this.CONVERSATION) === params.conversation)
					mjson.state = this.util.idvalue(members, this.STATE);
				mjson.type = this.util.choicevalue(members, this.MEMBER_TYPE);
				json.push(mjson);
			}
			else {
				var pi = json.length-1;
				if(json[pi].member.id === members.getValue(this.MEMBER)) {
					if(members.getValue(this.CONVERSATION) === params.conversation)
						json[pi].state = this.util.idvalue(members, this.STATE);
				}
				else {
					if(json.length === limit) {
						more = true;
						break;
					}
					var mjson = {};
					mjson.member = this.util.idvalue(members, this.MEMBER);
					if(members.getValue(this.CONVERSATION) === params.conversation)
						mjson.state = this.util.idvalue(members, this.STATE);
					mjson.type = this.util.choicevalue(members, this.MEMBER_TYPE);
					json.push(mjson);
				}
			}
		}
		return { more: more, members: json };
	},
	
	getConversationAdmins: function(conversationId) {
		return this.getMembers({ conversation : conversationId , state : this.ADMIN });
	},
	
	getConversationNotificationUsers: function(conversationId) {
		return this.getMembers({ conversation : conversationId, notification: true });
	},

	getConversationNotificationAdmins: function(conversationId) {
		return this.getMembers({ conversation: conversationId, state: this.ADMIN, notification: true});
	},

	getConversationNotificationUsersById: function(conversationId, adminsOnly) {
		var mr;
		if(adminsOnly)
			mr = this.getConversationNotificationAdmins(conversationId);
		else
			mr = this.getConversationNotificationUsers(conversationId);
		var members = [];
		while(mr.next()) {
			if (mr.getValue(this.MEMBER_TYPE) == 'user') {
				members.push(mr.member.document);
			}
			else if(mr.getValue(this.MEMBER_TYPE) == 'team') {
				var indirectMembers = new LiveFeedTeam().getTeamNotificationUsersById(mr.member.document);
				members = members.concat(indirectMembers);
			}
		}
		var uniqueMembers = {};
		for(var i=0;i<members.length;i++) {
			uniqueMembers[members[i]] = 1;
		}
		members = [];
		for (var key in uniqueMembers)
			members.push(key);
		return members;
	},

	isAdmin: function(conversationId) {
		if(gs.hasRole(this.LIVE_FEED_ADMIN))
			return true;
		var members = this.getMembers({ conversation: conversationId, memberId: this.getSessionProfile(), state: this.ADMIN});
		members.query();
		return members.next();
	},

	canCreate: function() {
		var gr = new GlideRecord(this.LIVE_CONVERSATION);
		gr.type = this.TYPE_FEED;
		return gr.canCreate();
	},
	
	canView: function(conversation) {
		if(gs.hasRole(this.LIVE_FEED_ADMIN))
			return true;
		if(conversation.public_group)
			return true;
		if(conversation.visible_group)
			return true;
		if(this._getMember(conversation.sys_id,this.getSessionProfile()))
			return true;
		if(conversation.document_group) {
			var gr = new GlideRecord(conversation.getValue(this.TABLE));
			if(gr.get(conversation.getValue(this.DOCUMENT)))
				if(gr.canRead())
				return true;
		}
	},
	
	deleteConversationMembers: function(conversationId) {
		var members = this.getMembers({ conversation: conversationId });
		members.query();
		while(members.next()) {
			members.deleteRecord();
		}
	},
	
	deleteConversationMessages: function(conversationId) {
		if(!conversationId)
			return;
		var messages = new GlideRecord(this.LIVE_MESSAGE);
		messages.addQuery(this.CONVERSATION, conversationId);
		messages.query();
		while(messages.next()) {
			messages.deleteRecord();
		}
	},
	
	deleteMessageLike: function(messageId) {
		var md = new GlideMultipleDelete(this.LIVE_MESSAGE_LIKE);
		md.addQuery(this.MESSAGE, messageId);
		md.execute();
	},
	
	deleteConversation: function(conversationId) {
		if(!this.isAdmin(conversationId))
			return false;
		var conversation = this.getConversation(conversationId);
		if(!conversation.isValidRecord())
			return false;
		conversation.deleteRecord();
		return true;
	},
	
	memberJSON: function(member) {
		var json = {};
		json.member = {id: member.getValue(this.MEMBER)};
		json.state = this.util.idvalue(member, this.STATE);
		json.type = this.util.choicevalue(member, this.MEMBER_TYPE);
		return json;
	},
	
	conversationJSON: function(conversation) {
		var json = {};
		json.sys_id = conversation.getValue(this.SYS_ID);
		json.name = conversation.getDisplayValue(this.NAME);
		json.short_description = conversation.getDisplayValue(this.SHORT_DESCRIPTION);
		json.public_conversation = this.util.toBoolean(conversation.getValue(this.PUBLIC_CONVERSATION));
		json.visible_conversation = this.util.toBoolean(conversation.getValue(this.VISIBLE_CONVERSATION));
		json.document_conversation = this.util.toBoolean(conversation.getValue(this.DOCUMENT_CONVERSATION));
		json.sys_created_on = conversation.getDisplayValue(this.SYS_CREATED_ON);
		if(json.document_conversation) {
			var gr = new GlideRecord(conversation.getValue(this.TABLE));
			json.document = {};
			if(gr.isValid() && gr.get(conversation.getValue(this.DOCUMENT))) {
				json.document.table = conversation.getValue(this.TABLE);
				json.document.table_name = gr.getLabel();
				json.document.sys_id = conversation.getValue(this.DOCUMENT);
				json.document.canRead = true;
				if(gr.isValidField(this.WORK_NOTES))
					json.document.canWriteWorkNotes = gr.getElement(this.WORK_NOTES).canWrite();
			}
			else {
				json.document.canRead = false;
				json.document.table = conversation.getValue(this.TABLE);
				json.document.sys_id = conversation.getValue(this.DOCUMENT);
				json.document.canWriteWorkNotes = false;
			}
		}
		var image = conversation.getDisplayValue(this.PHOTO);
		if(!image)
			image = conversation.getDisplayValue(this.IMAGE);
		json.image = image;
		return json;
	},
	/* public methods end } */
	
	type: 'LiveFeedFeed'
};