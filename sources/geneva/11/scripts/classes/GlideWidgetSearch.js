/*! RESOURCE: /scripts/classes/GlideWidgetSearch.js */
var GlideWidgetSearch = Class.create(GlideListWidget, {
  initialize: function($super, widgetID, listID, focusOnRefresh) {
    $super(widgetID, listID);
    this.field = "";
    this.focusOnRefresh = (focusOnRefresh == 'true');
    this._initEvents();
  },
  _refresh: function(listTable, list, isInitialLoad) {
    var field = list.sortBy;
    if (!field)
      field = 'zztextsearchyy';
    this._setSelect(field);
    this._setTitle();
    this._clearText();
    if (this.focusOnRefresh) {
      var e = this._getElement("text");
      try {
        e.focus();
      } catch (er) {}
    }
  },
  _initEvents: function() {
    this._getElement('select').observe('change', this._setTitle.bind(this));
    var text = this._getElement('text');
    text.observe('keypress', this.searchKeyPress.bind(this));
    var a = text.nextSibling;
    var spn = text.previousSibling;
    if (spn && spn.tagName.toUpperCase() == "SPAN")
      $(spn).observe('click', this.search.bind(this));
    while (a && a.tagName.toUpperCase() != "A")
      a = a.nextSibling;
    if (!a)
      return;
    var a = $(a);
    a.observe('click', this.search.bind(this));
  },
  searchKeyPress: function(ev) {
    if (!ev || ev.keyCode != 13)
      return;
    return this.search(ev);
  },
  search: function(ev) {
    var select = new Select(this._getElement('select'));
    var value = this._getValue("text");
    if (!value)
      return;
    ev.stop();
    var field = select.getValue();
    var list = GlideList2.get(this.listID);
    var parms = {};
    parms['sysparm_goto_query'] = value;
    parms['sysparm_goto_field'] = field;
    parms['sys_target'] = list.tableName;
    parms['sysparm_userpref.' + list.tableName + '.db.order'] = field;
    parms['sysparm_query'] = list.getQuery({
      groupby: true
    });
    CustomEvent.fire('list_v2.orderby.update', field);
    this._clearText();
    list.refresh(1, parms);
  },
  setTitle: function() {
    this._setTitle();
  },
  _clearText: function() {
    this._setValue('text', '');
  },
  _setSelect: function(field) {
    var select = new Select(this._getElement('select'));
    if (select.contains(field))
      select.selectValue(field);
  },
  _setTitle: function() {
    var opt = getSelectedOption(this._getElement('select'));
    if (!opt) {
      this._setInner('title', new GwtMessage().getMessage('Go to'));
      return;
    }
    if (opt.value == 'zztextsearchyy')
      this._setInner('title', new GwtMessage().getMessage('Search'));
    else
      this._setInner('title', new GwtMessage().getMessage('Go to'));
  },
  type: 'GlideWidgetSearch'
});;