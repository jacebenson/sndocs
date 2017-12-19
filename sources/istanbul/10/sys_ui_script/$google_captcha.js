$j.getScript(getCaptchaAPIURL(), function() {
	displayGoogleCaptcha("google_captcha");
});

/**
* Retuns the API url. add a global language if found.
*/
function getCaptchaAPIURL() {
	
	var baseURL = 'https://www.google.com/recaptcha/api.js';
	var lang = gel('global_lang').getAttribute("selected");
	
	if (lang != undefined) {
		//note that the default is en. if not supported, en will be used by default.
		baseURL = baseURL+'?hl='+lang;
	}
	return baseURL;
}
function displayGoogleCaptcha(id) {

	var GC = document.getElementById(id);
	if (GC != undefined) {
		var siteKey = GC.getAttribute("site_key");
		if (siteKey != undefined) {
			var captchaDiv = '<div class="g-recaptcha" data-sitekey="' + siteKey + '" ></div>';
			GC.innerHTML = captchaDiv;
			GC.style.display = 'inline-block';			
		}
	}
}

