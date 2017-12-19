gs.include("PrototypeServer");
gs.include("AbstractList");

var SysRefList = Class.create();

SysRefList.prototype = Object.extendsObject(AbstractList, {
  SYS_REF_LIST : 'sys_ref_list',

  get : function() {
     this.targetTable = this.tableName;
     var answer = this.getRefList();
     if (answer != null)
        return answer;

     answer = this.checkParents();
     if (answer != null)
        return answer;
     
     return this.defaultRefList();
  },

  getRefList : function() { 
     var answer = new GlideRecord(this.SYS_UI_LIST);
     answer.addQuery(this.NAME, this.targetTable);
     answer.addQuery(this.VIEW, this.view);
     answer.addNullQuery(this.SYS_USER);
	 //this will add sys_domain to the GlideRecord and do a queryNoDomain()
     this.domainQuery(answer, this.domainID);
     if (!answer.next())
        return null;

     return answer.sys_id.toString();
  },

  checkParents : function() {
     var list = this.getParents();
     if (list == null)
        return null;

     for (var i = 0; i < list.length; i++) {
        this.targetTable = list[i];
        var answer = this.getRefList();
        if (answer != null)
           return answer;
     }
     
     return null;
  },

  defaultRefList : function() {
     var td = GlideTableDescriptor.get(this.tableName);
     var dn = td.getDisplayName();
     var list = new GlideSysList(this.tableName);
     list.setTablePackageID();
     list.setTableScopeID();
     list.setViewName(this.SYS_REF_LIST);
     var fields = new Packages.java.util.ArrayList();
     fields.add(dn);
     list.InsertListElements(fields); 
     this.targetTable = this.tableName;
     return this.getRefList();
  },

  z : function() {
  }

});