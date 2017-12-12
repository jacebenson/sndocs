var CodeSearch = function() {
	//the config (should be filled by the time search runs)
	var searchConfig = {
		searchTable : null,
		searchGroup : null,
		searchGroupGr : null,
		globalSearch : null,
		extendedMatching : null,
		currentApplication : gs.getCurrentApplicationId(),
		limit : parseInt(gs.getProperty('sn_codesearch.search.results.max', 500))
	};
	
	//the defaults (if a value is provided or cant be found, use these)
	var defaults = {
		searchGroup : 'sn_codesearch.Default Search Group',
		globalSearch : false,
		extendedMatching : false,
		currentApplication : gs.getCurrentApplicationId(),
		limit : parseInt(gs.getProperty('sn_codesearch.search.results.max', 500))
	};
	
	//caches
	var fieldListCache = {},
		extendedFieldListCache = {},
		tableLabelCache = {};
	
	/**
	 * We need to get the search group record since it has our configuration
	 * If no search group name was provided, we default to the one that
	 * ships with codesearch. If we can't find a valid search group even after
	 * looking for the default record, we stop trying and the search will fail
	 */
	function getSearchGroupGr(alreadyTried) {
		var val=false,
			defaultSearchGroup = 'sn_codesearch.Default Search Group',
			sg;
		
		if (!searchConfig.searchGroup)
			return gs.warn("Search group not provided.");
		
		gs.info("Getting search group record for {0}", searchConfig.searchGroup);
		sg = new GlideRecord('sn_codesearch_search_group');
		sg.addQuery('name', searchConfig.searchGroup);
		sg.query();		
		gs.debug("Found {0} records matching name={1}", sg.getRowCount(), searchConfig.searchGroup);
		
		if (sg.next()) {
			searchConfig.searchGroupGr = sg;
			val = sg.getValue("extended_matching");
		} else {
			if (alreadyTried)
				return gs.error("Unable to get default search group {0}. Unable to complete search.", defaultSearchGroup);
			
			gs.warn("Search group {0} not found, using {1} instead.", searchConfig.searchGroup, defaultSearchGroup);
			searchConfig.searchGroup = defaultSearchGroup;
			return getSearchGroupGr(true);
		}
		
		//also set extended matching
		if (null == searchConfig.extendedMatching) {
			searchConfig.extendedMatching = (val == 'true') || (val == '1');
			gs.info("Extended matching set to {0}", searchConfig.extendedMatching);
		}
	}
	
	/**
	 * We only search one table at a time, though one request to the API
	 * can result in us looping over the valid tables for the Search Group
	 * and returning results for each one in an array.
	 */
	function getSearchTableGr() {
		gs.info("Getting search table record for {0}", searchConfig.searchTable);
		
		if (!searchConfig.searchGroupGr)
			return gs.warn("No search group record found yet. One may not have been set.");
			
		var st = new GlideRecord('sn_codesearch_table');
		st.addQuery('search_group', searchConfig.searchGroupGr.getUniqueValue());
		st.addQuery('table', searchConfig.searchTable);
		st.query();
		gs.debug("Searched sn_codesearch_table for record with sys_id {0}", searchConfig.searchGroupGr.getUniqueValue());
		
		if (st.next())
			searchConfig.searchTableGr = st;
		else
			gs.error("Search table record for {0} not found in search group {1}", searchConfig.searchTable, searchConfig.searchGroup);
	}
	
	/**
	 * The structure of the object we return is 
	 * {
     * "hits": [
     *   { "matches": [
     *       { "field": "field_name",
     *         "count": 1,
     *         "lineMatches": [
     *           {"context": "i < list.size()", "line": 1,"escaped": "i &lt; list.size()"}
     *         ],
     *         "fieldLabel": "Field display name"
     *       }],
     *     "sysId": "8a4674a693223100ae6e941e867ffb04",
     *     "name": "DisplayNameOfRecord",
     *     "className": "sys_ui_page",
     *     "modified": 1425521997000,
     *     "tableLabel": "sys_ui_page" 
     *   }],
     * "recordType": "sys_ui_page",
     * "tableLabel": "UI Page"
     * }
     */
	function getHit(record, term) {
		if (!record.canRead())
			return;
		
		gs.info("Found a hit for {0} in {1} record with sysId {2}", term, record.getTableName(), record.getUniqueValue());
		var hit = {};
		var gdt = new GlideDateTime();
		gdt.setValue(record.getValue('sys_updated_on'));
		hit.name = record.getDisplayValue();
		hit.className = record.getRecordClassName();

		hit.tableLabel = record.getTableName();
		if (hit.tableLabel == 'sys_metadata')
			hit.tableLabel = getTableLabel(hit.className);

		hit.matches = getMatches(record, term);
		hit.sysId = record.getUniqueValue();
		hit.modified = gdt.getNumericValue();

		return hit;
	}
	
	/**
	 * get all matches in our individual record
	 * searches each field that is specified in the table definition under the current
	 * Search Group, and optionally includes all text fields on this record big enough
	 * to be of potential interest.
	 */
	function getMatches(record, term) {
		gs.info("Getting all matches for {0} in {1} record with sys_id {2}", term, record.getTableName(), record.getUniqueValue());
		var context = [];
		var fieldList = getExtendedFieldList(record);
		gs.debug("Will find matches in these fields: {0}", fieldList.join(', '));

		for (var i = 0; i < fieldList.length; i++) {
			try {
				var field = fieldList[i];
				var text = record.getValue(field);
				var fieldLabel = record[field].getLabel();
				var matchObj = {
					field: field,
					fieldLabel: fieldLabel,
					lineMatches: [],
					count : 0
				};
				gs.debug("Searching for {0} in field {1}", term, field);
				if (text && hasTerm(text, term)) {
					matchObj.count = countTerm(text, term);
					matchObj.lineMatches = getMatchingLines(text, term);				
				}
				
				gs.info("{0} matches found for field {1}", matchObj.lineMatches.length, field);
				
				if (matchObj.lineMatches.length > 0)
					context.push(matchObj);
				
			} catch(e) {
				//do nothing - we aren't allowed to read this field or it is invalid
				gs.warn("Unable to read field. This is usually an ACL error and not a real problem.", e);
			}
		}
		return context;
	}
	
	/**
	 * Broken out from the getMatches code for readability. Just walks through
	 * each line in the text pulled out of the field, looking for our search term. If
	 * we find it, we also want to get the previous line *and* the next line, and we
	 * only ever want to look at a given line once.
	 */
	function getMatchingLines(text, term) {
		//consider adding the ability to turn off the secondary, escaped lines
		var lineMatches = [];
		var scanProgress = 0;
		var lines = text.split(/\r\n|\r|\n/g);
		
		for (var j = 0; j < lines.length; j++) {
			var line = lines[j];
			if (hasTerm(line, term)) {
				if (j > 0 && j > scanProgress + 1)
					lineMatches.push({line: (j), context: lines[j - 1], escaped: _.escape(lines[j - 1])});
				
				lineMatches.push({line: (j + 1), context: line, escaped: _.escape(line)});
				
				if (j < lines.length - 1)
					lineMatches.push({line: (j + 2), context: lines[j + 1], escaped: _.escape(lines[++j])});
					
				scanProgress = j;
				gs.debug("Scan progress update: at line {0}", j);
			}
		}
		return lineMatches;
	}
	
	/**
	 * We want to be able to display the human-readable table name, translated
	 * if available. Since we will potentially come back here hundreds of times
	 * per search, cache it after we find it, for this search.
	 */
	function getTableLabel(className) {
		gs.info("Getting table label for {0}", className);
		//maybe we've looked it up before
		if (tableLabelCache.hasOwnProperty(className))
			return tableLabelCache[className];
		
		var tableLabel = new GlideRecord(className).getClassDisplayValue();
		tableLabelCache[className] = tableLabel;
		
		gs.debug("Table label for {0} is {1}", className, tableLabel);
		return tableLabel;
	}
	
	/**
	 * Get the list of fields defined for this table under the current Search Group.
	 * Does not include the extended fields, which are optionally included later.
	 * We try to make sure there are no duplicates, and even though the list should be
	 * comma-separated, we try to fix them if they are space or space+comma separated.
	 * Since we can potentially come here hundreds of time per search, cache the results
	 * for this search.
	 */
	function getFieldList(record) {
		gs.info("Getting field list for {0}", record.getTableName());
		//maybe we've looked it up for this table before
		var className = record.getRecordClassName();
		if (fieldListCache.hasOwnProperty(className))
			return fieldListCache[className];

		var fieldList = '';
		if(!searchConfig.searchTableGr.search_fields.nil())
			fieldList = searchConfig.searchTableGr.getValue('search_fields');
		
		gs.debug("Field list from record is {0}", fieldList);
		//lotsa people use commas AND spaces as separators
		fieldList = fieldList.replace(' ',',').split(',');
		//remove emp elements created from our replace+split
		fieldList = _.compact(fieldList);
		
		//ensure uniqness and pass through toArray because underscore can be weird
		fieldList = _.toArray(_.unique(fieldList));
		gs.debug("Field list after uniqing is {0}", fieldList.join());

		fieldListCache[className] = fieldList;
		
		//go ahead and cache the extended field list
		getExtendedFieldList(record);
		
		return fieldList;
	}
	
	/** Look for any field on this table or it's ancestors which has a base type of text
	 * and is 80 characters or longer. We don't want to include sys_update_name which
	 * any table that extends sys_metadata (a.k.a all of the potentially interesting
	 * ones) will have that field, and it will likely just be a copy of Name anyway, only
	 * more annoying.
	 */
	function getExtendedFieldList(record) {
		gs.info("Getting extended field list for {0}", record.getTableName());

		//maybe we've looked it up for this table before
		var className = record.getRecordClassName();
		if (extendedFieldListCache.hasOwnProperty(className))
			return extendedFieldListCache[className];

		var extendedFieldList = getFieldList(record);
		//only bother if the Search Group specified we should include these
		if (searchConfig.extendedMatching) {
			gs.info("Extended matching is enabled.");
			var tableList = getTables(className);
			var dictionary = new GlideRecord('sys_dictionary');
			dictionary.addQuery("name", "IN", tableList.join(","));
			dictionary.addQuery("internal_type.scalar_type", "string");
			dictionary.addQuery("internal_type.name", "!=", "collection");
			dictionary.addQuery("element", "!=", "sys_update_name");
			dictionary.addQuery("max_length", ">=", 80);
			dictionary.query();
			
			gs.debug("Searched sys_dictionary with query {0}", dictionary.getEncodedQuery());
			
			while (dictionary.next())
				extendedFieldList.push(dictionary.getValue("element"));

			extendedFieldList = _.unique(extendedFieldList);
			extendedFieldListCache[className] = extendedFieldList;
			
		} else {
			gs.info("Extended matching is disabled.");
		}
		
		gs.debug("Extended field list for class {0} is {1}", className, extendedFieldList.join(', '));
		
		return extendedFieldList;
	}

	/**
	 * ... I feel this one is self-explanatory.
	 */
	function getTables(className) {
		return new GlideTableHierarchy(className).getTables();
	}

	/**
	 * Calling it a config is a bit much, but we should figure out the specific fields
	 * that we are definitely going to look inside, for this table definition inside
	 * this Search Group.
	 */
	function getTableSearchConfig(table) {
		gs.info("Generating search config for table {0}", table);
		
		var tableSearchConfig = {
			fields : ["sys_id"],
		};
		
		var record = new GlideRecord(table);
		if (record.isValid())
			tableSearchConfig.fields = getFieldList(record);
		else
			gs.error("No valid GlideRecord for table {0} exists.", table);
		
		return tableSearchConfig;
	}

	/**
	 * Only interested in knowing if this text contains that term. All the more detailed
	 * scanning comes later. We do this so we know wether we need to break it up into
	 * lines and do the counts and whatnot.
	 */
	function hasTerm(text, term) {
		if (!text || !term)
			return false;
		
		return (text.toLowerCase().indexOf(term.toLowerCase()) > -1);
	}
	
	/**
	 * We need to know how many times this term appears in the text. We could try to keep
	 * track while we are scanning each individual line, but we cleverly *skip* looking
	 * at a line in detail and just include for context sometimes.
	 */
	function countTerm(text, term) {
		if (!term)
			return 0;
		
		term = escapeSpecial(term);
		return text.match(new RegExp(term,"gi")).length;
	}
	
	/**
	 * This came from a very nice StackOver flow answer on how to do a regex for
	 * text which might have characters that are meaningful to regexes. It's very clever
	 * which means it's indecipherable except to someone who feels guilty about their past
	 * and so has learned deep regex syntax as pennance.
	 */
	function escapeSpecial(text) {
		return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	}
	
	/**
	 * This is the outer object for all the hits in a single table -
	 * it's the object which contains each of the individual record objects, which
	 * themselves contain each field match and each line in that field which is relevant
	 */
	function getResultObj(searchTable) {
		gs.info("Generating result object for {0}", searchTable);
		if (!searchTable)
			searchTable = '';
		
		var resultObj = {
					recordType : searchTable,
					hits : [],
					tableLabel : searchTable
				};
		
		return resultObj;
	}
	
	/**
	 * Get all of the tables which could be searched within this search group.
	 * It's really pretty simple. Look at the group record, and find all the 
	 * table records which are related to it.
	 */
	function getAllSearchableTables() {
		gs.info("Getting all searchable tables in group {0}", searchConfig.searchGroup);
		var tableList = [];
		var sgt = new GlideRecord('sn_codesearch_table');
		sgt.addQuery('search_group', searchConfig.searchGroupGr.getUniqueValue());
		sgt.query();
		gs.debug("Searched sn_codesearch_table with query {0}", sgt.getEncodedQuery());
		
		while(sgt.next())
			tableList.push(sgt.getValue('table'));
		
		gs.debug("Searchable tables are {0}", tableList.join(', '));
		return tableList;
	}
	
	/** This is the big momma. It's the workhorse, doing the querying of a single table,
	 * passing off each matching record into getHit to build up that outer object, which
	 * itself passes off to getMatches and that in turn passes off to getMatchingLines.
	 * If there is a big mistake anywhere, it's probably in here. However, notice that
	 * the bulk of this function is just building up the Query. Almost everything
	 * we do in here is specifically to get our query string correct. If the results
	 * aren't what you expected, turn on info logging and look at the encoded query that
	 * gets run. It is probably not what you expect.
	 */
	function searchOnlyScripts(term, limit) {
		
		if(gs.nil(limit))
			limit = searchConfig.limit;
		
		gs.info("Performing search for {0} with limit {1}", term, limit);
		var ret = getResultObj(searchConfig.searchTable),
			tableSearchConfig = getTableSearchConfig(searchConfig.searchTable),
			encodedQuery = [],
			CONTAINS = "LIKE",
			OR = "^OR";
		
		if(0 >= limit) {
			gs.info("Skipping search of {0} for term {1}, limit has been reached.",
				   searchConfig.searchTable, term);
			
			return ret;
		}
		
		for (var i=0; i<tableSearchConfig.fields.length; i++) {
			var field = tableSearchConfig.fields[i];
			encodedQuery.push(field + CONTAINS + term);
		}

		gs.debug("Query for just searchable fields is " + encodedQuery.join(OR));
		
		var records = new GlideRecord(searchConfig.searchTable);
		if (records.isValid()) {
			ret.tableLabel = records.getClassDisplayValue();
			records.addEncodedQuery(encodedQuery.join(OR) + "^EQ");
			
			if (searchConfig.searchTableGr && searchConfig.searchTableGr.getValue('additional_filter'))
				records.addEncodedQuery(searchConfig.searchTableGr.getValue('additional_filter'));

			//they may have given us a scope sys_id *or* a scope name, cover both cases
			if (!searchConfig.globalSearch && records.isValidField("sys_scope"))
				records.addQuery("sys_scope", searchConfig.currentApplication).addOrCondition("sys_scope.scope", searchConfig.currentApplication);

			records.addQuery('sys_class_name','NOT IN','sn_codesearch_search_group,sn_codesearch_table,sys_metadata_delete');

			records.orderBy("sys_class_name");
			records.orderBy("sys_name");
			records.setLimit(limit);
			
			gs.info("Encoded query actually run is: " + records.getEncodedQuery());

			records.query();
			gs.info("Found {0} matching records in table {1}", records.getRowCount(), records.getTableName());
			while (records.next()) {
				var hit = getHit(records, term);
				if (hit)
					ret.hits.push(hit);
			}
		} else {
			gs.error("No valid GlideRecords for {0} exist, no results can be returned.", searchConfig.searchTable);
		}
		
		return ret;
	}
	
	/**
	 * We have a total maximum limit, which is easy to do in a single lookup but harder
	 * if we are searching multiple tables. So keep track of the actual number of matching
	 * records for each individual table as we cycle through the list, and adjust the next
	 * query limit to compensate.
	 */
	function getThisLimit(matchesSoFar) {
		var foundSoFar = _.reduce(matchesSoFar, function(memo,hit) { return memo + hit.hits.length;}, 0);
		var newLimit = Math.max(searchConfig.limit - foundSoFar, 0);
		gs.debug("Already found {0} matches, new limit set to {1}.", foundSoFar, newLimit);
		
		return newLimit;
	}
	
	/**
	 * These are the methods people can actually call. They are limited to setting:
	 *  search group which contains the tables we can search and some other info
	 *  search table within that group
	 *  max number of results to return per API call
	 *  app scope we currently find most relevant
	 *  wether we want to search for stuff outside our ap scope.
	 *  wether we should match in fields outside those strictly specified - override
	 *    the setting in the group record
	 * Also, users can set up a Search Object then ask it what tables it will search
	 * for them.
	 * Finally, users can tell it to search, and get back an object as described in the
	 * comment for getHit, or an array of such objects when searching multiple tables.
	 */
	return {
		search: function search(term) {
			gs.info("Search initiated for term {0}", term);
			if(!term)
				return [];
			
			if (!searchConfig.searchGroupGr)
				this.setSearchGroup('sn_codesearch.Default Search Group');
			
			if (searchConfig.searchTableGr)
				return searchOnlyScripts(term);
			
			//search entire group, may be slow
			gs.warn("No valid search table specified, so searching entire group one table at a time. May be very slow.");
			
			var ret = [];
			var tableList = getAllSearchableTables();
			_.each(tableList, function(table) {
				this.setSearchTable(table);
				ret.push(searchOnlyScripts(term, getThisLimit(ret)));
			}, this);

			return ret;
		},
		
		setSearchTable : function setSearchTable(table) {
			//look, you gotta pass a string for the tablename
			if (table)
				searchConfig.searchTable = table + '';
			
			if (searchConfig.searchGroupGr)
				getSearchTableGr();
			
			if (!searchConfig.searchTableGr)
				gs.warn("Invalid search table {0} or searchGroup not set", table);

			return this;
		},

		setSearchAllScopes : function setSearchAllScopes(runAsGlobalSearch) {
			if (runAsGlobalSearch === "true" || runAsGlobalSearch === true)
				searchConfig.globalSearch = true;

			gs.info("Searching across all scopes set to {0}", searchConfig.globalSearch);
			return this;
		},
		
		setCurrentApplication : function setCurrentApplication(currentApp) {
			//the REST api sometimes passes this as a NativeArray
			searchConfig.currentApplication = currentApp ? currentApp + '' : searchConfig.currentApplication;
			
			gs.info("If global search is not enabled, results will be limited to scope {0}", searchConfig.currentApplication);
			return this;
		},
		
		setSearchGroup : function setSearchGroup(searchGroupName) {
			if (typeof searchGroupName === 'string' && searchGroupName) {
				searchConfig.searchGroup = searchGroupName;
				getSearchGroupGr();
				
			} else if (typeof searchGroupName === 'object') {
				gs.debug("Object passed in as search group. Treating it like a GlideRecord.");
				try {
					searchConfig.searchGroup = searchGroupName.getDisplayValue();
					searchConfig.searchGroupGr = searchGroupName;
				} catch (e) {
					searchConfig.searchGroup = 'sn_codesearch.Default Search Group';
					gs.error("Invalid Search Group object passed - did you mean to pass a GlideRecord? Using default instead.");
					getSearchGroupGr();
				}
			} else {
				searchConfig.searchGroup = 'sn_codesearch.Default Search Group';
				gs.warn("Unexpected search group name {0} provided, using {1} instead.", searchGroupName + '', searchConfig.searchGroup);
				getSearchGroupGr();
			}
			
			if (searchConfig.searchGroupGr && searchConfig.searchTable)
				getSearchTableGr();
			
			return this;
		},
		
		setLimit : function setLimit(wantLimit) {
			var hardLimit = parseInt(gs.getProperty('sn_codesearch.search.results.max', 500));
			wantLimit = parseInt(wantLimit);
			wantLimit = Math.max(wantLimit, 0);
			
			if (wantLimit)
				searchConfig.limit = Math.min(wantLimit, hardLimit);
			else
				searchConfig.limit = hardLimit;
			
			gs.info("Setting search limit to {0}, requested limit was {1}", searchConfig.limit, wantLimit);
			return this;
		},
		
		setExtendedMatching : function setExtendedMatching(useExtendedMatching) {
			if(gs.nil(useExtendedMatching))
				return this;
			
			if (useExtendedMatching === "true" || useExtendedMatching === true)
				searchConfig.extendedMatching = true;
			else
			 	searchConfig.extendedMatching = false;
			
			gs.info("Setting extended matching to {0}", searchConfig.extendedMatching);
			return this;
		},
		
		getAllSearchableTables : function() {
			if (!searchConfig.searchGroup)
				this.setSearchGroup('sn_codesearch.Default Search Group');
			
			return getAllSearchableTables();
		}
	}

}