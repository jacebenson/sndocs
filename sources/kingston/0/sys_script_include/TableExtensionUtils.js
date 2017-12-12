
			var TableExtensionUtils = Class.create();

			TableExtensionUtils.prototype = Object.extendsObject(AbstractAjaxProcessor, {
				process: function () {
					if (this.getType() == "allowExtension") {
						return this.allowExtension(this.getName());
					}
				},

				allowExtension: function (tableName) {
					// Secured
					if (!gs.hasRole('admin')) {
						gs.logWarning("Security restricted: cannot execute", "TableExtensionUtils.allowExtension");
						return;
					}

					var tu = new TableUtils();
					return tu.createClassField(tableName);
				}
			});
			