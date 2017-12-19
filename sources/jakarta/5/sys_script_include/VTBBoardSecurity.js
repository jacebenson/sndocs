/**
 *  Used for VTB Board security where board members can perform actions on the board
 */
var VTBBoardSecurity = Class.create();
VTBBoardSecurity.prototype = {
	initialize: function() {},

	canAccess: function(boardRecord) {
		// if they are the owner of the board, they can access it
		if (boardRecord.owner == gs.getUserID())
			return true;

		return this.isBoardMemberOf(boardRecord.sys_id);
	},

	canUserAccess: function(boardRecord, userId) {
		// if they are the owner of the board, they can access it
		if (boardRecord.owner == userId)
			return true;

		return this.isUserBoardMemberOf(boardRecord.sys_id, userId);
	},

	isBoardMemberOf: function(boardId) {
		return this.isUserBoardMemberOf(boardId, gs.getUserID());
	},

	isUserBoardMemberOf: function(boardId, userId) {
		var gr = new GlideRecord('vtb_board_member');
		gr.addQuery('board', boardId);
		gr.addQuery('user', userId);
		gr.addQuery('assignee', false);
		gr.query();

		// User is a member of vtb_board_member table for given board
		if (gr.hasNext())
			return true;

		return false;
	},

	type: 'VTBBoardSecurity'
}