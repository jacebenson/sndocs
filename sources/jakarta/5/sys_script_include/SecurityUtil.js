var SecurityUtil = Class.create();
SecurityUtil.prototype = {
    initialize: function() {
    },

	resetUserPassword: function() {
		if(this.isOptedIn()) {
			var endpoint = '/api/sn_bm_central/v1/benchmark_customer_api/update_password';
			var newPassword = GlideSecureRandomUtil.getSecureRandomString(64);
			var request = {};
			request.requestBody = '{"password": "'+newPassword+'"}';
			var response = new BenchmarkAPIHelper().post(endpoint, request);
			var responseJSON = new global.JSON().decode(response.getBody());
			if(responseJSON && responseJSON.result && responseJSON.result.status == 'success') {
				this.updateUserProfile(responseJSON.result.user, newPassword);
			}
			else {
				if(responseJSON && responseJSON.error && responseJSON.error.detail)
					gs.error(responseJSON.error.detail);
				else
					gs.error('Unable to reset the password. Service returns an error.');
			}
		}
	},

	isOptedIn: function() {
		var gr = new GlideRecord('sn_bm_client_configuration');
		gr.addQuery('name', 'opt_in_status');
		gr.query();
		return gr.next() && gr.getValue('value') == 'true';
	},

	updateUserProfile: function(userId, password) {
		var userProfileGR = new GlideRecord('sn_bm_client_user_profile');
		userProfileGR.addQuery('user_name', userId);
		userProfileGR.query();
		if(userProfileGR.next()) {
			userProfileGR.setValue('user_pwd', password);
			userProfileGR.update();
		}
	},

	createUserProfile : function(userId, password) {
		var userProfileGR = new GlideRecord('sn_bm_client_user_profile');
		userProfileGR.query();
		if (!userProfileGR.next()) {
			userProfileGR.initialize();
			userProfileGR.setValue('user_name', userId);
			userProfileGR.setValue('user_pwd', password);
			userProfileGR.insert();
		}
	},

    type: 'SecurityUtil'
};