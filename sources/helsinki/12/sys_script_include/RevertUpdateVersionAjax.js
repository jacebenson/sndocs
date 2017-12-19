var RevertUpdateVersionAjax = Class.create();

			RevertUpdateVersionAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
				revert: function () {
					// Secured.
					if (!gs.hasRole('admin')) {
						gs.logWarning("Security restricted: cannot execute", "RevertUpdateVersionAjax.revert");
						return;
					}

					var sys_id = this.getParameter('sysparm_sys_id');
					var versionAPI = new GlideappUpdateVersion();
					var isReverted = versionAPI.revert(sys_id);

					// Notify the user with the appropriate message when the entry could not be reverted
					// or a success message if able to revert.
					versionAPI.addUINotification();
				},

				revertToBaseSystem : function () {
					var sys_id = this.getParameter('sysparm_sys_id');

					var current = new GlideRecord('sys_upgrade_history_log');
					current.get(sys_id);

					var name = current.file_name;
					var grHead = GlideappUpdateVersion.getHeadVersion(name);
					if (grHead.isValidRecord()) {
							current.payload = grHead.payload;
					}

					var grBaselineHead = GlideappUpdateVersion.getVersion(name, current.upgrade_history, "sys_upgrade_history", null);
					if (grBaselineHead.isValidRecord()) {
							var isSuccess = GlideappUpdateVersion().revert(grBaselineHead.sys_id);
						if (isSuccess) {
							current.disposition = '5';
							current.resolution_status = 'reviewed_reverted';
							current.update();
						}
					}
				},

				toString: function () {
					return 'RevertUpdateVersionAjax';
				}
			});