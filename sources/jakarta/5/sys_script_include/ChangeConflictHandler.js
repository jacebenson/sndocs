var ChangeConflictHandler = Class.create();

ChangeConflictHandler.CONFLICT = "conflict";
ChangeConflictHandler.HAS_BEEN_HANDLED = "hasBeenHandled";

ChangeConflictHandler.prototype = {
	
	initialize: function (dumpCount) {
		this.changeConflictContainer = {};
		this.addedcount = 0;			// current count of conflicts held in this class
		this.savedCount = 0;			// total change conflict records by this class
		this.dumpCount = dumpCount;     // how many conflict records to collect before writing them out to database
	},
	
	addChangeConflict: function(changeConflict) {
		var strChangeConflict = changeConflict.toString();
		if (this.changeConflictContainer[strChangeConflict] != ChangeConflictHandler.HAS_BEEN_HANDLED) {
			this.changeConflictContainer[strChangeConflict] = changeConflict;
			++this.addedcount;
		}
		if (this.addedcount == this.dumpCount)
			this.saveConflicts();
	},
	
	getConflicts: function() {
		return this.changeConflictContainer;
	},
	
	saveConflicts: function () {
		var conflictsMapper = new GlideRecord(ChangeConflictHandler.CONFLICT);
		var key = null;
		for (key in this.changeConflictContainer) {
			
			var currentChangeConflict = this.changeConflictContainer[key];
			if (currentChangeConflict != ChangeConflictHandler.HAS_BEEN_HANDLED) {
				conflictsMapper.initialize();
				conflictsMapper.configuration_item = currentChangeConflict.configurationItemId;
				conflictsMapper.change = currentChangeConflict.changeId;
				conflictsMapper.type = currentChangeConflict.ctype;
				conflictsMapper.conflicting_change = currentChangeConflict.conflictingChangeId;
				conflictsMapper.related_configuration_item = currentChangeConflict.relatedCi;
				conflictsMapper.schedule = currentChangeConflict.scheduleId;
				conflictsMapper.insert();
				this.savedCount++;
			}
		}
		
		for (key in this.changeConflictContainer)
			this.changeConflictContainer[key] = ChangeConflictHandler.HAS_BEEN_HANDLED;
		this.addedcount = 0;
		
		return this.savedCount;
	},
	
	deleteConflictsByChangeId: function(changeId){
		var conflictsMapper = new GlideRecord(ChangeConflictHandler.CONFLICT);
		conflictsMapper.addQuery('change', changeId);
		conflictsMapper.deleteMultiple();
	},
	
	type: "ChangeConflictHandler"
};
