var hr_EmailUtil = Class.create();
hr_EmailUtil.prototype = {
    type: 'hr_EmailUtil'
};

//Replaces tokens in text with fields from the corresponding record
hr_EmailUtil.replaceFieldTokens = function(text, record) {
	while(text.indexOf('${') >= 0 && text.indexOf('}') >= 0) {
		var substr = text.slice(text.indexOf('${'), text.indexOf('}') + 1);
		var field = (substr.slice(0,substr.length - 1)).slice(2);
		
		text = text.replace(substr, record.getElement(field).getDisplayValue());
	}
	return text;
};

hr_EmailUtil.getRelevantLinkForUser = function(current, userId) {
	var caseLink = new sn_hr_sp.emailUtil(current).getRelevantLinkForUser(userId);
	return caseLink;
};