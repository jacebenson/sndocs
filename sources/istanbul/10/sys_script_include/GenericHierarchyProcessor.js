var GenericHierarchyProcessor = Class.create();

GenericHierarchyProcessor.prototype = Object.extendsObject(AbstractAjaxProcessor, {
     BASEID : "baseid",
     RECORD : "record",
     PARENT : "parent",
     TITLE : "title",
     COLOR : "color",
     ACTIVE : "active",
     LEVELS : "levels",
     DESCRIPTION : "description",
     SOURCE: "source",
     TARGET: "target",

     _initialize : function() {
        this.graphml = new GlideDiagram();
        this.recordType = null;
        this.baseSysId = null;
        this.parentField = null;
        this.levels = 9999;
        this.activeRecords = true;
        this.colorArray = [];
        this.titleField = null;
        this.titleFieldChoice = false;
        this.descriptionField = null;
        this.descriptionFieldChoice = false;
     },

     process : function() {
        this._initialize();
        var baseGR = this._getParams();
        var collapse = false;
        var expand = false;
        if (baseGR.get(this.baseSysId)) {
            baseNode = this._newNode(baseGR, 0);
            this._getChildren(baseGR, baseNode, 1, false);
        } else {
            this._errorNode(this.BASEID + " [" + this.baseSysId + "] not found for " + this.RECORD + " [" + this.recordType + "]"); 
            return;
        }

        this._addExpandCollapseActions();
        
        this.graphml.saveToXml(this.getDocument(), this.getRootElement());
    },
    
    _getChildren : function(baseGR, baseNode, level, parentCollapse) {
        var done = baseNode.getData("done");
        if (done)
           return 0; // prevent an endless loop if we've already started children for a node

        var children = 0;
        baseNode.setData("done", "true");

        var baseCollapse = parentCollapse;
        if (!baseCollapse) {
           if (level+1 > this.levels)
              baseCollapse = true;
           else
              if (this._isCollapsed(baseGR.sys_id) > -1)
                 baseCollapse = true;
        }
        if (baseCollapse && !parentCollapse)
           if (this._isExpanded(baseGR.sys_id) > -1)
              baseCollapse = false;

        var childGR = new GlideRecord(this.recordType);
        childGR.addQuery(this.parentField, baseGR.getUniqueValue());
        if (this.activeRecords)
           childGR.addActiveQuery();
        if (this.titleField != null)
           childGR.orderBy(this.titleField);
        childGR.query();

        if (!baseCollapse) {
           while (childGR.next()) {
              children++;
              var childCollapse = parentCollapse;
              var childNode = this._newNodeFromNode(childGR, level, baseNode, null);
              if (childNode)
                 children += this._getChildren(childGR, childNode, level+1, baseCollapse);
           }
        } else if (childGR.next()) {
           children++; // just add one so we know we found some children to set is_collapsed correctly
        }
        if (children > 0) {
           if (!baseCollapse)
              baseNode.setData('is_expanded','true');
           else
              baseNode.setData('is_collapsed','true');
        }
        return children;
    },

    _addExpandCollapseActions : function() {
       this._addAction("actionExpand", "Expand", 1, "icon", "images/add_filter.png", "this.getData('is_collapsed')=='true'",
          "var nodeID = this.getID();" +
          "var collapseList = this.diagram.getParam('collapse_nodes').split(',');" +
          "for(var i=0; i<collapseList.length; i++) {" +
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
         "for(var i=0; i<expandList.length; i++) {" +
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

    _getParams : function() {
        this.expandList = [];
        this.collapseList = [];
        var expandNodes = this.getParameter("expand_nodes");
        if (expandNodes)
           this.expandList = expandNodes.split(',');
        var collapseNodes = this.getParameter("collapse_nodes");
        if (collapseNodes)
           this.collapseList = collapseNodes.split(',');

        this.baseSysId = this.getParameter(this.BASEID);
        
        var graph = this.graphml.getGraph();
        graph.setData("name", this.baseSysId);
        graph.setID(this.baseSysId);
        
        if (!this.baseSysId) {
            this._errorNode("parameter '" + this.BASEID + "' is missing");
            return;
        }
        
        this.recordType = this.getParameter(this.RECORD);
        if (!this.recordType) {
            this._errorNode("parameter '" + this.RECORD + "' is missing");
            return;
        }
        
        this.parentField = this.getParameter(this.PARENT);
        if (!this.parentField) {
            this._errorNode("parameter '" + this.PARENT + "' is missing");
            return;
        }
        
        this.titleField = this.getParameter(this.TITLE);               // optional parameter for the title on boxes
        
        this.descriptionField = this.getParameter(this.DESCRIPTION);    // optional parameter for the description in boxes
        
        var colorPropertyName = this.getParameter(this.COLOR); // optional parameter for the colors of boxes at different levels
        if (colorPropertyName) {
            var colors = gs.getProperty(colorPropertyName, "skyblue,khaki");
            this.colorArray = colors.split(",");
        } else {
            this.colorArray.push("skyblue");
            this.colorArray.push("khaki");
        }
        
        var activeRecordsString = this.getParameter(this.ACTIVE);  // optional parameter to include records if false
        if (activeRecordsString == "false")
            this.activeRecords = false;
        
        var levelsString = this.getParameter(this.LEVELS); // optional parameter for how many levels to display
        if (levelsString) {
            this.levels = parseInt(levelsString, 10);
        }
        
        var baseGR = new GlideRecord(this.recordType);
        
        /* validate the record type and other record fields */
        if (!baseGR.isValid()) {
            this._errorNode( this.RECORD + " [" + this.recordType + "] is invalid");
            return;
        }
        if (!baseGR.isValidField(this.parentField)) {
            this._errorNode( this.PARENT + " [" + this.parentField + "] is not valid for " + this.RECORD + " [" + this.recordType + "]");
            return;
        }
        if (this.titleField) {
            if (!baseGR.isValidField(this.titleField)) {
                this._errorNode( this.TITLE + " [" + this.titleField + "] is not valid for " + this.RECORD + " [" + this.recordType + "]");
                return;
            }  
            this.titleFieldChoice = this._isChoiceField(baseGR, this.titleField);  
        }
        if (this.descriptionField) {
            if (!baseGR.isValidField(this.descriptionField)) {
                this._errorNode( this.DESCRIPTION + " [" + this.descriptionField + "] is not valid for " + this.RECORD + " [" + this.recordType + "]");
                return;
            }
            this.descriptionFieldChoice = this._isChoiceField(baseGR, this.descriptionField);
        }

        return baseGR;
    },
    
    _isChoiceField : function(gr, fieldName) {
        var ged = gr.getElement(fieldName).getED();
        if (ged.isChoiceTable())
            return true;
        return false;
    },

    /* Add a new node and add an edge from the specified SOURCE node to the new node. */
    _newNodeFromNode : function(targetGR, level, source, edgeLabel) {
        var node = this._newNode(targetGR, level);
        this._newEdge(edgeLabel, source, node);
        return node;
    },

    _newNode : function(gr, level) {
        var node = null;
        if (gr.canRead()) {
            var sys_id = gr.getUniqueValue();
            var node = this.graphml.getNode(sys_id); // do not insert a node more than once
            if (node == null) {
                node = new GlideDiagramNode();
                node.setID(sys_id);
                if (this.titleField != null) {
                    if (this.titleFieldChoice)
                        node.setName(gr.getChoiceValue(this.titleField));
                    else
                        node.setName(gr.getDisplayValue(this.titleField));
                }
                if (this.descriptionField != null) {
                    var description;
                    if (this.descriptionFieldChoice==true)
                        description = gr.getChoiceValue(this.descriptionField);
                    else
                        description = gr.getElement(this.descriptionField).getDisplayValue();
                    node.setDescription(description);
                }
                if (level != -1) {
                    var color = this.colorArray[this.colorArray.length-1];
                    if (level < this.colorArray.length)
                        color = this.colorArray[level];
                    node.setData(this.COLOR, color);
                }
                this.graphml.addNode(node);
            }
        }
        return node;
    },
    
    _newEdge : function (label, source, target) {
        var edge = new GlideDiagramEdge();
        edge.setID(source.getID() + "__to__" + target.getID());
        edge.setAttribute(this.SOURCE, source.getID());  
        edge.setAttribute(this.TARGET, target.getID());
        //edge.setName(label);  // labels are slow so we're skipping them for now
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

    type : 'GenericHierarchyDiagram'
});