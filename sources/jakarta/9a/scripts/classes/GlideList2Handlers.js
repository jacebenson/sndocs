/*! RESOURCE: /scripts/classes/GlideList2Handlers.js */
var GlideList2NewHandler = Class.create();
GlideList2NewHandler.prototype = {
  initialize: function() {
    CustomEvent.observe("list.handler", this.process.bind(this));
  },
  process: function(list, actionId, actionName) {
    if (actionName == "sysverb_new")
      list.addToForm("sys_id", "-1");
    return true;
  },
  type: 'GlideList2NewHandler'
};
var GlideList2ChecksHandler = Class.create();
GlideList2ChecksHandler.prototype = {
  initialize: function() {
    CustomEvent.observe("list.handler", this.process.bind(this));
  },
  process: function(list, actionId, actionName) {
    if (!actionName.startsWith("sysverb")) {
      var keys = ['No records selected', 'Delete the selected item?', 'Delete these', 'items?'];
      var msgs = getMessages(keys);
      if (list.checkedIds == '') {
        alert(msgs["No records selected"]);
        return false;
      }
      if (actionName == "delete_checked") {
        var items = list.checkedIds.split(",");
        if (items.length == 1) {
          if (!confirm(msgs["Delete the selected item?"]))
            return false;
        } else if (items.length > 0) {
          if (!confirm(msgs["Delete these"] + " " + items.length + " " + msgs["items?"]))
            return false;
        }
      }
    }
    list.addToForm('sysparm_checked_items', list.checkedIds);
    return true;
  },
  type: 'GlideList2ChecksHandler'
};
var GlideList2SecurityHandler = Class.create();
GlideList2SecurityHandler.prototype = {
    initialize: function() {
      CustomEvent.observe("list.handler", this.process.bind(this));
    },
    process: function(list, actionId, actionName) {
        var element = null;
        if (actionId)
          element = $(actionId);
        if (!element)
          element = $(actionName);
        if (element) {
          var gsftc = element.getAttribute('gsft_condition');
          if (gsftc != null && gsftc != 'true')
            return;
        }
        if (list.checkedIds.length == 0)
          return true;
        var sysIds = list.checkedIds;
        var ajax = new GlideAjax("AJAXActionSecurity");
        ajax.addParam("sys_target", list.getTableName());
        ajax.addParam("sys_action", actionId);
        ajax.addParam("sysparm_checked_items", sysIds);
        ajax.addParam("sysparm_view", list.getView());
        ajax.addParam("sysparm_query", list.getSubmitValue("sysparm_fixed_query"));
        ajax.addParam("sysparm_referring_url", list.getReferringURL());
        ajax.addParam("sys_is_related_list", list.getSubmitValue("sys_is_related_list"));
        ajax.addParam("sysparm_collection_related_file", list.getSubmitValue("sysparm_collection_related_file"));
        ajax.addParam("sysparm_collection_key", list.getSubmitValue("sysparm_collection_key"));
        ajax.addParam("sysparm_collection_relationship", list.getSubmitValue("sysparm_collection_relationship"));
        ajax.addParam("sysparm_target", list.getTableName());
        var xml = ajax.getXMLWait();
        var answer = {};
        var root = xml