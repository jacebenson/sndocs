var SearchMetadata = (function() {
	
	var getSearchGroups = function() {
		var groups = loadGroups();
		attachSearchedTables(groups);
		return groups;
	};
	
	function loadGroups() {
		var tsGroup = new GlideRecord("ts_group");
		tsGroup.addActiveQuery();
		tsGroup.orderBy("order");
		tsGroup.query();
		
		var groups = [];
		while (tsGroup.next()) {
			if (gs.getUser().hasRole(tsGroup.getValue("roles") || ''))
				groups.push({
					id: tsGroup.getValue("sys_id"),
					name : tsGroup.getDisplayValue("name"),
					description : tsGroup.getValue("description"),
					tables : []
				});
		}
		return groups;
	}
	
	function attachSearchedTables(groups) {
		var groupIds = groups.map(function(group) { return group.id; });
		var groupsBySysId = groups.reduce(function(memo, group, idx) {
			memo[group.id] = group;
			return memo;
		}, {});
		var tsTable = new GlideRecord("ts_table");
		tsTable.addActiveQuery();
		tsTable.addQuery("group", "IN", groupIds);
		tsTable.orderBy("group.order");
		tsTable.orderBy("order");
		tsTable.query();
		
		while (tsTable.next()) {
			var group = groupsBySysId[tsTable.getValue("group")];
			addTableToGroup(group, tsTable);
		}
	}
	
	function addTableToGroup(group, tsTable) {
		var tableName = tsTable.getDisplayValue("name");
		var tableGr = new GlideRecord(tableName); // Needed to check validity and get table label
		var tableLabel, tablePluralLabel;
		
		if (!tableGr.isValid())
			return; // Skip invalid tables
		
		tableLabel = tableGr.getED().getLabel(); // Ew, but no access to TD in scope
		tablePluralLabel = tableGr.getED().getPlural();
		
		group.tables.push({
			id : tsTable.getUniqueValue(),
			name : tableName,
			label : tableLabel,
			label_plural : tablePluralLabel,
			conditionQuery : tsTable.getValue("condition"),
			conditions : tsTable.getDisplayValue("condition"), // not marked READABLE at present, so ugly
			searched : tsTable.getValue("searched") === "1"
		});
	}
	
	return {
		/**
		 * Get the search groups for the current user.
		 *
		 * Includes details about the group itself and the tables that comprise that group.
		 */
		getSearchGroups : getSearchGroups
	};
	
})();