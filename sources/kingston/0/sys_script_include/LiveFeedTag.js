var LiveFeedTag = Class.create();
LiveFeedTag.prototype = {
	// tables
	LIVE_MESSAGE: "live_message",
	LIVE_MESSAGE_TAG: "live_message_tag",
	LIVE_TAG: "live_tag",
	LIVE_TAG_FOLLOW: "live_tag_follow",
	LIVE_PROFILE: "live_profile",
	LIVE_GROUP_PROFILE: "live_group_profile",
	
	// columns
	CONVERSATION: "group",
	MESSAGE: "message",
	COUNT: "count",
	USER: "user",
	FOLLOWING: "following",
	NAME: "name",
	TAG: "tag",

	/* private methods begin { */
	_getTags: function(params) {
		var tags = new GlideRecord(this.LIVE_TAG);
		var orderBy = [this.util.NAME]; // name, count, sys_updated_on
		tags.addQuery(this.COUNT, '>', 0);
		this.util.addQueryParam(tags, this.util.SYS_ID, params.sys_id);
		if (params.following_tags) {
			var tagsFollowing = tags.addJoinQuery(this.LIVE_TAG_FOLLOW, this.util.SYS_ID, this.FOLLOWING);
			tagsFollowing.addCondition(this.USER, this.profile);
		}
		if (params[this.util.TEXTQUERY]) {
			this.util.addExpressionQuery(tags, this.NAME, params);
		}
		this.util.setOrderBy(tags, params, orderBy);
		this.util.setLimit(tags, params);
		return tags;
	},

	_decrementTagCount: function(tagId) {
		var gr = new GlideRecord(this.LIVE_TAG);
		if(!gr.get(tagId))
			return false;
		if(gr.count > 0) {
			gr.count = gr.count-1;
			gr.update();
			return true;
		}
		return false;
	},
	
	_messageDelete: function(messageId) {
		var msgTagGr = new GlideRecord(this.LIVE_MESSAGE_TAG);
		msgTagGr.addQuery(this.MESSAGE, messageId);
		msgTagGr.query();
		while(msgTagGr.next()) {
			this._decrementTagCount(msgTagGr.getValue(this.TAG));
		}
	},
	
	_incrementTagCount: function(tagId) {
		var gr = new GlideRecord(this.LIVE_TAG);
		if(!gr.get(tagId))
			return false;
		gr.count = gr.count+1;
		gr.update();
		return true;
	},
	
	_messageUndoDelete: function(messageId) {
		var msgTagGr = new GlideRecord(this.LIVE_MESSAGE_TAG);
		msgTagGr.addQuery(this.MESSAGE, messageId);
		msgTagGr.query();
		while(msgTagGr.next()) {
			this._incrementTagCount(msgTagGr.getValue(this.TAG));
		}
	},

	/* private methods end } */

	/* public methods begin {*/
    initialize: function() {
		this.util = new LiveFeedCommon();
		var liveFeedUtil = new LiveFeedUtil();
		this.profile = liveFeedUtil.getSessionProfile();
    },
	
	getSessionProfile: function() {
		return this.profile;
	},
	
	getFollowingByIds: function(tagId) {
		var gr = new GlideRecord(this.LIVE_TAG_FOLLOW);
		gr.addQuery(this.USER, this.getSessionProfile());
		gr.addQuery(this.FOLLOWING, tagId);
		gr.query();
		return gr;
	},

	getTagsSuggestions: function(params) {
		if(!params)
			params = {};
		var tags = this._getTags(params);
		if (params.conversation_id) {
			var conversation = new GlideRecord(this.LIVE_GROUP_PROFILE);
			if (conversation.get(params.conversation_id)) {
				this.util.addQueryParam(tags, this.util.SYS_DOMAIN, conversation.getValue(this.util.SYS_DOMAIN));
			} else {
				throw "Bad conversation_id";
			}
		} else {
			var user = new GlideRecord(this.LIVE_PROFILE);
			if (user.get(this.getSessionProfile()))
				this.util.addQueryParam(tags, this.util.SYS_DOMAIN, user.getValue(this.util.SYS_DOMAIN));
		}
		tags.query();
		return tags;
	},

	getTagsSuggestionsJSON: function(params) {
		if(!params)
			params = {};
		this.util.defaultQueryLimit(params);
		var tags = this.getTagsSuggestions(params);
		var that = this;
		var json = this.util.listJSON(tags, function(tag) { return that.tagJSON(tag); }, params);
		return { more: tags.hasNext(), tags: json };
	},

	getTags: function(params) {
		if(!params)
			params = {};
		var tags = this._getTags(params);
		tags.query();
		return tags;
	},
	
	getTagsJSON: function(params) {
		if(!params)
			params = {};
		this.util.defaultQueryLimit(params);
		var tags = this.getTags(params);
		var that = this;
		var json = this.util.listJSON(tags, function(tag) { return that.tagJSON(tag); }, params);
		for(var i=0;i<json.length; i++) {
			var following = this.getFollowingByIds(json[i].sys_id);
			if(following.next())
				json[i].following = true;
			else
				json[i].following = false;
		}
		return { more: tags.hasNext(), tags: json };
	},
	
	getConversationTags: function(params) {
		if(!params)
			return;
		if(!params.conversation)
			return;
		var tags = new GlideAggregate(this.LIVE_MESSAGE_TAG);
		var qc = tags.addJoinQuery(this.LIVE_MESSAGE, this.MESSAGE, this.util.SYS_ID);
		qc.addCondition(this.CONVERSATION, this.util.EQUALS, params.conversation);
		tags.addAggregate(this.util.COUNT);
		// Order By needs to applied first since groupBy fields too end up in Order By.
		var orderBy = ["tag.name"]; // tag.name, tag.count, tag.sys_updated_on
		this.util.setOrderBy(tags, params, orderBy);
		tags.groupBy("tag.sys_id");
		tags.groupBy("tag.name");
		tags.groupBy(this.util.SYS_DOMAIN);
		if (params[this.util.TEXTQUERY]) {
			this.util.addExpressionQuery(tags, "tag.name", params);
		}
		this.util.setLimit(tags, params);
		tags.query();
		return tags;
	},

	getConversationTagsJSON: function(params) {
		if(!params)
			params = {};
		this.util.defaultQueryLimit(params);
		var tags = this.getConversationTags(params);
		var that = this;
		var json = this.util.listJSON(tags, function(tag) { return that.conversationTagJSON(tag); }, params);
		if(json.length == 0)
			return { more: false, tags: json };
		var hjson = this.util.listToHashJSON(json);
		var ids = [];
		for(var i=0;i<json.length;i++)
			ids.push(json[i].sys_id);
		var gparams = {};
		gparams.sys_id = ids;
		gparams[this.util.QUERY_LIMIT] = ids.length;
		var gtags = this.getTags(gparams);
		while(gtags.next())
			hjson[gtags.getValue(this.util.SYS_ID)].global_count = gtags.getValue(this.COUNT);
		return { more: tags.hasNext(), tags: json };
	},
	
	tagJSON: function(tag) {
		var json = {};
		json.sys_id = tag.getValue(this.util.SYS_ID);
		json.name = tag.getValue(this.util.NAME);
		if(tag.getDisplayValue(this.util.IMAGE))
			json.image = tag.getDisplayValue(this.util.IMAGE);
		json.domain_id = tag.getValue(this.util.SYS_DOMAIN);
		json.domain_name = tag.getDisplayValue(this.util.SYS_DOMAIN);
		json.count = tag.getValue(this.COUNT); // column
		json.canWrite = tag.canWrite();
		return json;
	},
	
	conversationTagJSON: function(tag) {
		var json = {};
		json.sys_id = tag.getValue("tag.sys_id");
		json.name = tag.getValue("tag.name");
		var img = tag.getDisplayValue("tag.image");
		if(img)
			json.image = img;
		json.domain_id = tag.getValue(this.util.SYS_DOMAIN);
		json.domain_name = tag.getDisplayValue(this.util.SYS_DOMAIN);
		json.count = tag.getAggregate(this.util.COUNT); // aggregate
		json.canWrite = tag.canWrite();
		return json;
	},
	
	follow: function(tagId) {
		var following = this.getFollowingByIds(tagId);
		if(following.next())
			return false;
		following = new GlideRecord(this.LIVE_TAG_FOLLOW);
		following.user = this.getSessionProfile();
		following.following = tagId;
		following.insert();
		var msg = gs.getMessage("You are now following the #{0} hashtag", [following.following.name]);
		gs.addInfoMessage(msg);
		return true;
	},
	
	unfollow: function(tagId) {
		var following = this.getFollowingByIds(tagId);
		if(!following.next())
			return false;
		var tag = following.following.name;
		following.deleteRecord();
		var msg = gs.getMessage("You are no longer following the #{0} hashtag", [tag]);
		gs.addInfoMessage(msg);
		return true;
	},

	removeMessageTag: function(messageId, tagId) {
		var gr = new GlideRecord(this.LIVE_MESSAGE_TAG);
		gr.addQuery(this.MESSAGE, messageId);
		gr.addQuery(this.TAG, tagId);
		gr.query();
		if(!gr.next())
			return false;
		gr.deleteRecord();
		var tagGr = new GlideRecord(this.LIVE_TAG);
		if(tagGr.get(tagId)) {
			if(tagGr.count > 0) {
				tagGr.count = tagGr.count-1;
				tagGr.update();
			}
		}
		var msgTags = new GlideAggregate(this.LIVE_MESSAGE_TAG);
		msgTags.addAggregate(this.util.COUNT);
		msgTags.addQuery(this.MESSAGE, messageId);
		msgTags.query();
		msgTags.next();
		var tagCount = msgTags.getAggregate(this.util.COUNT);
		if(!tagCount) {
			var msgGr = new GlideRecord(this.LIVE_MESSAGE);
			if(msgGr.get(messageId)) {
				msgGr.has_tags = 0;
				msgGr.update();
			}
		}
	},

	addMessageTag: function(messageId, tagName) {
		var gr = new GlideRecord(this.LIVE_MESSAGE);
		if(!gr.get(messageId))
			return false;
		var tagGr = new GlideRecord(this.LIVE_TAG);
		tagGr.addQuery(this.NAME, tagName);
		tagGr.addDomainQuery(gr);
		tagGr.query();
		var tagId;
		var msgTagGr = new GlideRecord(this.LIVE_MESSAGE_TAG);
		if(tagGr.next()) {
			tagId = tagGr.getUniqueValue();
			msgTagGr.addQuery(this.MESSAGE, gr.getUniqueValue());
			msgTagGr.addQuery(this.TAG, tagId);
			msgTagGr.query();
			if(msgTagGr.next()) {
				return false;
			}
		}
		else {
			tagGr.initialize();
			tagGr.name = tagName;
			tagGr.addDomainQuery(gr);
			tagId = tagGr.insert();
		}
		if(gr.has_tags == 0) {
			gr.has_tags = 1;
			gr.update();
		}
		msgTagGr.initialize();
		msgTagGr.message = gr.getUniqueValue();
		msgTagGr.tag = tagId;
		msgTagGr.reply_to = gr.reply_to;
		msgTagGr.insert();
		tagGr.count = tagGr.count+1;
		tagGr.update();
	},

	onMessageStateChange: function(msgGr) {
		if(msgGr.state == 'deleted') {
			this._messageDelete(msgGr.sys_id);
		}
		else {
			this._messageUndoDelete(msgGr.sys_id);
		}
	},
	
	/* public methods end } */
	
    type: 'LiveFeedTag'
}