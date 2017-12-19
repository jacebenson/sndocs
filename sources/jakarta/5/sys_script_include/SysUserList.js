gs.include("PrototypeServer");
gs.include("AbstractList");

var SysUserList = Class.create();

SysUserList.prototype = Object.extendsObject(AbstractList, {

  get : function() {
     return this.getUserList();
  },

  getUserList : function() { 
     var answer = new GlideRecord(this.SYS_UI_LIST);
     answer.addQuery(this.NAME, this.tableName);
     answer.addQuery(this.VIEW, this.view);
     answer.addQuery(this.SYS_USER, this.user);
     this.addParentQuery(answer);
     this.addRelationshipQuery(answer);
     this.domainQuery(answer);
     if (!answer.next())
        return null;
    
     return answer.sys_id.toString();
  },

  z : function() {
  }

});