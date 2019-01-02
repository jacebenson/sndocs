var hr_CaseCreation = Class.create();
hr_CaseCreation.prototype = {
	initialize: function() {
		this.TEXT_QUERY = "123TEXTQUERY321";
		this.searchTables = ["sys_user", "sn_hr_core_profile"]; // TODO Better support extended tables (eg. u_employee extending sys_user)

		// Create configuration object based on configuration record
		var evConfigGr = new GlideRecord("sn_hr_core_config_case_creation");
		evConfigGr.setLimit(1);
		evConfigGr.query();
		if (evConfigGr.next()) {
			// Search attributes
			this.pageSize = parseInt(evConfigGr.getValue("page_size"));
			this.minimumInputLength = parseInt(evConfigGr.getValue("minimum_input_length"));
			this.forcePartialSearch = evConfigGr.getValue("force_partial_search") == "1";
			// Employee Search
			this.userObjectTable = evConfigGr.getValue("display_table");
			this.userSearchCondition = (evConfigGr.getValue("limit_users_on_search") == "1") ? evConfigGr.getValue("user_search_condition") : "";
			this.userColumn = evConfigGr.getValue("user_field");
			this.additionalDisplayFields = evConfigGr.getValue("additional_display_fields") ? evConfigGr.getValue("additional_display_fields").split(",") : [];
			this.links = evConfigGr.getValue("links") ? evConfigGr.getValue("links").split(",") : [];
			// Case search
			this.taskSearchTable = evConfigGr.getValue("task_search_table");
			this.taskSearchCondition = (evConfigGr.getValue("limit_tasks_on_search") == "1") ? evConfigGr.getValue("task_search_condition") : "";
			this.taskUserFields = evConfigGr.getValue("task_user_fields") ? evConfigGr.getValue("task_user_fields").split(",") : [];
			// Employee information
			this.fields = {
				left_fields : evConfigGr.getValue("fields_left") ? evConfigGr.getValue("fields_left").split(",") : [],
				right_fields : evConfigGr.getValue("fields_right") ? evConfigGr.getValue("fields_right").split(",") : []
			};
			// Case creation
			this.taskCreateTable = evConfigGr.getValue("task_create_table");
			this.serviceCondition = (evConfigGr.getValue("limit_services") == "1") ? evConfigGr.getValue("service_condition") : "";
			this.taskFields = {
				left_fields : evConfigGr.getValue("fields_left_task") ? evConfigGr.getValue("fields_left_task").split(",") : [],
				right_fields : evConfigGr.getValue("fields_right_task") ? evConfigGr.getValue("fields_right_task").split(",") : [],
				bottom_fields : evConfigGr.getValue("fields_bottom_task") ? evConfigGr.getValue("fields_bottom_task").split(",") : []
			};
			
		} else { // Default if record not found
			// Search attributes
			this.pageSize = 10;
			this.minimumInputLength = 4;
			this.forcePartialSearch = true;
			// Employee Search
			this.userObjectTable = "sn_hr_core_profile";
			this.userSearchCondition = "";
			this.userColumn = "user";
			this.additionalDisplayFields = ["user.department", "user.employee_number", "user.location"];
			this.links = [];
			// Case search
			this.taskSearchTable = "sn_hr_core_case";
			this.taskSearchCondition = "";
			this.taskUserFields = ["subject_person", "opened_for", "opened_by", "watch_list"];
			// Employee information
			this.fields = {
				left_fields : ["user.name", "user.employee_number"],
				right_fields : ["user.email", "user.zip"]
			};
			// Case creation
			this.taskCreateTable = "sn_hr_core_case";
			this.serviceCondition = "";
			this.taskFields = {
				left_fields : [],
				right_fields : ["subject_person", "opened_for"],
				bottom_fields : ["work_notes"]
			};
		}

		this.taskPrefixes = [];
		var sysNumberGr = new GlideRecord("sys_number");
		sysNumberGr.addQuery("category", "INSTANCEOF", this.taskSearchTable);
		sysNumberGr.query();
		while (sysNumberGr.next())
			this.taskPrefixes.push(sysNumberGr.getValue("prefix"));
	},

	/**
	* Search for an employee by key words
	* @param searchTermParam String Search term input
	* @param searchPage number Search page used for pagination (starts at 0)
	* @param searchTable String (optional) Table name used for pagination
	* @return Object
	*    Example:
	* {
	*    list : Array Either an array of Objects from @function getUserObject for table searches OR
	*        Objects for task searches, Example:
	*            {
	*                display : String Task display value,
	*                users : array of Objects from @function getUserObject
	*            }
	*    total : number The total number of search results (can be more than results returned),
	*    table : String Table name to use for pagination
	* }
	*/
	search: function(searchTermParam, searchPage, searchTable) {
		var list = [];
		var total = 0;
		var table = "";

		// Parse search terms
		var taskTerms = [];
		var searchTerms = [];
		// TODO Should we require more than 1 number?
		// Example: ^(HRC|HRT)[0-9]+$
		var taskRegex = "^(" + this.taskPrefixes.join("|") + ")[0-9]+$";
		var searchTermParams = searchTermParam.split(" ");
		for (var i = 0; i < searchTermParams.length; i++)
			if (searchTermParams[i].match(taskRegex, "i"))
				taskTerms.push(searchTermParams[i]);
			else if (searchTermParams[i])
				searchTerms.push(this.appendPartialSearch(searchTermParams[i]));

		var taskTerm = taskTerms.join(" | ");
		var searchTerm = searchTerms.join(" ");

		// TODO This prevents searching users if task term is found, but what if user meant to search users?
		// Search tasks only if we have task search terms
		if (taskTerm) {
			var userTables = new GlideTableHierarchy("sys_user").getAllExtensions();
			var userObjectTables = new GlideTableHierarchy(this.userObjectTable).getAllExtensions();
			// Search for relevant tasks
			var taskSearchGr = new GlideRecord(this.taskSearchTable);
			taskSearchGr.addQuery(this.TEXT_QUERY, taskTerm);
			if (searchTerm)
				taskSearchGr.addQuery(this.TEXT_QUERY, searchTerm);
			if (this.taskSearchCondition)
				taskSearchGr.addEncodedQuery(this.taskSearchCondition);
			taskSearchGr.chooseWindow(searchPage * this.pageSize, (searchPage * this.pageSize) + this.pageSize);
			taskSearchGr.orderBy("ir_query_score");
			taskSearchGr.query();
			while (taskSearchGr.next()) {
				var taskObject = {
					displayValue: taskSearchGr.getDisplayValue(),
					table: taskSearchGr.getRecordClassName(),
					reference: taskSearchGr.getRecordClassName(),
					value: taskSearchGr.getUniqueValue(),
					label: taskSearchGr.getClassDisplayValue(),
					column_name: "task_object",
					internal_type: "reference",
					type: "reference",
					tooltip: gs.getMessage("{0} - Open reference record in current window", taskSearchGr.getClassDisplayValue())
				};
				// Find all relevant users on a given task
				var taskUserList = [];
				var taskUserMap = {};
				
				for (var j = 0; j < this.taskUserFields.length; j++) {
					var element = taskSearchGr.getElement(this.taskUserFields[j]);
					if (element == null || element.toString() == null || !element.canRead())
						continue;
					var eleEd = element.getED();
					var eleInternalType = eleEd.getInternalType();
					if (eleInternalType == "reference" || eleInternalType == "glide_list") {
						// TODO PRB1086657: element.getED().getReference() is not available in scope yet
						var eleTable;
						if (eleInternalType == "reference")
							eleTable = element.getReferenceTable();
						else {
							var elementDictionaryGr = new GlideRecord("sys_dictionary");
							elementDictionaryGr.addQuery("name", eleEd.getTableName());
							elementDictionaryGr.addQuery("element", this.taskUserFields[j]);
							elementDictionaryGr.query();
							if (elementDictionaryGr.next())
								eleTable = elementDictionaryGr.getValue("reference");
						}
						// Verify eleTable is a sys_user or extension, or a this.userObjectTable or extension
						if (!eleTable || (userTables.indexOf(eleTable) == -1 && userObjectTables.indexOf(eleTable) == -1))
							continue;
						var elementTableGr = new GlideRecordSecure(eleTable);
						elementTableGr.addQuery("sys_id", "IN", element.toString());
						if (searchTerm)
							elementTableGr.addQuery(this.TEXT_QUERY, searchTerm);
						elementTableGr.setLimit(100); // Limit results just in case
						elementTableGr.orderBy(elementTableGr.getDisplayName());
						elementTableGr.query();
						while (elementTableGr.next()) {
							// Skip this record if it was already added (doesn't work for non sys_user references)
							if (taskUserMap.hasOwnProperty(elementTableGr.getUniqueValue())) {
								taskUserMap[elementTableGr.getUniqueValue()].display_suffix.push(element.getLabel());
								continue;
							}
							var userElementObject = this.getUserObject(elementTableGr);
							if (userElementObject) {
								// This second check is needed if the element does not reference sys_user
								if (taskUserMap.hasOwnProperty(userElementObject.sys_id)) {
									taskUserMap[userElementObject.sys_id].display_suffix.push(element.getLabel());
									continue;
								}
								userElementObject.display_suffix = [element.getLabel()];
								userElementObject.task = taskObject;
								taskUserMap[userElementObject.sys_id] = userElementObject;
								taskUserList.push(userElementObject);
							}
						}
					}
				}
				if (taskUserList.length > 0) {
					list.push({
						display: taskSearchGr.getDisplayValue(),
						users: taskUserList
					});
				}
			}
			table = this.taskSearchTable;
			total = taskSearchGr.getRowCount();

		// Search this.searchTables, only returning results from one table failing over to the next when no results are found
		} else {
			// Skip to requested table if provided
			var k = 0;
			if (searchTable)
				k = this.searchTables.indexOf(searchTable);

			for (/* k is instantiated above */; k > -1 && k < this.searchTables.length && list.length == 0; k++) {
				// Search table using search input as key word search
				var searchGr = new GlideRecordSecure(this.searchTables[k]);
				searchGr.addQuery(this.TEXT_QUERY, searchTerm);
				if (this.userSearchCondition)
					searchGr.addEncodedQuery(this.getUserQuery(this.userSearchCondition, this.searchTables[k]));
				searchGr.chooseWindow(searchPage * this.pageSize, (searchPage * this.pageSize) + this.pageSize);
				searchGr.orderBy("ir_query_score");
				searchGr.query();
				while (searchGr.next()) {
					var userObject = this.getUserObject(searchGr);
					if (userObject)
						list.push(userObject);
				}
				total = searchGr.getRowCount();
				table = this.searchTables[k];

				// If search table is provided, don't failover to next table
				if (searchTable)
					break;
			}
		}

		return {
			list: list,
			total: total,
			table: table
		};
	},

	// TODO Better support names with apostrophe (eg. al'ghul -> al ghul*)
	/**
	* Force a search term to allow partial matching
	* @param searchTerm String Search term to force partial searching on
	* @return String Partialized search term
	*/
	appendPartialSearch: function(searchTerm) {
		if (this.forcePartialSearch
			&& searchTerm.indexOf("*") == -1
			&& searchTerm.indexOf('"') == -1
			&& searchTerm.indexOf("'") == -1
			&& searchTerm != "AND"
			&& searchTerm != "OR"
			&& searchTerm != "|")
			return searchTerm += "*";

		return searchTerm;
	},

	/**
	* Adapt an encoded query to work when querying this.userObjectTable instead of sys_user table
	* Example: For @param encodedQuery of "active=true^ORmarital_status=single"
	*     return "user.active=true^ORuser.marital_status=single" for sn_hr_core_profile
	*     return "active=true^ORmarital_status=single" for sys_user
	* @param encodedQuery String Field name to parse
	* @param tableName String table name to query on
	* @return String Parsed encoded query
	*/
	getUserQuery: function(encodedQuery, tableName) {
		if (!encodedQuery || tableName != this.userObjectTable || !this.userColumn)
			return encodedQuery;
		
		var queries = encodedQuery.split("^NQ");
		var queriesRet = [];
		for (var i = 0; i < queries.length; i++) {
			var orConditions = queries[i].split("^OR");
			var orConditionsRet = [];
			for (var j = 0; j < orConditions.length; j++) {
				var andConditions = orConditions[j].split("^");
				var andConditionsRet = [];
				for (var k = 0; k < andConditions.length; k++)
					andConditionsRet.push(this.userColumn + "." + andConditions[k]);
				if (andConditionsRet.length > 0)
					orConditionsRet.push(andConditionsRet.join("^"));
			}
			if (orConditionsRet.length > 0)
				queriesRet.push(orConditionsRet.join("^OR"));
		}
		
		return queriesRet.join("^NQ");
	},

	/**
	* Return a user object for a given GlideRecord
	* @param record GlideRecord to use as basis for user object
	* @return Object
	*    Example:
	* {
	*    sys_id : sys_id of a user,
	*    display : display value of a user,
	*    table: reference table of user field, or table of the user record,
	*    has_ev_record: boolean representing if Employee Verification record exists,
	*    ev_sys_id : sys_id of employee verification record,
	*    ev_table : table of the employee verification record,
	*    tooltip : display value for tooltip on reference icon,
	*    active: boolean if user is active,
	*    additional_display_fields : (optional) array of field display values,
	*    left_fields : (optional) array from @function getFieldObjects,
	*    right_fields : (optional) array from @function getFieldObjects
	* }
	*/
	getUserObject: function(record) {
		// Attempt to find the evConfig table's record for the passed in record
		var hasEVRecord = false; // Failover if not found to parsing out the user fields on evconfig
		var recordTable = record.getTableName();
		if (recordTable != this.userObjectTable) {
			var userObjectTableGr = new GlideRecord(this.userObjectTable);
			if (this.userColumn && userObjectTableGr.isValidField(this.userColumn) && userObjectTableGr.get(this.userColumn, record.getUniqueValue())) {
				record = userObjectTableGr;
				hasEVRecord = true;
			}
		} else
			hasEVRecord = true;

		var userObject = {
			sys_id: (hasEVRecord && this.userColumn) ? record.getValue(this.userColumn) : record.getUniqueValue(),
			display: (hasEVRecord && this.userColumn) ? record.getElement(this.userColumn).getDisplayValue() : record.getDisplayValue(),
			table: (hasEVRecord && this.userColumn && record.getElement(this.userColumn).getED().getInternalType() == "reference") ? record.getElement(this.userColumn).getReferenceTable() : record.getTableName(),
			has_ev_record: hasEVRecord,
			ev_sys_id: (hasEVRecord) ? record.getUniqueValue() : '',
			ev_table: (hasEVRecord) ? record.getTableName() : '',
			tooltip: gs.getMessage("{0} - Open reference record in current window", record.getClassDisplayValue())
		};
		
		if (this.links.length && userObject.ev_sys_id && userObject.ev_table) {
			userObject.links = [];
			for (var j = 0; j < this.links.length; j++) {
				var linkGr = new GlideRecord("link_generator_mapping");
				if (linkGr.get(this.links[j]))
					userObject.links.push({url:'', btnName:linkGr.getDisplayValue('btn_name')});
			}
		}
		
		// Add "active" property
		var userPrefix = (hasEVRecord && this.userColumn) ? (this.userColumn + ".") : "";
		var activeElement = record.getElement(userPrefix + "active");
		if (activeElement != null && activeElement.toString() != null && activeElement.toString() !== "true")
			userObject.active = activeElement.toString() === "true";

		// Add display values for additional display fields
		if (this.additionalDisplayFields && this.additionalDisplayFields.length) {
			var additionalDisplayFieldsArr = [];
			for (var i = 0; i < this.additionalDisplayFields.length; i++) {
				var fieldName = this.getUserField(this.additionalDisplayFields[i], hasEVRecord);
				var fieldElement = record.getElement(fieldName);
				if (fieldElement != null && fieldElement.toString() !== null && fieldElement.canRead())
					additionalDisplayFieldsArr.push(fieldElement.getDisplayValue());
			}
			if (additionalDisplayFieldsArr.length)
				userObject.additional_display_fields = additionalDisplayFieldsArr;
		}

		// Add all field lists to userObject
		for (var key in this.fields)
			userObject[key] = this.getFieldObjects(record, this.fields[key], hasEVRecord);

		return userObject;
	},

	/**
	* Parse a field name to retrieve a dot walked column when a user does not have a record in the specified EV Config table
	* Example: For @param fieldName of "user.employee_number", parse out "employee_number"
	* @param fieldName String Field name to parse
	* @param hasEVRecord (optional) boolean Employee Verification record exists
	* @return String Parsed field name
	*/
	getUserField: function(fieldName, hasEVRecord) {
		if (hasEVRecord || !fieldName)
			return fieldName;
		if (fieldName.startsWith(this.userColumn + "."))
			return fieldName.slice(this.userColumn.length + 1); // Attempt to directly grab the user field

		return null;
	},

	/**
	* Call @function getFieldObject on an array of field names
	* @param record GlideRecord to use in @function getFieldObject
	* @param fieldList array Array of field names to use in @function getFieldObject
	* @param hasEVRecord boolean Employee Verification record exists for record
	* @return array of field objects produced from @function getFieldObject
	*/
	getFieldObjects: function(record, fieldList, hasEVRecord) {
		var fields = [];
		for (var i = 0; i < fieldList.length; i++) {
			var field = this.getFieldObject(record, this.getUserField(fieldList[i], hasEVRecord));
			if (field)
				fields.push(field);
		}

		return fields;
	},

	/**
	* Return a field object for a given GlideRecord and field name
	* @param record GlideRecord to create field object from
	* @param fieldName String Field name to create a field object for
	*    Example:
	* @return Object
	* {
	*    display : display value of a field,
	*    label : label of a field,
	*    value : value of a field,
	*    column_name : column name of a field,
	*    max_length : max length of a field,
	*    internal_type : internal type of a field,
	*    type : internal type of a field (used for DEO angular directive)
	* }
	*/
	getFieldObject: function(record, fieldName) {
		var element = record.getElement(fieldName);
		if (element == null || element.toString() == null || !element.canRead())
			return null;

		var eleEd = element.getED();

		var fieldObject = {
			display: element.getDisplayValue(),
			label: element.getLabel(),
			value: element.toString(),
			column_name: fieldName,
			max_length: eleEd.getLength(),
			internal_type: eleEd.getInternalType(),
			type: eleEd.getInternalType()
		};
		if (eleEd.getInternalType() == "reference")
			this._addReferenceProperties(fieldObject, element, record.getTableName());
		else if (eleEd.getInternalType() == "glide_list")
			this._addGlideListProperties(fieldObject, element, record.getTableName());
 		else if (eleEd.isChoiceTable())
 			this._addChoiceProperties(fieldObject, element, record.getTableName());

		return fieldObject;
	},
	
	/**
	* Add reference specific properties to a given Object from @function getFieldObject
	* @param fieldObject Object Field object from @function getFieldObject
	* @param element GlideElement Field element
	* @param tableName String Table name to get qualifier for
	* Adds properties:
	*    table : table name for a reference field,
	*    reference : table name for a reference field,
	*    displayValue : display value for a reference field,
	*    tooltip : display value for tooltip on reference icon,
	*    external_space_id : (optional) space id used for showing floor plan,
	*    external_level_id : (optional) level id used for showing floor plan,
	*    external_building_id : (optional) building id used for showing floor plan,
	*    campus_sys_id : (optional) campus sys_id used for showing floor plan
	*/
	_addReferenceProperties: function(fieldObject, element, tableName) {
		// TODO Remove redundant properties and their usage, eg. table and reference
		fieldObject.table = element.getReferenceTable();
		fieldObject.reference = element.getReferenceTable();
		fieldObject.displayValue = element.getDisplayValue();
		fieldObject.refTable = element.getTableName();
		fieldObject.refId = -1;
		
		var eleRecord = new GlideRecord(fieldObject.table);
		if (!eleRecord.isValid())
			return;
			
		fieldObject.tooltip = gs.getMessage("{0} - Open reference record in current window", eleRecord.getClassDisplayValue());
		
		// Floor Plan specific properties
		if (element.external_space_id) {
			fieldObject.external_space_id = element.external_space_id.toString();
			fieldObject.external_level_id = element.floor.external_level_id.toString();
			fieldObject.external_building_id = element.building.external_building_id.toString();
			fieldObject.campus_sys_id = element.building.campus.toString();
		}
		
		// TODO Workaround for getReferenceQualifier not available in scope
		// Get the reference qualifier for this field, searching for a dictionary override first
		var tables = new GlideTableHierarchy(tableName).getTables();
		var elementTable = element.getED().getTableName();
		for (var i = 0; i < tables.length; i++) {
			var dictionaryOverrideGr = new GlideRecord("sys_dictionary_override");
			dictionaryOverrideGr.addQuery("name", tables[i]);
			dictionaryOverrideGr.addQuery("element", element.getName());
			dictionaryOverrideGr.addQuery("reference_qual_override", true);
			dictionaryOverrideGr.query();
			if (dictionaryOverrideGr.next()) {
				var qualifier = dictionaryOverrideGr.getValue("reference_qual");
				if (qualifier && !qualifier.startsWith("javascript:"))
					fieldObject.qualifier = qualifier;
				break;
			}
			if (tables[i] == elementTable) {
				var elementDictionaryGr = new GlideRecord("sys_dictionary");
				elementDictionaryGr.addQuery("name", element.getED().getTableName());
				elementDictionaryGr.addQuery("element", element.getName());
				elementDictionaryGr.query();
				if (elementDictionaryGr.next()) {
					var elementQualifier = elementDictionaryGr.getValue("reference_qual");
					if (elementQualifier && !elementQualifier.startsWith("javascript:"))
						fieldObject.qualifier = elementQualifier;
				}
				break;
			}
		}
	},
	
	/**
	* Add glide_list specific properties to a given Object from @function getFieldObject
	* @param fieldObject Object Field object from @function getFieldObject
	* @param element GlideElement Field element
	* @param tableName String Table name to get qualifier for
	* Adds properties:
	*    table : table name for a glide_list field,
	*    reference : table name for a glide_list field,
	*    displayValue : display value for a glide_list field,
	*    tooltip : display value for tooltip on reference icon,
	*    selectedOptions : Array of glide_list choice objects,
	*        Example:
	*            [{
	*                value: choice value,
	*                label: choice label
	*            }]
	*/
	_addGlideListProperties: function(fieldObject, element, tableName) {
		fieldObject.selectedOptions = [];
		var elementDictionaryGr = new GlideRecord("sys_dictionary");
		elementDictionaryGr.addQuery("name", element.getED().getTableName());
		elementDictionaryGr.addQuery("element", element.getName());
		elementDictionaryGr.query();
		if (elementDictionaryGr.next()) {
			fieldObject.table = elementDictionaryGr.getValue("reference");
			fieldObject.reference = elementDictionaryGr.getValue("reference");
			fieldObject.displayValue = "";
			fieldObject.display = "";
			
			var eleRecord = new GlideRecord(fieldObject.table);
			if (!eleRecord.isValid())
				return;
			
			fieldObject.tooltip = gs.getMessage("{0} - Open reference record in current window", eleRecord.getClassDisplayValue());
			
			var values = fieldObject.value.split(",");
			for (var i = 0; i < values.length; i++)
				if (eleRecord.get(values[i])) {
					fieldObject.selectedOptions.push({
						value : eleRecord.getUniqueValue(),
						label : eleRecord.getDisplayValue()
					});
				}
			// Reset values to prevent reference showing incorrect value
			fieldObject.values = "";
		}
		
		// TODO Workaround for getReferenceQualifier not available in scope
		// Get the reference qualifier for this field, searching for a dictionary override first
		var tables = new GlideTableHierarchy(tableName).getTables();
		var elementTable = element.getED().getTableName();
		for (var j = 0; j < tables.length; j++) {
			var dictionaryOverrideGr = new GlideRecord("sys_dictionary_override");
			dictionaryOverrideGr.addQuery("name", tables[j]);
			dictionaryOverrideGr.addQuery("element", element.getName());
			dictionaryOverrideGr.addQuery("reference_qual_override", true);
			dictionaryOverrideGr.query();
			if (dictionaryOverrideGr.next()) {
				var qualifier = dictionaryOverrideGr.getValue("reference_qual");
				if (qualifier && !qualifier.startsWith("javascript:"))
					fieldObject.qualifier = qualifier;
				break;
			}
			if (tables[j] == elementTable) {
				var eleDictionaryGr = new GlideRecord("sys_dictionary");
				eleDictionaryGr.addQuery("name", element.getED().getTableName());
				eleDictionaryGr.addQuery("element", element.getName());
				eleDictionaryGr.query();
				if (eleDictionaryGr.next()) {
					var elementQualifier = eleDictionaryGr.getValue("reference_qual");
					if (elementQualifier && !elementQualifier.startsWith("javascript:"))
						fieldObject.qualifier = elementQualifier;
				}
				break;
			}
		}
	},
	
	/**
	* Add choice specific properties to a given Object from @function getFieldObject
	* @param fieldObject Object Field object from @function getFieldObject
	* @param element GlideElement Field element to get choices for
	* @param tableName String Table name to get choices from
	* Adds property:
	*    choiceList : Array of choice objects,
	*        Example:
	*            [{
	*                value: choice value,
	*                label: choice label
	*            }]
	*/
	_addChoiceProperties: function(fieldObject, element, tableName) {
		fieldObject.choiceList = [];
		// TODO This gets the choices for the taskCreateTable, not necessarily the same choices on the record created
		var choiceTable = element.getTableName();
		if (new GlideTableHierarchy(choiceTable).getTableExtensions().indexOf(tableName) > -1)
			choiceTable = tableName;
		var choiceList = GlideChoiceList.getChoiceList(choiceTable, element.getName());
		// TODO Adding/removing none should be based on sys_dictionary for element
		choiceList.addNone();
		for (var i = 0; i < choiceList.getSize(); i++) {
			var choice = choiceList.getChoice(i);
			fieldObject.choiceList.push({
				value: choice.getValue(),
				label: choice.getLabel()
			});
		}
	},
	
	/**
	* Return all active COE tables
	* Used for select2 COE selector
	* @return Array of Objects,
	*     Example:
	* [{
	*     display: String display value of Topic Category for HR Services,
	*     table: Array of children HR Service objects
	* }]
	*/
	getActiveCoes: function() {
		var coes = [];
		var inactiveTables = gs.getProperty("sn_hr_core.inactive_tables", "").split(",");
		var caseTables = new GlideTableHierarchy("sn_hr_core_case").getAllExtensions();
		
		for (var i = 0; i < caseTables.length; i++)
			if (inactiveTables.indexOf(caseTables[i]) == -1)
				coes.push({
					display: new GlideRecord(caseTables[i]).getClassDisplayValue(),
					table: caseTables[i].toString()
				});
		
		coes.sort(function(a, b) {
			var aDisplay = a.display.toLowerCase();
			var bDisplay = b.display.toLowerCase();
			if (aDisplay > bDisplay)
				return 1;
			else if (bDisplay > aDisplay)
				return -1;
			return 0;
		});
		
		return coes;
	},
	
	/**
	* Return the HR Services for a user, filtered by HR Criteria
	* Used for select2 HR Service selector for a single user
	* @param userSysId String sys_id of the user to evaluate criteria for
	* @param ignoreServiceCondition boolean Ignore this.serviceCondition when querying services
	* @return Array of Objects,
	*     Example:
	* [{
	*     display: String display value of Topic Category for HR Services,
	*     coe: COE for the service,
	*     children: Array of children HR Service objects
	*         Example:
	*             [{
	*                 display: String display value of HR Service,
	*                 sys_id: String sys_id of HR Service,
	*                 coe: COE for the service,
	*                 template: String sys_id of HR Service's template,
	*                 parent: String Display value of HR Service's Topic Category
	*             }]
	* }]
	*/
	getServicesForUser: function(userSysId, ignoreServiceCondition) {
		// Get the active COEs
		var coes = [];
		var inactiveTables = gs.getProperty("sn_hr_core.inactive_tables", "").split(",");
		var caseTables = new GlideTableHierarchy("sn_hr_core_case").getAllExtensions();
		
		for (var j = 0; j < caseTables.length; j++)
			if (inactiveTables.indexOf(caseTables[j]) == -1)
				coes.push(caseTables[j].toString());

		var hrServices = new GlideRecord("sn_hr_core_service");
		hrServices.addActiveQuery();
		if (!userSysId)
			hrServices.addNullQuery("hr_criteria");
		hrServices.addNotNullQuery("topic_detail.topic_category.coe");
		hrServices.addQuery("topic_detail.topic_category.coe", "IN", coes.join(","));
		hrServices.addQuery("value", "!=", hr.BULK_PARENT_CASE_SERVICE);
		if (!ignoreServiceCondition && this.serviceCondition)
			hrServices.addEncodedQuery(this.serviceCondition);
		hrServices.orderBy("topic_detail.topic_category.name");
		hrServices.orderBy("topic_detail.topic_category.coe");
		hrServices.orderBy("name");
		hrServices.query();
		var result = [];
		var categories = {};
		var hrCriteria = new sn_hr_core.hr_Criteria();
		while (hrServices.next()) {
			var criteria = hrServices.getValue("hr_criteria");
			if (criteria) {
				criteria = criteria.split(",");
				var userMatchesService = false;
				var criteriaResult = {};
				for (var i = 0; i < criteria.length; i++) {
					// Save off criteria results and check before reevaluating same criteria
					if (criteriaResult.hasOwnProperty(criteria[i])) {
						if (criteriaResult[criteria[i]]) {
							userMatchesService = true;
							break;
						}
						continue;
					} else if (hrCriteria.evaluateById(criteria[i], userSysId)) {
						userMatchesService = true;
						criteriaResult[criteria[i]] = true;
						break;
					}
					criteriaResult[criteria[i]] = false;
				}
				if (!userMatchesService)
					continue;
			}
			var categorySysId = hrServices.topic_detail.topic_category.sys_id;
			var category = hrServices.topic_detail.topic_category.name.toString();
			var coe = hrServices.topic_detail.topic_category.coe.toString();
			if (!categories[categorySysId]) {
				categories[categorySysId] = {
					display: category,
					coe: coe,
					children: []
				};
				result.push(categories[categorySysId]);
			}
			categories[categorySysId].children.push({
				sys_id : hrServices.getUniqueValue(),
				coe: coe,
				display : hrServices.getDisplayValue(),
				template : hrServices.getValue("template"),
				parent : category
			});
		}

		return result;
	},
	
	/**
	* Get the employee reference to this.userObjectTable for a @param userSysId
	* @param userSysId String sys_id of the user to get the display reference for
	* @return Object Display reference information,
	*     Example:
	* {
	*     ev_table : table of the employee verification record,
	*     ev_sys_id : sys_id of the employee verification record,
	*     ev_tooltip : tooltip of the employee verification record
	* }
	*/
	getEmployeeReference: function(userSysId) {
		var employeeReference = {};
		var employeeGr = new GlideRecordSecure(this.userObjectTable);
		if (employeeGr.isValid() && employeeGr.get(this.userColumn, userSysId)) {
			employeeReference.ev_table = employeeGr.getTableName();
			employeeReference.ev_sys_id = employeeGr.getUniqueValue();
			employeeReference.ev_tooltip = gs.getMessage("{0} - Open reference record in current window", employeeGr.getClassDisplayValue());
		}

		return employeeReference;
	},
	
	type: 'hr_CaseCreation'
};