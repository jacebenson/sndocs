gs.include("PrototypeServer");
gs.include("AbstractList");

var SysSection = Class.create();

SysSection.prototype = Object.extendsObject(AbstractList, {

  SYS_METADATA : 'sys_metadata',
  SYS_UI_SECTION : 'sys_ui_section',
  SYS_UI_ELEMENT : 'sys_ui_element',
  HEADER : 'header',
  TITLE : 'title',

  get : function() {
     this.targetTable = this.tableName;
     var id  = this.getSection();
     if (id != null)
        return id;

     if (this.view == this.defaultViewID)
        return null;

     this.targetTable = this.tableName;
     this.view = this.defaultViewID;
     return this.getSection();
  },

  getSectionForTable: function(tableName) {
     this.targetTable = tableName;
     return this.getSection();
  },

  getSection : function() {
     var list = this._getViewList();
     for (var i = 0; i < list.length; i++) {
        var viewID = list[i];
        var gr = new GlideRecord(this.SYS_UI_SECTION);
        gr.addQuery(this.NAME, this.targetTable);
        gr.addQuery(this.VIEW, viewID);
        gr.orderByDesc(this.TITLE);
        this.domainQuery(gr, this.domainID);
        if (gr.next()) {
           this.section = gr;
           return gr.sys_id.toString();
        }
     }

     return this.checkParents();
  },

  // It is possible to have multiple views provided when a popup is being requested on a 
  // form that already has a view.  In this case we want to first check for a pop_up view
  // and if that fails then we look for the view that matches the view displaying the 
  // form.
  _getViewList : function() {
     if (this.view == this.defaultViewID)
        return new Array(this.view);

     if (this.viewName == 'sys_popup')
        this.isPopUp = true;

     var views = this.viewName.split(",");
     if (views.length == 1)
        return new Array(this.view);

     var answer = new Array();
     for (var i = 0; i < views.length; i++) {
        var viewName = views[i];
        if (viewName == 'sys_popup')
           this.isPopUp = true;

        answer.push(new GlideScriptViewManager(viewName).getID());
     }

     return answer;
  },

  checkParents : function() {
     if (this.targetTable != this.tableName)
        return null;

     var list = this.getParents();
     if (list == null)
        return null;

     for (var i = 0; i < list.length; i++) {
		 if (list[i] == this.SYS_METADATA)
			 continue; // Special case.  We don't ever want to copy from sys_metadata
		 
        this.targetTable = list[i];
        var answer = this.getSection();
        if (answer != null) 
           return this._clone();
     }
     
     return null;
  },

  _clone : function() {
	 var fromSysid = this.section.sys_id.toString();
	 var ss = new GlideSysSection(this.tableName);
     var toSysid = ss.copySection(this.section);
     this._copySectionElements(toSysid, fromSysid);
     return toSysid;
  },

  _copySectionElements : function(toID, fromID) {
     var gr = new GlideRecord(this.SYS_UI_ELEMENT);
     gr.addQuery(this.SYS_UI_SECTION, fromID);	
     gr.query();
     while (gr.next()) {
        gr.sys_ui_section = toID;
        gr.insert();
     }
  },

  z : function() {
  }

});