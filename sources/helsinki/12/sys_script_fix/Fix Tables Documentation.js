
			fixTableHints();

			function fixTableHints() {
				var doc = new GlideRecord("sys_documentation");
				doc.initialize();
				doc.addQuery("name", "sys_db_object");
				doc.addQuery("element", "user_role");
				doc.addQuery("language", "en");
				doc.query();
				if (doc.next()) {
					doc.hint = "Role required for end users to access this table";
					if (doc.changes() && doc.update() != null) {
						gs.log("Updated sys_db_object user_role hint");
					}
				}
			}
			