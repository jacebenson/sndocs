var gFormAlreadySubmitted = false;

		function onSubmit() {
			// Only need to validate the name for new tables
			if (!g_form.isNewRecord()) {
				return true;
			}

			if (gFormAlreadySubmitted) {
				return true;
			}

			// validate table name does not already exist
			var tableNameValidator = new TableNameValidator();
			tableNameValidator.g_form = g_form;
			tableNameValidator.callback = onComplete;
			tableNameValidator.validateTableName();

			return false;
		}

		var TableNameValidator = function(){};

		TableNameValidator.prototype = {
			validateTableName: function() {
				var name = g_form.getValue('name');
				var scope = g_form.getValue('sys_scope');
				var ga = new GlideAjax('com.snc.apps.AppsAjaxProcessor');
				ga.addParam('sysparm_function', 'tableExists');
				ga.addParam('sysparm_name', name);
				ga.addParam('sysparm_scope', scope);
				ga.getXMLAnswer(this.validateTableNameCallback.bind(this));
			},

			validateTableNameCallback: function(message) {
				if(message != null && message.length > 0) {
					this.g_form.showFieldMsg('name', getMessage(message), 'error');
				} else {
					this.callback();
				}
			}
		}

		function onComplete() {
			gFormAlreadySubmitted = true;
			var action = gel(g_form.getActionName());
			if (action) {
				gsftSubmit(action);
			} else {
				// Hm. Just try submit in worst case...
				g_form.submit();
			}
		}