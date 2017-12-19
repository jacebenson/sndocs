var PwdDefaultAutoGenPassword = Class.create();
PwdDefaultAutoGenPassword.prototype = {
    category: 'password_reset.extension.password_generator',    // DO NOT REMOVE THIS LINE!
    
	initialize: function() {
	},

    /**********
    * Returns an auto-generated string password
    * 
    * @param params.credentialStoreId The sys-id of the calling password-reset process (table: pwd_process)
    * @return An auto-generated string password. 
    **********/
    process: function(params) {
        return this.generatePassword(params.credentialStoreId);
    },
	
	/**
	 * function generatePassword
	 * 
	 * returns a string with a randomaly generated password
	 **/
	 /* eslint-disable no-unused-vars */
	generatePassword: function(processId) {
		var words = ["star", "fish", "self", "room", "name", "path", "corn", "save", "char", "pave", "gone", "girl", "bath", "soap", "sail", "door", "rock"];
		
		// Randomly select a word from the list:
		var wordIdx = GlideSecureRandomUtil.getSecureRandomIntBound(words.length);
		var selectedWord = words[wordIdx];

		// Randomly uppercase one of the characters:
		var charIdx = GlideSecureRandomUtil.getSecureRandomIntBound(selectedWord.length);
		var pwd = "";
		for (var i = 0; i < selectedWord.length; i++) {
			if (i == charIdx) {
				pwd += selectedWord.charAt(i).toUpperCase();
			} else {
				pwd += selectedWord.charAt(i);
			}
		}
		
		// Add random 4 digits
		for (i = 0; i < 4; i++)
			pwd += GlideSecureRandomUtil.getSecureRandomIntBound(10);

		return pwd;
	},
	/* eslint-enable no-unused-vars */
	
	
	_alternative_generatePassword: function(g_passwordLength) {
		var passwordLength = g_passwordLength;
		var chars = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz0123456789";
		var pwd = "";
		for (var i = 0; i < passwordLength; i++) {
			var index = GlideSecureRandomUtil.getSecureRandomIntBound(chars.length);
			pwd = pwd + chars[index];
		}
		return pwd;
	},
	
	type: 'PwdDefaultAutoGenPassword'
};