gs.include("PrototypeServer");
gs.include("AbstractList");

var SysList = Class.create();

SysList.prototype = Object.extendsObject(AbstractList, {
	
	get : function() {
		var answer = this.getList();
		if (answer != null)
			return answer;
		
		if (this.parentName != '') {
			this.parentName = '';
			this.relationshipID = '';
			answer = this.getList();
		}
		
		if (answer != null)
			return answer;
		
		return this.defaultList();
	},
	
	defaultList : function() {
		var list = new GlideSysList(this.tableName);
		list.setViewName(new GlideScriptViewManager(this.view, true).getViewName());
		var fields = list.getSuggestedFields();
		// PRB585017: The dynamically generated list view - a list that has been accessed for the very first time - must
		// be associated with the table's scope and not to the currently selected scope in the Application select list.
		list.setTablePackageID();
		list.setTableScopeID();
		list.InsertListElements(fields);
		list.createDefaultBaseline();
		return this.getList();
	},
	
	getList : function() {
		var answer = this.getSet(this.domainID, this.view, this.parentName);
		if (answer != null)
			return answer;
		
		if (this.domainID != 'global') {
			answer = this.getSet(null, this.view, this.parentName);
			if (answer != null)
				return answer;
		}
		
		if (this.view != this.defaultViewID) {
			answer = this.getSet(null, this.defaultViewID, this.parentName);
			if (answer != null)
				return answer;
		}
		
		return null;
	},
	
	getSet : function(domainID, viewID, parentName) {
		var answer = this.getDB(this.tableName, domainID, viewID, parentName);
		if (answer != null)
			return answer;
		
		var list = this.getParents();
		if (list == null)
			return null;
		
		for (var i = 0; i < list.length; i++) {
			if (list[i] == 'sys_metadata')
				continue; // Special case.  Never inherit a list from abstract sys_metadata table
			
			answer = this.getDB(list[i], domainID, viewID, parentName);
			if (answer != null)
				return answer;
		}
		
		return null;
	},
	
	getDB : function(tableName, domainID, viewID, parentName) {
		var gr = new GlideRecord(this.SYS_UI_LIST);
		gr.addNullQuery(this.SYS_USER);
		gr.addQuery(this.NAME, tableName);
		gr.addQuery(this.VIEW, viewID);
		this.addParentQuery(gr);
		this.addRelationshipQuery(gr);
		this.domainQuery(gr, domainID);
		if (!gr.next())
			return null;
		
		return gr.sys_id.toString();
	},
	
	z : function() {
	}
	
});