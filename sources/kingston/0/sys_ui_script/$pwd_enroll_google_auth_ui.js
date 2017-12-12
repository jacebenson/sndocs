function goog_auth_on_load(formId) {
	var currForm = document.getElementById(formId);
	var verificationId = currForm.elements['verification_id'].value;
	var userId = currForm.elements['user_id'].value;	
	loadContent();
}

function goog_auth_on_submit(formId) {
	var currForm = document.getElementById(formId);	
	var mandatory = currForm.elements['mandatory'].value == 'true';
	
	currForm.elements['can_submit'].value = 'true';
	var valid = currForm.elements['goog_auth_valid'].value == 'true';	
	
	if (!valid) {
		// If form is invalid and mandatory, show message and select the tab to draw the user's attention.
		if (mandatory) {
			var tabId = 'tablabel' + currForm.elements['tab_index'].value;
		    var tab = gel(tabId);
		    tab.click();
		    displayErrorMessage(getMessage('You must authorize at least one device with Google Authentication'));
		    return false;
		}
		// if not mandatory we dont want the form submitted and enrollment inserted
		else {
			currForm.elements['can_submit'].value = 'false';
		}
	}
	
	return true;
}

function loadContent(){
	var ajax = new GlideAjax("PwdGoogleAuthenticator");
    ajax.addParam("sysparm_name", "loadContent");
	ajax.addParam("sysparm_userId", getUserID());
	ajax.getXML(this.processContent.bind(this));
}

function processContent(response){
	var isEnabledResponse = response.responseXML.getElementsByTagName("isEnabled");
    var isEnabled = isEnabledResponse[0].getAttribute("isEnabled");
	var result = response.responseXML.getElementsByTagName("result");
	
	if (isEnabled == "false") 
		showEnableContent();
	else if(result && result.length > 0){
		var validated = result[0].getAttribute("validated");
		var qrCodeURL = result[0].getAttribute("qrCodeURL");
		var qrCodeText = result[0].getAttribute("qrCodeText");
		var canDisable = result[0].getAttribute("canDisable");

		if(validated == "true")
			showSuccessContent();
		else {
			showValidateContent();
			gel('imgCode').src = qrCodeURL;
			gel('lblCode').innerHTML = new GwtMessage().getMessage("Or type in") + ": " + qrCodeText;
		}
	}	
}

function validateResponse(formId){
	var userResponse = document.getElementById("txtResponse").value.trim();
	if (userResponse.length != 6 || isNaN(userResponse))
		showError();
	
	var currForm = document.getElementById(formId);
	var verificationId = currForm.elements['verification_id'].value;
	
	var ajax = new GlideAjax("PwdGoogleAuthenticator");
    ajax.addParam("sysparm_name", "validateEnrollmentResponse");
	ajax.addParam("sysparm_response", userResponse);
	ajax.addParam("sysparm_userId", getUserID());
	ajax.getXML(this.processResponse.bind(this));
}

function processResponse(response){
	var result = response.responseXML.getElementsByTagName("result");
	if (result && result.length > 0 ) {
		var validated = result[0].getAttribute("validated");
		if (validated == 'true')
			loadContent();
		else
			showError();
	} else
		showError();
}

function enableSetup() {
	var ajax = new GlideAjax("PwdGoogleAuthenticator");
	ajax.addParam("sysparm_name", "enableGoogleAuth");
	ajax.addParam("sysparm_userId", getUserID());
	ajax.getXML(this.processContent.bind(this));
}

function disableSetup() {
	var userId = getUserID();
	var areYouSure = confirm(new GwtMessage().getMessage("Are you sure you want to disable Multi-factor Authentication?"));
	if(areYouSure == true){
		g_form.clearMessages();
		g_form.addInfoMessage("The Multifactor Authentication property has been disabled for your user");
		
		var ajax = new GlideAjax("PwdGoogleAuthenticator");
		ajax.addParam("sysparm_name", "disableGoogleAuth");
		ajax.addParam("sysparm_userId", userId);
		ajax.getXML(this.processContent.bind(this));
	}
}

function resetCode() {
	var areYouSure = confirm(new GwtMessage().getMessage("Are you sure you want to generate a new code?"));
	if(areYouSure == true){
		var userId = getUserID();
		var ajax = new GlideAjax("PwdGoogleAuthenticator");
		ajax.addParam("sysparm_name", "resetMultifactorCode");
		ajax.addParam("sysparm_userId", userId);
		ajax.getXML(this.processContent.bind(this));
	}
}

function getUserID() {
	var user_id =  gel("userId").value;
	return user_id;
}

function showError(){
	g_form.clearMessages();
	g_form.addErrorMessage("The Google Authenticator code that you entered is invalid. Try again.");
	return false;
}

function showEnableContent() {
	toggleContent(true, false, false, false);
}

function showValidateContent() {
    gel("txtResponse").value = "";
	toggleContent(false, true, false, false);
}

function showSuccessContent() {
	var successMsg = new GwtMessage().getMessage("Your device was paired successfully and you can use it to verify your identity while resetting your password.");
	var warningRstMsg = new GwtMessage().getMessage("In addition, you can use the device to implement multi-factor authentication with other applications. If you generate a new code and pair the device using the code, the current multi-factor authentication data is replaced.");
	
	toggleContent(false, false, true, true);
	g_form.addInfoMessage(successMsg + "<br/><br/>" + warningRstMsg);
}

function toggleContent(enableContent, validateContent, successContent, authValid) {
	g_form.clearMessages();
	$j("#tdEnable").toggle(enableContent);
	$j(".pwd-auth-validate").toggle(validateContent);
	$j("#tdSuccess").toggle(successContent);
	gel("goog_auth_valid").value = authValid? "true":"false";
}
