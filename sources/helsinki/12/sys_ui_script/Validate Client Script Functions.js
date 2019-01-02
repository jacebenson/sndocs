function validateFunctionDeclaration(fieldName, functionName) {
    var code = g_form.getValue(fieldName);
    if (code == "")
       return true;

    code = removeCommentsFromClientScript(code);

    /* create regular expression to find the function declaration based on the type of client script */
    var patternString = "function(\\s+)" + functionName + "((\\s+)|\\(|\\[\r\n])";
    var validatePattern = new RegExp(patternString);
    
    if (!validatePattern.test(code)) {
       var msg = new GwtMessage().getMessage('Missing function declaration for') + ' ' + functionName;
       g_form.showErrorBox(fieldName, msg);
       return false;
    }

    return true;
}

function validateNoServerObjectsInClientScript(fieldName) {
    var code = g_form.getValue(fieldName);
    if (code == "")
       return true;

    code = removeCommentsFromClientScript(code);
    
    // take out the double quote strings, we do not want to check them
    var doubleQuotePattern = /"[^"\r\n]*"/g;
    code = code.replace(doubleQuotePattern,""); 

    // take out the single quote strings, we do not want to check them either
    var singleQuotePattern = /'[^'\r\n]*'/g;
    code = code.replace(singleQuotePattern,"");

    var rc = true;

    var gsPattern = /(\s|\W)gs\./;
    if (gsPattern.test(code)) {
       var msg = new GwtMessage().getMessage('The object "gs" should not be used in client scripts.');
       g_form.showErrorBox(fieldName, msg);
       rc = false;
    }

    var currentPattern = /(\s|\W)current\./;
    if (currentPattern.test(code)) {
       var msg = new GwtMessage().getMessage('The object "current" should not be used in client scripts.');
       g_form.showErrorBox(fieldName, msg);
       rc = false;
    }

    return rc;    
}

function validateUIScriptIIFEPattern(fieldName, scopeName, scriptName) {
	//For scoped-application UI Scripts, the scripts must follow our IIFE pattern.
	var code = g_form.getValue(fieldName);
	var rc = true;
	if("global" == scopeName)
		return rc;
	
	code = removeCommentsFromClientScript(code);
	code = removeSpacesFromClientScript(code);
	code = removeNewlinesFromClientScript(code);
	
	var requiredStart =  "var"+scopeName+"="+scopeName+"||{};"+scopeName+"."+scriptName+"=(function(){\"usestrict\";";
	var requiredEnd = "})();";
	
	if(!code.startsWith(requiredStart)) {
		var msg = new GwtMessage().getMessage("Missing closure assignment.");
		g_form.showErrorBox(fieldName,msg);
		rc = false;
	}
	
	if(!code.endsWith(requiredEnd)) {
		var msg = new GwtMessage().getMessage("Missing immediately-invoked function declaration end.");
		g_form.showErrorBox(fieldName,msg);
		rc = false;
	}

	return rc;
}

function validateNotCallingFunction (fieldName, functionName) {
	var code = g_form.getValue(fieldName);
	var rc = true;
	var reg = new RegExp(functionName, "g");
	var matches;
	
	code = removeCommentsFromClientScript(code);
	
	if (code == '')
		return rc;
	
	matches = code.match(reg);
	rc = (matches && (matches.length == 1));
	
	if(!rc) {
		var msg = "Do not explicitly call the " + functionName + " function in your business rule. It will be called automatically at execution time.";
		msg = new GwtMessage().getMessage(msg);
		g_form.showErrorBox(fieldName,msg);
	}
	
	return rc;
}

/* remove any comments whether "C" style or double slash to end of line */
function removeCommentsFromClientScript(code) {
    var pattern1 = /\/\*(.|[\r\n])*?\*\//g;
    code = code.replace(pattern1,""); 
    var pattern2 = /\/\/.*/g;
    code = code.replace(pattern2,"");
    return code;
}

function removeSpacesFromClientScript(code) {
	var pattern = /\s*/g;
	return code.replace(pattern,"");
}

function removeNewlinesFromClientScript(code) {
	var pattern = /[\r\n]*/g;
	return code.replace(pattern,"");
}