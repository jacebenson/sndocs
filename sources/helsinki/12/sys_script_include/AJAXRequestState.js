var AJAXRequestState = Class.create();
AJAXRequestState.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    process: function() {
		if (this.getName() == 'getRequestState') {
			var sysId = this.getParameter('sysparm_id');
			return this.getRequestState(sysId);
		}
    },
	
	getRequestState: function(sysId) {
		sysId = sysId === undefined ? null : sysId;
		if (!sysId) {
			this.setError("Invalid sc_request sys ID:" + sysId);
			return;
		}
		
		var record = new GlideRecord('sc_request');
		if (record.get(sysId)) {
			var values = this.newItem('values');
			values.setAttribute('state', record.getValue('request_state'));
			values.setAttribute('number', record.getValue('number'));
		}
	},
	
    /**
     * isPublic(): Always returns false.  Prevents public access to this AJAX processor.
     */
    isPublic: function() {
        return false;
    },	
	
    type: 'AJAXRequestState'
});