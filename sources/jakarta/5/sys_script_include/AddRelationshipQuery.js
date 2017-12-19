gs.include("PrototypeServer");

var AddRelationshipQuery = Class.create();

AddRelationshipQuery.prototype = {
	PREFERENCE : "ci_manage_relationships_filter_hint",
	
    initialize : function(util, item_id, relationship_id, mode) {
    	this.item_id = item_id;
    	this.relationship_id = relationship_id;
    	this.mode = mode;
    	this.util = util;
    },
    
    getQuery : function() {
    	var sql = new Array();
        if (this.mode == 'cmdb_ci') {
			var hint = this._getCIHint();
			if(!gs.nil(hint))
        		sql.push(hint);
		}
     
        var preferenceHint = this._getPreferenceHint();
		if(!gs.nil(preferenceHint))
			sql.push(preferenceHint); 
        var answer = sql.length >1 ? sql.join('^'): sql[0];
        gs.print('answer = ' + answer);
    	return answer;	
    },
    
    _getPreferenceHint : function() {
    	var pref = this.PREFERENCE + '.' + this.mode;
    	gs.print('PREF = ' + pref);
    	var sql = gs.getPreference(pref, '');
    		
        gs.print('SQL = ' + sql);
    	return sql;
    },
    
    _getCIHint : function() {
    	var sql = '';
    	if (this.relationship_id.indexOf('parent:') == 0) {
         	var parent = true;
     	    var child = false;
         	var type = this.relationship_id.substring('parent:'.length);
      	} else {
        	 var type = this.relationship_id.substring('child:'.length);
         	var parent = false;
         	var child = true;
      	}

      	var parents = this.util._getParentClasses(this.item_id);
      	var gr = new GlideRecord('cmdb_rel_type_suggest');
      	gr.addQuery('base_class', parents);
      	gr.addQuery('cmdb_rel_type', type);
      	gr.addQuery('parent', parent);
      	gr.addQuery('child', child);
      	gr.query();
      	gr.setQueryReferences(true);
      	var l = new Object();
      	while (gr.next()) 
        	l[gr.dependent_class+''] = true;
      
      	var sql = '';
      	for (key in l) {
        	if (sql != '')
          		sql += '^OR';
        
        	sql+='sys_class_nameINSTANCEOF' + key;
      	}
    	return sql;
    }
}