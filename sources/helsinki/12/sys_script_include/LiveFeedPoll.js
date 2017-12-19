var LiveFeedPoll = Class.create();
LiveFeedPoll.prototype = {
	LIVE_MESSAGE: "live_message",
	LIVE_POLL: "live_poll",
	LIVE_POLL_OPTION: "live_poll_option",
	LIVE_POLL_CAST: "live_poll_cast",
	POLL: "poll",
	CAST_COUNT: "cast_count",
	OPTION: "option",

    initialize: function() {
		this.util = new LiveFeedCommon();
		var liveFeedUtil = new LiveFeedUtil();
		this.profile = liveFeedUtil.getSessionProfile();
		this.pollId = null;
		this.headerGR = null;
		this.optionsGR = null;
    },

	_getPollHeader: function() {
		if(this.headerGR == null) {
			var gr = new GlideRecord(this.LIVE_POLL);
			gr.get(this.pollId);
			this.headerGR = gr;
		}
		return this.headerGR;
	},

	_getOptions: function() {
		if(this.optionsGR == null) {
			var gr = new GlideRecord(this.LIVE_POLL_OPTION);
			gr.addQuery(this.POLL, this.pollId);
			gr.orderBy(this.util.SYS_CREATED_ON);
			gr.query();
			this.optionsGR = gr;
		}
		return this.optionsGR;
	},

	getSessionProfile: function() {
		return this.profile;
	},

	createPoll: function(msgId, poll) {
		if(!poll.question) {
			var errMsg = gs.getMessage('Question is not provided for Poll');
			gs.addInfoMessage(errMsg);
			return;
		}
		if(poll.options.length < 2) {
			var errMsg = gs.getMessage('Atleast two options are needed for Poll');
			gs.addInfoMessage(errMsg);
			return;
		}
		var msgGr = new GlideRecord(this.LIVE_MESSAGE);
		if(msgGr.get(msgId)) {
			var pollGR = new GlideRecord(this.LIVE_POLL);
			pollGR.initialize();
			pollGR.question = poll.question;
			pollGR.state = 1;
			pollGR.sys_domain = msgGr.sys_domain;
			pollGR.update();

			for(var i=0 ; i < poll.options.length; i++) {
				var pollOptionGR = new GlideRecord(this.LIVE_POLL_OPTION);
				pollOptionGR.initialize();
				pollOptionGR.poll = pollGR.sys_id;
				pollOptionGR.name = poll.options[i].name
				pollOptionGR.order = i + 1;
				pollOptionGR.update();
			}
			msgGr.poll = pollGR.sys_id;
			msgGr.update();
		}
	},

	closePoll: function(pollId) {
		this.pollId = pollId;
		var gr = this._getPollHeader();
		gr.state = 2;
		gr.update();
		var info = gs.getMessage('The poll has ended');
		gs.addInfoMessage(info);
	},

	deletePoll: function(pollId) {
		this.pollId = pollId;
		gr = new GlideRecord(this.LIVE_POLL_OPTION);
		gr.addQuery(this.POLL, this.pollId);
		gr.query();
		gr.deleteMultiple();

		gr = new GlideRecord(this.LIVE_POLL_CAST);
		gr.addQuery(this.POLL, this.pollId);
		gr.query();
		gr.deleteMultiple();

		var gr = this._getPollHeader();
		gr.deleteRecord();
	},

	vote: function(pollId, optionId) {
		this.pollId = pollId;
		var cast = new GlideRecord(this.LIVE_POLL_CAST);
		cast.initialize();
		cast.poll = this.pollId;
		cast.profile = this.getSessionProfile();
		cast.option = optionId;
		var newRecord = cast.insert();
		
		if(!newRecord) { 
			throw 'Voting failed with Business Rule';
		}
	},

    type: 'LiveFeedPoll'
}