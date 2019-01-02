function multifactorSendOneTimePassword() {
	var ajax = new GlideAjax("GlideOneTimePasswordGenerator");
    ajax.addParam("sysparm_name", "generateOneTimePassword");
    ajax.getXML(processMultifactorSendOneTimePasswordResponse.bind(this)); 
	return false;
}

function processMultifactorSendOneTimePasswordResponse(response) {
    var results = response.responseXML.getElementsByTagName("result"); 
	GlideUI.get().clearOutputMessages();
    if(results && results.length >0) {
        var msg = results[0].getAttribute("msg");	
        GlideUI.get().addOutputMessage({msg: msg, type: "info", id: null});
    } else {
        var msg = response.responseXML.documentElement.getAttribute("error");
        GlideUI.get().addOutputMessage({msg: msg, type: "error", id: null});
    }
}