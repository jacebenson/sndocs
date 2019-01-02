var LiveMsgUtil = Class.create();

LiveMsgUtil.prototype = {
    initialize: function(msg){
        this.message = msg;
        this.isReply = !msg.reply_to.nil();
        this.isReplyTo = !msg.in_reply_to.nil();
        this.liveFeedApi = new SNC.LiveFeedApi();
		this.MSG_FORMAT_TEXT = 'TEXT';
		
        if (this.isReply) {
			//set base message
            this.basePoster = this.message.reply_to.profile.getDisplayValue();
            this.baseMsg = this.liveFeedApi.formatMessage(this.message.reply_to.message, this.MSG_FORMAT_TEXT);

            if (this.isReplyTo) {
				//this is a reply to a child message
                this.replyToPoster = this.message.in_reply_to.profile.getDisplayValue();
                this.replyToMsg = this.liveFeedApi.formatMessage(this.message.in_reply_to.message, this.MSG_FORMAT_TEXT);
            }
            else {
				//this is a reply to the base message
                this.replyToPoster = this.message.reply_to.profile.getDisplayValue();
                this.replyToMsg = this.liveFeedApi.formatMessage(this.message.reply_to.message, this.MSG_FORMAT_TEXT);
            }
        }
    },
    
	getBaseMsgWithName: function() {
		return this.basePoster + ": " + this.baseMsg;
	},

	getReplyToMsgWithName: function() {
		return this.replyToPoster + ": " + this.replyToMsg;
	},

	
    getBaseMsg: function(){
        return this.baseMsg;
    },
    
    getBasePoster: function(){
        return this.basePoster;
    },
    
    getReplyToMsg: function(){
        return this.replyToMsg;
    },
    
    getReplyToPoster: function(){
        return this.replyToPoster;
    },
    
    /**
     *
     * @return Array of user sys_ids that are participating in this thread
     */
    getThreadUsers: function(){
        if (!this.message || this.message.reply_to.nil()) 
            return;
        
        var users = [];
        var threadMsgs = new GlideRecord("live_message");
        threadMsgs.addQuery("reply_to", this.message.reply_to).addOrCondition("sys_id", this.message.reply_to);
        threadMsgs.query();
        while (threadMsgs.next()) {
            //include only users
            if (threadMsgs.profile.type == "user")  
                users.push(threadMsgs.profile.document.toString());
            
        }
        var arrUtils = new ArrayUtil();
        return arrUtils.unique(users);
    },
    
    /**
     * Returns an array of objects with url and text properties
     * Usage:
     * <code>
     * var util = new LiveMsgUtils(messageGlideRecord);
     * var links = util.getLinks(); 
     * for (var i = 0; i < links.length; i++) {
     *    var url = links[i].url;
     *    var text = links[i].text;
     *    var htmlLink = '<a href="' + url + '">' + text + '</a>';
     *    gs.print(htmlLink);
     * }
     * </code>
     */
    getLinks: function(){
        if (!this.message || !this.message.has_links) 
            return;
        
        var links = [];
        var linkGr = new GlideRecord("live_link");
        linkGr.addQuery("attached_to_table", "live_message");
        linkGr.addQuery("attached_to_id", this.message.getUniqueValue());
        linkGr.query();
        while (linkGr.next()) {
            var link = {};
            link.url = linkGr.url.toString();
            link.text = linkGr.short_description.toString();
            links.push(link);
        }
        
        return links;
    },
    
    type: "LiveMsgUtil"
}