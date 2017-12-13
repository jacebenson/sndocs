/*! RESOURCE: /scripts/doctype/PageTiming14.js */
NOW.PageTiming = function($) {
  "use strict";
  var categories = null;
  var self;
  initialize();

  function initialize() {
    CustomEvent.observe('page_timing', _pageTiming);
    CustomEvent.observe('page_timing_network', _pageTimingNetwork);
    CustomEvent.observe('page_timing_show', _pageTimingShow);
    CustomEvent.observe('page_timing_clear', _clearTimingDiv);
    CustomEvent.observe('page_timing_client', _clientTransaction);
  };

  function _pageTiming(timing) {
    var ms;
    if (timing.startTime)
      ms = new Date() - timing.startTime;
    else
      ms = timing.ms;
    if (isNaN(ms))
      return;
    _initCategories();
    var category = timing.name + '';
    ms = new Number(ms);
    if (!categories[category]) {
      categories[category] = {
        children: [],
        ms: 0
      }
    }
    var cat = categories[category];
    if (timing.child)
      cat.children.push({
        name: timing.child + '',
        ms: ms
      });
    cat.ms += ms;
  };

  function _pageTimingNetwork(timing) {
    if (!window._timingStartTime)
      timing.ms = 0;
    else if (window.performance)
      timing.ms = window.performance.timing.requestStart - window.performance.timing.navigationStart;
    else
      timing.ms = Math.max(0, timing.loadTime - window._timingStartTime - _getTiming('SERV'));
    if (isNaN(timing.ms))
      timing.ms = 0;
    _pageTiming(timing);
  };

  function _pageTimingShow(info) {
    if (!window._timingStartTime)
      return;
    _setRlCatName();
    var tot;
    if (window.performance)
      tot = (window.performance.timing.loadEventEnd - window.performance.timing.navigationStart);
    else
      tot = new Date().getTime() - window._timingStartTime;
    if (tot > 900000) {
      _clearTimingDiv(info);
      return;
    }
    window._timingTotal = tot;
    var div = _getOrCreateTimingDiv();
    var o = {
      RESP: tot
    };
    for (var c in categories)
      o[c] = _getTiming(c) + '';
    var txt = new XMLTemplate('glide:page_timing_div').evaluate(o);
    div.innerHTML = txt + '';
    if (tot > 0) {
      var timingGraph = $j('.timing_graph');
      timingGraph.find('.timing_network').width(Math.round((_getTiming('NETW') / tot) * 100) + '%');
      timingGraph.find('.timing_server').width(Math.round((_getTiming('SERV') / tot) * 100) + '%');
      timingGraph.find('.timing_browser').width(Math.round((_getTiming('REND') / tot) * 100) + '%');
      if (window.performance) {
        timingGraph.one('click', function() {
          var timingBreakdown = $j('<table class="timing_breakdown">');
          var events = [
            ['timing_network', 'Cache/DNS/TCP', 'fetchStart', 'connectEnd'],
            ['timing_server', 'Server', 'requestStart', 'responseEnd'],
            ['timing_browser', 'Unload', 'unloadEventStart', 'unloadEventEnd'],
            ['timing_browser', 'DOM Processing', 'domLoading', 'domComplete'],
            ['timing_browser', 'onLoad', 'loadEventStart', 'loadEventEnd']
          ];
          for (var i = 0; i < events.length; i++) {
            var runTime = window.performance.timing[events[i][3]] - window.performance.timing[events[i][2]];
            var startTime = (window.performance.timing[events[i][2]] - window.performance.timing.navigationStart) + '-' + (window.performance.timing[events[i][3]] - window.performance.timing.navigationStart);
            timingBreakdown.append($j('<tr><td class="' + events[i][0] + '"></td><td>' + events[i][1] + '</td><td>' + startTime + 'ms</td><td>' + runTime + 'ms</td></tr>'));
          }
          timingBreakdown.insertAfter(this);
        });
      }
    }
    var img = div.down('img');
    if (!img)
      img = div.down('i');
    if (!img)
      return;
    img.observe('click', toggle.bindAsEventListener(this));
    if (info.show == 'true')
      _toggle(img);
    var a = div.down('a');
    a.observe('click', toggleDetails);
    a.next().down().down().next().observe('click', toggleDetails);
  }

  function toggle(evt) {
    var img = Event.element(evt);
    var isVisible = _toggle(img);
    _setPreference(isVisible);
  }

  function _toggle(img) {
    var span = img.up('div').down('span');
    if (!span)
      return false;
    span.toggle();
    return span.visible();
  }

  function _setPreference(flag) {
    try {
      setPreference('glide.ui.response_time', flag + '');
    } catch (e) {
      return;
    }
  }

  function toggleDetails() {
    var span = gel('page_timing_details');
    var state = span.getAttribute('data-state');
    if (state === 'shown') {
      span.setAttribute('data-state', 'hidden');
      span.hide();
      return false;
    }
    if (state === 'hidden') {
      span.setAttribute('data-state', 'shown');
      span.show();
      return;
    }
    span.innerHTML = _buildDetails();
    span.setAttribute('data-state', 'shown');
    span.on('click', 'div.timing_detail_line', function(evt, element) {
      if (element.getAttribute('data-children') === '0')
        return;
      var div = element.down('div');
      if (div)
        div.toggle();
    });
  }

  function _buildDetails() {
    var txt = '';
    var o;
    var other = _getTiming('REND');
    var detailLine = new XMLTemplate('glide:page_timing_detail_line');
    CATEGORIES.forEach(function(cat) {
      if (!categories[cat.category])
        return;
      var ms = _getTiming(cat.category) + '';
      if ('RLV2' !== cat.category)
        other -= ms;
      var children = categories[cat.category].children;
      o = {
        name: cat.name,
        ms: ms,
        child_count: (children.length + ''),
        children: '',
        has_children: ''
      };
      if (children.length > 0) {
        o.children = _buildChildren(children);
        o.has_children = 'timing_detail_line_has_children';
      }
      txt += detailLine.evaluate(o);
    })
    if (other > 10)
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
  }

  function _buildChildren(children) {
    var txt = '<div style="display:none; cursor:default">';
    var detailChild = new XMLTemplate('glide:page_timing_child_line');
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      var o = {
        name: child.name,
        ms: (child.ms + '')
      };
      txt += detailChild.evaluate(o);
    }
    txt += '</div>';
    return txt;
  }

  function _initCategories() {
    if (categories)
      return;
    categories = {};
    var startTime = 0;
    if (window.performance)
      startTime = window.performance.timing.navigationStart;
    else
      startTime = parseInt(new CookieJar().get('g_startTime'), 10);
    window._timingStartTime = startTime;
  }

  function _getTiming(category) {
    if (!categories[category])
      return 0;
    return Math.max(0, categories[category].ms);
  }

  function _setRlCatName() {
    var isDeferred = window.g_related_list_timing != 'default';
    var postFix = (isDeferred === true) ? ' (async)' : ' (sync)';
    for (var i = 0; i < CATEGORIES.length; i++) {
      if ((CATEGORIES[i].category === 'RLV2') && (!hasPostFix(CATEGORIES[i].name)))
        CATEGORIES[i].name = CATEGORIES[i].name + postFix;
    }

    function hasPostFix(cat_name) {
      var cat_name_split = cat_name.split(' ');
      var len = cat_name_split.length;
      if ((cat_name_split[len - 1] === '(async)') || (cat_name_split[len - 1] === '(sync)'))
        return true;
      return false;
    }
  }

  function _clearTimingDiv() {
    window._timingTotal = -1;
    var div = gel('page_timing_div');
    if (div) {
      div.innerHTML = '';
      div.style.visibility = 'hidden';
    }
  }

  function _getOrCreateTimingDiv() {
    var div = gel('page_timing_div');
    if (!div) {
      div = cel('div');
      div.id = 'page_timing_div';
      div.className = 'timingDiv';
      document.body.appendChild(div);
    }
    div.style.visibility = '';
    return div;
  }

  function _clientTransaction(o) {
    if (!window._timingStartTime || !window._timingTotal || window._timingTotal <= 0 || getActiveUser() === false || getTopWindow().loggingOut === true)
      return;
    var det = [];
    for (var i = 0; i < CATEGORIES.length; i++) {
      var cat = CATEGORIES[i];
      if (!o.types[cat.category])
        continue;
      if (!categories[cat.category])
        continue;
      var children = categories[cat.category].children;
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
    ajax.setScope("global");
    ajax.addParam('transaction_id', o.transaction_id);
    ajax.addParam('table_name', o.table_name);
    ajax.addParam('form_name', o.form_name);
    ajax.addParam('view_id', o.view_id);
    ajax.addParam('transaction_time', window._timingTotal);
    ajax.addParam('server_time', _getTiming('SERV'));
    ajax.addParam('network_time', _getTiming('NETW'));
    ajax.addParam('browser_time', _getTiming('REND'));
    ajax.addParam('cs_time', (_getTiming('CSOL') + _getTiming('CSOC')) + '');
    ajax.addParam('policy_time', _getTiming('UIOL') + '');
    ajax.addParam('view_id', o.view_id);
    ajax.addParam('client_details', Object.toJSON(det));
    ajax.getXML();
  }
  var CATEGORIES = [{
      category: 'SCPT',
      name: 'Script Load/Parse'
    },
    {
      category: 'PARS',
      name: 'CSS and JS Parse'
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
      category: 'PROC',
      name: 'Browser processing before onload'
    },
    {
      category: 'DOMC',
      name: 'DOMContentLoaded to LoadEventEnd'
    },
    {
      category: 'LOADF',
      name: 'addLoadEvent functions'
    },
    {
      category: 'RLV2',
      name: 'Related Lists'
    }
  ]
}
document.observe('dom:loaded', function() {
  NOW.PageTiming(jQuery);
});