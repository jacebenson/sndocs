var SourceControlAjax = Class.create();

SourceControlAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	start: function() {
		var sys_app_id = this.getParameter('sysparm_ajax_processor_sys_app_id');
		var sys_repo_config_id = this.getParameter('sysparm_ajax_processor_sys_repo_config_id');
		var branch_name = this.getParameter('sysparm_ajax_processor_branch_name');
		var tag_name = this.getParameter('sysparm_ajax_processor_tag_name');
		var sys_repo_stash_id = this.getParameter('sysparm_ajax_processor_sys_repo_stash_id');
		var stash_message = this.getParameter('sysparm_ajax_processor_stash_message');
		var sys_repo_tag_id = this.getParameter('sysparm_ajax_processor_sys_repo_tag_id');
		var commit_message = this.getParameter('sysparm_ajax_processor_commit_message');
		var preserve_outgoing_changes = this.getParameter('sysparm_ajax_processor_preserve_outgoing_changes');
		var even_if_has_outgoing_changes = this.getParameter('sysparm_ajax_processor_even_if_has_outgoing_changes');
		var type = this.getParameter('sysparm_ajax_processor_type');
		var url = this.getParameter('sysparm_ajax_processor_user_input_url');
		var username = this.getParameter('sysparm_ajax_processor_user_input_username');
		var clearTextPassword = this.getParameter('sysparm_ajax_processor_user_input_password'); // Assume we have a cleartext password by default.

		// Override values if we are using an existing sys_repo_config record
		if (type == 'register_repo' && !gs.nil(sys_repo_config_id)) {
			var gr = new GlideRecord('sys_repo_config');
			gr.get(sys_repo_config_id);
			if (gr.isValidRecord()) {
				url = gr.url;
				username = gr.username;
				clearTextPassword = new GlideEncrypter().decrypt(gr.password); // Value in DB is encrypted, API needs cleartext
			}
		}

		// The UI will send the value of the password field.  If it hasn't been changed, this value will be the encrypted value.
		// If it has been changed, it will be a cleartext value.  Compare the password value to the existing sys_repo_config record
		// to see if we need to decrypt it before passing it to the API.
		if (type == 'test_connection' && !gs.nil(sys_repo_config_id)) {
			var gr = new GlideRecord('sys_repo_config');
			gr.get(sys_repo_config_id);
			if (gr.isValidRecord() && gr.password == clearTextPassword) {
				clearTextPassword = new GlideEncrypter().decrypt(gr.password); // Value in DB is encrypted, API needs cleartext
			}
		}

		if (!gs.nil(sys_repo_stash_id)) {
			var sysRepoStashGR = this._getSysRepoStashRecordById(sys_repo_stash_id);
			if (!gs.nil(sysRepoStashGR)) {
				sys_repo_config_id = sysRepoStashGR.getValue('sys_repo_config');
			}
		}

		if (!gs.nil(sys_repo_tag_id)) {
			var sysRepoTagGR = this._getSysRepoTagRecordById(sys_repo_tag_id);
			if (!gs.nil(sysRepoTagGR)) {
				sys_repo_config_id = sysRepoTagGR.getValue('sys_repo_config');
				tag_name = sysRepoTagGR.getValue('name');
			}
		}

		gs.log("SourceControlAjax: sys_app_id = " + sys_app_id);
		gs.log("SourceControlAjax: sys_repo_config_id = " + sys_repo_config_id);
		gs.log("SourceControlAjax: sys_repo_stash_id = " + sys_repo_stash_id);
		gs.log("SourceControlAjax: stash_message = " + stash_message);
		gs.log("SourceControlAjax: branch_name = " + branch_name);
		gs.log("SourceControlAjax: tag_name = " + tag_name);
		gs.log("SourceControlAjax: commit_message = " + commit_message);
		gs.log("SourceControlAjax: even_if_has_outgoing_changes = " + even_if_has_outgoing_changes);
		gs.log("SourceControlAjax: preserve_outgoing_changes = " + preserve_outgoing_changes);
		gs.log("SourceControlAjax: type = " + type);
		gs.log("SourceControlAjax: url = " + url);

		var progress_id;
		var progressStarter;
		var repo;

		if (type == 'import') {
			if (gs.nil(sys_app_id) && !gs.nil(sys_repo_config_id))
				sys_app_id = this._getSysAppId(sys_repo_config_id);
			progress_id = sn_vcs.AppSourceControl.applyIncomingChanges()
				.setSysApp(sys_app_id)
				.setStashMessage(stash_message)
				.setExecuteEvenIfHasNoIncomingChanges(true)
				.setExecuteEvenIfHasOutgoingChanges(even_if_has_outgoing_changes)
				.start();
		} else if (type == 'switch_to_branch') {
			if (gs.nil(sys_app_id) && !gs.nil(sys_repo_config_id))
				sys_app_id = this._getSysAppId(sys_repo_config_id);
			progressStarter = sn_vcs.AppSourceControl.switchToBranch()
				.setSysApp(sys_app_id)
				.setStashMessage(stash_message)
				.setBranchName(branch_name);
			if (!gs.nil(preserve_outgoing_changes))
				progressStarter.setPreserveOutgoingChanges(preserve_outgoing_changes)
			progress_id = progressStarter.start();
		} else if (type == 'register_repo') {
			if (gs.nil(sys_app_id) && !gs.nil(sys_repo_config_id))
				sys_app_id = this._getSysAppId(sys_repo_config_id);
			progressStarter = sn_vcs.AppSourceControl.registerRepository()
				.setRepositoryURL(url)
				.setUsername(username)
				.setPassword(clearTextPassword)
				.setCommitMessage(commit_message);
			if (!gs.nil(sys_app_id))
				progressStarter = progressStarter.setSysApp(sys_app_id);
			progress_id = progressStarter.start();

		} else if (type == 'export') {
			if (gs.nil(sys_app_id) && !gs.nil(sys_repo_config_id))
				sys_app_id = this._getSysAppId(sys_repo_config_id);
			progress_id = sn_vcs.AppSourceControl.commitOutgoingChanges()
				.setSysApp(sys_app_id)
				.setCommitMessage(commit_message)
				.start();
		} else if (type == 'test_connection') {
			progress_id = sn_vcs.SourceControl.testConnection()
				.setRepositoryURL(url)
				.setUsername(username)
				.setPassword(clearTextPassword)
				.setSysApp(sys_app_id)
				.start();
		}  else if (type == 'create_branch') {
			if (gs.nil(sys_repo_config_id))
				sys_repo_config_id = this._getSysRepoConfigId(sys_app_id);

			var cb = sn_vcs.SourceControl.createBranch();
			cb.setSysRepoConfig(sys_repo_config_id);
			cb.setBranchName(branch_name);
			if (!gs.nil(tag_name))
				cb.setBranchFromTag(tag_name);
			progress_id = cb.start();
		}  else if (type == 'create_branch_for_app') {
			if (gs.nil(sys_app_id))
				sys_app_id = this._getSysAppId(sys_repo_config_id);
			progressStarter = sn_vcs.AppSourceControl.createBranch();
			progressStarter.setSysApp(sys_app_id)
				.setBranchName(branch_name);
			if (!gs.nil(tag_name))
				progressStarter.setBranchFromTag(tag_name);
			progress_id = progressStarter.start();
		} else if (type == 'create_tag') {
			sys_app_id = this._getSysAppId(sys_repo_config_id);
			repo = sn_vcs.AppSourceControl.getRepository(sys_app_id);
			progress_id = repo.workers().createTag()
			    .setTagName(tag_name)
				.start();
		} else if (type == 'refresh_repo') {
			progress_id = sn_vcs.AppSourceControl.refreshRepository()
				.setSysRepoConfig(sys_repo_config_id)			
				.start();
		} else if (type == 'preview_stash') {
			progress_id = sn_vcs.SourceControl
				.getRepository(sys_repo_config_id)
				.workers().generateStashPreview()
				.setStash(sys_repo_stash_id)
				.start();
		} else if (type == 'commit_stash') {
			progress_id = sn_vcs.SourceControl
				.getRepository(sys_repo_config_id)
				.workers().commitStashPreview()
				.start();
		}  else
			gs.log("SourceControlAjax: unsupported type");

		gs.log("SourceControlAjax: progress_id = " + progress_id);

		return progress_id;
	},

	_getSysRepoStashRecordById: function(sys_repo_stash_id) {
		var gr = new GlideRecord('sys_repo_stash');
		gr.get(sys_repo_stash_id);
		if (!gr.isValidRecord()) {
			gs.log("SourceControlAjax: failed to look up sys_repo_stash record with sys_repo_stash_id = " + sys_repo_stash_id);
			return null;
		}
		return gr;
	},

	_getSysRepoTagRecordById: function(sys_repo_tag_id) {
		var gr = new GlideRecord('sys_repo_tag');
		gr.get(sys_repo_tag_id);
		if (!gr.isValidRecord()) {
			gs.log("SourceControlAjax: failed to look up sys_repo_tag record with sys_repo_tag_id = " + sys_repo_tag_id);
			return null;
		}
		return gr;
	},

	_getSysAppId: function(sys_repo_config_id) {
		var gr = new GlideRecord('sys_repo_config');
		gr.get(sys_repo_config_id);
		if (!gr.isValidRecord()) {
			gs.log("SourceControlAjax: failed to look up sys_app_id with sys_repo_config_id = " + sys_repo_config_id);
			return null;
		}
		gs.log("SourceControlAjax: looked up sys_app_id = " + gr.getValue('sys_app'));
		return gr.getValue('sys_app');
	},

	_getSysRepoConfigId: function(sys_app_id) {
		var gr = new GlideRecord('sys_repo_config');
		gr.get('sys_app', sys_app_id);
		if (!gr.isValidRecord()) {
			gs.log("SourceControlAjax: failed to look up sys_repo_config_id with sys_app_id = " + sys_app_id);
			return null;
		}
		gs.log("SourceControlAjax: looked up sys_repo_config_id = " + gr.getValue('sys_id'));
		return gr.getValue('sys_id');
	},

	getErrorCode: function() {
		var progress_id = this.getParameter('sysparm_progress_id');
		var error_code = new sn_vcs.SourceControlErrorInfoFinder().getErrorCodeFromTracker(progress_id);
		return error_code;
	},

	getErrorMessage: function() {
		var progress_id = this.getParameter('sysparm_progress_id');
		var error_message = new sn_vcs.SourceControlErrorInfoFinder().getErrorMessageFromTracker(progress_id);
		return error_message;
	},

	/**
     * get value from name/value pair in the result object of
     * @param sysparm_progress_id sys_execution_tracker.sys_id
     * @param sysparm_parameter_name name of name/value pair of the result object
     */
	getValueFromResult: function() {
		var progress_id = this.getParameter('sysparm_progress_id');
		var parameter_name = this.getParameter('sysparm_parameter_name');
		var value = new sn_vcs.SourceControlErrorInfoFinder().getValueFromResult(progress_id, parameter_name);
		return value;
	}
});
