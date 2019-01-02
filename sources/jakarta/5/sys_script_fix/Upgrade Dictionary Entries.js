// Reuse these gliderecords repeatedly below...
		var dict = new GlideRecord("sys_dictionary");
		var doc = new GlideRecord("sys_documentation");

		/*
		 sys_dictionary
		 <element name="max_length" mandatory="false"/>
		 */
		dict.initialize();
		dict.addQuery("name", "sys_dictionary");
		dict.addQuery("element", "max_length");
		dict.query();
		if (dict.next()) {
			dict.mandatory = false;
			dict.setWorkflow(false);
			if (dict.changes() && dict.update()) {
				gs.log("Updated sys_dictionary max_length element to mandatory = false")
			}
		}

		/*
		 sys_documentation
		 <element name="label" max_length="50" display="true"/>
		 */
		dict.initialize();
		dict.addQuery("name", "sys_documentation");
		dict.addQuery("element", "label");
		dict.query();
		if (dict.next()) {
			dict.display = true;
			dict.setWorkflow(false);
			if (dict.changes() && dict.update()) {
				gs.log("Updated sys_documentation label element to display = true")
			}
		}

		/*
		 sys_glide_object
		 <element name="label" display="true" hint="The display name of this field type" type="translated_field"/>
		 */
		dict.initialize();
		dict.addQuery("name", "sys_glide_object");
		dict.addQuery("element", "label");
		dict.query();
		if (dict.next()) {
			dict.display = true;
			dict.internal_type = "translated_field";
			dict.setWorkflow(false);
			if (dict.changes() && dict.update()) {
				gs.log("Updated sys_glide_object label element to display = true and internal_type = translated_field")
			}
		}

		/*
		 sys_dictionary
		 <element name="element" display="false"/>
		 */
		dict.initialize();
		dict.addQuery("name", "sys_dictionary");
		dict.addQuery("element", "element");
		dict.query();
		if (dict.next()) {
			dict.display = false;
			dict.setWorkflow(false);
			if (dict.changes() && dict.update()) {
				gs.log("Updated sys_dictionary element (column name) element to display = false")
			}
		}

		/*
		 sys_dictionary
		 <element name="reference" type="reference" reference="sys_db_object" reference_key="name"
		 dynamic_creation="true" dynamic_creation_script="current.label = value; return current.insert();"/>
		 */
		dict.initialize();
		dict.addQuery("name", "sys_dictionary");
		dict.addQuery("element", "reference");
		dict.query();
		if (dict.next()) {
			dict.internal_type = "reference";
			dict.reference = "sys_db_object";
			dict.reference_key = "name";
			dict.dynamic_creation = true;
			dict.dynamic_creation_script = "new TableUtils().createTableFromDynamicReference(current, value, parent, typeof grandparent != 'undefined' ? grandparent : null);";
			dict.setWorkflow(false);
			if (dict.changes() && dict.update()) {
				gs.log("Updated sys_dictionary reference element to reference sys_db_object with reference key " +
					"= name and dynamic_creation = true");
			}
		}

		/*
		 sys_dictionary
		 <element name="reference_qual" max_length="255" hint="References may depend on another value, for example role=itil" />
		 */
		doc.initialize();
		doc.addQuery("name", "sys_dictionary");
		doc.addQuery("element", "reference_qual");
		doc.addQuery("language", "en");
		doc.query();
		if (doc.next()) {
			doc.hint = "References may depend on another value, for example role=itil";
			if (doc.changes() && doc.update() != null) {
				gs.log("Updated sys_dictionary reference_qual element hint");
			}
		}

		/*
		 sys_dictionary
		 <element name="internal_type" type="reference" reference="sys_glide_object" reference_qual="javascript:gs.hasRole('maint')?'':'visible=true';" reference_key="name" label="Type" />
		 */
		dict.initialize();
		dict.addQuery("name", "sys_dictionary");
		dict.addQuery("element", "internal_type");
		dict.query();
		if (dict.next()) {
			dict.internal_type = "reference";
			dict.reference = "sys_glide_object";
			dict.reference_qual = "javascript:gs.hasRole('maint')?'':'visible=true';";
			dict.reference_key = "name";
			dict.setWorkflow(false);
			if (dict.changes() && dict.update()) {
				gs.log("Updated sys_dictionary internal_type element to reference sys_glide_object");
			}
		}

		/*
		 sys_db_object
		 <element name="name" table_reference="true" label="Name" mandatory="true" hint="The internal name of the table that cannot later be changed"/>
		 */
		dict.initialize();
		dict.addQuery("name", "sys_db_object");
		dict.addQuery("element", "name");
		dict.query();
		if (dict.next()) {
			dict.mandatory = true;
			dict.setWorkflow(false);
			if (dict.changes() && dict.update()) {
				gs.log("Updated sys_db_object name to mandatory = true");
			}
		}
		doc.initialize();
		doc.addQuery("name", "sys_db_object");
		doc.addQuery("element", "name");
		doc.addQuery("language", "en");
		doc.query();
		if (doc.next()) {
			doc.label = "Name";
			doc.plural = "Name";
			doc.hint = "The internal name of the table that cannot later be changed";
			if (doc.changes() && doc.update() != null) {
				gs.log("Updated sys_db_object name element label, plural and hint");
			}
		}
		/*
		 sys_db_object
		 <element name="super_class" type="reference" label="Extends table" reference="sys_db_object" reference_qual="is_extendable=true" hint="Table this table inherits fields from"/>
		 */
		dict.initialize();
		dict.addQuery("name", "sys_db_object");
		dict.addQuery("element", "super_class");
		dict.query();
		if (dict.next()) {
			dict.reference_qual = "is_extendable=true";
			dict.setWorkflow(false);
			if (dict.changes() && dict.update()) {
				gs.log("Updated sys_db_object super_class reference_qual='is_extendable=true'");
			}
		}
		doc.initialize();
		doc.addQuery("name", "sys_db_object");
		doc.addQuery("element", "super_class");
		doc.addQuery("language", "en");
		doc.query();
		if (doc.next()) {
			doc.label = "Extends table";
			doc.plural = "Extends table";
			doc.hint = "Table this table inherits fields from";
			if (doc.changes() && doc.update() != null) {
				gs.log("Updated sys_db_object super_class element label, plural and hint");
			}
		}
		/*
		 sys_number
		 <element name="prefix" hint="Characters added to the beginning of the number to differentiate tables" display="true"/>
		 */
		dict.initialize();
		dict.addQuery("name", "sys_number");
		dict.addQuery("element", "prefix");
		dict.query();
		if (dict.next()) {
			dict.display = true;
			dict.setWorkflow(false);
			if (dict.changes() && dict.update()) {
				gs.log("Updated sys_number prefix display = true");
			}
		}
		/*
		 sys_number
		 <element name="category" type="reference" reference="sys_db_object" reference_key="name" label="Table" table_reference="true" hint="Table the number is associated with"/>
		 */
		doc.initialize();
		doc.addQuery("name", "sys_number");
		doc.addQuery("element", "category");
		doc.addQuery("language", "en");
		doc.query();
		if (doc.next()) {
			doc.hint = "Table the number is associated with";
			if (doc.changes() && doc.update() != null) {
				gs.log("Updated sys_number category element hint");
			}
		}
		/*
		 sys_number
		 <element name="maximum_digits" type="integer" hint="Number of digits for the number, zero (0) padded from the left.  Set value to zero (0) for no padding." default="7" label="Number of digits"/>
		 */
		doc.initialize();
		doc.addQuery("name", "sys_number");
		doc.addQuery("element", "maximum_digits");
		doc.addQuery("language", "en");
		doc.query();
		if (doc.next()) {
			doc.hint = "Number of digits for the number, zero (0) padded from the left.  Set value to zero (0) for no padding.";
			if (doc.changes() && doc.update() != null) {
				gs.log("Updated sys_number maximum_digits element hint");
			}
		}

		/*
		 sys_app_module:
		 <element name="application" label="Application menu" hint="The navigation menu where this module should reside"/>
		 */
		doc.initialize();
		doc.addQuery("name", "sys_app_module");
		doc.addQuery("element", "application");
		doc.addQuery("language", "en");
		doc.query();
		if (doc.next()) {
			doc.hint = "The navigation menu where this module should reside";
			doc.plural = "Application menu";
			if (doc.changes() && doc.update() != null) {
				gs.log("Updated sys_db_object super_class element label, plural and hint");
			}
		}
