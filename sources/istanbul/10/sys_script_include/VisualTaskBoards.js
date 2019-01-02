var VisualTaskBoards = Class.create();
VisualTaskBoards.prototype = {
    initialize: function() {
    },

    type: 'VisualTaskBoards'
};
	
	
VisualTaskBoards.showAddToBoardUIAction = function() {
	// In the future check for roles and other conditions
	return !GlideVTBCompatibility.isBlocked();
}	
	
