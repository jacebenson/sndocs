var InheritedRoleMapProcessor = Class.create();

InheritedRoleMapProcessor.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	SYSID : "sysId",
	TITLE : "title",
	DESCRIPTION : "description",
	SOURCE: "source",
	TARGET: "target",
	COLOR : "color",
	COLOR_USER : "gray",
	COLOR_BASE_ROLE : "green",
	COLOR_ROLE : "skyblue",
	COLOR_GROUP : "khaki",
	
	
	_initialize : function() {
		this.graphml = new GlideDiagram();
		this.sysId = null;
		this.userSysId = null;
		this.targetRoleSysId = null;
		this.titleField = "Title goes here for USER and ROLE names...";
		this.titleFieldChoice = false;
		this.descriptionField = null;
		this.descriptionFieldChoice = false;
		this.userNode = null;
		this.targetRoleNode = null;
	},
	
	_getParams : function() {
		this.expandList = [];
		this.collapseList = [];
		var expandNodes = this.getParameter("expand_nodes");
		if (expandNodes)
			this.expandList = expandNodes.split(',');
		var collapseNodes = this.getParameter("collapse_nodes");
		if (collapseNodes)
			this.collapseList = collapseNodes.split(',');
		this.sysId = this.getParameter(this.SYSID);
		var graph = this.graphml.getGraph();
		graph.setData("name", this.userSysId);
		graph.setID(this.targetRoleSysId);
		
		this.sysId = this.getParameter(this.SYSID);
		if (!this.sysId) {
			this._errorNode("parameter '" + this.SYSID + "' is missing");
			return;
		}
		
		var gr = new GlideRecord('sys_user_has_role');
		if (gr.get(this.sysId)) {
			this.userSysId = gr.getValue('user');
			this.targetRoleSysId = gr.getValue('role');
		} else {
			this._errorNode('Record not found for sys_id='+this.sysId + ' in the sys_user_has_role table!');
		}
		
		this.titleField = this.getParameter(this.TITLE);               // optional parameter for the title on boxes	
		this.descriptionField = this.getParameter(this.DESCRIPTION);    // optional parameter for the description in boxes
	},
	
	process : function() {
		this._initialize();
		this._getParams();
		var collapse = false;
		var expand = false;
		this.userNode = this._newNode(this.userSysId, "User", this.COLOR_USER);
		this.targetRoleNode = this._newNode(this.targetRoleSysId, "Target Role", this.COLOR_BASE_ROLE);
		this._getContainingRoles();
		this._getContainingRolesFromGroups();
		this._addExpandCollapseActions();
		this.graphml.saveToXml(this.getDocument(), this.getRootElement());
	},
	
	_getContainingRoles : function() {		
		var rmAPI = new SNC.RoleManagementAPI();
		var listPaths = rmAPI.findRolePathsForUserAndTargetRole(this.userSysId, this.targetRoleSysId);
		for (var i = 0; i < listPaths.size(); i++) {
			var listPath = listPaths.get(i);
			if (listPath.size() < 2) {
				this._newEdge(this.userNode, this.targetRoleNode);
				continue;
			}
			var containedNode = this.targetRoleNode;
			for (var j = listPath.size()-2; j >= 0 ; j--) {
				var containerRoleSysId = listPath.get(j);
				var containerNode = this._newNodeFromNode(containerRoleSysId, containedNode);
				containedNode = containerNode;
				if (j == 0) {
					// add link to userNode
					this._newEdge(this.userNode, containedNode);
				}
			}
		}
	},
	
	_getContainingRolesFromGroups : function() {
		var rmAPI = new SNC.RoleManagementAPI();
		var mapListPaths = rmAPI.findGroupRolePathsForUserAndTargetRole(this.userSysId, this.targetRoleSysId);
		var groups = mapListPaths.keySet().toArray();
		var rolePaths = mapListPaths.values().toArray();
		for (var k = 0; k < rolePaths.length; k++) {
			var listPaths = rolePaths[k];
			// add group node, and add link to userNode
			var groupSysId = groups[k];
			var groupNode = this._newNode(groupSysId, "Group", this.COLOR_GROUP);
			this._newEdge(this.userNode, groupNode);
			for (var i = 0; i < listPaths.size(); i++) {
				var listPath = listPaths.get(i);
				if (listPath.size() < 2) {
					this._newEdge(groupNode, this.targetRoleNode);
					continue;
				}
				var containedNode = this.targetRoleNode;
				for (var j = listPath.size()-2; j >= 0 ; j--) {
					var containerRoleSysId = listPath.get(j);
					var containerNode = this._newNodeFromNode(containerRoleSysId, containedNode);
					containedNode = containerNode;
					if (j == 0) {
						// add link to groupNode
						this._newEdge(groupNode, containedNode);
					}
				}
			}
		}
	},
	
	
	_addExpandCollapseActions : function() {
		this._addAction("actionExpand", "Expand", 1, "icon", "images/add_filter.png", "this.getData('is_collapsed')=='true'",
		"var nodeID = this.getID();" +
		"var collapseList = this.diagram.getParam('collapse_nodes').split(',');" +
		"for(var i=0; i&lt;collapseList.length; i++) {" +
		" var node = collapseList[i];" +
		" if (node == nodeID) {" +
		" collapseList.splice(i,1);" +
		" break;" +
		" }" +
		"}" +
		"var expandList = this.diagram.getParam('expand_nodes').split(',');" +
		"expandList.push(nodeID);" +
		"this.diagram.setParam('expand_nodes', expandList.join(','));" +
		"this.diagram.setParam('collapse_nodes', collapseList.join(','));" +
		"this.diagram.load();");
		this._addAction("actionCollapse", "Collapse", 2, "icon", "images/minus.png", "this.getData('is_expanded')=='true'",
		"var nodeID = this.getID();" +
		"var expandList = this.diagram.getParam('expand_nodes').split(',');" +
		"for(var i=0; i&lt;expandList.length; i++) {" +
		" var node = expandList[i];" +
		" if (node == nodeID) {" +
		" expandList.splice(i,1);" +
		" break;" +
		" }" +
		"}" +
		"var collapseList = this.diagram.getParam('collapse_nodes').split(',');" +
		"collapseList.push(nodeID);" +
		"this.diagram.setParam('expand_nodes', expandList.join(','));" +
		"this.diagram.setParam('collapse_nodes', collapseList.join(','));" +
		"this.diagram.load();");
	},
	
	_isChoiceField : function(gr, fieldName) {
		var ged = gr.getElement(fieldName).getED();
		if (ged.isChoiceTable())
			return true;
		return false;
	},
	
	/* Add a new node and add an edge from the specified SOURCE node to the new node. */
	_newNodeFromNode : function(roleSysId, source) {
		var node = this._newNode(roleSysId, "Role", this.COLOR_ROLE);
		this._newEdge(node, source);
		return node;
	},
	
	_newNode : function(sysId, descr, color) {
		var node = null;
		var node = this.graphml.getNode(sysId); // do not insert a node more than once
		if (node != null)
			return node;
		
		node = new GlideDiagramNode();
		node.setID(sysId);
		node.setDescription(descr);
		var rmAPI = new SNC.RoleManagementAPI();
		var nodeName = (color == this.COLOR_USER ? rmAPI.getUserNameById(sysId) :
		color == this.COLOR_GROUP ?  rmAPI.getGroupNameById(sysId) : rmAPI.getRoleNameById(sysId));
		node.setName(Packages.org.apache.commons.lang.StringEscapeUtils.escapeXml(nodeName));
		node.setData(this.COLOR, color);
		this.graphml.addNode(node);
		return node;
	},
	
	_newEdge : function (fromNode, toNode) {
		var edge = new GlideDiagramEdge();
		edge.setID(fromNode.getID() + "__to__" + toNode.getID());
		edge.setAttribute(this.SOURCE, fromNode.getID());
		edge.setAttribute(this.TARGET, toNode.getID());
		this.graphml.addEdge(edge);
		return edge;
	},
	
	// see "BSM Map -> Map Actions" records for examples of these values
	_addAction: function(id, name, order, type, icon, condition, script) {
		var action = new GlideDiagramAction();
		action.setID(id);
		action.setName(name);
		action.setAttribute("order", order);
		action.setType(type); // can be: icon, menu, line
		action.setIcon(icon);
		action.setCondition(condition);
		if (script)
			action.setScript(script);
		this.graphml.addAction(action);
	},
	
	_isCollapsed: function(nodeID) {
		for (var i = 0; i < this.collapseList.length; i++) {
			var node = this.collapseList[i];
			if (node == nodeID)
				return i;
		}
		return -1;
	},
	
	_isExpanded: function(nodeID) {
		for (var i = 0; i < this.expandList.length; i++) {
			var node = this.expandList[i];
			if (node == nodeID)
				return i;
		}
		return -1;
	},
	
	_errorNode : function(message) {
		var node = new GlideDiagramNode();
		node.setID("ERROR_NODE");
		node.setName("Error");
		node.setDescription(message);
		node.setData(this.COLOR, "red");
		this.graphml.addNode(node);
		this.graphml.saveToXml(this.getDocument(), this.getRootElement());
	},
	
	type : 'InheritedRoleMapProcessor'
	
});

