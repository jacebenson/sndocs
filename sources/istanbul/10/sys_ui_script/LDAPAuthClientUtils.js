function ldapSendOneTimePassword() {
	var ajax = new GlideAjax("LDAPOneTimePasswordGenerator");
    ajax.addParam("sysparm_name", "generateOneTimePassword");
    ajax.getXML(processLDAPSendOneTimePasswordResponse.bind(this)); 
	return false;
}

function processLDAPSendOneTimePasswordResponse(response) {
    var results = response.responseXML.getElementsByTagName("result"); 
	GlideUI.get().clearOutputMessages();
    if(results && results.length >0) {
        var msg = results[0].getAttribute("msg");	
        GlideUI.get().addOutputMessage({msg: msg, type: "info", id: null});
    } 
}