var PwdMaskHelper = Class.create();

var UNMASK_DIGIT_COUNT = 4;
var UNMASK_CHAR_COUNT = 3;

PwdMaskHelper.maskEmail = function(emailAddress) {
	var parts = emailAddress.split('@');
	var local = parts[0];
	var domain = parts[1];
	
	var retStr = "";
	if (local.length < ((UNMASK_CHAR_COUNT*2) + 1)) {      // Mask half of(round up) the email if it is short
		var maskLen = Math.ceil(local.length/2);
		for (var j = 0; j < maskLen; j++)
			retStr += "*";
		retStr += local.slice(maskLen);
	} else {
		retStr = local.slice(0, UNMASK_CHAR_COUNT);
	    for(var i = 0; i < (local.length - (UNMASK_CHAR_COUNT*2)); i++)
		    retStr += "*";
	
	    retStr += local.slice(local.length - UNMASK_CHAR_COUNT);
	}
	return retStr + '@' + domain;
};

PwdMaskHelper.maskPhone = function(phoneNumber) {
	var trimmed = phoneNumber.replace(/[^0-9]/gi, '');
	var append = (function (text, times) {
		return new Array(times + 1).join(text);
	})('x', Math.max(10 - UNMASK_DIGIT_COUNT, trimmed.length - UNMASK_DIGIT_COUNT));

	return append + trimmed.substr(trimmed.length - UNMASK_DIGIT_COUNT);
};