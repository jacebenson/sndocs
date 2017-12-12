var AJAXSysEmailPreviewer = Class.create();
AJAXSysEmailPreviewer.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	getEmailByID : function() {
		var sysEmailID = this.getParameter('sysparm_id');
		var sysEmailGr = new GlideRecord('sys_email'); 
		var sanitizedEmailBody = '';
		if(sysEmailGr.get(sysEmailID)) {
			var sysEmailBody = sysEmailGr.getValue('body');
			sanitizedEmailBody = this._sanitize(sysEmailBody);
		}
		
		return sanitizedEmailBody;
		
	},
	
	_sanitize : function(sysEmailBody) {
		return SNC.GlideHTMLSanitizer.sanitize(sysEmailBody);
	},

    type: 'AJAXSysEmailPreviewer'
});