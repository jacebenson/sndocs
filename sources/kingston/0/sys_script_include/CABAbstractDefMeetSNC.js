var CABAbstractDefMeetSNC = Class.create();

CABAbstractDefMeetSNC.prototype = Object.extendsObject(CAB, {
	
	initialize: function(_gr, _gs) {
		CAB.prototype.initialize.apply(this, arguments);
		this._cabDomUtil = new global.CABDomainUtil(this._gr);
	},
	
	getManager: function() {
		return this._gr.getValue("manager");
	},
	
	getAllBoardMembers: function() {
		var memberIds = this.getBoardMembers();
		var groupMemberIds = this.getBoardGroupsMembers();
		var delegateIds = this.getDelegates();
		
		return new global.ArrayUtil().union(memberIds, groupMemberIds, delegateIds);
	},
	
	getBoardMembers: function() {
		var userIds = [];
		
		if (this._gr.board_members.nil())
			return userIds;

		var userGr = new GlideRecord("sys_user");
		userGr.addActiveQuery();
		userGr.addQuery("sys_id", "IN", this._gr.getValue("board_members"));
		userGr.query();
		
		while (userGr.next())
			userIds.push(userGr.getUniqueValue());
		
		return userIds;
	},
	
	// return an array of "sys_user" ids compiled from the groups specified in the
	// board_groups list field
	getBoardGroupsMembers: function() {
		var userIds = [];

		if (this._gr.board_groups.nil())
			return userIds;

		var groupMembers = new GlideAggregate("sys_user_grmember");
		groupMembers.addQuery("group", "IN", this._gr.getValue("board_groups"));
		groupMembers.addQuery("group.active", true);
		groupMembers.addQuery("user.active", true);
		groupMembers.groupBy("user");
		groupMembers.query();
		
		while (groupMembers.next())
			userIds.push(groupMembers.getValue("user"));
						 
		return userIds;
	},
	
	getDelegates: function() {
		if (this._gr.delegates.nil())
			return [];
		
		return this._gr.delegates.split(",");
	},

	// Determines if the current record is in the currently selected domain.
	isInSelectedDomain: function() {
		return this._cabDomUtil.isInSelectedDomain();
	},
	
	type: 'CABAbstractDefMeetSNC'
});