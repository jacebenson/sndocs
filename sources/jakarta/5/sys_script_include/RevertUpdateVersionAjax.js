var RevertUpdateVersionAjax = Class.create();

			RevertUpdateVersionAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
				revert: function () {
					// prevent transaction cancellation by quota rules
					var t = null;
					var isUncancelable = false;
					try {
						t = GlideTransaction.get();
						if (t != null) {
							isUncancelable = t.isUncancelable();
							t.setCannotCancel(true);
						}

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
					} finally {
						if (t != null)
							t.setCannotCancel(isUncancelable);
					}
				},

				revertToBaseSystem : function (sys_id) {
					// prevent transaction cancellation by quota rules
					var t = null;
					var isUncancelable = false;
					try {
						t = GlideTransaction.get();
						if (t != null) {
							isUncancelable = t.isUncancelable();
							t.setCannotCancel(true);
						}

						if (typeof sys_id === "undefined")
							sys_id = this.getParameter('sysparm_sys_id');

						var current = new GlideRecord('sys_upgrade_history_log');
						current.get(sys_id);

						var name = current.file_name;
						var grHead = GlideappUpdateVersion.getHeadVersion(name);
						if (grHead.isValidRecord()) {
								current.payload = grHead.payload;
						}

						// if the record is from a store app, the baseline version has its source_table and source set to sys_store_app and the app ID
						var storeAppID = this._getStoreAppID(name);
						var grBaselineHead;
						if (storeAppID != null)
							grBaselineHead = GlideappUpdateVersion.getVersion(name, storeAppID, "sys_store_app", null);
						else
							grBaselineHead = GlideappUpdateVersion.getVersion(name, current.upgrade_history, "sys_upgrade_history", null);

						if (grBaselineHead.isValidRecord()) {
							var guv = new GlideappUpdateVersion();
							var isSuccess = guv.revert(grBaselineHead.sys_id);
							guv.addUINotification();
							if (isSuccess) {
								current.disposition = '5';
								current.resolution_status = 'reviewed_reverted';
								current.update();
							}
						} else {
							var gr = new GlideRecord('sys_upgrade_history');
							gr.get(current.upgrade_history);
							var uin = new UINotification();
							uin.setText(gs.getMessage('Your update version entry cannot be reverted because no base system version was found for upgrade {0}', gr.getValue('to_version')));
							uin.send();
						}
					} finally {
						if (t != null)
							t.setCannotCancel(isUncancelable);
					}
				},

				/**
				 * Checks if the record being reverted is a sys_store_app record.
				 * Returns the sys_store_app ID if it is, otherwise returns null.
				 */
				_getStoreAppID : function(name) {
					var gr = new GlideRecord('sys_metadata');
					gr.addQuery('sys_update_name', name);
					gr.query();
					if (gr.next()) {
						var actualGR = new GlideRecord(gr.sys_class_name);
						if (actualGR.get(gr.sys_id) && actualGR.isInStoreScope()) {
							if (!actualGR.isValidField("sys_scope"))
								return null;

							return actualGR.sys_scope.toString();
						}

						return null;
					}

					return null;
				},

				toString: function () {
					return 'RevertUpdateVersionAjax';
				}
			});