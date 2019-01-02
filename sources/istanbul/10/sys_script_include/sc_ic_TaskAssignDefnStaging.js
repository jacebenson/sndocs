var sc_ic_TaskAssignDefnStaging = Class.create();
sc_ic_TaskAssignDefnStaging.prototype = Object.extendsObject(sc_ic_BaseTypeDefnStaging, {
    initialize: function(_gr,_gs) {
		sc_ic_Base.prototype.initialize.call(this,_gr,_gs);
		
		// Fields that trigger the approval changing to draft
		this._toDraft = {'short_description': true, 'description': true, 'assignment_type':true, 'assignment_user':true,
						 'assignment_group':true, 'assignment_script': true};
    },

	setAssignmentDetails: function() {
		this._gr.assignment_details = "";
		
		if (this._gr.assignment_type+"" == sc_ic.DIRECT_ASSIGNMENT) {
			if (JSUtil.notNil(this._gr.assignment_group))
				this._gr.assignment_details = "Group: " + this._gr.assignment_group.getDisplayValue();
			if (JSUtil.notNil(this._gr.assignment_user)) {
				var usrDet = "User: " + this._gr.assignment_user.getDisplayValue();
				
				if (JSUtil.notNil(this._gr.assignment_details))
					this._gr.assignment_details = this._gr.assignment_details + ", " + usrDet;
				
				this._gr.assignment_details = usrDet;
			}
		}
		else
			this._gr.assignment_details = this._gs.getMessage("Script");
	},
	
	/**
	 * Published the approval definition expiring the currently published version
	 */
	publish: function() {
		this._publishToTable(sc_ic.TASK_ASSIGN_DEFN);
	},
	
	isPublished: function() {
		return JSUtil.notNil(this._gr[sc_ic.TASK_ASSIGN_DEFN]);
	},
	
	/**
	 * Expires the current & it's "Published Definition" record
	 */
	setExpired: function() {
	    this._gr[sc_ic.STATE] = sc_ic.EXPIRED;
		this._gr[sc_.ACTIVE] = false;
		
		return this;
	},
	
	/**
	 * Expires the current record and the published record
	 */
	expire: function() {
		this.setExpired();
		this._gr.update();
		if (!this._gr.isActionAborted() && !JSUtil.nil(this._gr[sc_ic.TASK_ASSIGN_DEFN]))
			sc_ic_Factory.wrap(this._gr[sc_ic.TASK_ASSIGN_DEFN].getRefRecord()).expire();
	},
	
    type: 'sc_ic_TaskAssignDefnStaging'
});