var NumberOfAdminLogins = Class.create();
NumberOfAdminLogins.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    type: 'NumberOfAdminLogins',
	timeQueries: {
		"today": "^sys_created_onONtoday@javascript:gs.daysAgoStart(0)@javascript:gs.daysAgoEnd(0)",
		"yesterday": "^sys_created_onONyesterday@javascript:gs.daysAgoStart(1)@javascript:gs.daysAgoEnd(1)",
		"thisWeek": "^sys_created_onONthisweek@javascript:gs.beginningOfThisWeek()@javascript:gs.endOfThisWeek()"
	},
	
	getUserIDs: function() {
		var role = this.getParameter("sysparm_role");
		for(var timeframe in this.timeQueries) {
			this._getUserIDs(role, timeframe);
		}
	},
	
	_getUserIDs: function(role, timeframe) {
		var gr = new GlideRecord('sysevent');
		gr.addEncodedQuery('name=login' + this.timeQueries[timeframe]);
		var grU = gr.addJoinQuery('sys_user_has_role', 'user_id', 'user');
		grU.addCondition('role.name', role);
		gr.query();

		var count = 0;
		var userIdMap = {};
		while(gr.next()) {
			count++;
			userIdMap[gr.user_id] = gr.user_id;
		}
		this.newItem(timeframe + ".count").setAttribute("value", count);
		
		for(var key in userIdMap) {
			this.newItem(timeframe + ".user").setAttribute("userID", key);
		}
	}
});