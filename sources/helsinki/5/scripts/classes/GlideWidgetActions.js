/*! RESOURCE: /scripts/classes/GlideWidgetActions.js */
var GlideWidgetActions = Class.create(GlideListWidget, {
  initialize: function($super, widgetID, listID, ofText) {
    $super(widgetID, listID);
    this.ofText = ofText;
    this.securityActions = {};
  },
  _refresh: function(listTable, list) {
    this.securityActions = {};
    list._setTheAllCheckbox(false);
  },
  actionCheck: function(select) {
    if (select.getAttribute('gsft_sec_check') == 'true')
      return;
    select.setAttribute('gsft_sec_check', 'true');
    var actions = [];
    var sysIds = [];
    var list = GlideList2.get(this.listID);
    var checkedIds = list.getChecked();
    if (checkedIds)
      sysIds = checkedIds.split(",");
    var options = select.options;
    for (var i = 0; i < options.length; i++) {
      var opt = options[i];
      opt.style.display = 'inline';
      if (getAttributeValue(opt, 'gsft_is_action') != 'true')
        continue;
      if (this._checkAction(opt, sysIds))
        actions.push(opt);
    }
    if (actions.length > 0) {
      var actionIds = [];
      for (var i = 0; i < actions.length; i++)
        actionIds.push(actions[i].id);
      this._canExecute(actionIds, sysIds, list.tableName);
      for (var i = 0; i < actions.length; i++) {
        var opt = actions[i];
        var validIds = this.securityActions[opt.id];
        opt.style.color = "";
        if (!validIds || (validIds.length == 0)) {
          opt.style.color = '#777';
          opt.disabled = true;
        } else if (validIds.length == sysIds.length) {
          opt.disabled = false;
          opt.innerHTML = getAttributeValue(opt, 'gsft_base_label');
          opt.setAttribute('gsft_allow', '');
        } else {
          opt.disabled = false;
          opt.innerHTML = getAttributeValue(opt, 'gsft_base_label') + ' (' + validIds.length + ' ' + this.ofText + ' ' + sysIds.length + ')';
          opt.setAttribute('gsft_allow', validIds.join(','));
        }
      }
    }
    if ('' == 'true' && options.length > 0) {
      for (var i = 0; i < options.length; i++) {
        var opt = options[i];
        if (this._shouldHide(opt, select))
          opt.style.display = 'none';
      }
    }
    select.focus();
  },
  _shouldHide: function(opt, select) {
    var options = select.options;
    var ourId = opt.id;
    var ourLabel = opt.innerHTML;
    for (var i = 0; i < options.length; i++) {
      var actionLabel = options[i].innerHTML,
        actionEnabled = options[i].disabled != true,
        actionId = options[i].id;
      if (ourId == actionId && !opt.disabled)
        return false;
      if (ourLabel == actionLabel && actionEnabled)
        return true;
    }
    return false;
  },
  _checkAction: function(opt, sysIds) {
    if (sysIds.length == 0) {
      opt.disabled = true;
      opt.innerHTML = getAttributeValue(opt, 'gsft_base_label');
      opt.style.color = '#777';
      return false;
    }
    if (getAttributeValue(opt, 'gsft_check_condition') != 'true') {
      opt.disabled = false;
      opt.style.color = '';
      return false;
    }
    return true;
  },
  _canExecute: function(actionIds, sysIds, tableName) {
    var ajax = new GlideAjax("AJAXActionSecurity");
    ajax.addParam("sys_target", tableName);
    ajax.addParam("sys_action", actionIds.join(","));
    ajax.addParam("sysparm_checked_items", sysIds.join(','));
    var xml = ajax.getXMLWait();
    var answer = {};
    for (var n = 0; n < actionIds.length; n++) {
      var actionId = actionIds[n];
      var root = xml.getElementsByTagName("action_" + actionId)[0];
      var keys = root.childNodes;
      this.securityActions[actionId] = [];
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var id = key.getAttribute('sys_id');
        if (key.getAttribute('can_execute') == 'true')
          this.securityActions[actionId].push(id);
      }
    }
  },
  runAction: function(select) {
    var opt = getSelectedOption(select);
    if (!opt)
      return false;
    if (opt.id == 'ignore' || (!opt.value && !opt.text))
      return false;
    if (opt.disabled)
      return false;
    var list = GlideList2.get(this.listID);
    if (!list)
      return false;
    var id = opt.id;
    var name = getAttributeValue(opt, 'action_name');
    if (!name)
      name = id;
    if (getAttributeValue(opt, 'client') == 'true') {
      g_list = list;
      var href = getAttributeValue(opt, 'href');
      eval(href);
      g_list = null;
    } else {
      var ids = opt.getAttribute('gsft_allow');
      list.action(id, name, ids);
    }
    return false;
  },
  type: 'GlideWidgetActions'
});;