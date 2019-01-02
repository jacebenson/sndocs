gs.include("PrototypeServer");

var GroupSelect = Class.create();

GroupSelect.prototype = {
  
  GROUP_NONE: "-- None --",

  initialize: function() {
    this.fUser = new GlideRecord('sys_user');
    this.fUser.get(gs.getUserID());
    gs.log("Current user = " + this.fUser.name);
    gs.log(this.fUser.isValidField('u_primary_group'));
  },

  getList: function() {
    var xmlDocument = new GlideXMLDocument('groups');
    var root = xmlDocument.getDocumentElement();
    var choices = new GlideChoiceList();
    var groups = gs.getUser().getMyGroups();
    if (groups.size() == 0 || !this.fUser.isValidField('u_primary_group')) {
       choices.add(new GlideChoice("", this.GROUP_NONE));
    }
    for (var i = 0; i < groups.size(); i++) {
       var groupID = groups.get(i);
       var groupRecord = new GlideRecord('sys_user_group');
       groupRecord.get(groupID);
       var groupName = groupRecord.name.toString();
       var choice = new GlideChoice(groupID, groupName);
       choices.add(choice);
    }
    var set = new GlideChoiceListSet();
    set.setSelected(choices);
    var document =  set.toXML();
    var e = document.getDocumentElement()
    
    if (this.fUser.isValidField('u_primary_group'))
       e.setAttribute("currentChoice", this.fUser.u_primary_group.toString()); 
    else
       e.setAttribute("currentChoice", this.GROUP_NONE);
    answer = document;
    return document;
  },

  changeGroup: function(id) {
    if (!this.fUser.isValidField('u_primary_group')) {
       gs.log("Setting primary group to " + id + " is not possible as the field is not defined");
    } else {
       this.fUser.u_primary_group = id;
       this.fUser.update();
    }
  }
};