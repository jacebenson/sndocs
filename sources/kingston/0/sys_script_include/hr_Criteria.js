var hr_Criteria = Class.create();

hr_Criteria.prototype = {
	type: 'hr_Criteria',
	initialize: function() {
	},

	//Return a list of all hr criteria which has table and column not null or table is user and column is null/has value
	getHRCriteriaWithUserConnection: function() {
		var criteriaGR = new GlideRecord("sn_hr_core_criteria");
		var encodedQuery = "tableISNOTEMPTY^user_columnISNOTEMPTY^NQtable=sys_user^EQ";
		criteriaGR.addEncodedQuery(encodedQuery);
		criteriaGR.query();
		var result = [];
		while (criteriaGR.next())
			result.push(criteriaGR.name);

		return result;
	},

	//Return the count after query
	getUserCountForHRCriteria: function(hrCriteria) {
		var userList = this.getUsersForHRCriteria(hrCriteria);
		return userList.length;
	},


	//Return the users list after query
	getUsersForHRCriteria: function(hrCriteria) {
		var res = [];
		var userList = [];
		var conditionCount;
		var userCol;
		var criteriaTable;
		var grSnHrCoreCriteria = new GlideRecord("sn_hr_core_criteria");
		if (grSnHrCoreCriteria.get(hrCriteria)) {
			userCol = grSnHrCoreCriteria.user_column;
			criteriaTable = grSnHrCoreCriteria.table;
			var grSnHrCoreM2mConditionCriteria = new GlideRecord("sn_hr_core_m2m_condition_criteria");
			grSnHrCoreM2mConditionCriteria.addQuery('hr_criteria', grSnHrCoreCriteria.sys_id);
			grSnHrCoreM2mConditionCriteria.query();
			conditionCount = grSnHrCoreM2mConditionCriteria.getRowCount();
			while (grSnHrCoreM2mConditionCriteria.next()) {
				var hrCond = grSnHrCoreM2mConditionCriteria.hr_condition;
				var grSnHrCoreCondition = new GlideRecord("sn_hr_core_condition");
				if (grSnHrCoreCondition.get(hrCond)) {
					var curGR = new GlideRecord(grSnHrCoreCondition.table);
					curGR.addEncodedQuery(grSnHrCoreCondition.condition);
					curGR.query();
					while (curGR.next()) {
						if (grSnHrCoreCondition.user_column != null && grSnHrCoreCondition.user_column != "") {
							var cur = curGR.getValue(grSnHrCoreCondition.user_column);
							userList.push(cur.toString());
						} else if (grSnHrCoreCondition.table == "sys_user")
						userList.push(curGR.sys_id.toString());
					}
				}
			}
		}
		userList.sort();
		var start = 0;
		var end = 0;
		while (start < userList.length) {
			while (end < userList.length && userList[start] == userList[end])
				end++;
			if (end - start == conditionCount)
				res.push(userList[start]);

			start = end;
		}

		//query from the criteriaTable with userCol is in res array to get the final user list
		var finalList = [];
		if (userCol == null || userCol == "")
			finalList = res;
		else {
			for (var i = 0; i < res.length; i++) {
				var gr = new GlideRecord(criteriaTable);
				gr.addQuery(userCol, res[i]);
				gr.query();
				if (gr.next())
					finalList.push(res[i]);
			}
		}

		return finalList;
	},

	/* Evaluates the HR Criteria specified by the given Id.  If the Id is not specified return true.
	 *
	 * For the criteria to evaluate the following must be true:
	 *    1. The Criteria record must be active
	 *    2. There must be at least one active Condition
	 *    3. All active conditions must evaluate (have at least one result).
	 *
	 *  Inactive or empty Conditions are ignored.
	 */
	evaluateById : function(criteriaId, userId) {
		userId = userId || gs.getUserID();
		if (!gs.nil(criteriaId)) {
			var gr = this._getCriteriaRecord(criteriaId);
			if (gr.hasNext()) {
				while (gr.next()){
					var cond = this._addUserToCondition(gr.hr_condition, userId);

					if (!this._canUserAccessHRCriteria(gr.hr_condition.table, cond))
						return false;
				}
				return true;
			}
			else {
				gs.info('Did not find any active conditions for the specified HR Criteria');
				return false;
			}
		}
		return true;
	},

	_addUserToCondition : function(conditionGr, userId) {
		var conditionString = this._sanitizeCondition(conditionGr.condition.toString(), userId);
		var userColumn = conditionGr.user_column;

		if (conditionGr.table == 'sys_user' && gs.nil(userColumn))
			userColumn = 'sys_id';

		if (!gs.nil(userColumn))
			conditionString = conditionString.substr(0, conditionString.length - 3) + '^' + userColumn + '=' + userId + '^EQ';

		return conditionString;
	},

	_getCriteriaRecord : function(criteriaId) {
		var gr = new GlideRecord(hr.TABLE_CRITERIA_LOOKUP);
		gr.addQuery('hr_criteria', criteriaId);
		gr.addQuery('hr_criteria.active', 'true');
		gr.addQuery('hr_condition.active', 'true');
		gr.addNotNullQuery('hr_condition.condition');
		gr.query();
		return gr;
	},

	_evaluteQuery : function(table, query){
		return this._canUserAccessHRCriteria(table, query) ;
	},
	
	_canUserAccessHRCriteria : function(table, query) {
		var queryGr = new GlideRecord(table);
		queryGr.addEncodedQuery(query);
		queryGr.query();
		return queryGr.hasNext();
	},

	_sanitizeCondition : function(cond, userId) {
		var QUERY_KEYWORD = 'javascript:{targetUserID}';

			if (cond.indexOf(QUERY_KEYWORD) > -1)
				cond = cond.replace(new RegExp(QUERY_KEYWORD, "gi"), userId);

			return cond;
		}
	};