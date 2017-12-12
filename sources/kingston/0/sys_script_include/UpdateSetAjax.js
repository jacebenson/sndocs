var UpdateSetAjax = Class.create();

			UpdateSetAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
				process: function () {
					if (this.getType() == "getRole") {
						return this.getRole();
					}

					if (this.getType() == "getUpdateSets") {
						this.getUpdateSets();
						return;
					}

					if (this.getType() == "retrieveUpdateSets") {
						return this.retrieveUpdateSets();
					}
					
					if (this.getType() == "cancelRetrieve") {
						var trackerId = this.getParameter("sysparm_tracker_id");
						return this.cancelRetrieve(trackerId);
					}

					if (this.getType() == "getUpdateSetSkipCount") {
						return this.getUpdateSetSkipCount();
					}

					if (this.getType() == "changeUpdateSet") {
						this.changeUpdateSet(this.getValue());
						return;
					}

					if (this.getType() == "updateGetAvailable") {
						var host = this.getParameter("sysparm_host");
						var user = this.getParameter("sysparm_user");
						var pass = this.getParameter("sysparm_pass");
						this.updateGetAvailable(host, user, pass);
						return;
					}

					if (this.getType() == "updateApply") {
						var host = this.getParameter("sysparm_host");
						var user = this.getParameter("sysparm_user");
						var pass = this.getParameter("sysparm_pass");
						this.updateApply(host, user, pass, this.getValue());
						return;
					}
					
					if (this.getType() == "canReadUpdateSetTable") {
						return this.canReadUpdateSetTable();
					}					
				},

				getRole: function () {
					return gs.getProperty('glide.ui.update_set_picker.role');
				},

				getUpdateSetSkipCount: function () {
					var updateset_sys_id = this.getParameter("sysparm_remote_updateset_sys_id");
					var gr = new GlideRecord('sys_update_preview_xml');
					if (!gr.canRead()) {
						// Secured
						gs.logWarning("Security restricted: cannot read", "UpdateSetAjax.getUpdateSetSkipCount");
						return;
					}

					gr.addQuery('remote_update.remote_update_set', updateset_sys_id);
					gr.addQuery('proposed_action', 'skip');
					gr.query();
					var skipCount = gr.getRowCount();
					return skipCount;
				},

				getUpdateSets: function () {
					var gr = new GlideRecord("sys_update_set");
					if (!gr.canRead()) {
						// Secured
						gs.logWarning("Security restricted: cannot read", "UpdateSetAjax.getUpdateSets");
						return;
					}
					
					var us = new GlideUpdateSet();
					var currentSet = us.getOrCreate();
					var currentScopeDisplayName = gs.getCurrentApplicationScope();
					if (gs.isCurrentApplicationInGlobalScope())
						currentScopeDisplayName = gs.getMessage(currentScopeDisplayName);
					else
						currentScopeDisplayName = gs.getCurrentApplicationName();
					this.getRootElement().setAttribute('currentSet', currentSet);
					
					gr.orderBy('name');
					gr.addQuery('application.scope', gs.getCurrentApplicationScope());
					gr.addQuery('state', 'in progress');
					gr.query();
					
					while (gr.next()) {
						var item = this.newItem();
						item.setAttribute('value', gr.getValue('sys_id'));
						item.setAttribute('label', gs.getMessage('{0} [{1}]',
								[gr.getValue('name'), currentScopeDisplayName]));
					}
				},

				changeUpdateSet: function (sys_id) {
					var us = new GlideUpdateSet();
					us.set(sys_id);
				},
				
				retrieveUpdateSets: function() {
					var worker = new GlideUpdateSetWorker();
					var sys_id = this.getParameter('sysparm_id');
					worker.setUpdateSourceSysId(sys_id);
					worker.setBackground(true);
					worker.start();
					var progress_id = worker.getProgressID();
					return progress_id;
				},

				updateGetAvailable: function (url, user_id, password) {
					var i = 0;
					var lastName = '';
					var recordFound = true;
					var setsSeen = {};

					this.getRootElement().setAttribute('messages', 'failure: ' + url);

					while (recordFound) {
						recordFound = false;
						var r = new GlideRemoteGlideRecord(url, 'sys_update_set');
						r.setBasicAuth(user_id, password);

						r.addQuery('state', 'complete');
						if (lastName != '') {
							r.addQuery('name', '>', lastName);
						}

						r.orderBy('name');
						r.query();
						if (r.getError()) {
							this.getRootElement().setAttribute('messages', r.getErrorMessage());
							return;
						}

						// add the available updates
						while (r.next()) {
							recordFound = true;
							lastName = r.getValue('name');
							var id = r.getValue('sys_id');
							if (setsSeen[id]) {
								continue;
							}

							setsSeen[id] = true;
							var set = new GlideRecord('sys_update_set');
							if (set.get(id)) {
								continue;
							}  // already applied on current system

							i++;

							var item = this.newItem();
							item.setAttribute('value', r.getValue('sys_id'));
							item.setAttribute('text', r.getValue('name'));
						}
					}

					this.getRootElement().setAttribute('messages', 'available updates:' + i);

					if (gs.getProperty('glide.update.host') != url) {
						gs.log("Setting update host to: " + url);
						gs.setProperty('glide.update.host', url);
					}
				},

				// get (copy) the update set record and insert it
				// copy the children of the update set
				// when all are copied, apply
				updateApply: function (url, user_id, password, sys_ids) {
					this.getRootElement().setAttribute('messages', 'Done deal');
					var parts = sys_ids.split(",");
					var messages = new Array();
					for (var i = 0; i < parts.length; i++) {
						var sysID = parts[i];
						var msgs = this._updateGet(url, user_id, password, sysID);
						messages = messages.concat(msgs);
					}
					this.getRootElement().setAttribute('messages', messages.join('<br/>'));
				},

				canReadUpdateSetTable: function() {
					var updateset = new GlideRecord('sys_update_set');
					return (updateset.canRead());
				},
				
				_updateGet: function (url, user_id, password, sys_id) {
					// check if already applied on current system
					var set = new GlideRecord('sys_update_set');
					if (set.get(sys_id)) {
						this.getRootElement().setAttribute('messages', 'Update set ' + set.name + ' already exists on target system');
						return;
					}

					sys_id = this._buildSetRecord(url, user_id, password, sys_id);

					if (sys_id) {
						var msgs = this._updateRetrieveSet(url, user_id, password, sys_id);
						msgs = msgs.concat(this._applySet(sys_id));
						return msgs;
					} else {
						var msgs = new Array();
						msgs.push("Error occuring attempting to create update set on local system");
						return msgs;
					}
				},

				// Create an update_set record on the current system that matches what
				// we are copying from the remote system
				_buildSetRecord: function (url, user_id, password, sys_id) {
					var lr = new GlideRecord('sys_update_set');
					if (!lr.canCreate())
					// Secured.
					{
						return null;
					}
					
					return this._sub_buildSetRecord(lr, url, user_id, password, sys_id);
				},
				
				_sub_buildSetRecord: function (lr, url, user_id, password, sys_id) {
					// this was separated from the _buildSetRecord to enable security testing
					var r = new GlideRemoteGlideRecord(url, 'sys_update_set');
					r.setBasicAuth(user_id, password);
					r.addQuery('sys_id', sys_id);
					r.query();

					if (r.next()) {
						lr.initialize();
						lr.setNewGuidValue(r.getValue('sys_id'));
						lr.name = r.getValue('name');
						lr.description = r.getValue('description');
						lr.release_date = r.getValue('release_date');
						lr.install_date = gs.now();
						lr.installed_from = url;
						lr.state = 'complete';
						lr.insert();
						lr = new GlideRecord('sys_update_set');

						if (!lr.get(sys_id)) {
							return null;
						}
					} else {
						return null;
					}

					return sys_id;
				},

				// applies the changes in the set to the current system
				_applySet: function (sys_id) {
					gs.print("Apply Update Set: " + sys_id);
					var apply = new GlideUpdateManager2();
					GlideSessionDebug.enable("log");
					apply.loadUpdateSet(sys_id);
					var msgs = GlideSessionDebug.getOutputMessages();
					GlideSessionDebug.disable("all");
					var rmsgs = new Array();

					for (var i = 0; i < msgs.size(); i++) {
						var line = msgs.get(i).getLine();
						line = "--> " + line;
						rmsgs.push(line);
					}

					gs.cacheFlush();
					return rmsgs;
				},

				// Get all the records from the remote system for a given update_set
				// and copy them to the local system
				_updateRetrieveSet: function (url, user_id, password, sys_id) {
					// get the available updates
					var i = 0;
					var messages = new Array();
					var recordFound = true;
					var lastSysID = '';

					while (recordFound) {
						recordFound = false;
						var r = new GlideRemoteGlideRecord(url, 'sys_update_xml');
						r.setBasicAuth(user_id, password);
						r.addQuery('update_set', sys_id);
						if (lastSysID != '') {
							r.addQuery('sys_id', '>' + lastSysID);
						}
						r.orderBy('sys_id');
						r.query();
						if (r.getError()) {
							this.getRootElement().setAttribute('messages', r.getErrorMessage());
							return;
						}
						while (r.next()) {
							i++;
							recordFound = true;
							this._copyRecord(messages, r);
							lastSysID = r.getValue('sys_id');
							messages.push(r.getValue('name'));
						}
						if (recordFound) {
							gs.log("Got " + i + " Records so far, checking for more");
						}
					}
					if (i == 0) {
						messages.push("No updates found");
					}
					else if (i == 1) {
						messages.push("Update found: 1");
					}
					else {
						messages.push("Updates found: " + i);
					}

					messages.reverse();
					return messages;
				},

				// make a copy of the remote record and insert into local system
				// use the same sys_id value from the remote system
				_copyRecord: function (messages, r) {
					var lr = new GlideRecord('sys_update_xml');
					var id = r.getValue('sys_id');
					if (lr.get(id)) {
						if (lr.update_set.isNil()) {
							messages.push("Update entry " + lr.name + " is being replaced by entry from remote system ");
						} else {
							messages.push("Update entry " + lr.name +
									" currently in update set '" + lr.update_set.name + "' is being replaced by entry from remote system ");
						}
						lr.update_set = r.getValue('update_set');
						lr.name = r.getValue('name');
						lr.category = r.getValue('category');
						lr.payload = r.getValue('payload');
						if (lr.validField('sys_recorded_at') && (r.validField('sys_recorded_at')))
							lr.sys_recorded_at = r.sys_recorded_at;
						lr.setNewGuidValue(r.getValue('sys_id'));
						lr.update();
					} else {
						lr.initialize();
						lr.update_set = r.getValue('update_set');
						lr.name = r.getValue('name');
						lr.category = r.getValue('category');
						lr.payload = r.getValue('payload');
						if (lr.validField('sys_recorded_at') && (r.validField('sys_recorded_at')))
							lr.sys_recorded_at = r.sys_recorded_at;
						lr.setNewGuidValue(r.getValue('sys_id'));
						lr.insert();
					}
				},
				
				cancelRetrieve: function(trackerId) {
					var tracker = SNC.GlideExecutionTracker.getBySysID(trackerId);
					tracker.updateMessage("Canceling update set retrieve...");
					result = {'update_set_retrieve_cancel_requested': 'true'};
					tracker.updateResult(result);
					return;
				},

				type: "UpdateSetAjax"
			});