var LiveFeedAjaxProcessor = Class.create();
LiveFeedAjaxProcessor.prototype = Object.extendsObject(AbstractScriptProcessor, {
	SYSPARM_ARGS: 'sysparm_args',
	SYSPARM_DATA: 'sysparm_data',
	ACTION_GET: 'GET',
	ACTION_INSERT: 'INSERT',
	ACTION_UPDATE: 'UPDATE',
	ACTION_DELETE: 'DELETE',

	EMAIL_PREFERENCE: 'EMAIL_PREFERENCE',
	CONVERSATION_EMAIL_PREFERENCE: 'CONVERSATION_EMAIL_PREFERENCE',
	FAVORITE: 'FAVORITE',
	LIKE: 'LIKE',
	ADMIN_MEMBERSHIP: 'ADMIN_MEMBERSHIP',
	MEMBERSHIP: 'MEMBERSHIP',
	CONVERSATION_MEMBERSHIP: 'CONVERSATION_MEMBERSHIP',
	INVALID_INTENTION: 'Invalid intention',
	INVALID_TASK: 'Invalid task',
	LAST_FETCHED_TIME: 'last_fetched_time',
	UI_NOTIFICATION: '$$uiNotification',
	LIVE_PROFILE: 'live_profile',
	DOCUMENT: 'document',
	
	// tasks
	TASK_FOLLOW: "follow",
	TASK_UNFOLLOW: "unfollow",
	TASK_BASIC: 'BASIC',
	TASK_REMOVE: 'REMOVE',
	TASK_CLOSE_POLL: 'CLOSE_POLL',
	TASK_CAST_VOTE: 'CAST_VOTE',
	TASK_TAG_DELETE: 'TAG_DELETE',
	TASK_TAG_ADD: 'TAG_ADD',
	TASK_RENAME_TAG: 'RENAME_TAG',

	initialize: function(request, response, processor) {
		AbstractScriptProcessor.prototype.initialize.call(this, request, response, processor);//Super call
		var payload = request.getParameter(this.SYSPARM_ARGS);
		if(!payload)
			payload = {};
		this.args = new JSON().decode(payload);
		this.isBatchMode = (this.request.getHeader('X-Mode') + '') === 'batch';
		this.contexts = {};
		this.liveFeedApi = new SNC.LiveFeedApi();
	},
	
	addServerContext: function(key, value) {
		this.contexts[key] = value;
	},

	hasUiNotifications: function() {
		return gs.getErrorMessages().size() > 0 || 
				gs.getInfoMessages().size() > 0  || 
				gs.getTrivialMessages().size() > 0;
	},

	flattenSearchPayload: function(args) {
		if (args.search) {
			for (var key in args.search)
				args[key] = args.search[key];
			args.search_mode = true;
		}
		return args;
	},

	_processStateSearch: function(args) {
		if (args.search && args.search.state && args.state) {
			// Unlike other params which act as filters and restrict the results,
			// state param acts as enabler. Every additional value in it actually
			// includes more results. So, when this is provided in search we should
			// take an intersection of two sets - state and search.state (always a single string).
			var arrUtil = new ArrayUtil();
			var searchState = args.search.state;
			var intersect = true;
			if (args.state instanceof Array) {
				if (arrUtil.indexOf(args.state, searchState) === -1)
					intersect = false;
			} else if (args.state !== searchState) { // The args.state is string
				intersect = false;
			}
			return !intersect; // They do not intersect so no use is querying, return no results.
		}
		return false;
	},

	action_getUserId: function(){
		if(this.args.intention === this.ACTION_GET){
			var json = {sys_id: gs.getUserID()};
			return json;
		}
		throw this.INVALID_INTENTION;
	},
	
	action_SessionProfile: function(){
		if(this.args.intention === this.ACTION_GET) {
			var profileId = new GlideappLiveProfile().getID();
			var liveProfile = new LiveFeedProfile(profileId);
			var json = liveProfile.getFullDetails();
			var acls = {};
			acls.team_create = new LiveFeedTeam().canCreate();
			acls.conversation_create = new LiveFeedFeed().canCreate();
			json.acls = acls;
			return json;
		}
		throw this.INVALID_INTENTION;
	},
	
	action_Profile: function(){
		var liveProfile;
		if(this.args.intention === this.ACTION_GET) {
			if(this.args.sys_id)
				liveProfile = new LiveFeedProfile(this.args.sys_id);
			else if(this.args.user_id)
				liveProfile = new LiveFeedProfile(new GlideappLiveProfile().getID(this.args.user_id));
			if(this.args.task === this.TASK_BASIC)
				return liveProfile.getDetails();
			else
				return liveProfile.getFullDetails();
		}
		else if(this.args.intention === this.ACTION_UPDATE){
			liveProfile = new LiveFeedProfile(this.data.sys_id);
			if(liveProfile.update(this.data))
				return {};
			else
				throw 'Update Failed';
		}
		throw this.INVALID_INTENTION;
	},
	
	action_Post: function(){
		if(this.args.intention === this.ACTION_INSERT)
			return new LiveFeedMessage().postMessage(this.data);
		else if(this.args.intention === this.ACTION_DELETE) {
			if(this.args.task === this.TASK_TAG_DELETE) {
				new LiveFeedMessage().removeTag(this.data.sys_id, this.data.tag);
				return {};
			}
			else
				return new LiveFeedMessage().deleteMessage(this.data);
		}
		else if(this.args.intention === this.ACTION_UPDATE) {
           if(this.args.task === this.LIKE) {
               return this.liveFeedApi.likeMessage(this.args.sys_id);
           }
		   else if(this.args.task === this.FAVORITE) {
				if(this.data.favorite){
					new LiveFeedMessage().favorite(this.data.sys_id);
					return {};
				}
				else {
					new LiveFeedMessage().unfavorite(this.data.sys_id);
					return {};
				}
			}
			else if(this.args.task === this.TASK_TAG_ADD) {
				new LiveFeedMessage().addTag(this.data.sys_id, this.data.tagName);
				return {};
			}
        }
		throw this.INVALID_INTENTION;
	},

	action_Messages: function(){
		if(this.args.intention === this.ACTION_GET){
			var json = this.liveFeedApi.getMessages(this.args);
			json = new JSON().decode(json);
			if (this.args.search && this.hasUiNotifications()) // Then maybe search errored out.
				throw {type: 'search_error'};
			this.addServerContext(this.LAST_FETCHED_TIME, json.last_fetched_time);
			return json;
		}
		throw this.INVALID_INTENTION;
	},

	action_Feeds: function() {
		var lfc = new LiveFeedFeed();
		if(this.args.intention === this.ACTION_GET) {
			var json = lfc.getConversationsJSON(this.flattenSearchPayload(this.args));
			return json;
		}
		throw this.INVALID_INTENTION;
	},
	
	action_Feed: function() {
		var lfc = new LiveFeedFeed();
		if(this.args.intention === this.ACTION_UPDATE) {
			if(this.args.task === this.FAVORITE){
				if(this.data.favorite){
					lfc.favorite(this.data.sys_id);
					return {};
				}
				else {
					lfc.unfavorite(this.data.sys_id);
					return {};
				}
			}
			else if(this.args.task === this.EMAIL_PREFERENCE) {
				lfc.setNotificationPreference(this.data.sys_id, this.data.notification);
				return {};
			}
			else if(this.data.sys_id && this.data.sys_id !== '-1') {
				if (!lfc.updateConversation(this.data))
					throw "Feed update failed.";
				return {};
			}
		}
		else if(this.args.intention === this.ACTION_INSERT) {
			var grpId = lfc.createConversation(this.data);
			if(grpId) {
				return { sys_id: grpId };
			}
			else {
				return {};
			}
		}
		else if(this.args.intention === this.ACTION_DELETE) {
			if(this.data.sys_id) {
				lfc.deleteConversation(this.data.sys_id);
				return {};
			}
		}
		if(this.args.intention === this.ACTION_GET) {
			if(this.args.task === 'MEMBERSHIP') {
				return lfc.getMembership(this.args.sys_id, this.args.profile_id);
			} else if(this.args.sys_id) {
				var json = lfc.getConversationsJSON({sys_id: this.args.sys_id, membership: true, favorites: true, extended_stats: true});
				if (json.conversations.length === 0)
					return {};
				else
					return json.conversations[0];
			} else {
				return {};
			}
		}
		throw this.INVALID_INTENTION;
	},
	
	action_FeedMembers: function() {
		var lfc = new LiveFeedFeed();
		if(this.args.intention === this.ACTION_GET) {
			if (this._processStateSearch(this.args)) {
				return {more: false, members: []};
			}
			var json = lfc.getMembersJSON(this.flattenSearchPayload(this.args));
			return json;
		}
		throw this.INVALID_INTENTION;
	},
	
	action_FeedMember: function() {
		var lfc = new LiveFeedFeed();
		if(this.args.intention === this.ACTION_UPDATE) {
			if(this.args.task === this.MEMBERSHIP) {
				var membership = lfc.updateMyMembership(this.data.conversation, this.data.membership);
				return { membership: membership };
			}
			if(this.args.task === this.ADMIN_MEMBERSHIP) {
				var membership = lfc.administrateMembership(this.data.conversation, this.data.member, this.data.membership);
				return { membership: membership };
			}
			if(this.args.task === this.TASK_REMOVE) {
				if (lfc.removeConversationMember(this.data.conversation, this.data.member))
					return { success: true };
			}
			throw this.INVALID_TASK;
		}
		throw this.INVALID_INTENTION;
	},
	
	action_Teams: function() {
		var lfug = new LiveFeedTeam();
		if(this.args.intention === this.ACTION_GET) {
			var json = lfug.getTeamsJSON(this.flattenSearchPayload(this.args));
			return json;
		}
		throw this.INVALID_INTENTION;
	},
	
	action_Team: function() {
		var lfug = new LiveFeedTeam();
		if(this.args.intention === this.ACTION_UPDATE) {
			if(this.args.task === this.FAVORITE){
				if(this.data.favorite){
					lfug.favorite(this.data.sys_id);
					return {};
				}
				else {
					lfug.unfavorite(this.data.sys_id);
					return {};
				}
			}
			else if(this.args.task === this.EMAIL_PREFERENCE) {
				lfug.setNotificationPreference(this.data.sys_id, this.data.notification);
				return {};
			}
			else if(this.args.task === this.CONVERSATION_MEMBERSHIP) {
				lfug.updateConversationMembership(this.data.team, this.data.conversation, this.data.membership);
				return {};
			}
			else if(this.args.task === this.CONVERSATION_EMAIL_PREFERENCE) {
				lfug.setConversationNotificationPreference(this.data.sys_id, this.data.conversation, this.data.notification);
				return {};
			}
			else if(this.data.sys_id && this.data.sys_id !== '-1') {
				if (!lfug.updateTeam(this.data))
					throw 'Team update failed';
				return {};
			}
		}
		else if(this.args.intention === this.ACTION_INSERT) {
			var grpId = lfug.createTeam(this.data);
			if(grpId) {
				return { sys_id: grpId };
			}
			else {
				return {};
			}
		}
		else if(this.args.intention === this.ACTION_DELETE) {
			if(this.data.sys_id) {
				lfug.deleteTeam(this.data.sys_id);
				return {};
			}
		}
		else if (this.args.intention === this.ACTION_GET) {
			if (this.args.sys_id) {
				var json = lfug.getTeamsJSON({ sys_id : this.args.sys_id, membership: true, favorites : true, extended_stats: true });
				if (json.teams.length === 0)
					return {};
				else
					return json.teams[0];
			} else {
				return {};
			}
		}
		throw this.INVALID_INTENTION;
	},
	
	action_TeamMembers: function() {
		var lfug = new LiveFeedTeam();
		if(this.args.intention === this.ACTION_GET) {
			if (this._processStateSearch(this.args)) {
				return {more: false, members: []};
			}
			var json = lfug.getMembersJSON(this.flattenSearchPayload(this.args));
			return json;
		}
		throw this.INVALID_INTENTION;
	},
	
	action_TeamFeeds: function() {
		var lfug = new LiveFeedTeam();
		if(this.args.intention === this.ACTION_GET) {
			var json = lfug.getConversationsJSON(this.flattenSearchPayload(this.args));
			return json;
		}
		throw this.INVALID_INTENTION;
	},
	
	action_TeamMember: function() {
		var lfug = new LiveFeedTeam();
		if(this.args.intention === this.ACTION_UPDATE) {
			if(this.args.task === this.MEMBERSHIP) {
				var membership = lfug.updateMyMembership(this.data.team, this.data.membership);
				return { membership: membership };
			}
			if(this.args.task === this.ADMIN_MEMBERSHIP) {
				var membership = lfug.administrateMembership(this.data.team, this.data.member, this.data.membership);
				return { membership: membership };
			}
			if(this.args.task === this.TASK_REMOVE) {
				if (lfug.removeTeamMember(this.data.team, this.data.member))
					return { success: true };
			}
			throw this.INVALID_TASK;
		}
		throw this.INVALID_INTENTION;
	},
	
	action_Favorite: function() {
		var lffav = new LiveFeedFavorite();
		if(this.args.intention === this.ACTION_INSERT) {
			lffav.favorite(this.data.object.table, this.data.object.sys_id);
			return {};
		}
		else if(this.args.intention === this.ACTION_DELETE) {
			lffav.unfavorite(this.data.object.table, this.data.object.sys_id);
			return {};
		}
		throw this.INVALID_INTENTION;
	},

	action_Followers: function() {
		var liveFeedNetwork = new LiveFeedNetwork();
		if(this.args.intention === this.ACTION_GET) {
			var json = liveFeedNetwork.getFollowersJSON(this.flattenSearchPayload(this.args));
			return json;
		}
		throw this.INVALID_INTENTION;
	},

	action_Following: function() {
		var liveFeedNetwork = new LiveFeedNetwork();
		if(this.args.intention === this.ACTION_GET) {
			var json = liveFeedNetwork.getFollowingJSON(this.flattenSearchPayload(this.args));
			return json;
		}
		throw this.INVALID_INTENTION;
	},
	
	action_Follow: function() {
		var liveFeedNetwork = new LiveFeedNetwork();
		if(this.args.intention === this.ACTION_UPDATE) {
			if(this.args.task === this.TASK_FOLLOW)
				liveFeedNetwork.follow(this.data.following);
			else if(this.args.task === this.TASK_UNFOLLOW)
				liveFeedNetwork.unfollow(this.data.following);
			return {};
		}
		throw this.INVALID_INTENTION;
	},

	action_Members: function() {
		var lfm = new LiveFeedMembers();
		if(this.args.intention === this.ACTION_GET) {
			var json = lfm.getMembersJSON(this.args);
			return json;
		}
		throw this.INVALID_INTENTION;
	},

	action_Poll: function() {
		if(this.args.intention === this.ACTION_GET) {
			var json = this.liveFeedApi.getPoll(this.args.sys_id);
			json = new JSON().decode(json);
			return json;
		}
		else if(this.args.intention === this.ACTION_UPDATE) {
			var poll = new LiveFeedPoll();
			if(this.args.task === this.TASK_CAST_VOTE) {
				poll.vote(this.args.sys_id, this.args.option_id);
			}
			else if(this.args.task === this.TASK_CLOSE_POLL) {
				poll.closePoll(this.args.sys_id);
			}
			return {};
		}
		throw this.INVALID_INTENTION;
	},

	action_Tags: function() {
		var lfTag = new LiveFeedTag();
		if(this.args.intention === this.ACTION_GET) {
			var json;
			if(this.args.conversation)
				json = lfTag.getConversationTagsJSON(this.flattenSearchPayload(this.args));
			else
				json = lfTag.getTagsJSON(this.flattenSearchPayload(this.args));
			return json;
		}
		throw this.INVALID_INTENTION;
	},

	action_Tag: function() {
		if(this.args.intention === this.ACTION_UPDATE) {
			if(this.args.task === this.TASK_RENAME_TAG) {
				this.liveFeedApi.renameTag(this.data.sys_id, this.data.new_name);
			}
			return {};
		}
		throw this.INVALID_INTENTION;
	},

	action_TagsSuggestions: function() {
		var lfTag = new LiveFeedTag();
		if(this.args.intention === this.ACTION_GET) {
			var json = lfTag.getTagsSuggestionsJSON(this.flattenSearchPayload(this.args));
			return json;
		}
		throw this.INVALID_INTENTION;
	},

	action_FollowTag: function() {
		var lfTag = new LiveFeedTag();
		if(this.args.intention === this.ACTION_UPDATE) {
			if(this.args.task === this.TASK_FOLLOW)
				lfTag.follow(this.data.following);
			else if(this.args.task === this.TASK_UNFOLLOW)
				lfTag.unfollow(this.data.following);
			return {};
		}
		throw this.INVALID_INTENTION;
	},

	process: function() {
		
		var fjson = [], payload = [];
		
		if (this.isBatchMode) {
			var body = this.request.getParameter(this.SYSPARM_DATA);
			if (body)
				payload = new JSON().decode(body);
		} else{
			var data = this.request.getParameter(this.SYSPARM_DATA);
			if (data)
				data = new JSON().decode(data);
			payload.push({action: this.action +  '', args: this.args, data: data});
		}
		
		var canFetchUiNotifications = false;
		for (var i = 0; i < payload.length; i++) {
			var d = payload[i], json = {}, f;
			this.args = d.args;
			this.data = d.data;
			this.contexts = {};
			f = this['action_' + d.action];
			if (f) {
				try {
					var response = f.call(this); //Call the corresponding action
					if (this.args._isModelCall) {
						json = {answer: {response: response}};
						json.answer.contexts = this.contexts;
						if (!this.args._isPollingCall)
							canFetchUiNotifications = true;
					} else {
						json = {answer: response};
						canFetchUiNotifications = true;
					}
				} catch (err) {
					json = {action: d.action, error: err};
					if (!this.args._isPollingCall)
						canFetchUiNotifications = true;
				}
			}
			else
				json = {error: 'No Action Found'};
			json.action = d.action;
			fjson.push(json);
		}
		var resp;
		var uiNotification = {};
		if (canFetchUiNotifications)
			uiNotification = new JSON().decode(this.liveFeedApi.getUiNotifications());
		if (this.isBatchMode) {
			resp = fjson;
			if (uiNotification[this.UI_NOTIFICATION])
				resp.push(uiNotification);
		} else {
			resp = fjson[0];
			if (uiNotification[this.UI_NOTIFICATION])
				resp[this.UI_NOTIFICATION] = uiNotification[this.UI_NOTIFICATION];
		}
		resp = new JSON().encode(resp);
		
		this.response.setContentType("application/json");
		this.processor.writeOutput(resp);
		
	},
	
	type: 'LiveFeedAjaxProcessor'
});