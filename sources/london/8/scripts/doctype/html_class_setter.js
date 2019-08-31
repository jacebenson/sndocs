/*! RESOURCE: /scripts/doctype/html_class_setter.js */
(function() {
  if (window.NOW.htmlClassSetterInitialized)
    return;
  window.NOW.htmlClassSetterInitialized = true;
  var df = window.NOW.dateFormat;
  var shortDateFormat = window.NOW.shortDateFormat;
  var $h = $j('HTML');
  $j(function() {
    if (!df)
      return;
    CustomEvent.observe('timeago_set', function(timeAgo) {
      df.timeAgo = timeAgo;
      df.dateBoth = false;
      setDateClass();
    });
    CustomEvent.observe('shortdates_set', function(trueFalse) {
      shortDateFormat = trueFalse;
      setDateClass();
    });
    CustomEvent.observe('date_both', function(trueFalse) {
      df.dateBoth = trueFalse;
      df.timeAgo = false;
      setDateClass();
    })
  });

  function setDateClass() {
    $h.removeClass('date-timeago');
    $h.removeClass('date-calendar');
    $h.removeClass('date-calendar-short');
    $h.removeClass('date-both');
    if (df.dateBoth) {
      $h.addClass('date-both');
      if (shortDateFormat)
        $h.addClass('date-calendar-short');
      else
        $h.addClass('date-calendar');
    } else if (df.timeAgo)
      $h.addClass('date-timeago');
    else {
      if (shortDateFormat)
        $h.addClass('date-calendar-short');
      else
        $h.addClass('date-calendar');
    }
  }
  setDateClass();
  var toggleTemplate = function(trueFalse) {
    var bool = (typeof trueFalse !== "undefined") ? trueFalse : !window.NOW.templateToggle;
    window.NOW.templateToggle = bool;
    setPreference('glide.ui.templateToggle', bool);
    setTemplateToggle();
    if (CustomEvent.events.templateToggle.length > 1)
      CustomEvent.un('templateToggle', toggleTemplate);
  };
  CustomEvent.observe('templateToggle', toggleTemplate);
  CustomEvent.observe('compact', function(trueFalse) {
    window.NOW.compact = trueFalse;
    setCompact();
  });
  CustomEvent.observe('cc_listv3_tablerow_striped', function(bool) {
    if (bool) {
      $j('.table-container table.list-grid').addClass('table-striped');
    } else {
      $j('.table-container table.list-grid').removeClass('table-striped');
    }
  });

  function setTemplateToggle() {
    var toggleBtn = $j('#template-toggle-button'),
      ariaLiveEl = $j('#template-bar-aria-live');
    var ariaLiveMsg = '';
    if (window.NOW.templateToggle) {
      $h.addClass('templates');
      toggleBtn.attr('aria-expanded', 'true');
      ariaLiveMsg = getMessage('Added Template bar landmark to bottom of form.');
    } else {
      $h.removeClass('templates');
      toggleBtn.removeAttr('aria-expanded');
      ariaLiveMsg = getMessage('Removed Template bar landmark from bottom of form.');
    }
    ariaLiveEl.text(ariaLiveMsg);
  }
  CustomEvent.observe('form.loaded', setTemplateToggle);

  function setCompact() {
    try {
      var modalDiv = window.top.document.getElementById("settings_modal");
    } catch (e) {}
    if (modalDiv)
      modalDiv = modalDiv.childNodes[0];
    var $pH;
    if (parent.$j)
      $pH = parent.$j('HTML');
    if (window.NOW.compact) {
      $h.addClass('compact');
      if ($pH)
        $pH.addClass('compact');
      if (modalDiv && modalDiv.className.indexOf(' compact') == -1)
        modalDiv.className += ' compact';
    } else {
      $h.removeClass('compact');
      if ($pH)
        $pH.removeClass('compact');
      if (modalDiv && modalDiv.className.indexOf(' compact') > -1)
        modalDiv.className = modalDiv.className.replace(" compact", "");
    }
  }
  setCompact();
  CustomEvent.observe('tabbed', function(trueFalse) {
    window.NOW.tabbed = trueFalse;
    setTabbed();
  });

  function setTabbed() {
    if (window.NOW.tabbed)
      $h.addClass('tabbed');
    else
      $h.removeClass('tabbed');
  }
  setTabbed();

  function setListTableWrap() {
    if (window.NOW.listTableWrap)
      $j('HTML').removeClass('list-nowrap-whitespace');
    else
      $j('HTML').addClass('list-nowrap-whitespace');
  }
  setListTableWrap();
  CustomEvent.observe('table_wrap', function(trueFalse) {
    window.NOW.listTableWrap = trueFalse;
    setListTableWrap();
    CustomEvent.fire('calculate_fixed_headers');
  });
})();

function printList(maxRows) {
  var mainWin = getMainWindow();
  if (mainWin && mainWin.CustomEvent && mainWin.CustomEvent.fire && mainWin.CustomEvent.fire("print", maxRows) === false)
    return false;
  var veryLargeNumber = "999999999";
  var print = true;
  var features = "resizable=yes,scrollbars=yes,status=yes,toolbar=no,menubar=yes,location=no";
  if (isChrome && isMacintosh)
    features = "";
  var href = "";
  var frame = top.gsft_main;
  if (!frame)
    frame = top;
  if (frame.document.getElementById("printURL") != null) {
    href = frame.document.getElementById("printURL").value;
    href = printListURLDecode(href);
  }
  if (!href) {
    if (frame.document.getElementById("sysparm_total_rows") != null) {
      var mRows = parseInt(maxRows);
      if (mRows < 1)
        mRows = 5000;
      var totalrows = frame.document.getElementById("sysparm_total_rows").value;
      if (parseInt(totalrows) > parseInt(mRows))
        print = confirm(getMessage("Printing large lists may affect system performance. Continue?"));
    }
    var formTest;
    var f = 0;
    var form = frame.document.forms['sys_personalize'];
    if (form && form.sysparm_referring_url) {
      href = form.sysparm_referring_url.value;
      if (href.indexOf("?sys_id=-1") != -1 && !href.startsWith('sys_report_template')) {
        alert(getMessage("Please save the current form before printing."));
        return false;
      }
      if (isMSIE) {
        var isFormPage = frame.document.getElementById("isFormPage");
        if (isFormPage != null && isFormPage.value == "true")
          href = href.replace(/javascript%3A/gi, "_javascript_%3A");
      }
      href = printListURLDecode(href);
    } else
      href = document.getElementById("gsft_main").contentWindow.location.href;
  }
  if (href.indexOf("?") < 0)
    href += "?";
  else
    href += "&";
  href = href.replace("partial_page=", "syshint_unimportant=");
  href = href.replace("sysparm_media=", "syshint_unimportant=");
  href += "sysparm_stack=no&sysparm_force_row_count=" + veryLargeNumber + "&sysparm_media=print";
  if (print) {
    if (href != null && href != "") {
      win = window.open(href, "Printer_friendly_format", features);
      win.focus();
    } else {
      alert("Nothing to print");
    }
  }

  function printListURLDecode(href) {
    href = href.replace(/@99@/g, "&");
    href = href.replace(/@88@/g, "@99@");
    href = href.replace(/@77@/g, "@88@");
    href = href.replace(/@66@/g, "@77@");
    return href;
  }
}

function clearCacheSniperly() {
  var aj = new GlideAjax("GlideSystemAjax");
  aj.addParam("sysparm_name", "cacheFlush");
  aj.getXML(clearCacheDone);
}

function clearCacheDone() {
  window.status = "Cache flushed";
};