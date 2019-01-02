var CABEmailContent = Class.create();
CABEmailContent.prototype = {
    initialize: function() {
    },
	
    type: 'CABEmailContent'
};

CABEmailContent.generateHTMLEmailContent = function(currentRecord, emailAction, event, outboundEmail) {
	var emailFormatter = new GlideEmailFormatter(currentRecord, emailAction, event, outboundEmail);
	var emailContent = emailFormatter.evaluateTemplateScript(emailAction.message_html);
	emailContent = emailFormatter.substitute(emailContent, true, true);
		
	return emailContent;
};
	
