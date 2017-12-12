var ExportTargetHelper = Class.create();
ExportTargetHelper.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    /*
    * Tests connection to Export Target.
    * returns XML response that contains the statusCode and statusMessage
    *
    * return
    * <result>
    *       <status>
    *           <connected></connected>
    *           <errorMessage><errorMessage>
    *       </status>
    * </result>
    * statusCode = 0 indicates successful connection to export target.
    */
    testConnection: function() {
        var exportTargetId = String(this.getParameter("sysparm_export_target_id"));
        var result = this.newItem("result");
        var status = this.newItem("status");
        result.appendChild(status);
        
        var connected = this.newItem("connected");
        status.appendChild(connected);
        
        var errorMessage = this.newItem('errorMessage');
        status.appendChild(errorMessage);
        
        var connectionTestHandler = new SNC.ExportTargetTestConnectionHandler(exportTargetId);
        try {
            var result = connectionTestHandler.testConnection();
            connected.setAttribute('value', result);
            if(result == false) {
                errorMessage.setAttribute('value', GlideXMLUtil.removeInvalidChars(gs.getSession().getProperty("export_target_test.errorMessage")));
            }
        } catch (e) {
            connected.setAttribute('value', false);
            errorMessage.setAttribute('value', GlideXMLUtil.removeInvalidChars(e.getMessage()));
        }
        return result;
    },
    
	getOSForMIDServer: function() {
        var midServerId = String(this.getParameter("sysparm_mid_server_id"));
		var gr = new GlideRecord("ecc_agent");
		if (gr.get(midServerId))
			return gr.getValue("host_type");
		
		return null;
	},
	
    type: 'ExportTargetHelper'
});
