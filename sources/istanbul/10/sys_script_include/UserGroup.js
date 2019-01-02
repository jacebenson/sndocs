gs.include("PrototypeServer");

var UserGroup= Class.create();

UserGroup.prototype = {
  initialize: function() {
  },

  getGroups: function(userSysID) {
    var gr = this._getGroups(userSysID);
    var sandbox = RhinoEnvironment.useSandbox();
    new AJAXHelper().createItemXML0(gr, root, ['sys_id', 'name'], sandbox);
  },
  
  _getGroups: function(userSysID) {
    var al = GlideUserGroup.getUsersGroups(userSysID);
    var gr = new GlideRecord('sys_user_group'); 
    gr.addQuery('sys_id', al);
    gr.query();
    return gr;
  }
}
