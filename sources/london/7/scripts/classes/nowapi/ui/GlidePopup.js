/*! RESOURCE: /scripts/classes/nowapi/ui/GlidePopup.js */
(function(exports, $, CustomEvent) {
  "use strict";
  var _focusTraps;
  var _bWindowResize;
  var _popupCursors = (function() {
    var cursor = "progress";
    var oldCursor;
    return {
      startWaiting: function(target) {
        if (target == null) return;
        oldCursor = target.style.cursor;
        target.style.cursor = cursor;
      },
      stopWaiting: function(target) {
        if (!target) return;
        target.style.cursor = oldCursor ? oldCursor : "";
      }
    };
  })();
  var _getPopupConfig = (function() {
    var DEFAULT_POPOVER_TEMPLATE =
      '<div class="popover glide-popup" role="tooltip" style="max-width:650px"><div class="arrow"></div><div class="popover-content" style="width:650px;"></div></div>';
    var DEFAULT_CONFIG = {
      trigger: "manual",
      placement: "bottom",
      html: true
    };

    function _wrapWithDefaultTemplate($markup) {
      var $wrappedMarkup = $(DEFAULT_POPOVER_TEMPLATE);
      $wrappedMarkup.children(".popover-content").append($markup);
      return $wrappedMarkup;
    }

    function _processTemplate(contentResponse, options) {
      var $markup = $(contentResponse);
      if (!$markup.hasClass("glide-popup")) {
        $markup = _wrapWithDefaultTemplate($markup);
      }
      if (options && options.width) {
        $markup
          .css({
            maxWidth: options.width
          })
          .find(".popover-content")
          .css({
            width: options.width
          });
      }
      return $markup;
    }

    function _getTemplateContentFromMarkup($markup) {
      return $markup.find(".popover-content").html() || new GwtMessage().getMessage('No Preview Available');
    }

    function _getPopoverTitle($markup) {
      return $markup.find(".small_caption").detach().text();
    }

    function _getContainer($target) {
      var dashboardContainer = $(".sn-canvas-main .grid-stack-container");
      if (dashboardContainer.length > 0) {
        return dashboardContainer;
      }
      var formContainerExists =
        $(".section_header_content_no_scroll").length > 0;
      var container = formContainerExists ?
        ".section_header_content_no_scroll" :
        "body";
      var modalContainer = $target.closest(".modal");
      if (modalContainer.length > 0) {
        container = modalContainer;
      }
      return container;
    }
    return function getPopupConfig(url, $target, options) {
      return $.post(url).then(function(contentResponse) {
        var $markup = _processTemplate(contentResponse, options);
        var container = _getContainer($target);
        var title = _getPopoverTitle($markup);
        var content = _getTemplateContentFromMarkup($markup);
        return $.extend({}, DEFAULT_CONFIG, {
          title: title,
          container: container,
          content: content,
          html: true,
          template: $markup[0].outerHTML,
          viewport: {
            selector: container,
            padding: 40
          }
        });
      });
    };
  })();

  function showPopup(evt, url, options) {
    _bWindowResize = false;
    evt.preventDefault();
    if (_shouldSkip(evt)) {
      return;
    }
    var $target = $(evt.target);
    _popupCursors.startWaiting(evt.target);
    destroypopDiv(evt);
    bindClose();
    _getPopupConfig(url, $target, options).then(function(config) {
      $target.popover(config);
      $target.popover("show");
      $target.addClass("glide-popup-target");
      _popupCursors.stopWaiting(evt.target);
      if (options && options.trapFocus === true) {
        createAndActivateFocusTrap(getActivePopup());
      }
    });
  }

  function _popupClickHandler(evt) {
    if ($(evt.target).closest(".glide-popup").length > 0) {
      return;
    }
    destroypopDiv();
  }

  function _registerClickHandler() {
    document.addEventListener('click', _popupClickHandler, true);
  }

  function _deregisterClickHandler() {
    document.removeEventListener('click', _popupClickHandler, true);
  }

  function _popupEscapeHandler(evt) {
    if (evt.keyCode != 27) {
      return;
    }
    destroypopDiv(evt);
  }

  function _registerEscape() {
    $(document).on("keyup", _popupEscapeHandler);
  }

  function _deregisterEscape() {
    $(document).off("keyup", _popupEscapeHandler);
  }

  function _popupWindowResizeHandler() {
    if (_bWindowResize)
      destroypopDiv();
    _bWindowResize = true;
  }

  function _registerWindowResize() {
    $(window).on("resize", _popupWindowResizeHandler);
  }

  function _deregisterWindowResize() {
    $(window).off("resize", _popupWindowResizeHandler);
  }

  function bindClose() {
    _registerClickHandler();
    _registerEscape();
    _registerWindowResize();
  }

  function destroypopDiv() {
    _deregisterClickHandler();
    _deregisterEscape();
    _deregisterWindowResize();
    deactivateAndDestroyFocusTrap(getActivePopup());
    $(".glide-popup-target")
      .popover("destroy")
      .removeClass("glide-popup-target");
    if (typeof CustomEvent !== "undefined") {
      CustomEvent.fire("refresh.event");
    }
  }

  function getActivePopup() {
    var elementData = $(".glide-popup-target").data("bs.popover");
    return typeof elementData !== "undefined" ?
      elementData.$tip[0] :
      undefined;
  }

  function exitPopup(evt) {
    destroypopDiv(evt);
  }

  function createAndActivateFocusTrap(popup) {
    if (!popup) {
      return;
    }
    if (!window.focusTrap || !window.WeakMap) {
      return;
    }
    _focusTraps = _focusTraps || new WeakMap();
    var focusTrap = _focusTraps.get(popup);
    if (!focusTrap) {
      focusTrap = window.focusTrap(popup, {
        clickOutsideDeactivates: true
      });
      _focusTraps.set(popup, focusTrap);
    }
    try {
      focusTrap.activate();
    } catch (e) {
      console.warn("Unable to activate focus trap", e);
    }
  }

  function deactivateAndDestroyFocusTrap(popup) {
    if (!popup) {
      return;
    }
    if (!window.focusTrap || !window.WeakMap) {
      return;
    }
    _focusTraps = _focusTraps || new WeakMap();
    var focusTrap = _focusTraps.get(popup);
    if (!focusTrap) {
      return;
    }
    try {
      focusTrap.deactivate({
        returnFocus: true
      });
    } catch (e) {
      console.warn("Unable to deactivate focus trap", e);
    }
  }

  function _shouldSkip(evt) {
    if ($(evt.target).data("bs.popover")) {
      return true;
    }
    if (evt.ctrlKey) {
      return true;
    }
    return false;
  }

  function _createOptionsObject(trapFocus, width) {
    return {
      trapFocus: !!trapFocus,
      width: width || 0
    };
  }

  function popListDiv(
    evt,
    target,
    sys_id,
    view,
    width,
    showOpenButton,
    trapFocus
  ) {
    evt.preventDefault();
    var options = _createOptionsObject(trapFocus, width);
    var useHref = evt.target && evt.target.getAttribute('data-use-href') === "true";
    var elemHref = evt.target ? evt.target.getAttribute('href') : "";
    var contentURL = new GlideURL("popup.do");
    contentURL.addParam("sysparm_sys_id", sys_id);
    contentURL.addParam("sysparm_table_name", target);
    contentURL.addParam("sysparm_field_name", "sys_id");
    contentURL.addParam("sys_popup_direct", "true");
    contentURL.addParam("sysparm_show_open_button", !!showOpenButton);
    if (view) {
      contentURL.addParam("sysparm_view", view);
    }
    if (useHref) {
      contentURL.addParam("sysparm_elem_href", elemHref);
    }
    contentURL.addParam("sysparm_glide_popup", "true");
    showPopup(evt, contentURL.getURL(), options);
  }

  function popReferenceDiv(evt, inputId, view, form, refKey, trapFocus) {
    evt.preventDefault();
    var options = _createOptionsObject(trapFocus);
    var safeInputID = inputId || ".";
    var safeInput = document.getElementById(safeInputID) || "";
    var firstDotIndex = safeInputID.indexOf(".");
    var sys_id = safeInput.value;
    var fieldName = safeInputID.slice(firstDotIndex + 1);
    var table = safeInputID.slice(0, firstDotIndex);
    var displayInput = gel("sys_display." + safeInputID);
    var newWindow = $(evt.target).attr('data-new-window') === "true";
    if (displayInput) {
      var targetForm = displayInput.getAttribute('data-table');
    }
    if (evt.metaKey && targetForm) {
      window.open(targetForm + ".do?sys_id=" + sys_id + "&sysparm_view=" + view);
      return;
    }
    var contentURL = new GlideURL("popup.do");
    contentURL.addParam("sysparm_sys_id", sys_id);
    contentURL.addParam("sysparm_table_name", table);
    contentURL.addParam("sysparm_field_name", fieldName);
    contentURL.addParam("sysparm_view", view);
    contentURL.addParam("sysparm_show_open_button", "true");
    if (form) {
      contentURL.addParam("sysparm_form", form);
    }
    if (refKey) {
      contentURL.addParam("sysparm_refkey", refKey);
    }
    contentURL.addParam("sysparm_glide_popup", "true");
    contentURL.addParam("sysparm_new_window", newWindow);
    showPopup(evt, contentURL.getURL(), options);
  }

  function popForm(evt, target, sys_id, view, width) {
    evt.preventDefault();
    var options = _createOptionsObject(false, width);
    var contentURL = new GlideURL("popup.do");
    contentURL.addParam("sysparm_sys_id", sys_id);
    contentURL.addParam("sysparm_table_name", target);
    contentURL.addParam("sysparm_field_name", "sys_id");
    contentURL.addParam("sys_popup_direct", "true");
    contentURL.addParam("sysparm_show_open_button", "true");
    if (view) {
      contentURL.addParam("sysparm_view", view);
    }
    contentURL.addParam("sysparm_glide_popup", "true");
    showPopup(evt, contentURL.getURL(), options);
  }

  function popDiv(evt, sys_id) {
    evt.preventDefault();
    var contentURL = new GlideURL("service_catalog.do");
    contentURL.addParam("sysparm_action", "popup");
    contentURL.addParam("sysparm_sys_id", sys_id);
    contentURL.addParam("sysparm_glide_popup", "true");
    showPopup(evt, contentURL.getURL());
  }

  function popCatDiv(evt, sys_id) {
    evt.preventDefault();
    var contentURL = new GlideURL("service_catalog.do");
    contentURL.addParam("sysparm_action", "popupCat");
    contentURL.addParam("sysparm_sys_id", sys_id);
    contentURL.addParam("sysparm_glide_popup", "true");
    showPopup(evt, contentURL.getURL());
  }

  function popKnowledgeDiv(evt, sys_id) {
    evt.preventDefault();
    var contentURL = new GlideURL("kb_preview.do");
    contentURL.addParam("sys_kb_id", sys_id);
    contentURL.addParam("sysparm_nostack", "true");
    contentURL.addParam("sysparm_glide_popup", "true");
    showPopup(evt, contentURL.getURL());
  }

  function popRecordDiv(evt, table, sys_id, view, width) {
    evt.preventDefault();
    var options = _createOptionsObject(true, width);
    var contentURL = new GlideURL("popup.do");
    var newWindow = $(evt.target).attr('data-new-window') === "true";
    contentURL.addParam("sysparm_sys_id", sys_id);
    contentURL.addParam("sysparm_table_name", table);
    contentURL.addParam("sysparm_field_name", "sys_id");
    contentURL.addParam("sys_popup_direct", "true");
    contentURL.addParam("sysparm_show_open_button", "true");
    if (view) {
      contentURL.addParam("sysparm_view", view);
    }
    contentURL.addParam("sysparm_glide_popup", "true");
    contentURL.addParam("sysparm_new_window", newWindow);
    showPopup(evt, contentURL.getURL(), options);
  }

  function popLightWeightReferenceDiv(evt, inputid, hideOpenButton) {
    evt.preventDefault();
    var table;
    var sys_id;
    var tableElem = document.getElementById(inputid + "TABLE");
    if (tableElem) {
      table = tableElem.value;
    }
    var sysIdElem = document.getElementById(inputid);
    if (sysIdElem) {
      sys_id = sysIdElem.value;
    }
    var options = _createOptionsObject(true);
    var contentURL = new GlideURL("popup.do");
    var newWindow = $(evt.target).attr('data-new-window') === "true";
    contentURL.addParam("sysparm_sys_id", sys_id);
    contentURL.addParam("sysparm_table_name", table);
    contentURL.addParam("sysparm_field_name", "sys_id");
    contentURL.addParam("sysparm_view", null);
    contentURL.addParam("sysparm_popup_direct", "true");
    contentURL.addParam("sysparm_glide_popup", "true");
    if (!!hideOpenButton)
      contentURL.addParam("sysparm_show_open_button", "false");
    else
      contentURL.addParam("sysparm_show_open_button", "true");
    contentURL.addParam("sysparm_new_window", newWindow);
    showPopup(evt, contentURL.getURL(), options);
  }

  function popIssueDiv(evt, issues) {
    evt.preventDefault();
    var contentURL = new GlideURL("issuespopup.do");
    contentURL.addParam("sysparm_issues", issues);
    contentURL.addParam("sysparm_glide_popup", "true");
    showPopup(evt, contentURL.getURL());
  }

  function popReportInfoDiv(evt, sys_id) {
    evt.preventDefault();
    var contentURL = new GlideURL("popup.do");
    contentURL.addParam("sysparm_sys_id", sys_id);
    contentURL.addParam("sysparm_table_name", "sys_report");
    contentURL.addParam("sysparm_field_name", "user");
    contentURL.addParam("sysparm_popup_direct", "true");
    contentURL.addParam("sysparm_glide_popup", "true");
    showPopup(evt, contentURL.getURL());
  }

  function popHistoryDiv(evt, table, sys_id, checkpoint, internalCP) {
    evt.preventDefault();
    var contentURL = new GlideURL("historypopup.do");
    contentURL.addParam("sysparm_table_name", table);
    contentURL.addParam("sysparm_sys_id", sys_id);
    contentURL.addParam("checkpoint", checkpoint);
    contentURL.addParam("internalCP", internalCP);
    contentURL.addParam("sysparm_glide_popup", "true");
    showPopup(evt, contentURL.getURL());
  }
  exports.nowapi = exports.nowapi || {};
  exports.nowapi.g_popup_manager = {
    POPUP_PREFIX: "popup_",
    showPopup: showPopup,
    bindClose: bindClose,
    destroypopDiv: destroypopDiv,
    createAndActivateFocusTrap: createAndActivateFocusTrap,
    deactivateAndDestroyFocusTrap: deactivateAndDestroyFocusTrap,
    exitPopup: exitPopup,
    getActivePopup: getActivePopup,
    popListDiv: popListDiv,
    popReferenceDiv: popReferenceDiv,
    popForm: popForm,
    popDiv: popDiv,
    popCatDiv: popCatDiv,
    popKnowledgeDiv: popKnowledgeDiv,
    popRecordDiv: popRecordDiv,
    popLightWeightReferenceDiv: popLightWeightReferenceDiv,
    popIssueDiv: popIssueDiv,
    popReportInfoDiv: popReportInfoDiv,
    popHistoryDiv: popHistoryDiv,
    type: "GlidePopup"
  };
})(window, jQuery, CustomEvent);;