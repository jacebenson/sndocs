gs.include("PrototypeServer");
gs.include("AbstractList");

var SysRelatedList = Class.create();

SysRelatedList.prototype = Object.extendsObject(AbstractList, {
  SYS_UI_RELATED_LIST : 'sys_ui_related_list',
  ESS_VIEW : 'ess',

  get : function() {
     this.targetTable = this.tableName;
     var answer = this.getList(this.view);
     if (answer != null)
        return answer;

     answer = this._checkParents(this.view);
     if (answer != null)
        return answer;

     if (this.ESS_VIEW == this.viewName)
        return answer;

     if (this.view != this.defaultViewID) {
        this.targetTable = this.tableName;
        answer = this.getList(this.defaultViewID);
        if (answer != null)
           return answer;

        answer = this._checkParents(this.defaultViewID);
        if (answer != null)
           return answer;
     }

     return this.NOT_FOUND_ID;
  },

  getList : function(viewID) {
     var gr = new GlideRecord(this.SYS_UI_RELATED_LIST);
     gr.addQuery(this.NAME, this.targetTable);
     gr.addQuery(this.VIEW, viewID);
     this.domainQuery(gr, this.domainID);
     if (!gr.next())
        return null;
     
     return gr.sys_id.toString();
  },

  _checkParents : function(viewID) {
     var list = this.getParents();
     if (list == null)
        return null;

     for (var i = 0; i < list.length; i++) {
        this.targetTable = list[i];
        if (this.targetTable == "sys_metadata")
           continue;
        var answer = this.getList(viewID);
        if (answer != null)
           return answer;
     }
     
     return null;
  },


  z : function() {
  }

});