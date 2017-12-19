var sc_ic_TaskAssignDefn = Class.create();
sc_ic_TaskAssignDefn.prototype = Object.extendsObject(sc_ic_Base, {
    initialize: function(_gr,_gs) {
		sc_ic_Base.prototype.initialize.call(this,_gr,_gs);
    },
	
	setExpired: function() {
		this._gr.active = false;
		return this;
	},
	
	expire: function() {
		this.setExpired();
		this._gr.update();
	},
	
	/**
	 * Returns the assignment for this assignment type definition
	 */
	getAssignment: function () {
		var assignment = {"user":'', "group":''};
		
		if (this._gr.assignment_type+"" == sc_ic.DIRECT_ASSIGNMENT) {
			assignment.user = this._gr.assignment_user+"";
			assignment.group = this._gr.assignment_group+"";
			
			if (this._log.atLevel(GSLog.DEBUG))
				this._log.debug("[getAssignment] Direct Assignment user: " + assignment.user + ", group: " + assignment.group);
		}
		else
			assignment = this._processAssignmentScript();
		
		return assignment;
	},
	
	_copyFields: function(source) {
		this._gr.short_description = source.short_description;
		this._gr.description = source.description;
		this._gr.assignment_type = source.assignment_type;
		this._gr.assignment_group = source.assignment_group;
		this._gr.assignment_user = source.assignment_user;
		this._gr.assignment_script = source.assignment_script;
		this._gr.assignment_details = source.assignment_details;
		this._gr[sc_ic.TASK_ASSIGN_DEFN_STAGING] = source.getUniqueValue();
	},
	
	/**
	 * Process the assignment script held as part of this record.
	 * expects a return from the script to be an object with the structure defined in assignment below.
	 */
	_processAssignmentScript: function() {
		var assignment = {"user":'',"group":''};
		
		if (GlideStringUtil.nil(this._gr.assignment_script))
			return assignment;

		var scriptResult = GlideEvaluator.evaluateString(this._gr.assignment_script);
		
		if (GlideStringUtil.nil(scriptResult))
			return assignment;
		
		assignment.user = scriptResult.user + "";
		assignment.group = scriptResult.group + "";
		
		if (this._log.atLevel(GSLog.DEBUG))
			this._log.debug("[_processAssignmentScript] Found assignment user: " + assignment.user + ", group: " + assignment.group);
		
		return assignment;
	},
		
		
	
    type: 'sc_ic_TaskAssignDefn'
});

sc_ic_TaskAssignDefn.create = function(source) {
	var ttd = new GlideRecord(sc_ic.TASK_ASSIGN_DEFN);
	var typeDef = sc_ic_Factory.wrap(ttd);
	typeDef._copyFields(source);
	ttd.insert();
	return ttd;
};