var RoleRecursiveTester = Class.create();
RoleRecursiveTester.prototype = {
    initialize: function(table, parentField, childField) {
        this.table = table;
        this.parentField = parentField;
        this.childField = childField;
    },
    
    /**
     * Used when trying to add child to the parent role
     */
    isRecursive: function(gr) {
        if (gr[this.parentField].nil())
            return false; // no parent/child no recursion

        if (gr[this.parentField] == gr[this.childField])
            return true; // cannot be your own parent/child
		
		var parent = gr[this.parentField] + '';
		var child = gr[this.childField] + '';
		
		// check if there's an existing cycle:
		var cyclicRoleListParent = new GlideUserHasRoleInhCountFixer().findCyclicRoleNames(parent);
		var cyclicRoleListChild = new GlideUserHasRoleInhCountFixer().findCyclicRoleNames(child);
		if (!cyclicRoleListParent.isEmpty() || !cyclicRoleListChild.isEmpty()) {
			var cyclicRoleList = cyclicRoleListParent.isEmpty() ? cyclicRoleListChild : cyclicRoleListParent;
			var msg = gs.getMessage("The following existing roles cyclicity was detected and needs to be fixed: {0}", GlideStringUtil.join(cyclicRoleList));
			gs.log(msg);
			gs.addErrorMessage(msg);
			return true;
		}
		
        // it will check if the target value has been visited or it is looped
        this.targetValue = gr[this.childField] + '';
        this.visited = {};
        if (!this._walkTree(parent))
            return true;
		
		return false;
    },
    
    // walk the tree, return false if cyclicity is detected
    _walkTree : function(p) {
        this.visited[p] = true; // mark as visited
        if (this.visited[this.targetValue]) {
        	// prevent creating a new cycle:
			this._reportCycle(this.targetValue);
			return false;
		}
		
        var gr = new GlideRecord(this.table);
        gr.addQuery(this.childField, p); // find out all the parent records that has this child
        gr.query();
        while (gr.next()) {
            if (!this._walkTree(gr[this.parentField]))
                return false;
        }
        return true;
    },
	
	_reportCycle: function(p) {
		var msg = 'The following new roles cyclicity was detected: [';
		var ar = [];
		for (var role in this.visited)
			ar.push(this._getRoleNameByID(role));
		for (var i=ar.length-1; i>=0; i--)
			msg += ar[i] + ', ';
		msg += this._getRoleNameByID(p) + ',';
		msg += '...]';
		gs.log(msg);
		gs.addErrorMessage(msg);
	},
	
	_getRoleNameByID: function(sysId) {
		var gr = new GlideRecord('sys_user_role');
		gr.get(sysId);
		return gr.name;
	},

    type: 'RoleRecursiveTester'
};