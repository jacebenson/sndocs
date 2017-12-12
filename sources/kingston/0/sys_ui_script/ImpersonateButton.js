var ImpersonateUser = Class.create();

ImpersonateUser.prototype = {
	
	/**
 	* Pass in the id of the span that the impersonate user button is in along with the field
 	* that will hold the impersonating user's name.
 	*/
	initialize: function(span_name, toggle_field_name) {
		this.span_name = span_name;
		this.toggle_field_name = toggle_field_name;
		
		CustomEvent.observe('user.login', this.updateImpersonateForLogin.bind(this));
	},
	
	/**
 	* Login handler
 	*/
	updateImpersonateForLogin: function(/* GlideUser */ user) {
		// if you don't have the admin role and haven't previously impersonated, hide the button
		var got_it = user.hasRole("impersonator");
		
		var toggle_field = gel(this.toggle_field_name);
		if (toggle_field.value != "")
			got_it = true;
		
		var span = gel(this.span_name);
		if (!got_it) {
			hideObject(span);
			return;
		}
		
		showObjectInlineBlock(span);
	},
	
	impersonateUser: function() {
		var dialogClass = GlideDialogWindow,
			width;
		if (window.GlideModal) {
			dialogClass = GlideModal;
			width = 400;
		}
		var gDialog = new dialogClass('dialog_imp_user', false, width);
		gDialog.setPreference('table', 'impersonate_dialog');
		gDialog.setTitle(new GwtMessage().getMessage('Impersonate User'));
		gDialog.render();
	},
	
	unimpersonateUser: function() {
		var dialogClass = GlideDialogWindow,
			width;
		if (window.GlideModal) {
			dialogClass = GlideModal;
			width = 400;
		}
		
		var gDialog = new dialogClass('dialog_imp_user', false, width);
		gDialog.setPreference('table', 'unimpersonate_user');
		gDialog.setTitle(new GwtMessage().getMessage('Unimpersonate User'));
		gDialog.render();
	}
};