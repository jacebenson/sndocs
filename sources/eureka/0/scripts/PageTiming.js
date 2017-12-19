var PageTiming = Class.create({
  initialize: function() {
    CustomEvent.observe('page_timing', this._pageTiming.bind(this));
    CustomEvent.observe('page_timing_network', this._pageTimingNetwork.bind(this));
    CustomEvent.observe('page_timing_show', this._pageTimingShow.bind(this));
    CustomEvent.observe('page_timing_clear', this._clearTimingDiv.bind(this));
    CustomEvent.observe('page_timing_client', this._clientTransaction.bind(this));
  },
  _pageTiming: function(timing) {
    var ms;
    if (typeof timing.startTime !== 'undefined')
      ms = new Date() - timing.startTime;
    else
      ms = timing.ms;
    if (isNaN(ms))
      return;
    this._initCategories();
    var category = timing.name + '';
    var child = timing.child + '';
    ms = new Number(ms);
    if (!window._timingCategories[category]) {
      window._timingCategories[category] = {
        children: [],
        ms: 0
      };
    }
    var cat = window._timingCategories[category];
    if (child)
      cat.children.push({
        name: child,
        ms: ms
      });
    cat.ms += ms;
  },
  _pageTimingNetwork: function(timing) {
    if (!window._timingStartTime)
      timing.ms = 0;
    else
      timing.ms = Math.max(0, timing.loadTime - window._timingStartTime - this._getTiming('SERV'));
    if (isNaN(timing.ms))
      timing.ms = 0;
    this._pageTiming(timing);
  },
  _pageTimingShow: function(info) {
    if (!window._timingStartTime)
      return;
    var tot = new Date().getTime() - window._timingStartTime;
    if (tot > 900000) {
      this._clearTimingDiv(info);
      return;
    }
    window._timingTotal = tot;
    var div = this._getOrCreateTimingDiv();
    div = $(div);
    var o = {
      RESP: tot
    };
    for (var c in window._timingCategories)
      o[c] = this._getTiming(c) + '';
    var txt = new XMLTemplate('glide:page_timing_div').evaluate(o);
    div.innerHTML = txt + '';
    var img = div.down('img');
    if (!img)
      return;
    img.observe('click', this.toggle.bindAsEventListener(this));
    if (info.show == 'true')
      this._toggle(img);
    var a = div.down('a');
    a.observe('click', this.toggleDetails.bind(this));
    a.next().down().down().next().observe('click', this.toggleDetails.bind(this));
  },
  toggle: function(evt) {
    var img = Event.element(evt);
    var isVisible = this._toggle(img);
    this._setPreference(isVisible);
  },
  _toggle: function(img) {
    var span = $(img).up('div').down('span');
    if (!span)
      return false;
    span.toggle();
    return span.visible();
  },
  _setPreference: function(flag) {
    try {
      setPreference('glide.ui.response_time', flag + '');
    } catch (e) {
      return;
    }
  },
  toggleDetails: function() {
    var span = $('page_timing_details');
    var state = span.getAttribute('data-state');
    if (state === 'shown') {
      span.setAttribute('data-state', 'hidden');
      span.hide();
      return;
    }
    if (state === 'hidden') {
      span.setAttribute('data-state', 'shown');
      span.show();
      return;
    }
    span.innerHTML = this._buildDetails();
    span.setAttribute('data-state', 'shown');
    span.on('click', 'div.timing_detail_line', function(evt, element) {
      if (element.getAttribute('data-children') === '0')
        return;
      var div = element.down('div');
      if (div)
        div.toggle();
    });
  },
  _buildDetails: function() {
    var txt = '';
    var o;
    var other = this._getTiming('REND');
    var detailLine = new XMLTemplate('glide:page_timing_detail_line');
    for (var i = 0; i < PageTiming.CATEGORIES.length; i++) {
      var cat = PageTiming.CATEGORIES[i];
      if (!window._timingCategories[cat.category])
        continue;
      var ms = this._getTiming(cat.category) + '';
      other -= ms;
      var children = window._timingCategories[cat.category].children;
      o = {
        name: cat.name,
        ms: ms,
        child_count: (children.length + ''),
        children: '',
        has_children: ''
      };
      if (children.length > 0) {
        o.children = this._buildChildren(children);
        o.has_children = 'timing_detail_line_has_children';
      }
      txt += detailLine.evaluate(o);
    }
    txt += detailLine.evaluate({
      name: 'Other',
      ms: other,
      child_count: 0,
      has_children: ''
    });
    o = {
      details: txt
    };
    return new XMLTemplate('glide:page_timing_details').evaluate(o);
  },
  _buildChildren: function(children) {
    var txt = '<div style="display:none; cursor:default">';
    var detailChild = new XMLTemplate('glide:page_timing_child_line');
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      o = {
        name: child.name,
        ms: (child.ms + '')
      };
      txt += detailChild.evaluate(o);
    }
    txt += '</div>';
    return txt;
  },
  _initCategories: function() {
    if (window._timingCategories)
      return;
    window._timingCategories = {};
    var startTime = 0;
    try {
      startTime = window.parent['g_startTime'];
    } catch (e) {}
    window._timingStartTime = new Number(startTime);
  },
  _getTiming: function(category) {
    if (!window._timingCategories[category])
      return 0;
    return Math.max(0, window._timingCategories[category].ms);
  },
  _clearTimingDiv: function() {
    window._timingTotal = -1;
    var div = gel('page_timing_div');
    if (div) {
      div.innerHTML = '';
      div.style.visibility = 'hidden';
    }
  },
  _getTimingDiv: function() {
    return gel('page_timing_div');
  },
  _getOrCreateTimingDiv: function() {
    var div = this._getTimingDiv();
    if (!div) {
      div = document.createElement('div');
      div.id = 'page_timing_div';
      div.className = 'timingDiv';
      document.body.appendChild(div);
    }
    div.style.visibility = 'visible';
    return div;
  },
  _clientTransaction: function(o) {
    if (!window._timingStartTime || !window._timingTotal || window._timingTotal <= 0 || getActiveUser() === false || getTopWindow().loggingOut === true)
      return;
    var det = [];
    for (var i = 0; i < PageTiming.CATEGORIES.length; i++) {
      var cat = PageTiming.CATEGORIES[i];
      if (!o.types[cat.category])
        continue;
      if (!window._timingCategories[cat.category])
        continue;
      var children = window._timingCategories[cat.category].children;
      if (!children)
        continue;
      for (var ndx = 0; ndx < children.length; ndx++) {
        var child = children[ndx];
        var t = {};
        t.type_code = cat.category;
        t.type = cat.name;
        t.name = child.name;
        t.duration = child.ms;
        det.push(t);
      }
    }
    var ajax = new GlideAjax('AJAXClientTiming');
    ajax.addParam('transaction_id', o.transaction_id);
    ajax.addParam('table_name', o.table_name);
    ajax.addParam('form_name', o.form_name);
    ajax.addParam('view_id', o.view_id);
    ajax.addParam('transaction_time', window._timingTotal);
    ajax.addParam('server_time', this._getTiming('SERV'));
    ajax.addParam('network_time', this._getTiming('NETW'));
    ajax.addParam('browser_time', this._getTiming('REND'));
    ajax.addParam('cs_time', (this._getTiming('CSOL') + this._getTiming('CSOC')) + '');
    ajax.addParam('policy_time', this._getTiming('UIOL') + '');
    ajax.addParam('view_id', o.view_id);
    ajax.addParam('client_details', Object.toJSON(det));
    ajax.getXML();
  },
  toString: function() {
    return 'PageTiming';
  }
});
if (!window.g_PageTiming)
  window.g_PageTiming = new PageTiming();
PageTiming.get = function() {
  return window.g_PageTiming;
};
PageTiming.CATEGORIES = [{
    category: 'SCPT',
    name: 'Script Load/Parse'
  },
  {
    category: 'SECT',
    name: 'Form Sections'
  },
  {
    category: 'UIOL',
    name: 'UI Policy - On Load'
  },
  {
    category: 'CSOL',
    name: 'Client Scripts - On Load'
  },
  {
    category: 'CSOC',
    name: 'Client Scripts - On Change (initial load)'
  },
  {
    category: 'RLV2',
    name: 'Related Lists'
  }
];