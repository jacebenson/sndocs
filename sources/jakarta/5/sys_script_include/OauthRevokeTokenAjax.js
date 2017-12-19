var OauthRevokeTokenAjax = Class.create();
OauthRevokeTokenAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	proceedWithRevokeFromForm: function() {
		var objSysId = this.getParameter('sysparm_obj_id');
		var tblName = this.getParameter('sysparm_table_name');
		var disableWf = this.getParameter('sysparm_disable_wf');
		
		var gRecord = new GlideRecord(tblName);
		if(JSUtil.notNil(disableWf) && disableWf == 'true') {
			gRecord.setWorkflow(false);
		}
		if(gRecord.get(objSysId)) {
			this._expireToken(gRecord);
			this._revokeRefreshToken(gRecord.getValue('peer'), gRecord.getValue('user'));
			
		}
		return true;
	},
	
	proceedWithRevokeFromListContextMenu: function() {
		var objSysId = this.getParameter('sysparm_sys_id');
		var tblName = this.getParameter('sysparm_table_name');
		var disableWf = this.getParameter('sysparm_disable_wf');
		
		
		var gRecord = new GlideRecord(tblName);
		if(JSUtil.notNil(disableWf) && disableWf == 'true') {
			gRecord.setWorkflow(false);
		}
		if(gRecord.get(objSysId)) {
			this._expireToken(gRecord);
			this._revokeRefreshToken(gRecord.getValue('peer'), gRecord.getValue('user'));
			
		}
		return true;
	},
	
	proceedWithRevokeFromList: function() {
		var objSysIds = this.getParameter('sysparm_obj_list');
		var tblName = this.getParameter('sysparm_table_name');
		
		var objList = objSysIds.split(',');
		
		for(var i=0; i<objList.length; i++) {
			
			if(objList[i] == null || objList[i] == '') {
				continue;
			}
			var gr = new GlideRecord(tblName);
			gr.get('sys_id', objList[i]);
			this._expireToken(gr);
			this._revokeRefreshToken(gr.getValue('peer'), gr.getValue('user'));
		}
		return true;
	},
	
	_revokeRefreshToken: function(peer, user) {
		var gr = new GlideRecord('oauth_credential');
		gr.addQuery('peer', peer);
		gr.addQuery('user', user);
		gr.addQuery('type', 'refresh_token');
		gr.query();
		while (gr.next())
			this._expireToken(gr);
	},
	
	_expireToken: function(grCred) {
		//A user can revoke token if either the token belongs to him/her or he/she has admin role.
		if(this._canExpire(grCred)){
			var milliSeconds = new Date().getTime();
			var expires = new GlideDateTime(new Date(milliSeconds));
			grCred.setValue('expires', expires);
			grCred.update();
		}
	},
	
	_canExpire: function(grCred) {
			return gs.getSession().isLoggedIn() 
				&& ((GlideStringUtil.notNil(gs.getUserID()) 
					 && GlideStringUtil.notNil(grCred.user) && gs.getUserID() == grCred.user)
					|| gs.getUser().hasRole("admin"));
	},
	
	toString: function() { return 'OauthRevokeTokenAjax'; }
	});
	