var PwdDefaultUserAccountLookup = Class.create();
PwdDefaultUserAccountLookup.prototype = {
    category: 'password_reset.extension.user_account_lookup', // DO NOT REMOVE THIS LINE!

    initialize: function() {
    },
	
	/**********
	 * Returns the credential-store account id for a given user
	 * 
	 * @param params.userId  The sys-id of the user being checked (table: sys_user)
	 * @return               The credential-store account-id (string) for a given user
	 **********/
	process: function(params) {
	   return this.getAccountNameByUserSysId(params.userId);
	},	
	
	getAccountNameByUserSysId: function(userSysId) {
		var gr = new GlideRecord('sys_user');
		if (!gr.get(userSysId)) {
			return '';
		}
		return gr.user_name;
	},

    type: 'PwdDefaultUserAccountLookup'
}