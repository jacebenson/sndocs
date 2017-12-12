/*
* Read CSRF token from the master form.
*/
function findCSRFElement() {
	return gel('pwd_csrf_token');
}

/**
* Handles security from AJAX reponse.
*/
function handleSecurityFrom(response) {
	
	var res = response.responseXML.getElementsByTagName('security');
    
    try {
		var status = res[0].getAttribute("status");
		
		if(status =='error'){
			
			// security violation happened.let's send it to the error page.
			var message= res[0].getAttribute("message");
			submitWithBlock('$pwd_error.do', message);
			return;
		}
		var newToken =  res[0].getAttribute("pwd_csrf_token");
		findCSRFElement().value= newToken;
	}
	catch(err){
		// should not happen. just reload the page. 
		this.location.replace('$pwd_error.do?sysparam_error=unexpected_security_error');
	}
}

/**
* Submit for OK status.
*/
function submitWithOK(action){
    var form = gel('pwd_master_form');
	form.action = action;
	form.submit();
}

/**
* Submit for OK status.
*/
function submitWithOKAndSysParam(action, sysparamName,sysparamValue){
	var form = gel('pwd_master_form');
	form.action = action;
	gel(sysparamName).value =sysparamValue;
	form.submit();
}

/**
* Submit for block status.
*/
function submitWithBlock(action,msg){
    var form = gel('pwd_master_form');
	form.action = action;
	gel('sysparm_error').value = msg;
	form.submit(); 
}