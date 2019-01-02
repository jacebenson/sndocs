var PwdCryptoSecureAutoGenPassword = Class.create();
PwdCryptoSecureAutoGenPassword.prototype = {
	category: 'password_reset.extension.password_generator',    // DO NOT REMOVE THIS LINE!

	initialize: function() {
	},

	process: function() {
        return this.generatePassword();
    },
	
	/**
	 * Generates a cryptographically secure pseudo-random password, with length between 8 and 12,
	 * containing at least one special character 
	 * 
	 * @return {string} New string with character inserted
	 */
	generatePassword: function() {
		var specialCharacters = " !\"#$%'()*+,-./:;=?@[\]^_`{|}~";
		var secureRandom = GlideSecureRandomUtil;
		var pwdBaseLength = secureRandom.getSecureRandomIntBound(3) + 7;
		var newPwd = secureRandom.getSecureRandomString(pwdBaseLength);
		var numSpecialCharacters = secureRandom.getSecureRandomIntBound(3) + 1;
		for (var i = 0; i < numSpecialCharacters; i++) {
			var idx = secureRandom.getSecureRandomIntBound(newPwd.length);
			var c = specialCharacters.charAt(secureRandom.getSecureRandomIntBound(specialCharacters.length));
			newPwd = this._insertCharacterAtIndex(newPwd, c, idx);
		}
		
		return newPwd;
	},
	
	/**
	 * Returns a string with a character inserted at a specific index
	 *
	 * @param {string} str The string to insert the character into
	 * @param {string} c The character to instert into the string
	 * @param {number} idx The index in the string to insert the character
	 * @return {string} New string with character inserted
	 */
	_insertCharacterAtIndex: function(str, c, idx) {
		return (str.slice(0, idx) + c + str.slice(idx));
	},

	type: 'PwdCryptoSecureAutoGenPassword'
};