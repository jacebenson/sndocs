var LiveFeedMessage = Class.create();
LiveFeedMessage.prototype = {

	LIVE_MESSAGE: "live_message",
	LIVE_LINK: "live_link",

	initialize: function() {
		this.liveFeedApi = new SNC.LiveFeedApi();
	},
	
	_postMessage: function(message, group_id, to_profile, isWorkNotes, from_profile){
		return this.liveFeedApi.addMessage(message, group_id, to_profile, isWorkNotes, from_profile);
	},
	
	addLinks: function(msgId, links) {
		var count = 0;
		for(var i=0;i<links.length;i++) {
			var url = links[i].url;
			var short_description = links[i].short_description;
			if(url) {
				var linkGr = new GlideRecord(this.LIVE_LINK);
				linkGr.initialize();
				linkGr.attached_to_table = this.LIVE_MESSAGE;
				linkGr.attached_to_id = msgId;
				linkGr.url = url;
				if(!short_description)
					short_description = url;
				linkGr.short_description = short_description;
				linkGr.insert();
				count++;
			}
		}
		if(count) {
			var gr = new GlideRecord(this.LIVE_MESSAGE);
			gr.get(msgId);
			gr.has_links = true;
			gr.last_activity = gs.nowDateTime();
			gr.update();
		}
		return count;
	},

	postMessage: function(data) {
		var msgId = this._postMessage(data.message, data.group_id, data.to_profile, data.is_worknotes, data.from_profile);
		if(!msgId)
			return;
		if(data.links)
			this.addLinks(msgId, data.links);
		if(data.poll) {
			var poll = new LiveFeedPoll();
			poll.createPoll(msgId, data.poll);
		}
		return msgId;
	},

	replyMessage: function(data) {
		if(reply_to)
			message = 'replyto:' + reply_to + ':' + message;
		this._postMessage(data.message, data.group_id, data.to_profile, data.is_worknotes);
	},
	
	deleteMessage: function(data) {
		this.liveFeedApi.deleteMessage(data.sys_id);
	},

	favorite: function(messageId) {
		var favorite = new LiveFeedFavorite();
		return favorite.favorite(this.LIVE_MESSAGE, messageId);
	},

	unfavorite: function(messageId) {
		var favorite = new LiveFeedFavorite();
		return favorite.unfavorite(this.LIVE_MESSAGE, messageId);
	},

	addTag: function(messageId, tagName) {
		return new LiveFeedTag().addMessageTag(messageId, tagName);
	},

	removeTag: function(messageId, tagId) {
		return new LiveFeedTag().removeMessageTag(messageId, tagId);
	},
	
	type: 'LiveFeedMessage'
};