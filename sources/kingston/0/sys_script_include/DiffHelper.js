var DiffHelper = Class.create();

DiffHelper.prototype = {
    compareRecord: function(sys_id, table){ 
        var diffHelper = new DiffHelper();
        // Get current record
        var updateSet = new GlideUpdateSet();
        var gr = new GlideRecord(table);
        gr.query("sys_id", sys_id);
        // Use _next() here, since we do not know if the given table has a 'next' column.
	    gr._next();

        // Get the records update name
        var updateManager =  new GlideUpdateManager2();
        var name = updateManager.getUpdateName(gr);
        
        // Using records update name get most recent update xml
        gr2 = new GlideRecord("sys_update_xml");
        gr2.addQuery("update_set", "!=", updateSet.get());
        gr2.query("name", name + "");
        gr2.orderByDesc("sys_updated_on");
        gr2.next()        

        if (gr2 == null) 
            var payload2 = "";
        else 
            var payload2 = gr2.payload;

        // Serialize Record for comparison
        var serializer = new GlideRecordXMLSerializer()
        var payload = serializer.serialize(gr);
        var diff = diffHelper.diffRecord(payload, payload2, gr.name);
        if (diff == null) {
            diffHelper.infoMessage();
            return;
        }
        var html = diffHelper.getTemplate(diff, "Previous Version", "Current Version");
        
        // get most recent record to populate the diff record
        var gr = new GlideRecord("sys_update_xml");
        gr.query("name", name + "");
        gr.orderByDesc("sys_updated_on");
        gr.next() 
          
        return diffHelper.createDiff(gr, html);
        
    },

   
   /**
     *  Create a sys_update_diff record
     *  Used by sys_update_diff's UI Action compare to Previous
     */
    compareToPrevious: function(sys_id){
        // get current update xml
        var gr = new GlideRecord("sys_update_xml");
        gr.query("sys_id", sys_id + "");
        gr.next();
         
        var payload2 = this.getXMLFromSysUpdate(gr.update_set, gr.name); 
        var html;
        var left = "Previous Version";
        var right = "Update Version";
        if (payload2 != null && payload2 != "") {
            var diff = this.diffXMLString(gr.getValue("payload"), payload2, gr.target_name);
            html = this.getTemplate(diff, left, right);
        }
        else {
            var diff = this.diffUpdateSet(gr.getValue("payload"));
            html = this.getTemplate(diff, "Current Version", right);
        }
        
        if (diff == null) {
            this.infoMessage();
            return;
        }
        return this.createDiff(gr, html);
    },
    createDiff: function(gr, html){
        var gr2 = new GlideRecord("sys_update_diff");
        gr2.name = gr.name;
        gr2.target_name = gr.target_name;
        gr2.type = gr.type;
        gr2.update_xml = gr.sys_id;
        gr2.payload_diff = html;
        gr2.insert();
        return gr2;
    },
    /**
     * Get the url of the record represented by
     * the sys_update_xml file.
     * Used by sys_update_diff's UI Action Edit
     */
    getURL: function(sys_id) {     
        var gr = new GlideRecord("sys_update_xml");
        gr.query("sys_id", sys_id + "");
        gr.next();
        var root = this._getRoot(gr.payload);
        if (root.getTagName() == "record_update") 
            root = this._firstChildElement(root);
        return this._getDiffer(root).getURL(root);
    },
    
    diffAvailable: function(update){
        var root = this._getRoot(update.payload);
        if (root == null)
          return false;

        if (root.getTagName() == "database") 
            return false;
        
        if (root.getTagName() == "record_update") 
            root = this._firstChildElement(root);
	   
	   if (root === null)
		  return false;
	   
	   var differ = this._getDiffer(root);
	   var rec = differ._getParentRecord(root);
	   // Do not use next() here!  A table could have a 'next' field, like sys_template,
	   // which fails without telling you why, forcing you to break your keyboard 
	   // with your forehead.
	   return rec.hasNext();	   
    },
    
    diffUpdateSet: function(xmlString){
        var root1 = this._getRoot(xmlString);
        if (root1 == null)
           return null;
        if (root1.getTagName() == "database") 
            return null;
        if (root1.getTagName() == "record_update") 
            root1 = this._firstChildElement(root1);
        
        return this._getDiffer(root1).diffUpdateSet(root1);
    },
    
    diffXMLString: function(xmlstring1, xmlstring2){
		xmlstring1 = GlideappUpdateVersion.getPreviewXML(xmlstring1);
		xmlstring2 = GlideappUpdateVersion.getPreviewXML(xmlstring2);
        var root1 = this._getRoot(xmlstring1);
        var root2 = this._getRoot(xmlstring2);
        if (root1 == null|| root2 == null) {
           gs.print("Error getting root");
           return null;
        }
        return this._getDiffer(root1).diffXML(root1, root2);
    },
    
    diffRecord: function(recordXML, updateXML, name){
        var root1 = this._getRoot(recordXML);
        var root2 = this._getRoot(updateXML);
        if (root1 == null|| root2 == null)
           return null;
           
        if (root1.getTagName() == "record_update") 
            root1 = this._firstChildElement(root1);
     
        if (root2.getTagName() == "record_update") 
            root2 = this._firstChildElement(root2);
        return this._getDiffer(root1).diffXML(root1, root2, name);
    },
    
    getTemplate: function(html, left, right){
        var jr = new GlideJellyRunner();
        jr.setEscaping(false);
        jr.setVariable("jvar_table", html);
        jr.setVariable("jvar_left", gs.getMessage(left));
        jr.setVariable("jvar_right", gs.getMessage(right));
        return jr.runFromTemplate("diff_html_viewer.xml");
    },

    getVersionTemplate: function(html, version1, version2, isChangeTitle){
        var jr = new GlideJellyRunner();
        jr.setEscaping(false);
        jr.setVariable("jvar_table", html);
        jr.setVariable("jvar_left", gs.getMessage(version1.sys_created_on.getDisplayValue()));
        var isRightTheCurrentVersion = this._isCurrentVersion(version2.name, version2.sys_id);
        jr.setVariable("jvar_left_is_current", this._isCurrentVersion(version1.name, version1.sys_id));
        jr.setVariable("jvar_right_is_current", this._isCurrentVersion(version2.name, version2.sys_id));
        jr.setVariable("jvar_is_title_change", isChangeTitle);
        var versionAPI = new GlideappUpdateVersion();
        jr.setVariable("jvar_left_is_revertable", versionAPI.isUpdateVersionRevertable(version1.sys_id));
        jr.setVariable("jvar_right_is_revertable", versionAPI.isUpdateVersionRevertable(version2.sys_id));
        if (isRightTheCurrentVersion == false && isChangeTitle == true)
            jr.setVariable("jvar_right", gs.getMessage("Current"));
        else 
            jr.setVariable("jvar_right", gs.getMessage(version2.sys_created_on.getDisplayValue()));

        return jr.runFromTemplate("diff_version_html_viewer.xml");
    },
    
      getConflictVersionTemplate: function(html, version1, version2, isChangeTitle){
        var jr = new GlideJellyRunner();
        jr.setEscaping(false);
        jr.setVariable("jvar_table", html);
        jr.setVariable("jvar_left", gs.getMessage("Pulled version"));
        jr.setVariable("jvar_right", gs.getMessage("Local version"));
        jr.setVariable("jvar_conflict_version", version1.sys_id);
        jr.setVariable("jvar_is_title_change", isChangeTitle);
        var versionAPI = new GlideappUpdateVersion();
        return jr.runFromTemplate("diff_conflict_versions_html_viewer.xml");
    },

    _isCurrentVersion: function(name, sysId){
        var gr = new GlideRecord('sys_update_version'); 
        gr.addQuery('name', name);
		gr.addQuery('state', 'current');
        gr.orderByDesc('sys_created_on');
        gr.setLimit(1);
        gr.query();
        if (!gr.next())
            return false;

        if (gr.sys_id == sysId)
            return false;  

        return sysId;    
    },
    
    _getRoot: function(xmlstring){
        var xml = GlideXMLUtil.parseWithCoalescing(xmlstring,false);
        if (!xml)
           return null;
        var root = xml.getFirstChild();
        if (root.getTagName() == "sys_documentation" || root.getTagName() == "unload") 
            root = this._firstChildElement(root);

	   if (root === null)
		  return null;
        
        if (this._nonRecord(root)) {
           gs.print("table does not exist: " + root.getTagName() + "\n");
           return null;
        }
        return root;
    },
    
    _getDiffer: function(root1){
        if (this._isType(root1, "sys_ui_section")) 
            return new SimplifiedDiffer();
        if (this._isType(root1, "sys_choice")) 
            return new ChoiceListDiffer();
        if (this._isType(root1, "sys_ui_related")) 
            return new RelatedListDiffer();
        if (this._isType(root1, "sys_ui_list")) 
            return new ListDiffer();
        if (this._isType(root1, "sys_ui_form_sections")) 
            return new FormSectionsDiffer();
        if (this._isType(root1, "sys_dictionary"))
            return new DictionaryDiffer();
        if (this._isType(root1, "sys_ui_view")) 
            return new ViewDiffer();
        return new StandardDiffer();
        
    },
    
    /**
     * Given a sys_update_xml sys id
     * return the payload of previous sys_update_xml
     */
    getXMLFromSysUpdate: function(sys_id, name){        
        var gr2 = new GlideRecord("sys_update_xml");
        gr2.addQuery("update_set", sys_id + "");
        gr2.addQuery("name", name);
        gr2.query();
        var name = "";
        while (gr2.next()) 
            name = gr2.name;
        
        var gr2 = new GlideRecord("sys_update_xml");
        gr2.addNotNullQuery("update_set");
        gr2.addQuery("name", name);
        gr2.orderBy("sys_created_on");
        gr2.query();
        var payload2 = "";
        while (gr2.next()) 
          payload2 = gr2.payload + "";
        return payload2;
    },
   
    _isType: function(item, type){
        if (item.getTagName() == type) 
            return true;
        
        return false;
    },
    
    noCompare: function(){
        return "<p align=center>" +gs.getMessage("Local version of update not found") + "</p>";
    },
    
    infoMessage: function(){
        gs.addInfoMessage(gs.getMessage("Local version of update not found"));
    },

    _nonRecord : function(root) { 
        if (root.getTagName() == "record_update")
          root = this._firstChildElement(root);
        if (root.getNodeType() == "3")
          root = this._firstSiblingElement(root);
	    if (root.getTagName() == "sys_ui_related" || root.getTagName() == "sys_ui_form_sections")
           return false;
        var gr = new GlideRecord(root.getTagName());
        return !gr.isValid();
    },
   
      /**
     Return the first child of this parent element that is really an element (or for now, just not TEXT.)
    */
   _firstChildElement : function(parent) {
	    var child = parent.getFirstChild();
	    return this._firstSiblingElement(child);
   },
   
   /**
     Including the child itself, return the first of its siblings that is really an element (or for now, just not TEXT).
    */
    _firstSiblingElement : function(child) {	     
	  var sibling = child;
	   while (sibling !== null && sibling.getNodeType() == "3") {  // TEXT == 3
		 sibling = sibling.getNextSibling();
	  }
	   
	   return sibling;
   }
}