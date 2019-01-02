var HTMLSanitizerConfig = Class.create();
HTMLSanitizerConfig.prototype = {
	initialize: function() {
	},
	
	HTML_WHITELIST : {
		globalAttributes: {
			attribute:[],
			attributeValuePattern:{}
		},
	},
	
	HTML_BLACKLIST : {
		globalAttributes: {},
	},
	
	getWhiteList : function() {
		return this.HTML_WHITELIST;
	},
	
	getBlackList : function() {
		return this.HTML_BLACKLIST;
	},
	
	type: 'HTMLSanitizerConfig'
}