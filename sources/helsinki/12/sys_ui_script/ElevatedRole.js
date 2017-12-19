var ElevatedRole = Class.create();

ElevatedRole.prototype = {
	
	initialize: function(span_name) {
		this.span_name = span_name;
		CustomEvent.observe('user.login', this.updateElevatedRoleForLogin.bind(this));
	},
	
	/*
 	* Login handler
 	*/
	updateElevatedRoleForLogin: function(/* GlideUser */ user) {
		this.elevatedRolesArray = user.getAvailableElevatedRoles();
		this.activeElevatedRolesArray = user.getActiveElevatedRoles();
		
		if (this.activeElevatedRolesArray && this.activeElevatedRolesArray.length > 0) { //an elevated role exists
			CustomEvent.observe('glide:ui_notification.security', this.expireElevatedRole.bind(this));
		}
		
		var span = gel(this.span_name);
		if (this.elevatedRolesArray.length <= 0) {
			// if there are no available elevated roles, hide the control
			hideObject(span);
			return;
		}
		
		showObjectInlineBlock(span);
	},
	
	expireElevatedRole: function(/* UINotification*/ notification){
		if (this.activeElevatedRolesArray && this.activeElevatedRolesArray.length > 0) { //an elevated role exists
			var dialogClass = GlideDialogWindow,
				width;
			if (window.GlideModal) {
				dialogClass = GlideModal;
				width = 400;
			}
			
			var gDialog = new dialogClass("elevated_role_dialog", false, width);
			gDialog.setPreference('activeElevatedRoles', this.activeElevatedRolesArray);
			gDialog.setPreference('activeElevatedRoles', this.activeElevatedRolesArray.join(', '));
			gDialog.setTitle(new GwtMessage().getMessage('Elevated Roles has Expired'));
			gDialog.render();
		}
	},
	
	selectElevatedRole: function() {
		var dialogClass = GlideDialogWindow,
			width;
		if (window.GlideModal) {
			dialogClass = GlideModal;
			width = 400;
		}	
		var gDialog = new dialogClass("dialog_elevated_role", false, width);
		gDialog.setPreference('table', 'elevated_role_dialog');
		gDialog.setPreference('elevatedRolesArray', this.elevatedRolesArray);
		gDialog.setTitle(new GwtMessage().getMessage('Activate an Elevated Privilege'));
		gDialog.render();
	}
};