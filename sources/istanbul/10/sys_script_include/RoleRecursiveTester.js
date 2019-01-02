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

        // it will check if the target value has been visited or it is looped
        this.targetValue = gr[this.childField] + '';
        this.visited = {};
        if (!this._walkTree(gr[this.parentField]))
            return true;
    },
    
    // it uses the childField as the relation field to walk tree
    _walkTree : function(/* GlideElement */ p) {        
        this.visited[p] = true; // visit the record
        if (this.visited[this.targetValue]) 
            return false;

        var gr = new GlideRecord(this.table);
        gr.addQuery(this.childField, p); // find out all the parent records that has this child
        gr.query();
        while (gr.next()) {
            if (!this._walkTree(gr[this.parentField]))
                return false;
        }
        return true;
    },

    type: 'RoleRecursiveTester'
};