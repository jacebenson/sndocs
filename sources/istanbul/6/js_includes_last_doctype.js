/*! RESOURCE: /scripts/doctype/js_includes_last_doctype.js */
/*! RESOURCE: /scripts/functions_showloading.js */
function showLoadingDialog(callbackFn) {
  var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
  window.loadingDialog = new dialogClass("dialog_loading", true, 300);
  window.loadingDialog.setPreference('table', 'loading');
  window.loadingDialog._isLoadingDialogRendered = false;
  window.loadingDialog.on('bodyrendered', function() {
    window.loadingDialog._isLoadingDialogRendered = true;
  });
  if (callbackFn)
    window.loadingDialog.on('bodyrendered', callbackFn);
  window.loadingDialog.render();
}

function hideLoadingDialog() {
  if (!window.loadingDialog) {
    jslog('hideLoadingDialog called with no loading dialog on the page')
    return;
  }
  if (!window.loadingDialog._isLoadingDialogRendered) {
    window.loadingDialog.on('bodyrendered', function() {
      window.loadingDialog.destroy();
    });
    return;
  }
  window.loadingDialog.destroy();
};
/*! RESOURCE: /scripts/doctype/event_initialize.js */
$(document.body);
addAfterPageLoadedEvent(function() {
  document.on('keypress', 'input[data-type="ac_reference_input"]', function(evt, element) {
    acPopulate(element);
    acReferenceKeyPress(element, evt);
  });
  document.on('keydown', 'input[data-type="ac_reference_input"]', function(evt, element) {
    acPopulate(element);
    acReferenceKeyDown(element, evt);
  });
  document.on('keyup', 'input[data-type="ac_reference_input"]', function(evt, element) {
    acPopulate(element);
    acReferenceKeyUp(element, evt);
  });
  document.on('paste', 'input[data-type="ac_reference_input"]', function(evt, element) {
    setTimeout(function() {
      acPopulate(element);
      acReferenceKeyPress(element, evt);
    }, 0);
  });

  function acPopulate(element) {
    if (!element) {
      return;
    }
    var answer = element.ac;
    if (answer)
      return answer;
    var c = element.getAttribute('data-completer');
    var ref = element.getAttribute('data-ref');
    var d = element.getAttribute('data-dependent');
    var rq = element.getAttribute('data-ref-qual');
    new window[c](element, ref, d, rq);
  }
  document.body.on('click', 'a[data-type="ac_reference_input"]', function(evt, element) {
    var name = element.getAttribute('data-for');
    var target = $(name);
    if (!target) {
      return;
    }
    acPopulate(target);
    mousePositionSave(evt);
    var ref = target.getAttribute('data-ref');
    var d = target.getAttribute('data-dependent');
    var rq = target.getAttribute('data-ref-qual');
    var n = target.getAttribute('data-name');
    var table = target.getAttribute('data-table');
    reflistOpen(ref, n, table, d, 'false', rq);
  });
  window.addEventListener('focus', function(evt, element) {
    if (window.popupClose)
      popupClose();
  });
  document.body.on('click', 'a[data-type="reference_popup"]', function(evt, element) {
    var table = element.getAttribute('data-table');
    var form = element.getAttribute('data-form');
    var ref = element.getAttribute('data-ref');
    var refKey = element.getAttribute('data-ref-key');
    checkSave(table, form, ref, refKey);
  });
  document.on('mouseover', 'a[data-type="reference_popup"], a[data-type="reference_hover"]', function(evt, element) {
    var ref = element.getAttribute('data-ref');
    var view = element.getAttribute('data-view');
    var refKey = element.getAttribute('data-ref-key');
    popReferenceDiv(evt, ref, view, null, refKey);
  });
  document.on('mouseout', 'a[data-type="reference_popup"], a[data-type="reference_hover"]', function(evt, element) {
    lockPopup(evt);
  });
  document.body.on('click', 'a[data-type="reference_hover"]', function(evt, element) {
    alert(getMessage("Reference field click-through not available when updating multiple records"));
  });
  document.body.on('click', 'img[data-type="section_toggle"], span[data-type="section_toggle"]', function(evt, element) {
    var id = element.getAttribute("data-id");
    var prefix = element.getAttribute("data-image-prefix");
    var first = element.getAttribute("data-first");
    toggleSectionDisplay(id, prefix, first);
  });
  document.body.on('click', '[data-type="glide_list_unlock"]', function(evt, element) {
    var ref = element.getAttribute("data-ref");
    unlock(element, ref, ref + "_edit", ref + "_nonedit");
    toggleGlideListIcons(ref, false);
    var spaceElement = $('make_spacing_ok_' + ref);
    if (spaceElement)
      spaceElement.style.display = 'none';
    toggleAddMe(ref);
    evt.stop();
  });
  document.body.on('click', '[data-type="user_roles_unlock"]', function(evt, element) {
    var ref = element.getAttribute("data-ref");
    var title = element.getAttribute("data-title");
    var modal = new GlideModal(ref + "_edit_modal", false);
    modal.setTitle(title);
    modal.on('bodyrendered', function() {
      gel(ref + 'select_0').focus();
    });
    var $content = $j(gel(ref + "_edit")).show();
    modal.renderWithContent($content);
    modal.on('beforeclose', function() {
      lock(element, ref, ref + '_edit', ref + '_nonedit', ref + 'select_1', ref + '_nonedit');
      $j(element).append($content);
    });
    evt.stop();
  });
  document.body.on('click', '[data-type="user_roles_lock"]', function(evt, element) {
    var ref = element.getAttribute("data-ref");
    $j(gel(ref + "_edit_modal")).data('gWindow').destroy();
    evt.stop();
  });
  document.body.on('click', '[data-type="glide_list_remove"]', function(evt, element) {
    var ref = element.getAttribute("data-ref");
    simpleRemoveOption($('select_0' + ref));
    toggleGlideListIcons(ref);
    evt.stop();
  });
  document.body.on('click', '[data-type="glide_list_lock"]', function(evt, element) {
    var ref = element.getAttribute("data-ref");
    lock(element, ref, ref + "_edit", ref + "_nonedit", "select_0" + ref, ref + "_nonedit");
    var spaceElement = $('make_spacing_ok_' + ref);
    if (spaceElement)
      spaceElement.style.display = 'inline';
    toggleAddMe(ref);
    evt.stop();
  });
  document.body.on('click', '[data-type="glide_list_add_me"]', function(evt, element) {
    var ref = element.getAttribute("data-ref");
    var u = element.getAttribute("data-user-id");
    var name = element.getAttribute("data-user").replace(/\\'/, "'");;
    addGlideListChoice('select_0' + ref, u, name);
    evt.stop();
  });
  document.body.on('click', '[data-type="glide_list_add_me_locked"]', function(evt, element) {
    var ref = element.getAttribute("data-ref");
    var u = element.getAttribute("data-user-id");
    var name = element.getAttribute("data-user").replace(/\\'/, "'");;
    addGlideListChoice('select_0' + ref, u, name);
    lock($(ref + "_lock"), ref, ref + "_edit", ref + "_nonedit", "select_0" + ref, ref + "_nonedit");
    element.hide();
    evt.stop();
  });
  document.on('contextmenu', 'div[data-type="label"]', function(evt, element) {
    if (!elementAction(element, evt))
      evt.stop();
  });
  document.on('contextmenu', 'nav[data-type="section_head"]', function(evt, element) {
    var id = element.getAttribute("data-id");
    if (!contextShow(evt, "1", -1, 0, 0))
      evt.stop();
  });
});;
/*! RESOURCE: /scripts/classes/ui/GlideBox.js */
var g_glideBoxes = {};
var GlideBox = Class.create({
  QUIRKS_MODE: document.compatMode != 'CSS1Compat',
  initialize: function(options) {
    if (isMSIE9)
      this.QUIRKS_MODE = this._isQuirksMode();
    this.options = Object.extend({
      id: typeof options == 'string' ? options : guid(),
      title: 'Default Title',
      boxClass: '',
      body: '',
      form: null,
      iframe: null,
      iframeId: null,
      bodyPadding: 4,
      fadeOutTime: 200,
      draggable: true,
      showClose: true,
      parent: document.body,
      boundingContainer: options.parent || document.body,
      position: Prototype.Browser.IE || options.parent ? 'absolute' : 'fixed',
      allowOverflowY: true,
      allowOverflowX: true,
      height: null,
      maxHeight: null,
      minHeight: 50,
      width: null,
      minWidth: 70,
      maxWidth: null,
      top: null,
      bottom: null,
      maxTop: null,
      minBottom: null,
      left: null,
      right: null,
      preferences: {},
      onBeforeLoad: function() {},
      onAfterLoad: function() {},
      onBeforeHide: function() {},
      onAfterHide: function() {},
      onBeforeShow: function() {},
      onAfterShow: function() {},
      onBeforeClose: function() {},
      onAfterClose: function() {},
      onBeforeDrag: function() {},
      onAfterDrag: function() {},
      onBeforeResize: function() {},
      onAfterResize: function() {},
      onHeightAdjust: function() {},
      onWidthAdjust: function() {},
      autoDimensionOnPreLoad: true,
      autoDimensionOnLoad: true,
      autoPositionOnLoad: true,
      fadeInTime: 250
    }, options || {});
    this.options.padding = Object.extend({
      top: 15,
      right: 15,
      bottom: 15,
      left: 15
    }, this.options.padding || {});
    this._iframeShim = null;
    this._dataCache = {};
    this._box = $(document.createElement('div'));
    this._box.id = this.options.id;
    this._box.className = (new Array('glide_box', 'gb_mw', trim(this.options.boxClass), this.options.iframe && this.options.iframe != '' ? 'iframe' : '').join(' '));
    this._box.setAttribute('role', 'dialog');
    this._box.innerHTML = gb_BoxTemplateInner;
    if (this._box.hasClassName('frame'))
      this.getBodyWrapperElement().update(gb_BodyFrameTemplate);
    this.options.parent.appendChild(this._box);
    this.setBody(this.options.body);
    this.setBodyPadding(this.options.bodyPadding);
    if (this.options.titleHtml)
      this.setTitleHtml(this.options.titleHtml)
    else
      this.setTitle(this.options.title);
    this.setDraggable(this.options.draggable);
    this.setStyle({
      position: this.options.position
    });
    if (this.options.maxWidth)
      this.setMaxWidth(this.options.maxWidth);
    if (this.options.showClose)
      this.addToolbarCloseButton();
    if (this.options.allowOverflowY === false)
      this.getBodyElement().setStyle({
        overflowY: 'hidden'
      });
    if (this.options.allowOverflowX === false)
      this.getBodyElement().setStyle({
        overflowX: 'hidden'
      });
    g_glideBoxes[this.options.id] = this;
  },
  getId: function() {
    return this.options.id;
  },
  getBoxElement: function() {
    return this._box;
  },
  getBoxWrapperElement: function() {
    return this._box.select('.gb_wrapper')[0];
  },
  getIFrameElement: function() {
    return this._box.select('iframe')[0];
  },
  isVisible: function() {
    return this._box.visible();
  },
  isLoading: function() {
    return this._isLoading;
  },
  setOnClick: function(f) {
    this._box.observe('click', f.bind(this));
  },
  setOnBeforeLoad: function(f) {
    this.options.onBeforeLoad = f;
  },
  setOnAfterLoad: function(f) {
    this.options.onAfterLoad = f;
  },
  setOnBeforeClose: function(f) {
    this.options.onBeforeClose = f;
  },
  setOnAfterClose: function(f) {
    this.options.onAfterClose = f;
  },
  setOnBeforeDrag: function(f) {
    this.options.onBeforeDrag = f;
  },
  setOnAfterDrag: function(f) {
    this.options.onAfterDrag = f;
  },
  setOnBeforeResize: function(f) {
    this.options.onBeforeResize = f;
  },
  setOnAfterResizes: function(f) {
    this.options.onAfterResize = f;
  },
  setOnHeightAdjust: function(f) {
    this.options.onHeightAdjust = f;
  },
  setOnWidthAdjust: function(f) {
    this.options.onWidthAdjust = f;
  },
  addData: function(key, value) {
    this._dataCache[key] = value;
  },
  getData: function(key) {
    return this._dataCache[key];
  },
  getToolbar: function() {
    return this._box.select('.gb_toolbar')[0];
  },
  addToolbarRow: function(html) {
    var thead = this._box.select('.gb_table > thead')[0];
    var td = thead.insertRow(thead.rows.length).insertCell(0);
    td.className = 'gb_table_col_l1';
    td.innerHTML = html;
    return td;
  },
  setTitle: function(html) {
    var titleZone = this._box.select('.gb_title_zone')[0];
    titleZone.addClassName('gb_toolbar_text');
    if (titleZone.firstChild)
      titleZone.removeChild(titleZone.firstChild);
    var text = document.createTextNode(html);
    titleZone.appendChild(text);
    this._box.setAttribute('aria-label', html);
  },
  setTitleHtml: function(html) {
    this._box.select('.gb_title_zone')[0].removeClassName('gb_toolbar_text').innerHTML = html;
  },
  setWindowIcon: function(html) {
    var tr = this._box.select('.gb_toolbar_left tr')[0];
    for (var i = 0, l = tr.childNodes.length; i < l; i++)
      tr.deleteCell(i);
    this.addWindowIcon(html);
  },
  addWindowIcon: function(html) {
    this.addToolbarLeftDecoration('<div style="margin-left:5px;">' + html + '</div>');
  },
  removeToolbarDecoration: function(objSelector) {
    var e = this.getToolbar().select(objSelector);
    if (!e || e.length == 0)
      return;
    if (e[0].tagName.toLowerCase() == 'td')
      var td = e;
    else if (e[0].parentNode.tagName.toLowerCase() == 'td')
      var td = e[0].parentNode;
    else
      return;
    var tr = td.parentNode;
    for (var i = 0, l = tr.childNodes.length; i < l; i++) {
      if (tr.childNodes[i] == td) {
        tr.deleteCell(i);
        break;
      }
    }
  },
  addToolbarLeftDecoration: function(html, boolPrepend) {
    return this._addToolbarDecoration(html, boolPrepend || false, '.gb_toolbar_left');
  },
  addToolbarRightDecoration: function(html, boolPrepend) {
    return this._addToolbarDecoration(html, boolPrepend || false, '.gb_toolbar_right');
  },
  addToolbarCloseButton: function() {
    var arr = this._box.getElementsByClassName('gb_close');
    if (arr.length == 1)
      return;
    var className = this._box.hasClassName('dark') || this._box.hasClassName('iframe') ?
      'icon-cross-circle i12 i12_close' :
      'icon-cross-circle i16 i16_close2';
    this.addToolbarRightDecoration('<span style="float:none;cursor:pointer;" ' +
      'tabindex="0" aria-label="Close" role="button" class="gb_close ' + className + '"></span>');
    this.setToolbarCloseOnClick(function(event) {
      this.close();
    }.bind(this));
  },
  removeToolbarCloseButton: function() {
    this.removeToolbarDecoration('.gb_close');
  },
  setToolbarCloseOnClick: function(f) {
    var arr = this._box.getElementsByClassName('gb_close');
    if (arr.length == 0)
      return;
    arr[0].stopObserving('mousedown');
    arr[0].observe('mousedown', function(event) {
      f.call(this, event);
      event.stop();
    }.bind(this));
    arr[0].stopObserving('keydown');
    arr[0].observe('keydown', function(event) {
      if (event.keyCode != 13)
        return;
      f.call(this, event);
      event.stop();
    }.bind(this));
  },
  _addToolbarDecoration: function(html, boolPrepend, tableClassSelector) {
    var table = this._box.select(tableClassSelector)[0].show();
    var tr = table.select('tr')[0];
    var td = tr.insertCell(boolPrepend ? 0 : -1);
    td.innerHTML = html;
    return td;
  },
  getFooter: function() {
    return this._box.select('.gb_footer')[0];
  },
  showFooter: function() {
    if (this._isFooterVisible === true)
      return;
    this.getFooter().show();
    this._box.select('.gb_table > tfoot')[0].setStyle({
      display: 'table-footer-group'
    });
    this._isFooterVisible = true;
  },
  hideFooter: function() {
    if (!this._isFooterVisible !== true)
      return;
    this.getFooter().hide();
    this._box.select('.gb_table > tfoot')[0].setStyle({
      display: 'none'
    });
    this._isFooterVisible = false;
  },
  showFooterResizeGrips: function() {
    this.showFooter();
    var footer = this.getFooter();
    if (!footer.select('.i16_resize_grip_left'))
      return;
    footer.select('.gb_footer_left_resize')[0].innerHTML = '<span class="i16 i16_resize_grip_left" style="float:none;" />';
    footer.select('.gb_footer_right_resize')[0].innerHTML = '<span class="i16 i16_resize_grip_right" style="float:none;" />';
    this.leftResizeDragger = new GlideDraggable(footer.select('.i16_resize_grip_left')[0], footer);
    this.leftResizeDragger.setHoverCursor('sw-resize');
    this.leftResizeDragger.setDragCursor('sw-resize');
    this.leftResizeDragger.setStartFunction(function(e, dragElem, pageCoords, shift, dragCoords) {
      var dims = this._getViewportDimensions();
      var offsets = document.viewport.getScrollOffsets();
      this._currentOffset = this.getOffset();
      this._currentOffset.right = this._currentOffset.left + this.getWidth();
      this._isLeftPositioned = this.convertToRightPosition();
      this._maxWidth = this._currentOffset.right - this.options.padding.left - offsets.left;
      this._maxHeight = dims.height - this.options.padding.top - this._currentOffset.top + offsets.top;
      this.options.onBeforeResize.call(this);
    }.bind(this));
    this.leftResizeDragger.setDragFunction(function(e, dragElem, pageCoords, shift, dragCoords) {
      this.setWidth(Math.min(this._maxWidth, (this._currentOffset.right - pageCoords.x)));
      this.setHeight(Math.min(this._maxHeight, (pageCoords.y - this._currentOffset.top)));
    }.bind(this));
    this.leftResizeDragger.setEndFunction(function() {
      if (this._isLeftPositioned)
        this.convertToLeftPosition();
      this._isLeftPositioned = null;
      this.options.onAfterResize.call(this);
    }.bind(this));
    this.rightResizeDragger = new GlideDraggable(footer.select('.i16_resize_grip_right')[0], footer);
    this.rightResizeDragger.setHoverCursor('se-resize');
    this.rightResizeDragger.setDragCursor('se-resize');
    this.rightResizeDragger.setStartFunction(function(e, dragElem, pageCoords, shift, dragCoords) {
      var dims = this._getViewportDimensions();
      var offsets = document.viewport.getScrollOffsets();
      this._currentOffset = this.getOffset();
      this._isRightPositioned = this.convertToLeftPosition();
      this._maxWidth = dims.width - this.options.padding.left - this._currentOffset.left + offsets.left;
      this._maxHeight = dims.height - this.options.padding.top - this._currentOffset.top + offsets.top;
      this.options.onBeforeResize.call(this);
    }.bind(this));
    this.rightResizeDragger.setDragFunction(function(e, dragElem, pageCoords, shift, dragCoords) {
      this.setWidth(Math.min(this._maxWidth, (pageCoords.x - this._currentOffset.left)));
      this.setHeight(Math.min(this._maxHeight, (pageCoords.y - this._currentOffset.top)));
    }.bind(this));
    this.rightResizeDragger.setEndFunction(function() {
      if (this._isRightPositioned)
        this.convertToRightPosition();
      this._isRightPositioned = null;
      this.options.onAfterResize.call(this);
    }.bind(this));
  },
  hideFooterResizeGrips: function() {
    this.leftResizeDragger.destroy();
    this.rightResizeDragger.destroy();
    this.leftResizeDragger = null;
    this.rightResizeDragger = null;
    this._box.select('.gb_footer_left_resize')[0].innerHTML = '';
    this._box.select('.gb_footer_right_resize')[0].innerHTML = '';
  },
  getFooterContainer: function() {
    return this._box.select('.gb_footer_body > div')[0];
  },
  setFooter: function(html) {
    this.showFooter();
    this._box.select('.gb_footer_body > div')[0].innerHTML = html;
  },
  prependFooterRow: function(html) {
    return this._addFooterRow(0, html);
  },
  appendFooterRow: function(html) {
    return this._addFooterRow(-1, html);
  },
  _addFooterRow: function(pos, html) {
    var foot = this._box.select('.gb_table > tfoot')[0];
    var td = foot.insertRow(pos == -1 ? foot.rows.length : pos).insertCell(0);
    td.className = 'gb_table_col_l1';
    td.innerHTML = html;
    return td;
  },
  getMaxDimensions: function() {
    var vp = this._getViewportDimensions();
    if (this.options.parent == document.body || this.options.parent != this.options.boundingContainer)
      var res = {
        width: vp.width,
        height: vp.height
      };
    else
      var res = this.options.parent.getDimensions();
    if (this.options.boundingContainer == this.options.parent) {
      res.height -= this.options.top !== null ? this.options.top : this.options.padding.top;
      res.height -= this.options.bottom !== null ? this.options.bottom : this.options.padding.bottom;
      res.width -= this.options.left !== null ? this.options.left : this.options.padding.left;
      res.width -= this.options.right !== null ? this.options.right : this.options.padding.right;
    } else if (this.options.boundingContainer == document.body && document.loaded == true) {
      var o = this.options.parent.cumulativeOffset();
      var dims = this.options.parent.getDimensions();
      if (this.options.bottom !== null)
        res.height -= vp.height - (o.top + dims.height) + this.options.padding.top;
      else if (this.options.top !== null)
        res.height -= o.top + this.options.padding.bottom;
      if (this.options.right !== null)
        res.width -= vp.width - (o.left + dims.width) + this.options.padding.left;
      else if (this.options.left !== null)
        res.width -= o.left + this.options.padding.right;
    } else {}
    if (this.options.maxWidth)
      res.width = Math.min(res.width, this.options.maxWidth);
    if (this.options.maxHeight)
      res.height = Math.min(res.height, this.options.maxHeight);
    return res;
  },
  getDocumentHeight: function(doc) {
    var D = doc || window.document;
    return Math.max(
      Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
      Math.max(D.body.offsetHeight, D.documentElement.offsetHeight),
      Math.max(D.body.clientHeight, D.documentElement.clientHeight)
    );
  },
  getDocumentWidth: function(doc) {
    var D = doc || window.document;
    return Math.max(
      Math.max(D.body.scrollWidth, D.documentElement.scrollWidth),
      Math.max(D.body.offsetWidth, D.documentElement.offsetWidth),
      Math.max(D.body.clientWidth, D.documentElement.clientWidth)
    );
  },
  autoDimension: function() {
    this._scrollBarWidth = this._scrollBarWidth || getScrollBarWidthPx();
    var box = this._box;
    var body = this.getBodyElement();
    var bodyWrapper = this.getBodyWrapperElement();
    var extraWidth = 0;
    var innerHeight = null;
    var innerWidth = null;
    var maxDim = this.getMaxDimensions();
    var clone = null;
    box.setStyle({
      width: '',
      height: ''
    });
    bodyWrapper.setStyle({
      width: '',
      height: '',
      overflowY: 'hidden'
    });
    body.setStyle({
      width: '',
      height: ''
    });
    var iframe = this.getIFrameElement();
    if (this.options.iframe && iframe && !this.isLoading()) {
      if (!this.options.width && !this.options.height) {
        try {
          var D = iframe.contentDocument || iframe.contentWindow.document;
          innerWidth = (this.getDocumentWidth(D) + 4);
          innerHeight = (this.getDocumentHeight(D) + 4);
          if (isMacintosh && Prototype.Browser.Gecko)
            innerHeight++;
        } catch (e) {
          innerWidth = 500;
          innerHeight = 500;
        }
      } else {
        if (this.options.height) {
          var p = (this.options.height + '').match(/([0-9]*)%/);
          var diff = box.measure('border-box-height') - body.measure('border-box-height');
          if (!this.QUIRKS_MODE)
            diff = diff - box.measure('border-top') - box.measure('border-bottom');
          if (typeof this.options.height == 'number')
            innerHeight = this.options.height - diff;
          else if (typeof this.options.height == 'string' && p)
            innerHeight = (maxDim.height * (parseInt(p[1], 10) / 100)) - diff;
        }
        if (this.options.width) {
          var p = (this.options.width + '').match(/([0-9]*)%/);
          var diff = box.measure('border-box-width') - body.measure('border-box-width');
          if (!this.QUIRKS_MODE)
            diff = diff - box.measure('border-left') - box.measure('border-right');
          if (typeof this.options.width == 'number')
            innerWidth = this.options.width - diff;
          else if (typeof this.options.width == 'string' && p)
            innerWidth = (maxDim.width * (parseInt(p[1], 10) / 100)) - diff;
        }
      }
      iframe.writeAttribute('height', 0);
      iframe.writeAttribute('width', 0);
    } else {
      clone = Element.clone(box, true);
      clone.id = '';
      clone.setStyle({
        position: 'absolute',
        top: '-1999px',
        left: '-1999px',
        right: '',
        bottom: '',
        width: '',
        height: '',
        display: 'block',
        visibility: 'hidden'
      });
      clone.innerHTML = clone.innerHTML;
      document.body.appendChild(clone);
      var cloneBody = clone.select('.gb_body:first')[0];
      var diff = clone.measure('border-box-width') - cloneBody.measure('border-box-width');
      if (this.QUIRKS_MODE)
        diff = diff - clone.measure('border-left') - clone.measure('border-right');
      if (!this.options.width)
        innerWidth = Math.min(maxDim.width - diff, cloneBody.getWidth() + 1);
      else {
        var p = (this.options.width + '').match(/([0-9]*)%/);
        if (typeof this.options.width == 'number')
          innerWidth = Math.min(maxDim.width, this.options.width) - diff;
        else if (typeof this.options.width == 'string' && p)
          innerWidth = (maxDim.width * (parseInt(p[1], 10) / 100)) - diff;
      }
      cloneBody.setStyle({
        width: innerWidth + 'px'
      });
      if (!this.options.height) {
        innerHeight = cloneBody.getHeight();
        cloneBody.setStyle({
          width: innerWidth + 'px'
        });
      } else {
        var p = (this.options.height + '').match(/([0-9]*)%/);
        var diff = clone.measure('border-box-height') - cloneBody.measure('border-box-height');
        if (this.QUIRKS_MODE)
          diff = diff - box.measure('border-top') - box.measure('border-bottom');
        if (typeof this.options.height == 'number')
          innerHeight = this.options.height - diff;
        else if (typeof this.options.height == 'string' && p)
          innerHeight = (maxDim.height * (parseInt(p[1], 10) / 100)) - diff;
        cloneBody.setStyle({
          height: innerHeight + 'px'
        });
      }
    }
    if (clone && this.options.width && typeof this.options.width == 'string') {
      var per = (this.options.width + '').match(/([0-9]*)%/);
      clone.setStyle({
        width: (maxDim.width * (parseInt(per[1], 10) / 100)) + 'px'
      });
    } else if (clone && this.options.width && typeof this.options.width == 'number')
      clone.setStyle({
        width: this.options.width + 'px'
      });
    if (this.options.allowOverflowY === true)
      bodyWrapper.setStyle({
        overflowY: ''
      });
    body.style.width = innerWidth + 'px';
    body.style.height = innerHeight + 'px';
    var dims = clone ? clone.getDimensions() : box.getDimensions();
    var diffHeight = dims.height - maxDim.height;
    if (dims.height > maxDim.height) {
      extraWidth = this.options.allowOverflowY === true ? this._scrollBarWidth : 0;
      body.style.height = Math.max(0, innerHeight - diffHeight) + 'px';
      this.setHeight(maxDim.height, clone);
    } else
      this.setHeight(dims.height, clone);
    if (dims.width > maxDim.width) {
      this.setWidth(maxDim.width);
      this.setHeight(Math.min(maxDim.height, dims.height + this._scrollBarWidth), clone);
    } else
      this.setWidth(Math.min(dims.width, this.options.width && typeof this.options.width == 'number' ? this.options.width : dims.width) + extraWidth);
    if (clone)
      clone.remove();
    this._resizeIframeShim();
  },
  size: function(w, h) {
    if (w) this.setWidth(w);
    if (h) this.setHeight(h);
  },
  setMaxWidth: function(mw) {
    this.options.maxWidth = parseInt(mw, 10);
    this._box.setStyle({
      maxWidth: this.options.maxWidth + 'px'
    });
  },
  setWidth: function(w) {
    w = typeof w == 'string' ? parseInt(w, 10) : w;
    var box = this._box;
    var boxBorder = box.measure('border-left') + box.measure('border-right');
    var gbWrapper = box.select('.gb_wrapper')[0];
    var wrapperBorder = gbWrapper.measure('border-left') + gbWrapper.measure('border-right');
    var wrapper = this.getBodyWrapperElement();
    var body = this.getBodyElement();
    var iframe = this.options.iframe ? this.getIFrameElement() : null;
    w = Math.max(w, this.options.minWidth);
    var wrapperWidth = w;
    if (!this.QUIRKS_MODE || (this.QUIRKS_MODE && !Prototype.Browser.IE))
      wrapperWidth -= (boxBorder + wrapperBorder);
    if (!this.QUIRKS_MODE || (this.QUIRKS_MODE && !Prototype.Browser.IE))
      wrapperWidth -= wrapper.measure('padding-left') + wrapper.measure('padding-right');
    var ww = wrapperWidth;
    if (this.QUIRKS_MODE && Prototype.Browser.IE)
      ww += wrapperBorder + wrapper.measure('padding-left') + wrapper.measure('padding-right');
    var boxSizing = wrapper.getStyle('box-sizing');
    var bsw = ww;
    if (boxSizing == 'border-box') {
      bsw += wrapperBorder + wrapper.measure('padding-left') + wrapper.measure('padding-right');
    } else if (boxSizing == 'padding-box') {
      bsw += wrapper.measure('padding-left') + wrapper.measure('padding-right');
    }
    wrapper.setStyle({
      width: bsw + 'px'
    });
    body.setStyle({
      width: ww + 'px'
    });
    if (!this.QUIRKS_MODE || (this.QUIRKS_MODE && !Prototype.Browser.IE))
      w = w - boxBorder;
    if (this.QUIRKS_MODE && Prototype.Browser.IE) {
      w = ww - (wrapperBorder + wrapper.measure('padding-left') + wrapper.measure('padding-right'));
      body.setStyle({
        width: w + 'px'
      });
    }
    box.setStyle({
      width: w + 'px'
    });
    if (iframe) {
      var iframeWrap2 = iframe.up();
      var iframeContainer = iframeWrap2.up();
      var iframeWidth = (wrapperWidth -
        iframeWrap2.measure('border-left') - iframeWrap2.measure('border-right') -
        iframeContainer.measure('border-left') - iframeContainer.measure('border-right'));
      iframe.writeAttribute('width', iframeWidth);
    }
    var table = box.select('.gb_table')[0];
    var tw = table.getWidth();
    var realWrapperWidth = wrapper.getWidth();
    if (realWrapperWidth < tw) {
      var bodyPadding = wrapper.measure('padding-left') + wrapper.measure('padding-right');
      var nw = tw - bodyPadding;
      wrapper.setStyle({
        width: nw + 'px'
      });
      box.setStyle({
        width: (w + (tw - realWrapperWidth)) + 'px'
      });
      if (iframe)
        iframe.writeAttribute('width', nw);
    }
    this.options.onWidthAdjust.call(this);
  },
  setMinWidth: function(mw) {
    this.options.minWidth = typeof mw == 'string' ? parseInt(mw, 10) : mw;
  },
  setHeight: function(h, clone) {
    h = typeof h == 'string' ? parseInt(h, 10) : h;
    var box = clone || this._box;
    var gbWrapper = box.select('.gb_wrapper')[0];
    var boxBorder = box.measure('border-top') + box.measure('border-bottom');
    var wrapperBorder = gbWrapper.measure('border-top') + gbWrapper.measure('border-bottom');
    var bodyWrapper = box.select('.gb_body_wrapper')[0];
    var body = box.select('.gb_body')[0];
    var iframe = this.options.iframe ? this.getIFrameElement() : null;
    var table = box.select('.gb_table')[0];
    if (this.options.minHeight)
      h = Math.max(h, this.options.minHeight);
    if (iframe)
      var wrapperHeight = h - (box.getHeight() - Math.max(body.getHeight(), parseInt(body.getStyle('height'), 10)));
    else {
      var wrapperHeight = h - wrapperBorder - boxBorder - table.select('thead')[0].getHeight() - table.select('tfoot > tr')[0].getHeight();
      if (!this.QUIRKS_MODE || (this.QUIRKS_MODE && !Prototype.Browser.IE))
        wrapperHeight -= bodyWrapper.measure('padding-top') + bodyWrapper.measure('padding-bottom');
    }
    wrapperHeight = Math.max(wrapperHeight, 0);
    wh = wrapperHeight;
    if (this.QUIRKS_MODE && Prototype.Browser.IE)
      wh += wrapperBorder + bodyWrapper.measure('padding-top') + bodyWrapper.measure('padding-bottom');
    var boxSizing = bodyWrapper.getStyle('box-sizing');
    if (boxSizing == 'border-box') {
      wh += wrapperBorder + bodyWrapper.measure('padding-top') + bodyWrapper.measure('padding-bottom');
    } else if (boxSizing == 'padding-box') {
      wh += bodyWrapper.measure('padding-top') + bodyWrapper.measure('padding-bottom');
    }
    this.getBodyWrapperElement().setStyle({
      height: wh + 'px'
    });
    if (iframe) {
      var iframeWrap2 = iframe.up();
      var iframeContainer = iframeWrap2.up();
      var iframeHeight = (wrapperHeight -
        iframeWrap2.measure('border-top') - iframeWrap2.measure('border-bottom') -
        iframeContainer.measure('border-top') - iframeContainer.measure('border-bottom'));
      iframe.writeAttribute('height', iframeHeight);
    }
    h = h - boxBorder;
    this._box.setStyle({
      height: h + 'px'
    });
    this.options.onHeightAdjust.call(this);
  },
  setMinHeight: function(mh) {
    this.options.minHeight = typeof mh == 'string' ? parseInt(mh, 10) : mh;
    this._box.setStyle({
      minHeight: this.options.minHeight + 'px'
    });
  },
  getMaxPositions: function() {
    if (this.options.parent == document.body) {
      var winDimensions = this._getViewportDimensions();
      var parent = {
        width: winDimensions.width,
        height: winDimensions.height
      };
    } else {
      var parent = {
        width: this.options.parent.getWidth(),
        height: this.options.parent.getHeight()
      };
    }
    return {
      minTop: this.options.padding.top,
      minLeft: this.options.padding.left,
      maxTop: parent.height - this.getHeight() - this.options.padding.bottom,
      maxLeft: parent.width - this.getWidth() - this.options.padding.right
    };
  },
  autoPosition: function() {
    if ((this.options.left !== null || this.options.right !== null) &&
      (this.options.top !== null || this.options.bottom !== null)) {
      if (this.options.left !== null)
        this.positionLeft(this.options.left);
      else
        this.positionRight(this.options.right);
      if (this.options.top !== null)
        this.positionTop(this.options.top);
      else
        this.positionBottom(this.options.bottom);
    } else {
      if (this.options.parent == document.body) {
        var winScrollOffsets = document.viewport.getScrollOffsets();
        var winDimensions = this._getViewportDimensions();
        var height = winDimensions.height;
        var width = winDimensions.width;
        var offset = this.getStyle('position') == 'absolute' ? {
          left: winScrollOffsets.left,
          top: winScrollOffsets.top
        } : {
          left: 0,
          top: 0
        };
      } else {
        var height = this.options.parent.getHeight();
        var width = this.options.parent.getWidth();
        var offset = {
          left: 0,
          top: 0
        };
      }
      if (this.options.left !== null)
        this.positionLeft(this.options.left);
      else if (this.options.right !== null)
        this.positionRight(this.options.right);
      else
        this.positionLeft(width / 2 - this.getWidth() / 2 + offset.left)
      if (this.options.top !== null)
        this.positionTop(this.options.top);
      else if (this.options.bottom !== null)
        this.positionBottom(this.options.bottom);
      else
        this.positionTop(height / 2 - this.getHeight() / 2 + offset.top);
    }
  },
  center: function() {
    if (this.options.parent == document.body) {
      var offsets = document.viewport.getScrollOffsets();
      var winDimensions = this._getViewportDimensions();
      var height = winDimensions.height;
      var width = winDimensions.width;
    } else {
      var height = this.options.parent.getHeight();
      var width = this.options.parent.getWidth();
      var offsets = {
        left: 0,
        top: 0
      };
    }
    if (this.getStyle('position') == 'absolute') {
      this.positionLeft(width / 2 - this.getWidth() / 2 + offsets.left);
      this.positionTop(height / 2 - this.getHeight() / 2 + offsets.top);
    } else {
      this.positionLeft(width / 2 - this.getWidth() / 2);
      this.positionTop(height / 2 - this.getHeight() / 2);
    }
  },
  setMaxTop: function(p) {
    this.options.maxTop = p;
  },
  setMinBottom: function(p) {
    this.options.minBottom = p;
  },
  positionTop: function(top) {
    if (top === null)
      return;
    top = parseInt(top, 10);
    if (this.options.maxTop)
      top = Math.min(top, this.options.maxTop);
    if (this.options.minBottom) {
      var h = this.getHeight();
      if (top + h < this.options.minBottom)
        top = this.options.minBottom - h;
    }
    this.setStyle({
      top: top + 'px'
    });
  },
  positionLeft: function(left) {
    if (!left)
      return;
    this.setStyle({
      left: left + 'px',
      right: ''
    });
  },
  positionRight: function(right) {
    if (right === null)
      return;
    this.setStyle({
      right: right + 'px',
      left: ''
    });
  },
  positionBottom: function(bottom) {
    if (bottom === null)
      return;
    bottom = parseInt(bottom, 10);
    this.setStyle({
      bottom: bottom + 'px',
      top: ''
    });
  },
  convertToLeftPosition: function() {
    if (!this._box.style.right)
      return false;
    this.setStyle({
      right: '',
      left: (this.getOffset().left - (this.getStyle('position') == 'fixed' ? document.viewport.getScrollOffsets().left : 0)) + 'px'
    });
    return true;
  },
  convertToRightPosition: function() {
    var l = this._box.style.left;
    if (!l)
      return false;
    this.setStyle({
      left: '',
      right: (this._getViewportDimensions().width - parseInt(l, 10) - this.getWidth()) + 'px'
    });
    return true;
  },
  setStyle: function(o, value) {
    if (typeof o == 'string')
      o = {
        o: value
      };
    else if (typeof o != 'object')
      o = {};
    this._box.setStyle(o);
  },
  getWidth: function() {
    return this._box.getWidth();
  },
  getHeight: function() {
    return this._box.getHeight();
  },
  getStyle: function(s) {
    return this._box.getStyle(s);
  },
  getOffset: function() {
    return this._box.cumulativeOffset();
  },
  getBodyElement: function() {
    return this._box.select('.gb_body')[0];
  },
  getBodyWrapperElement: function() {
    return this._box.select('.gb_body_wrapper')[0];
  },
  setBody: function(html) {
    this.getBodyElement().innerHTML = html;
  },
  setBodyFromForm: function(template) {
    this.options.form = template;
  },
  setBodyPadding: function(pad) {
    if (!this.options.iframe)
      this.getBodyWrapperElement().setStyle({
        padding: pad + (isNaN(pad) ? '' : 'px')
      });
  },
  _getViewportDimensions: function() {
    if (!this.QUIRKS_MODE || !Prototype.Browser.IE)
      return document.viewport.getDimensions();
    return {
      height: getBrowserWindowHeight(),
      width: getBrowserWindowWidth()
    };
  },
  setDraggable: function(b) {
    if (b) {
      this.toolbarDragger = new GlideDraggable(this.getToolbar(), this._box);
      this.toolbarDragger.setHoverCursor('move');
      this.toolbarDragger.setStartFunction(function(e, dragElem, pageCoords, shift, dragCoords) {
        this._tmpDim = this.getMaxPositions();
        this.options.onBeforeDrag.call(this, e, dragElem, pageCoords, shift, dragCoords);
      }.bind(this));
      this.toolbarDragger.setDragFunction(function(e, dragElem, pageCoords, shift, dragCoords) {
        dragElem.style.left = Math.min(Math.max(this._tmpDim.minLeft, dragCoords.x), this._tmpDim.maxLeft) + 'px';
        dragElem.style.top = Math.min(Math.max(this._tmpDim.minTop, dragCoords.y), this._tmpDim.maxTop) + 'px';
      }.bind(this));
      this.toolbarDragger.setEndFunction(function(e, dragElem, pageCoords, shift, dragCoords) {
        this.options.onAfterDrag.call(this, e, dragElem, pageCoords, shift, dragCoords);
      }.bind(this));
    } else if (this.toolbarDragger) {
      this.toolbarDragger.destroy();
      this.toolbarDragger = null;
    }
  },
  isDraggable: function(b) {
    return this.toolbarDragger ? true : false;
  },
  setPreferences: function(preferences) {
    this.options.preferences = preferences;
  },
  setPreference: function(name, value) {
    if (typeof(value) == 'string')
      value = value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    this.options.preferences[name] = value;
  },
  getPreferences: function() {
    return this.options.preferences;
  },
  removePreference: function(name, value) {
    delete this.options.preferences[name];
  },
  getDescribingXML: function() {
    var section = document.createElement('section');
    section.setAttribute('name', this.getId());
    for (var name in this.options.preferences) {
      var p = document.createElement('preference');
      var v = this.options.preferences[name];
      p.setAttribute('name', name);
      if (typeof v == 'object') {
        if (typeof v.join == 'function') {
          v = v.join(',');
        } else if (typeof v.toString == 'function') {
          v = v.toString();
        }
      }
      if (v)
        p.setAttribute('value', v);
      section.appendChild(p);
    }
    return section;
  },
  getDescribingText: function() {
    var gxml = document.createElement("gxml");
    var x = this.getDescribingXML();
    gxml.appendChild(x);
    return gxml.innerHTML;
  },
  hide: function(fadeOutTime) {
    this.options.onBeforeHide.call(this);
    this._removeIFrameShim();
    fadeOutTime = fadeOutTime || fadeOutTime === 0 ? fadeOutTime : this.options.fadeOutTime
    if (fadeOutTime !== 0)
      this.getBoxElement().fadeOut(fadeOutTime, function() {
        this.options.onAfterHide.call(this);
      }.bind(this));
    else {
      this.getBoxElement().hide();
      this.options.onAfterHide.call(this);
    }
  },
  show: function(fadeInTime) {
    this.options.onBeforeShow.call(this);
    fadeInTime = 0;
    if (this._iframeNeedsAutoDimension === true) {
      this._box.setStyle({
        opacity: '0',
        filter: 'alpha(opacity=0)',
        visibility: 'hidden',
        display: 'block'
      });
      this.autoDimension();
      this.autoPosition();
      this._box.setStyle({
        opacity: '',
        filter: '',
        visibility: '',
        display: 'none'
      });
    }
    if (fadeInTime !== 0)
      this.getBoxElement().fadeIn(fadeInTime, function() {
        this.options.onAfterShow.call(this);
      }.bind(this));
    else {
      this.getBoxElement().show();
      this.options.onAfterShow.call(this);
    }
    this._iframeNeedsAutoDimension = false;
    this._createIframeShim();
  },
  render: function(options) {
    options = Object.extend({
      autoDimensionOnPreLoad: this.options.autoDimensionOnPreLoad,
      autoDimensionOnLoad: this.options.autoDimensionOnLoad,
      autoPositionOnLoad: this.options.autoPositionOnLoad,
      fadeInTime: 0
    }, options || {});
    this._isClosing = false;
    var bw = this.getBodyWrapperElement();
    if (!this.getToolbar().visible())
      bw.addClassName('no_toolbar');
    if (!this.getFooter().visible())
      bw.addClassName('no_footer');
    if (this.options.form)
      this._renderForm(options);
    else if (this.options.iframe)
      this._renderIFrame(options);
    else
      this._renderStatic(options);
  },
  _renderStatic: function(opts) {
    this.options.onBeforeLoad.call(this);
    if (opts.autoDimensionOnLoad)
      this.autoDimension();
    if (opts.autoPositionOnLoad)
      this.autoPosition();
    if (opts.fadeInTime !== 0)
      this._box.fadeIn(opts.fadeInTime);
    else
      this._box.style.display = 'block';
    this.options.onAfterShow.call(this);
    this.options.onAfterLoad.call(this);
  },
  _renderForm: function(opts) {
    this._isLoading = true;
    this.options.onBeforeLoad.call(this);
    this.setBody(gb_LoadingBody);
    this._box.addClassName('form');
    this._box.setStyle({
      display: 'block'
    });
    if (opts.autoDimensionOnPreLoad) {
      this.autoDimension();
      this.center();
    }
    this.setPreference('renderer', 'RenderForm');
    this.setPreference('type', 'direct');
    this.setPreference('table', this.options.form);
    var ga = new GlideAjaxForm(this.options.form);
    ga.addParam('sysparm_value', this.getDescribingText());
    ga.addParam('sysparm_name', this.options.form);
    ga.getRenderedBodyText(function() {
      this.setBody(s);
      s.evalScripts(true);
      this._isLoading = false;
      this.options.onAfterShow.call(this);
      this.options.onAfterLoad.call(this);
      if (opts.autoDimensionOnLoad)
        this.autoDimension();
      if (opts.autoPositionOnLoad)
        this.autoPosition();
    }.bind(this));
  },
  _renderIFrame: function(opts) {
    this._isLoading = true;
    this.setBody(gb_BoxIFrameBody);
    this._box.setStyle({
      display: 'block'
    });
    if (opts.autoDimensionOnPreLoad)
      this.autoDimension();
    this.autoPosition();
    if (opts.autoDimensionOnLoad !== true) {
      var tmpIFrame = this.getIFrameElement();
      if (tmpIFrame) {
        var oldHeight = tmpIFrame.readAttribute('height');
        var oldWidth = tmpIFrame.readAttribute('width');
      }
    }
    var loading = this._box.select('.gb_loading')[0];
    var wrapper = loading.up('.gb_body_wrapper');
    loading.setStyle({
      height: (wrapper.measure('height') - loading.measure('padding-top') - loading.measure('padding-bottom') - 4) + 'px'
    });
    loading.up('.loading_wrap_outer').setStyle({
      width: (wrapper.measure('width') - 2) + 'px'
    });
    var f = function() {
      var iframe = this.getIFrameElement();
      iframe.stopObserving('load', f);
      iframe.up().up().show().previous().remove();
      this._isLoading = false;
      if (opts.autoDimensionOnLoad || (!opts.autoDimensionOnLoad && !oldHeight && !oldWidth)) {
        if (!this.isVisible())
          this._iframeNeedsAutoDimension = true;
        else
          this.autoDimension();
      } else if (oldHeight && oldWidth) {
        iframe.writeAttribute('height', oldHeight);
        iframe.writeAttribute('width', oldWidth);
      }
      this.autoPosition();
      this._createIframeShim();
      this.options.onAfterShow.call(this);
      this.options.onAfterLoad.call(this);
    }.bind(this);
    var iframe = this.getIFrameElement();
    iframe.id = this.options.iframeId || guid();
    iframe.observe('load', f);
    this.options.onBeforeLoad.call(this);
    iframe.src = this.options.iframe;
  },
  _createIframeShim: function() {
    if (!this.options.iframe || !isMSIE6 || this._iframeShim)
      return;
    var box = this.getBoxElement();
    this._iframeShim = $(document.createElement('iframe'));
    this._iframeShim.setStyle({
      top: box.getStyle('top'),
      left: box.getStyle('left'),
      height: box.getHeight() + 'px',
      width: box.getWidth() + 'px',
      position: 'absolute',
      zIndex: '10',
      filter: 'alpha(opacity=0)',
      opacity: 0
    });
    this._iframeShim.src = 'javascript:"<html></html>"';
    document.body.appendChild(this._iframeShim);
  },
  _resizeIframeShim: function() {
    if (!Object.isElement(this._iframeShim))
      return;
    var box = this.getBoxElement();
    this._iframeShim.setStyle({
      width: box.getWidth() + 'px',
      height: box.getHeight() + 'px',
      top: box.getStyle('top'),
      left: box.getStyle('left')
    });
  },
  _removeIFrameShim: function() {
    if (this._iframeShim && Object.isElement(this._iframeShim)) {
      this._iframeShim.remove();
      this._iframeShim = null;
    }
  },
  close: function(timeout) {
    if (this._isClosing === true)
      return;
    this._isClosing = true;
    this.options.onBeforeClose.call(this);
    timeout = !timeout && timeout !== 0 ? this.options.fadeOutTime : parseInt(timeout, 10);
    if (timeout !== 0)
      this._box.fadeOut(timeout, function() {
        this._box.remove();
      }.bind(this));
    else
      this._box.remove();
    this.options.onAfterClose.call(this);
    delete g_glideBoxes[this.getId()];
  },
  _isQuirksMode: function() {
    var i = 0;
    var d = document;
    while (d) {
      if (++i == 10)
        return true;
      if (d.compatMode != 'BackCompat')
        return false;
      if (d.parentWindow.parent.document == d)
        return true;
      d = d.parentWindow.parent.document;
    }
    return true;
  },
  toString: function() {
    return 'GlideBox';
  }
});
GlideBox.get = function(objIdOrElem) {
  if (typeof objIdOrElem == 'object' && objIdOrElem.toString() == 'GlideBox') {
    var o = g_glideBoxes[objIdOrElem.options.id];
    return o || null;
  } else if (typeof objIdOrElem == 'string') {
    var o = g_glideBoxes[objIdOrElem];
    if (o) return o;
  }
  var e = $(objIdOrElem);
  if (!e)
    return null;
  var box = e.up('.glide_box');
  if (box)
    return g_glideBoxes[box.getAttribute('id')] || null;
  return null;
}
GlideBox.close = function(objIdOrElem, timeout) {
  var o = GlideBox.get(objIdOrElem);
  if (o)
    o.close(timeout);
  return false;
}
var gb_LoadingBody = '<div style="padding:6px 5px 5px 3px;" class="gb_loading"><span class="ia_loading"></span><span class="fontsmall" style="padding-left:6px;padding-top:4px;">Loading ...</span></div>';
var gb_ToolbarTemplate = '<table class="gb_toolbar"><tbody><tr><td class="gb_toolbar_col_l1">' +
  '<table class="gb_toolbar_left gb_toolbar_decoration"><tr></tr></table>' +
  '</td><td class="gb_toolbar_col_l1 gb_title_zone"></td><td class="gb_toolbar_col_l1">' +
  '<table class="gb_toolbar_right gb_toolbar_decoration"><tbody><tr></tr></tbody></table>' +
  '</td></tr></tbody></table><div class="gb_toolbar_bottom_border">&nbsp;</div>';
var gb_FooterTemplate = '<div class="gb_footer_sep"></div><table class="gb_footer"><tbody><tr><td class="gb_footer_left_resize"></td><td class="gb_footer_body"><div></div></td><td class="gb_footer_right_resize"></td></tr></tbody></table>';
var gb_BodyTemplate = '<div class="gb_body_wrapper gb_mw"><div class="gb_body"></div></div>';
var gb_BodyFrameTemplate = '<div class="inner_wrap_outer"><div class="inner_wrap_inner"><div class="gb_body"></div></div></div>';
var gb_BoxTemplateInner = '<div class="gb_wrapper"><table class="gb_table"><thead><tr><td class="gb_table_col_l1" style="vertical-align:top;">' + gb_ToolbarTemplate + '</td></tr></thead><tbody><tr><td class="gb_table_col_l1">' + gb_BodyTemplate + '</td></tr></tbody><tfoot class="gb_table_tfoot"><tr><td class="gb_table_col_l1">' + gb_FooterTemplate + '</td></tr></tfoot></table></div>';
var gb_BoxIFrameBody = '<div class="loading_wrap_outer"><div class="loading_wrap_inner">' + gb_LoadingBody + '</div></div><div class="iframe_container inner_wrap_outer"><div class="inner_wrap_inner"><iframe class="gb_iframe" frameborder="0" marginheight="0" marginwidth="0" src="javascript:\'<html></html>\'"></iframe></div></div><div class="clear"></div>';;
/*! RESOURCE: /scripts/classes/ui/GlideOverlay.js */
var GlideOverlay = Class.create(GlideBox, {
  initialize: function($super, options) {
    var opts = Object.extend({
      closeOnEscape: true,
      isModal: true,
      id: typeof options == 'string' ? options : guid()
    }, options || {});
    opts.boxClass = [options.boxClass || '', 'glide_overlay'].join(' ');
    $super(opts);
    GlideOverlay.showMask();
    this.getBoxElement().observe('click', function(event) {
      event.stopPropagation();
      CustomEvent.fire(GlideEvent.WINDOW_CLICKED, event, window);
    });
    this.closeOnEscape(this.options.closeOnEscape);
  },
  isModal: function(b) {
    return this.options.isModal;
  },
  closeOnEscape: function(b) {
    if (!b && this._escapeCloseHandler) {
      $(document).stopObserving('keydown', this._escapeCloseHandler);
    } else if (b && !this._escapeCloseHandler) {
      this._escapeCloseHandler = function(event) {
        if (event.keyCode === Event.KEY_ESC)
          this.close();
      }.bind(this);
      $(document).observe('keydown', this._escapeCloseHandler);
    }
  },
  close: function($super, options) {
    if (this._isClosing === true)
      return;
    if (this._escapeCloseHandler) {
      $(document).stopObserving('keydown', this._escapeCloseHandler);
      this._escapeCloseHandler = null;
    }
    var opts = {
      timeout: this.options.fadeOutTime,
      closeMask: true
    };
    if (typeof options == 'number')
      opts.timeout = options;
    else
      Object.extend(opts, options || {});
    var mask = $('glide_expose_mask');
    if (this.isModal() && mask && opts.closeMask === true) {
      if (opts.timeout !== 0)
        mask.fadeOut(opts.timeout, function() {
          this.remove();
        });
      else
        mask.remove();
    }
    $super(opts.timeout);
  },
  toString: function() {
    return 'GlideOverlay';
  }
});
GlideOverlay.get = function(objIdOrElem) {
  if (objIdOrElem)
    return GlideBox.get(objIdOrElem);
  for (var i in g_glideBoxes) {
    var box = g_glideBoxes[i];
    if (box.toString() == 'GlideOverlay')
      return box;
  }
}
GlideOverlay.close = function(objIdOrElem, options) {
  if (objIdOrElem)
    return GlideBox.close(objIdOrElem, options);
  for (var i in g_glideBoxes) {
    var box = g_glideBoxes[i];
    if (box.toString() == 'GlideOverlay')
      return box.close(options);
  }
}
GlideOverlay.showMask = function() {
  if ($('grayBackground'))
    return;
  var mask = $('glide_expose_mask');
  if (!mask) {
    mask = $(document.createElement('div'));
    mask.id = 'glide_expose_mask';
    mask.className = 'glide_mask';
    document.body.appendChild(mask);
    mask.observe('click', function(event) {
      event.stopPropagation();
      CustomEvent.fire(GlideEvent.WINDOW_CLICKED, event, window);
    });
  }
  mask.show();
  return mask;
}
GlideOverlay.hideMask = function(boolRemove) {
  var mask = $('glide_expose_mask');
  if (mask)
    mask[boolRemove === true ? 'remove' : 'hide']();
};
/*! RESOURCE: /scripts/classes/GwtPollDialog.js */
var GwtPollDialog = Class.create(GlideDialogWindow, {
  initialize: function(tableName, query, rows, view, action, fields, excel_type) {
    GlideDialogWindow.prototype.initialize.call(this, 'export_poll_dialog');
    var keys = ["Export in Progress", "Export Complete", "Export Canceled", "Export failed", "Internal error", "Finished Export. Exported {0} of {1} rows"];
    this.msgs = getMessages(keys);
    this.tableName = tableName;
    this.query = query;
    this.rows = rows;
    this.view = view;
    this.action = action;
    this.fields = fields;
    this.excel_type = excel_type;
    this.setPreference('table', 'export_poll');
    var q = this.query.replace(/&/g, "@99@");
    this.setPreference('sysparm_query', q);
    this.setPreference('sysparm_target', this.tableName);
    this.setPreference('sysparm_export', this.action);
    this.setPreference('sysparm_view', this.view);
    this.setPreference('sysparm_rows', this.rows);
    this.setPreference('sysparm_fields', this.fields);
    this.setPreference('sysparm_excel_type', this.excel_type);
    this.pollInterval = 1000;
    this.jobId = null;
    this.timerId = null;
    g_poll_dialog = this;
  },
  execute: function() {
    this.render();
  },
  close: function() {
    g_poll_dialog = null;
    this.destroy();
  },
  cancelJob: function() {
    var postString = "job_id=" + this.jobId + "&sys_action=cancel";
    this._makeRequest(postString, function() {
      clearTimeout(this.timerId);
    }.bind(this))
    this.close();
  },
  startPolling: function() {
    this.setTitle(this.msgs["Export in Progress"]);
    var poll_form = $('sys_poll.do');
    if (poll_form) {
      poll_form.sys_action.value = "init";
      if (poll_form.sysparm_query && poll_form.sysparm_query.value)
        poll_form.sysparm_query.value = poll_form.sysparm_query.value.replace(/@99@/g, "&");
      var serial = Form.serialize(poll_form);
      this._makeRequest(serial, this.ackInit.bind(this));
    }
  },
  ackInit: function(response) {
    this.jobId = response.responseText;
    this._queuePoll();
  },
  ack: function(response) {
    if (this._isDestroyed())
      return;
    var answer = response.responseText;
    if (answer.indexOf('complete') == 0) {
      var splits = answer.split(',');
      var id = splits[1];
      $('completed_sys_id').value = id;
      $('poll_text').innerHTML = this.msgs["Export Complete"];
      var download = $('download_button');
      download.setAttribute('class', 'web');
      download.setAttribute('className', 'web');
      download.disabled = false;
      $('poll_img').hide();
      $('export_complete').show();
      this.setTitle(this.msgs["Export Complete"]);
      var isAdmin = $('is_admin').value;
      if (this.action.indexOf('unload_') == 0 && isAdmin == "true") {
        var gr = new GlideRecord("sys_poll");
        gr.addQuery("job_id", this.jobId);
        gr.query(this._showExportStatusMsg.bind(this));
      }
      return;
    } else if (answer.indexOf('error') == 0) {
      this.setTitle(this.msgs["Export failed"]);
      var splits = answer.split(',');
      if (splits.length > 1)
        $('err_text').innerHTML = splits[1];
      $('poll_img').hide();
      $('export_failed').show();
      $('download_button').hide();
      $('cancel_button').hide();
      $('ok_button').show();
      return;
    } else {
      $('poll_img').show();
    }
    if (answer.indexOf('cancelled') == 0) {
      $('poll_img').hide();
      $('export_canceled').show();
      $('download_button').hide();
      $('retry_button').show();
      var answerParts = answer.split(',');
      $('poll_text').innerHTML = answerParts[1];
      this.setTitle(this.msgs['Export Canceled']);
    } else if (answer.indexOf('initial') != 0) {
      $('poll_text').innerHTML = answer;
      $('retry_button').hide();
      $('download_button').show();
      $('export_canceled').hide();
      this._queuePoll.call(this);
    }
  },
  _showExportStatusMsg: function(gRecord) {
    if (gRecord.next()) {
      maxRows = gRecord.getValue('max');
      if (this.rows > maxRows) {
        $('poll_text_export_status').innerHTML = formatMessage(this.msgs['Finished Export. Exported {0} of {1} rows'], maxRows, this.rows);
        $('poll_text_wiki').show();
      }
    }
  },
  _queuePoll: function() {
    this.timerId = setTimeout(this.poll.bind(this), this.pollInterval);
  },
  poll: function() {
    if (this.jobId) {
      var postString = "job_id=" + this.jobId + "&sys_action=poll";
      this._makeRequest(postString, this.ack.bind(this));
    }
  },
  _makeRequest: function(postString, callback) {
    var ga = new GlideAjax('poll_processor', 'poll_processor.do');
    ga.setQueryString(postString);
    ga.getXML(callback);
  },
  getResult: function() {
    var id = $('completed_sys_id').value;
    top.window.location = "sys_attachment.do?sys_id=" + id;
    this.close();
  },
  _isDestroyed: function() {
    if ($('poll_text') == null)
      g_poll_dialog = null;
    return g_poll_dialog == null;
  }
});;
/*! RESOURCE: /scripts/classes/GwtExportScheduleDialog.js */
var GwtExportScheduleDialog = Class.create(GlideDialogWindow, {
  initialize: function(tableName, query, rows, view, action, fields, excel_type) {
    GlideDialogWindow.prototype.initialize.call(this, 'export_schedule_dialog');
    var keys = ["Please Confirm", "Please specify an address", "Export will be emailed to"];
    this.msgs = getMessages(keys);
    this.tableName = tableName;
    this.query = query;
    this.rows = rows;
    this.view = view;
    this.action = action;
    this.fields = fields;
    this.excel_type = excel_type;
    this.setPreference('table', 'export_schedule');
    this.setPreference('sysparm_query', this.query);
    this.setPreference('sysparm_target', this.tableName);
    this.setPreference('sysparm_export', this.action);
    this.setPreference('sysparm_view', this.view);
    this.setPreference('sysparm_rows', this.rows);
    this.setPreference('sysparm_fields', this.fields);
    this.setPreference('sysparm_excel_type', this.excel_type);
    this.setTitle(this.msgs["Please Confirm"]);
    g_export_schedule_dialog = this;
  },
  execute: function() {
    this.render();
  },
  close: function() {
    g_export_schedule_dialog = null;
    this.destroy();
  },
  emailMe: function() {
    var address = gel('display_address');
    if (!address)
      return;
    if (address.value == '') {
      alert(this.msgs["Please specify an address"]);
      return;
    }
    var real_address = gel('email_address');
    real_address.value = address.value;
    var splits = this.action.split('\_');
    var fName = 'sys_confirm_' + splits[1] + '.do';
    var confirm_form = gel(fName);
    confirm_form.sys_action.value = "email";
    var remember_me = gel('display_remember_me');
    if (remember_me.checked)
      gel('remember_me').value = "true";
    var serial = Form.serialize(confirm_form);
    var args = this.msgs["Export will be emailed to"] + ' ' + address.value;
    serverRequestPost(fName, serial, this.ack, args);
    this.close();
  },
  waitForIt: function() {
    var dialog = new GwtPollDialog(this.tableName, this.query, this.rows, this.view, this.action, this.fields, this.excel_type);
    dialog.execute();
    this.close();
  },
  ack: function(request, message) {
    alert(message);
  }
});;
/*! RESOURCE: /scripts/classes/TemplateRecord.js */
function applyTemplate(sysID) {
  var t = new TemplateRecord(sysID);
  t.apply();
}
var TemplateRecord = Class.create({
  NAME: "name",
  VALUE: "value",
  ITEM: "item",
  DEPENDENT: "dependent",
  initialize: function(sysID) {
    this.sysID = sysID;
  },
  apply: function() {
    var ga = new GlideAjax('AjaxClientHelper');
    ga.addParam('sysparm_name', 'getValues');
    ga.addParam('sysparm_sys_id', this.sysID);
    ga.getXML(this._applyResponse.bind(this));
  },
  _applyResponse: function(response) {
    if (!response || !response.responseXML)
      return;
    this.template = response.responseXML;
    this.applyRecord();
  },
  applyRecord: function() {
    var items = this.template.getElementsByTagName(this.ITEM);
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var name = item.getAttribute(this.NAME);
      var e = g_form.getGlideUIElement(name);
      if (e && (e.getType() == "currency" || e.getType() == "price")) {
        if (e.getChildElementById(e.getID() + ".display")) {
          name += ".display";
        }
      }
      var widget = g_form.getControl(name);
      if (!widget) {
        continue;
      }
      if (g_form.isTemplateCompatible(e, widget) && !g_form.isReadOnly(e, widget))
        this.applyItem(name, item.getAttribute(this.VALUE));
    }
  },
  applyItem: function(element, value) {
    if (value == null || value == 'null')
      return;
    g_form.setTemplateValue(element, value);
  }
});
TemplateRecord.save = function(id) {
  var fields = g_form.getEditableFields();
  var f = g_form.getFormElement();
  addHidden(f, 'sysparm_template_editable', fields.join());
  gsftSubmit(id);
};
/*! RESOURCE: /scripts/popups.js */
var popupCurrent = null;
var lastMouseX;
var lastMouseY;
if (window.opener && !window.opener.closed && window.opener != window.self) {
  Event.observe(window, 'beforeunload', function() {
    if (window.opener && !window.opener.closed && window.opener.popupCurrent && window.opener.popupCurrent == window.self)
      window.opener.popupCurrent = null;
  });
}

function popupClose() {
  if (!popupCurrent)
    return;
  try {
    if (!popupCurrent.closed)
      popupCurrent.close();
  } catch (e) {}
  popupCurrent = null;
}

function mousePositionSave(e) {
  if (navigator.appName.indexOf("Microsoft") != -1)
    e = window.event;
  lastMouseX = e.screenX;
  lastMouseY = e.screenY;
}

function imageListOpen(elementName, img_dirs, ignore, name) {
  var url = new GlideURL("image_picker.do");
  url.addParam("sysparm_element", elementName);
  url.addParam("sysparm_img_dirs", img_dirs);
  url.addParam("sysparm_ignore", ignore);
  url.addParam("sysparm_name", name || "");
  popupOpenStandard(url.getURL(), "imagepicker");
}

function imageBrowseOpen(elementName, directory, name, color, icon) {
  if (!color)
    color = "color-normal";
  var url = new GlideURL("icon_browse.do");
  url.addParam("sysparm_dir", directory);
  url.addParam("sysparm_name", name || "");
  url.addParam("sysparm_element", elementName);
  url.addParam("sysparm_color", color);
  url.addParam("sysparm_icon", icon);
  popupOpenStandard(url.getURL(), "imagepicker");
}
var g_IconBrowseHelpers = {
  getIconColor: function() {
    var spanElem = jQuery("span.bookmark_image");
    if (spanElem.length) {
      var color = jQuery.grep(spanElem.prop('class').split(" "), function(v) {
        return v.indexOf('color-') === 0;
      });
      return color.length ? color[0] : '';
    }
  },
  getIcon: function() {
    var spanElem = jQuery("span.bookmark_image");
    if (spanElem.length) {
      var fontIcon = jQuery.grep(spanElem.prop('class').split(" "), function(v) {
        return v.indexOf('icon-') === 0;
      });
      return fontIcon.length ? fontIcon[0] : '';
    }
  }
};

function imagePickedCustomEvent(options) {
  CustomEvent.fire('glide:image_picked', options);
}

function imageListPick(elementName, value) {
  var element = document.getElementById(elementName);
  if (element.nodeName == "IMG" || element.nodeName == "INPUT") {
    var imgel = document.getElementById("img." + elementName);
    element.value = value;
    if (element['onchange'])
      element.onchange();
    if (imgel != null) {
      if (value && value.length > 0)
        imgel.src = value;
      else
        imgel.src = "images/s.gifx";
    }
  } else {
    element.className = "";
    element.className = "image-browse-icon " + value;
  }
  popupClose();
  return false;
}

function reflistOpen(target, elementName, refTableName, dependent, useQBE, refQualElements, additionalQual, parentID, forceReference) {
  var url = reflistOpenUrl(target, target, elementName, refTableName, dependent, useQBE, refQualElements, additionalQual, parentID, forceReference);
  popupOpenStandard(url, "lookup");
}

function reflistOpenUrl(target, targetElementID, elementName, refTableName, dependent, useQBE, refQualElements, additionalQual, parentID, forceReference) {
  var url;
  if (useQBE == 'true')
    url = new GlideURL(refTableName + '_search.do');
  else
    url = new GlideURL(refTableName + '_list.do');
  url.addParam("sysparm_target", target);
  var et = gel(targetElementID);
  if (et)
    url.addParam("sysparm_target_value", et.value);
  var dspEl = gel("sys_display." + targetElementID);
  if (dspEl && !et.value)
    url.addParam("sysparm_reference_value", dspEl.value);
  url.addParam("sysparm_nameofstack", "reflist");
  url.addParam("sysparm_clear_stack", "true");
  url.addParam("sysparm_element", elementName);
  url.addParam("sysparm_reference", refTableName);
  url.addParam("sysparm_view", "sys_ref_list");
  url.addParam("sysparm_additional_qual", additionalQual);
  if (parentID != null && parentID != '')
    url.addParam("sysparm_parent_id", parentID);
  if (forceReference)
    url.addParam("sysparm_force_ref", "true");
  var v = getDependentValue(target, dependent);
  if (v != null)
    url.addParam("sysparm_dependent", v);
  var refQual = getRefQualURI(target, refQualElements);
  return url.getURL() + refQual;
}

function emailClientOpen(e, table, row, rows) {
  var query = e.getAttribute("query");
  var addOn = '&sysparm_record_row=' + row + '&sysparm_record_rows=' + rows + '&sysparm_record_list=' + encodeURIComponent(query);
  emailClientOpenPop(table, false, null, null, addOn);
}

function showPopupLiveFeedList(sysId, table) {
  var box = GlideBox.get('showLiveFeed');
  if (box)
    box.close(0);
  var iframe_src = 'show_live_feed.do?sysparm_stack=no&sysparm_sys_id=' + sysId + '&sysparm_table=' + table;
  box = new GlideBox({
    id: 'showLiveFeed',
    iframe: iframe_src,
    width: 600,
    height: "95%",
    title: "Live Feed",
    noTitle: true
  });
  box.render();
  var g_feedResizer;
  Event.observe(window, 'resize', function() {
    g_feedResizer = setTimeout(function() {
      box.autoPosition();
      box.autoDimension();
    }, 50);
  });
}

function emailClientOpenPop(table, immediate, replyType, replyID, addOn) {
  var id = document.getElementsByName("sys_uniqueValue")[0];
  if (!id)
    return;
  var url = new GlideURL("email_client.do");
  url.addParam("sysparm_table", table);
  url.addParam("sysparm_sys_id", id.value);
  url.addParam("sysparm_target", table);
  if (replyType != null) {
    url.addParam("replytype", replyType);
    url.addParam("replyid", replyID);
  }
  popupOpenEmailClient(url.getURL() + g_form.serializeChangedAll());
}

function reflistPick(elementName, value, display) {
  "use strict";
  var listName = "select_0" + elementName;
  var list = $(listName);
  if (list) {
    addGlideListChoice(listName, value, display, true);
    popupClose();
    return false;
  }
  if (gel("sys_display.LIST_EDIT_" + elementName))
    elementName = "LIST_EDIT_" + elementName;
  var element = $("sys_display." + elementName);
  if (element && element.onRefPick)
    element.onRefPick(element);
  if (element && element.ac && typeof(element.ac.referenceSelect) == "function") {
    element.ac.referenceSelectTimeout(value, display);
    popupClose();
    return;
  }
  var elementActual = $(elementName);
  elementActual.value = value;
  element = $("sys_display." + elementName);
  element.value = display;
  if (typeof(elementActual.onchange) == "function")
    elementActual.onchange();
  if (typeof(element.onchange) == "function")
    element.onchange();
  var eDep = element;
  var itemName = eDep.getAttribute("function");
  if (itemName != null) {
    eval(itemName);
  }
  element = document.getElementsByName("sys_select." + elementName)[0];
  if (element != null) {
    var options = element.options;
    var optionFound = false;
    for (var i = 0; i < options.length; i++) {
      var option = options[i];
      option.selected = false;
      var o = option.value;
      if (o == value) {
        option.selected = true;
        optionFound = true;
      }
    }
    if (!optionFound) {
      element.selectedIndex = -1;
      var opt = document.createElement("option");
      opt.value = value;
      opt.appendChild(document.createTextNode(display));
      opt.selected = true;
      element.appendChild(opt);
      var options = element.options;
      element.selectedIndex = options.length - 1;
      element.disabled = true;
      element.disabled = false;
    }
    element.onchange();
  } else {
    var fcs = "updateRelatedGivenNameAndValue('" + elementName + "','" + value + "');";
    setTimeout(fcs, 0);
  }
  popupClose();
  return false;
}

function picklistOpen(baseURL, width, modified, searchParam, target, dependent) {
  if (modified == '1')
    baseURL = baseURL + searchParam;
  baseURL += getDependent(target, dependent);
  popupOpenStandard(baseURL, "lookup");
}

function getDependent(target, dependent) {
  var value = getDependentValue(target, dependent);
  if (value == null)
    return "";
  return "&sysparm_dependent=" + encodeURIComponent(value);
}

function getDependentValue(target, dependent) {
  if (dependent == null)
    return null;
  var table = target.split('.')[0];
  var tfield = dependent.split(',')[0];
  var elname = table + '.' + tfield;
  if (tfield == 'sys_id') {
    tfield = 'sys_uniquevalue';
    elname = 'sys_uniquevalue';
  }
  var el = document.getElementsByName(elname)[0];
  if (el == null)
    return null;
  var selectValue = "";
  if (el.tagName == "INPUT")
    var selectValue = el.value;
  else
    selectValue = el.options[el.selectedIndex].value;
  return selectValue;
}

function getRefQualURI(target, refQualElements) {
  if (!refQualElements || typeof g_form == "undefined")
    return "";
  var aj = new GlideAjax("FormStateAjax");
  aj.addEncodedString(g_form.serialize());
  aj.getXMLWait();
  return "&sysparm_client_record=session";
}

function picklistPick(elementName, value) {
  var element = document.getElementsByName(elementName)[0];
  element.value = value;
  if (element["onchange"]) {
    element.onchange();
  }
  element.value = replaceRegEx(element.value, document, elementName);
  popupClose();
  return false;
}

function popupOpenStandard(url, name) {
  var width = document.documentElement.getAttribute('data-doctype') == 'true' ? 800 : 700;
  var height = 480;
  var features = "width=" + width + ",height=" + height + ",toolbar=no,status=no,directories=no,menubar=no,resizable=yes,scrollbars=1";
  popupOpen(url, name, width, height, features, true);
}

function popupOpenEmailClient(url) {
  var width = 875;
  var height = 575;
  var features = "width=" + width + ",height=" + height + ",toolbar=no,status=no,directories=no,menubar=no,resizable=yes,scrollbars=1";
  popupOpenFocus(url, "Email_Client", width, height, features, false, false);
}

function popupOpen(url, name, pWidth, pHeight, features, snapToLastMousePosition) {
  popupOpenFocus(url, name, pWidth, pHeight, features, snapToLastMousePosition, true);
}

function popupOpenFocus(url, name, pWidth, pHeight, features, snapToLastMousePosition, closeOnLoseFocus) {
  popupClose();
  if (url.indexOf("?") != -1)
    url += "&";
  else
    url += "?";
  url += "sysparm_domain_restore=false";
  var domain = gel("sysparm_domain");
  if (domain)
    url += "&sysparm_domain=" + domain.value;
  if (url.indexOf("sysparm_nameofstack") == -1)
    url += "&sysparm_stack=no";
  if (snapToLastMousePosition) {
    if (lastMouseX - pWidth < 0) {
      lastMouseX = pWidth;
    }
    if (lastMouseY + pHeight > screen.height) {
      lastMouseY -= (lastMouseY + pHeight + 50) - screen.height;
    }
    lastMouseX -= pWidth;
    lastMouseY += 10;
    features += ",screenX=" + lastMouseX + ",left=" + lastMouseX + ",screenY=" + lastMouseY + ",top=" + lastMouseY;
  }
  if (closeOnLoseFocus) {
    popupCurrent = window.open(url, name, features, false);
    if (!popupCurrent) {
      alert('Please disable your popup blocker to use this feature');
      return null;
    } else {
      popupCurrent.focus();
      popupCurrent.opener = window.self;
      return popupCurrent;
    }
  } else {
    popupCurrent = null;
    var win = window.open(url, name, features, false);
    if (win) {
      win.focus();
      win.opener = window.self;
    }
    return win;
  }
}

function xmlView(ref, id) {
  var mytable = ref.split('.')[0];
  var myfield = ref.substring(mytable.length + 1);
  var w = 700;
  var h = 500;
  var url = new GlideURL(mytable + ".do");
  url.addParam("sys_id", id);
  url.addParam("sys_target", myfield);
  url.addParam("XML", "");
  popupOpen(url.getURL(), "xmlview", w, h,
    "width=" + w + ",height=" + h + ",toolbar=no,status=no,directories=no,menubar=no,resizable=yes,scrollbars=1");
}

function htmlView(ref, id) {
  var mytable = ref.split('.')[0];
  var myfield = ref.split('.')[1];
  var w = 1000;
  var h = 500;
  var url = new GlideURL("diff_html_page.do");
  url.addParam("sysparm_id", id);
  url.addParam("sysparm_table", mytable);
  popupOpen(url.getURL(), "htmlview", w, h,
    "width=" + w + ",height=" + h + ",toolbar=no,status=no,directories=no,menubar=no,resizable=yes,scrollbars=1");
}

function tearOffReference(table, fieldName, view, navigate, refKey) {
  var widget = gel(fieldName);
  if (widget == null) {
    alert('Tear off called for a non existent reference field');
    return false;
  }
  var sys_id = widget.value;
  if (sys_id == null || sys_id == '') {
    alert('Please select a reference before trying to tear it off');
    return false;
  }
  tearOff(table, sys_id, view, navigate, refKey);
}

function tearOff(table, sys_id, view, navigate, refKey) {
  var key = sys_id;
  var url = new GlideURL(table + '.do');
  url.addParam("sys_id", key);
  url.addParam("sysparm_view", view);
  url.addParam("sysparm_stack", "no");
  url.addParam("sysparm_referring_url", "tear_off");
  if (refKey)
    url.addParam("sysparm_refkey", refKey);
  window.open(url.getURL(), "",
    "toolbar=no,menubar=no,personalbar=no,width=800,height=600," +
    "scrollbars=yes,resizable=yes");
  if (navigate) {
    gsftSubmit(document.getElementById('sysverb_back'));
  }
}

function tearOffAttachment(sys_id) {
  var url = new GlideURL("sys_attachment.do");
  url.addParam("sysparm_referring_url", "tear_off");
  url.addParam("view", "true");
  url.addParam("sys_id", sys_id);
  window.open(url.getURL(), sys_id,
    "toolbar=no,menubar=no,personalbar=no,width=800,height=600," +
    "scrollbars=yes,resizable=yes");
};
/*! RESOURCE: /scripts/doctype/condition14_new.js */
NOW.msg = new GwtMessage();
NOW.c14 = (function() {
  "use strict";
  return {
    setup: function(name) {
      name = name || firstTable;
      if (!name) {
        alert("Choose a table before adding filters");
        return false;
      }
      g_current_table = name;
      columns = queueColumns[name];
      if (!columns) {
        var tname = (name.split("."))[0];
        columns = queueColumns[tname];
        if (!columns) {
          columnsGet(name, setup);
          columns = queueColumns[tname];
          if (columns == null)
            return false;
        }
      }
      currentTable = name;
      return true;
    },
    shouldShowDynamicReferenceOperator: function(type, elementDef, tableNameFull) {
      if (type != "reference" && type != "string" && type != "journal_input")
        return false;
      if (!window.g_dynamic_filter_options)
        return false;
      var table = elementDef.getReference();
      var gotOne = false;
      var arr = g_dynamic_filter_options.split("##");
      for (var i = 0; i < arr.length; i++) {
        var aItem = arr[i];
        if (aItem.length == 0)
          continue;
        var aItemArr = aItem.split("::");
        if (aItemArr.length < 3)
          continue;
        var contextTableName = tableNameFull.split(".")[1];
        var isExclusive = typeof gtf_exclusive_dynamics != 'undefined' && gtf_exclusive_dynamics == 'true';
        if (!isExclusive && table == aItemArr[2] || contextTableName == aItemArr[3]) {
          gotOne = true;
          break;
        }
      }
      return gotOne;
    },
    enterKey: function(event) {
      if (event.keyCode == 13 || event.keyCode == 3) {
        var timeout;
        if (slushbucketDOMcheck()) {
          var elem = Event.element(getEvent(event)).up(".list_name");
          if (elem && elem.getAttribute) {
            var name = elem.getAttribute("name");
            if (name)
              timeout = name + "acRequest();";
          }
          if (!timeout)
            timeout = "acRequest();";
        } else {
          var name = listDOMcheck(Event.element(getEvent(event)));
          if (name)
            timeout = "runFilter('" + name + "');";
        }
        if (timeout)
          setTimeout(timeout, 0);
        Event.stop(event);
        return false;
      }
      return true;
    },
    setShowRelated: function(fieldName, idx, name, select, filter) {
      if (fieldName == '...Show Related Fields...') {
        gotShowRelated = true;
        showRelated = 'yes';
        setPreference("filter.show_related", "yes");
      }
      if (fieldName == '...Remove Related Fields...') {
        gotShowRelated = true;
        showRelated = 'no';
        setPreference("filter.show_related", "no");
      }
      var f = fieldName.substring(0, idx);
      if (f != name)
        f = name + "." + f;
      f += ".";
      var filterMethod;
      if (filter && !filter.getUseVariables())
        filterMethod = filter.filterFields.bind(filter);
      addFirstLevelFields(select, f, '', filterMethod, fieldName);
      return f;
    },
    conditionColumnResponse: function(columns, tableName, mfunc) {
      decodeFilter(tableName);
      queueFilters[tableName] = null;
      if (typeof mfunc === "function")
        mfunc(tableName);
    }
  }
})();

function slushbucketDOMcheck() {
  var epObject;
  if (epObject = gel("ep")) {
    var tdArr = epObject.getElementsByTagName("TD");
    for (var tdArrIndex = 0; tdArrIndex < tdArr.length; tdArrIndex++) {
      if (tdArr[tdArrIndex].className == "slushbody")
        return true;
    }
  }
  return false;
}

function listDOMcheck(el) {
  while (el) {
    el = findParentByTag(el, "div");
    if (!el)
      return null;
    if (el.id.endsWith(MAIN_LAYER))
      return el.id.substring(0, el.id.length - MAIN_LAYER.length);
  }
  return null;
}

function setup(name) {
  return NOW.c14.setup(name);
}

function getThing(table, name) {
  var thing = gel(table + name);
  if (thing)
    return thing;
  thing = gel(name);
  if (thing)
    return thing;
  if (table != null) {
    var fperiod = table.indexOf(".");
    if (fperiod > 0) {
      table = table.substring(fperiod + 1);
      thing = gel(table + name);
    }
  }
  return thing;
}

function buildMap(values, position) {
  "use strict";
  var keys = [];
  values.forEach(function(thisOp) {
    var thisMsg = thisOp[position];
    keys.push(thisMsg);
  });
  return keys;
}

function _createFilterSelect(width, multi) {
  var s = cel('select');
  s.className = "filerTableSelect";
  s.title = getMessage("Choose Input");
  if (width)
    s.style.width = width + "px";
  if (multi) {
    s.multiple = true;
  } else {
    s.className = s.className + ' select2';
  }
  s.style.verticalAlign = "top";
  s.className += " form-control";
  return s;
}

function getTableReference(tableName, parentTable, isTemplate) {
  if (firstTable == '')
    firstTable = tableName;
  return Table.get(tableName, parentTable, isTemplate);
}

function allowConditionsForJournal(type, filter) {
  if (type != "journal" && type != "journal_input")
    return false;
  if (filter && filter.type == "GlideTemplateFilter" && filter.allowJournal)
    return true;
  if (!filter || filter.getUsageContext() != "element_conditions")
    return false;
  var ie = filter.getIncludeExtended();
  return !!ie["VALCHANGES"];
}

function updateFields(name, select, fOper, fValue, includeExtended, filter) {
  if (!NOW.c14.setup(name))
    return;
  var tableNameFull = name;
  name = currentTable;
  var o = getSelectedOption(select);
  var fieldName = o.value;
  name = name.split(".")[0];
  var idx = fieldName.indexOf("...");
  if (idx != -1)
    NOW.c14.setShowRelated(fieldName, idx, name, select, filter);
  name = currentTable = getTableFromOption(o);
  var options = select.options;
  for (var i = 0; i < options.length; i++) {
    var option = options[i];
    if (optionWasSelected(option)) {
      option.innerHTML = getNormalLabel(option);
      option.style.color = 'black';
      option.wasSelected = 'false';
      break;
    }
  }
  if (!NOW.c14.setup(name))
    return;
  var tr = select.parentNode.parentNode;
  o.normalLabel = o.innerHTML;
  o.innerHTML = getFullLabel(o);
  o.style.color = 'green';
  o.wasSelected = 'true';
  $(select).addClassName('filter_type');
  var $select = $j(select);
  if (!$select.data('select2'))
    $select.select2();
  buildFieldsPerType(name, tr, fieldName, fOper, fValue, includeExtended, tableNameFull, filter);
}

function columnsGet(mft, nu) {
  loadFilterTableReference(mft);
  NOW.c14.conditionColumnResponse(columns, mft, nu);
}

function optionWasSelected(option) {
  return option.wasSelected === 'true';
}

function getFullLabel(option) {
  return option.fullLabel || "";
}

function addOperators(td, type, dValue, isChoice, includeExtended, showDynamicReferenceOperator, filterClass, restrictI18NOpers) {
  var msg = NOW.msg;
  var s = _createFilterSelect("150");
  s.title = 'choose operator';
  if (td.parentNode.conditionObject)
    if (td.parentNode.conditionObject.isPlaceHolder())
      s.disabled = true;
  var opers;
  if (isChoice)
    opers = sysopers[type + "_choice"];
  var translated = type == 'translated_field' || type == 'translated_html' || type == 'translated_text';
  if (!opers && translated && restrictI18NOpers)
    opers = sysopers['translated_basic'];
  if (!opers && sysopers[type])
    opers = sysopers[type];
  if (type && type.indexOf(':') > 0) {
    var complexTypeArray = type.split(':');
    if (null != complexTypeArray[0])
      opers = sysopers[complexTypeArray[0]];
  }
  if (!opers)
    opers = sysopers['default'];
  if (noOps)
    dValue = '=';
  if (filterClass == "GlideTemplateFilter") {
    if (typeof gtfOperators != 'undefined' && gtfOperators.length != 0)
      opers = gtfOperators;
    else
      opers = sysopers_template['default'];
  }
  var keys = buildMap(opers, 1);
  map = msg.getMessages(keys);
  for (var ii = 0; ii < opers.length; ii++) {
    var opInfo = opers[ii];
    if (opInfo[0] == 'SINCE') {
      var base = new GlideRecord('cmdb_baseline');
      base.query();
      if (!base.hasNext())
        continue;
    }
    if (extopers[opInfo[0]] && !includeExtended[opInfo[0]])
      continue;
    if (opInfo[0] == "DYNAMIC" && !showDynamicReferenceOperator)
      continue;
    addOption(s, opInfo[0], map[opInfo[1]], dValue && opInfo[0] == dValue);
  }
  var so = getSelectedOption(s);
  if (dValue && (!so || so.value != dValue)) {
    addOption(s, dValue, msg.getMessage(dValue));
    s.selectedIndex = s.length - 1;
  }
  td.fieldType = "select";
  if (so)
    td.currentOper = getSelectedOption(s).value;
  td.subType = type;
  td.appendChild(s);
  return s;
}

function getTableFromOption(option) {
  return option.tableName || "";
}

function isFilterExtension(type) {
  return g_filter_extension_map[type] != undefined;
}

function initFilterExtension(type, tableName, elementDef) {
  var o = g_filter_extension_map[type];
  return o.call(this, tableName, elementDef);
}

function addTextInput(td, dValue, type) {
  var input = cel("input");
  if (type)
    input.type = type;
  if (td.parentNode.conditionObject)
    if (td.parentNode.conditionObject.isPlaceHolder())
      input.disabled = true;
  if (isMSIE) {
    input.onkeypress = function() {
      return NOW.c14.enterKey(event)
    }
  } else
    input.onkeypress = NOW.c14.enterKey;
  td.fieldType = "input";
  if (dValue)
    input.value = dValue;
  input.className = "filerTableInput form-control";
  input.title = 'input value';
  if (useTextareas) {
    input.style.width = "80%";
    input.style.resize = "vertical";
    input.maxlength = 80;
  }
  input.style.verticalAlign = "top";
  td.appendChild(input);
  return input;
}

function loadFilterTableReference(mft, isTemplate) {
  var tablepart = mft.split(".")[0];
  currentTable = mft;
  if (typeof g_filter_description != 'undefined')
    if (g_filter_description.getMainFilterTable() == null ||
      g_filter_description.getMainFilterTable() == "")
      g_filter_description.setMainFilterTable(mft);
  var tableDef = getTableReference(tablepart, null, isTemplate);
  var columns = tableDef.getColumns();
  queueColumns[mft] = columns;
  queueColumns[tablepart] = columns;
  return tableDef;
}

function decodeFilter(tableName) {
  currentTable = tableName;
  var query = queueFilters[tableName];
  queueFilters[tableName] = null;
  var fDiv = getThing(tableName, 'gcond_filters');
  if (query == null) {
    query = fDiv.initialQuery;
    if (query != null && fDiv.filterObject != null) {
      var fo = fDiv.filterObject;
      if (fo.isQueryProcessed())
        return;
    }
  }
  var runable = false;
  var defaultPH = true;
  var sync = false;
  var filter = fDiv.filterObject;
  if (filter) {
    if (filter.tableName == tableName && filter.query == query)
      return;
    runable = filter.isRunable();
    defaultPH = filter.defaultPlaceHolder;
    sync = filter.synchronous;
    filter.destroy();
  }
  new GlideFilter(tableName, query, null, runable, sync, function(filter) {
    filter.setDefaultPlaceHolder(defaultPH);
  });
}

function refreshFilter(name) {
  var fDiv = getThing(name, 'gcond_filters');
  var fQueries = fDiv.getElementsByTagName("tr");
  for (var i = 0; i < fQueries.length; i++) {
    var queryTR = fQueries[i];
    if (queryTR.queryPart != 'true')
      continue;
    var queryID = queryTR.queryID;
    var query = getThing(name, queryID);
    refreshQuery(query);
  }

  function refreshQuery(query) {
    var tableTRs = query.getElementsByTagName("tr");
    for (var i = 1; i < tableTRs.length; i++) {
      var tr = tableTRs[i];
      if (!tr)
        continue;
      if (tr.basePart != 'true')
        continue;
      var fieldValue = tr.tdValue;
      refreshSelect(tr, fieldValue);
    }
  }

  function refreshSelect(tr, td) {
    if (typeof td == 'undefined')
      return;
    var fType = td.fieldType ? td.fieldType : "select";
    var tags = td.getElementsByTagName(fType);
    if (tags == null || tags.length == 0)
      return;
    var field = tags[0];
    if (fType == "select") {
      if (field.multiple == true) {
        var choices = field.choices;
        choicesGet(tr.tableField, field, choices);
      }
    }
  }
}

function getNormalLabel(option) {
  return option.normalLabel || ""
}

function getFilter(name, doEscape) {
  var fullFilter = "";
  orderBy = "";
  var spanName = ".encoded_query";
  var fSpan = getThing(name, spanName);
  if (fSpan)
    return fSpan.innerHTML;
  var divName = "gcond_filters";
  if (fDiv)
    divName = fDiv + divName;
  var fDiv = getThing(name, divName);
  if (!fDiv)
    return "";
  if ('gcond_filters' == divName)
    addOrderBy();
  var fQueries = fDiv.getElementsByTagName("tr");
  for (var i = 0; i < fQueries.length; i++) {
    var queryTR = fQueries[i];
    if (queryTR.queryPart != 'true')
      continue;
    var queryID = queryTR.queryID;
    var query = getThing(name, queryID);
    filter = "";
    var queryString = getQueryString(query);
    if (fullFilter.length > 0 && queryString.length > 0)
      fullFilter += "^NQ";
    fullFilter = fullFilter + queryString;
  }
  if (fullFilter.length > 0)
    fullFilter += "^EQ";
  fullFilter += orderBy;
  filter = fullFilter;
  if (doEscape)
    filter = encodeURIComponent(filter);
  return filter;

  function addOrderBy() {
    'use strict';
    var fDiv = $('gcond_sort_order');
    if (!fDiv)
      return;
    var fQueries = fDiv.getElementsByTagName("tr");
    for (var i = 0; i < fQueries.length; i++) {
      var queryTR = fQueries[i];
      if (queryTR.queryPart != 'true')
        continue;
      var queryID = queryTR.queryID;
      var query = getThing(name, queryID);
      if (!query)
        continue;
      getQueryString(query);
    }
  }
}

function getQueryString(query) {
  var tableTRs = query.getElementsByTagName("tr");
  for (var i = 0; i < tableTRs.length; i++) {
    var tr = tableTRs[i];
    if (!tr)
      continue;
    if (tr.basePart != 'true')
      continue;
    getQueryForTR(tr);
  }
  return filter;
}

function getQueryForTR(trItem) {
  "use strict";
  var trs = trItem.getElementsByTagName("tr");
  for (var i = 0; i < trs.length; i++) {
    var tr = trs[i];
    var field = getTDFieldValue(tr.tdField);
    if (field == PLACEHOLDER || !tr.operSel)
      continue;
    var oper = getSelectedOption(tr.operSel).value;
    if (!tr.sortSpec && !tr.aggSpec) {
      var filterPart = getTRFilter(tr, field, oper);
      if (filter.length > 0)
        filter += "^";
      if (tr.gotoPart)
        filter += "GOTO";
      if (i != 0)
        filter += "OR";
      filter += filterPart;
      var ips = tr.getElementsByTagName("input");
      for (var ti = 0; ti < ips.length; ti++) {
        var iput = ips[ti];
        if (iput.type == "hidden" && iput.name == "subcon") {
          filter += "^" + iput.jop + iput.field + iput.oper +
            iput.value;
        }
      }
    } else if (!tr.aggSpec) {
      if (oper == 'ascending')
        orderBy += "^" + "ORDERBY" + field;
      else if (oper == 'descending')
        orderBy += "^" + "ORDERBYDESC" + field;
    }
  }

  function getTDFieldValue(td) {
    if (!td) {
      return;
    }
    var fType = td.fieldType || "select";
    var field = td.getElementsByTagName(fType)[0];
    if (fType != "select")
      return field.value;
    var options = field.options;
    if (!field.multiple)
      return options[field.selectedIndex].value;
    var retVal = [];
    for (var i = 0; i < options.length; i++) {
      if (options[i].selected)
        retVal[retVal.length] = options[i].value;
    }
    return retVal.join(",");
  }

  function getTRFilter(tr, field, oper) {
    if (tr.handler) {
      var answer = tr.handler.getFilterText(oper);
      if (answer != '')
        return answer;
      var val = tr.handler.getValues();
      if (oper == 'SINCE')
        oper = '>';
    }
    return field + oper + escapeEmbeddedQueryTermSeparator(val);
  }

  function escapeEmbeddedQueryTermSeparator(val) {
    return val.replace(/(\w)\^(\w)/g, "$1^^$2");
  }
}

function deleteFilterByID(tablename, id) {
  var td = getThing(tablename, id);
  deleteTD(tablename, td);
  _frameChanged();

  function deleteTD(tableName, butTD) {
    var butTR = butTD.parentNode;
    var orTR = butTR.previousSibling;
    if (butTR.conditionObject)
      butTR.conditionObject.remove();
    else {
      var parent = butTR.parentNode;
      if (parent.conditionObject) {
        parent.conditionObject.remove();
      }
    }
    if (orTR && $(orTR).hasClassName('orRow')) {
      orTR.remove();
    }
  }
}

function buildFieldsPerType(tableName, tr, descriptorName, fOper, fValue, includeExtended, tableNameFull, filter) {
  var filterClass = filter.type;
  var isTemplate = filter.isTemplate;
  var tableName = tableName.split(".")[0];
  var tableDef = getTableReference(tableName, null, isTemplate);
  if (!tableDef)
    return;
  var supportsMapping = false;
  if (filter) {
    supportsMapping = filter.elementSupportsMapping;
  }
  var type;
  var multi;
  var isChoice;
  var restrictI18NOpers;
  var msg = NOW.msg;
  var usingEnglish = g_lang == 'en';
  var parts = descriptorName.split('.');
  descriptorName = parts[parts.length - 1];
  var elementDef = tableDef.getElement(descriptorName);
  if (elementDef == null && tableDef.glide_var)
    elementDef = tableDef.getElement(parts[parts.length - 2] + "." + parts[parts.length - 1]);
  if (elementDef == null) {
    if (descriptorName != TEXTQUERY && descriptorName != PLACEHOLDER)
      return;
    if (descriptorName == TEXTQUERY) {
      type = 'keyword';
      multi = true;
      isChoice = false;
    } else {
      type = 'placeholder';
      multi = false;
      isChoice = false;
      fValue = msg.getMessage('-- value --');
    }
  } else {
    type = elementDef.getType();
    multi = elementDef.getMulti();
    isChoice = elementDef.isChoice();
    restrictI18NOpers = !usingEnglish && !elementDef.canSortI18N();
    if (!elementDef.getBooleanAttribute("canmatch")) {
      if (type != "variables" && type != "related_tags")
        type = "string_clob";
    } else if (elementDef.isEdgeEncrypted())
      type = elementDef.canSort() ? "edgeEncryptionOrder" : "edgeEncryptionEq";
  }
  var tdOperator = tr.tdOper;
  var tdValue = tr.tdValue;
  tr.varType = type;
  tr.gotoPart = gotoPart;
  if (tr.handler)
    tr.handler.destroy();
  tr.handler = null;
  if (tr.sortSpec == true) {
    tr.varType = 'sortspec';
    type = 'sortspec';
  } else if (tr.aggSpec == true) {
    tr.varType = 'aggspec';
    type = 'aggspec';
  }
  if (elementDef != null && tableDef.glide_var)
    tr.tableField = elementDef.tableName + "." + descriptorName;
  else
    tr.tableField = tableName + "." + descriptorName;
  tdOperator.innerHTML = "";
  tdValue.innerHTML = "";
  tdValue.style.minWidth = "";
  if (type == "float")
    type = "integer";
  else if (type == 'domain_number')
    type = "integer";
  else if (type == "wide_text" || type == "ref_ext" || type == "sc_email" || type == "sc_url")
    type = "string";
  else if (dateTypes[type]) {
    type = "calendar";
    if (fValue && fValue.indexOf("datePart") > -1)
      fOper = 'DATEPART';
    else if (fValue && (fValue.indexOf('getBaseFilter') > 0))
      fOper = "SINCE";
  }
  var showDynamicReferenceOperator = NOW.c14.shouldShowDynamicReferenceOperator(type, elementDef, tableNameFull);
  var operSel = addOperators(tdOperator, type, fOper, isChoice, includeExtended,
    showDynamicReferenceOperator, filterClass, restrictI18NOpers);
  if (operSel) {
    operSel.observe('change', function() {
      var form = operSel.up('form');
      if (form) {
        var nameWithoutTablePrefix = tableNameFull.substring(tableNameFull.indexOf(".") + 1);
        form.fire("glideform:onchange", {
          id: nameWithoutTablePrefix,
          value: unescape(getFilter(tableNameFull)),
          modified: true
        });
      }
    });
  }
  tr.operSel = operSel;
  if (fOper == null && operSel)
    fOper = tdOperator.currentOper;
  tr.setAttribute("type", type);
  if (tableNameFull.endsWith(".var_map")) {
    tr.handler = new GlideFilterVariableMap(tableName, elementDef);
  } else if ((type == "boolean") || (type == 'string_boolean')) {
    tr.handler = new GlideFilterChoice(tableName, elementDef);
    var keys = [];
    for (var i = 0; i < sysvalues[type].length; i++)
      keys.push(sysvalues[type][i][0]);
    var map = msg.getMessages(keys);
    for (var i = 0; i < sysvalues[type].length; i++) {
      var v = sysvalues[type][i][0];
      sysvalues[type][i][1] = map[v];
    }
    tr.handler.setChoices(sysvalues[type]);
  } else if (type == 'calendar')
    tr.handler = new GlideFilterDate(tableName, elementDef, filter.mappingId);
  else if (type == "reference") {
    tr.handler = new GlideFilterReference(tableName, elementDef);
    tr.handler.setOriginalTable(tableNameFull);
  } else if (type == "related_tags") {
    tr.handler = new GlideFilterLabels(tableName, elementDef);
    tr.handler.setOriginalTable(tableNameFull);
  } else if (type == "variables") {
    if (tableName == 'sc_task')
      tr.handler = new GlideFilterItemVariables(tableName, elementDef);
    else
      tr.handler = new GlideFilterVariables(tableName, elementDef);
    tr.handler.setOriginalTable(tableNameFull);
  } else if (type == "questions") {
    tr.handler = new GlideFilterQuestions(tableName, elementDef);
    tr.handler.setOriginalTable(tableNameFull);
  } else if (type == "glide_list")
    tr.handler = tableNameFull.endsWith(".template") ?
    new GlideFilterReferenceMulti(tableName, elementDef) :
    new GlideFilterReference(tableName, elementDef);
  else if (type == 'sortspec' || type == 'aggspec') {} else if (type == 'mask_code' || isChoice)
    tr.handler = new GlideFilterChoiceDynamic(tableName, elementDef);
  else if (type == 'glide_duration' || type == 'timer')
    tr.handler = new GlideFilterDuration(tableName, elementDef);
  else if (isFilterExtension(type))
    tr.handler = initFilterExtension(type, tableName, elementDef);
  else if ((multi == 'yes') && (useTextareas)) {
    tr.setAttribute("isMulti", "true");
    tr.handler = new GlideFilterStringMulti(tableName, elementDef);
    tr.handler.setOriginalTable(tableNameFull);
  } else if (type == 'integer')
    tr.handler = new GlideFilterNumber(tableName, elementDef);
  else if (type == 'currency' || type == 'price')
    tr.handler = new GlideFilterCurrency(tableName, elementDef);
  else {
    tr.setAttribute("isMulti", "false");
    tr.handler = new GlideFilterString(tableName, elementDef);
    tr.handler.setOriginalTable(tableNameFull);
  }
  if (tr.handler) {
    tr.handler.setFilterClass(filterClass);
    tr.handler.create(tr, fValue);
  }
  if (tr.handler)
    tr.handler.initMappingSupport(supportsMapping, type, (filter && filter.mappingMgr));
}

function addFirstLevelFields(s, target, fValue, filterMethod, fieldName, filter) {
  "use strict";
  var isTemplate = filter && filter.isTemplate;
  var forFilter;
  var onlyRestrictedFields;
  if (filter) {
    forFilter = filter.getOpsWanted();
    onlyRestrictedFields = filter.onlyRestrictedFields;
  }
  var messages = getMessages(MESSAGES_CONDITION_RELATED_FILES);
  s.options.length = 0;
  if (!gotShowRelated) {
    gotShowRelated = true;
    if (typeof g_filter_description != 'undefined')
      showRelated = g_filter_description.getShowRelated();
    else
      showRelated = getPreference("filter.show_related");
  }
  var placeholder = false;
  var selindex = 0;
  var indentLabel = false;
  var savedItems = {};
  var savedLabels = [];
  var labelPrefix = '';
  var headersAdded = false;
  var parts = target.split(".");
  var tableName = parts[0];
  var tableDef = getTableReference(tableName, null, isTemplate);
  var extension = '';
  var prefix = '';
  if (parts.length > 1 && parts[1] != null && parts[1] != '')
    var elementDef = fixParts();
  columns = tableDef.getColumns();
  queueColumns[tableDef.getName()] = columns;
  var textIndex = false;
  if (!noOps && !indentLabel) {
    var root = columns.getElementsByTagName("xml");
    if (root && root.length == 1) {
      root = root[0];
      textIndex = root.getAttribute("textIndex");
    }
  }
  var items = (extension != '') ? tableDef.getTableElements(extension) : tableDef.getElements();
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var t = item.getName();
    if (filterMethod && t != fValue) {
      if (!filterMethod(item))
        continue;
    }
    var t = item.getName();
    if (prefix != '')
      t = prefix + '.' + t;
    if (!noOps && item.getAttribute("filterable") == "no" &&
      !allowConditionsForJournal(item.getAttribute("type"), filter))
      continue;
    if (!item.canRead()) {
      if (t != fValue)
        continue;
      item.setCanRead('yes');
    }
    if (!item.isActive()) {
      if (t != fValue)
        continue;
      item.setActive('yes');
    }
    var label = item.getLabel();
    if (!elementDef || elementDef.getType() != "glide_var") {
      savedItems[label] = t;
      savedLabels.push(label);
    }
    if (item.isReference() && !item.isRefRotated() &&
      item.getType() != 'glide_list' && filterExpanded &&
      showRelated == 'yes') {
      label += " ⟹ " + item.getRefLabel();
      label += " " + messages['lowercase_fields'];
      t += "...";
      savedItems[label] = t;
      savedLabels.push(label);
    }
  }
  items = tableDef.getExtensions();
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var label = item.getLabel() + " (+)";
    t = item.getExtName() + "...";
    if (prefix != '')
      t = prefix + '.' + t;
    savedItems[label] = t;
    savedLabels.push(label);
  }
  if (!onlyRestrictedFields &&
    ((fValue == TEXTQUERY || textIndex) && filterMethod == null || forFilter)) {
    o = addOption(s, TEXTQUERY, messages['Keywords'], (fValue == TEXTQUERY));
    o.fullLabel = messages['Keywords'];
  }
  savedLabels.forEach(function(sname) {
    var o = addOption(s, savedItems[sname], sname, savedItems[sname] == fValue);
    o.tableName = tableDef.getName();
    if (labelPrefix != '')
      o.fullLabel = labelPrefix + "." + sname;
    else
      o.fullLabel = sname;
    if (indentLabel)
      o.innerHTML = "&nbsp;&nbsp;&nbsp;" + o.innerHTML;
    if (o.value.indexOf("...") != -1)
      if (o.fullLabel.indexOf("(+)") == -1)
        o.style.color = 'blue';
      else
        o.style.color = 'darkred';
  });
  if (filterExpanded && !onlyRestrictedFields) {
    if (showRelated != 'yes')
      var o = addOption(s, "...Show Related Fields...", messages['Show Related Fields'], false);
    else
      o = addOption(s, "...Remove Related Fields...", messages['Remove Related Fields'], false);
    o.style.color = 'blue';
  }
  if (!placeholder && (s.selectedIndex == 0 && ((textIndex && fValue != TEXTQUERY) || headersAdded)))
    s.selectedIndex = selindex;
  return s;

  function fixParts() {
    var o = null;
    if (filterExpanded && parts.length > 2) {
      var tableLabel = tableDef.getLabel();
      if (tableLabel == null)
        tableLabel = "Parent";
      o = addOption(s, tableDef.getName() + "...", tableLabel + " " + messages['lowercase_fields'], false);
      o.tableName = tableDef.getName();
      o.style.color = 'blue';
    }
    if (parts[1] == PLACEHOLDERFIELD) {
      o = addOption(s, PLACEHOLDER, messages['-- choose field --'], true);
      o.style.color = 'blue';
      o.tableName = tableDef.getName();
      o.fullLabel = messages['-- choose field --'];
      placeholder = true;
    }
    var sPeriod = "";
    var cname = '';
    for (var i = 1; i < parts.length - 1; i++) {
      var f = parts[i];
      if (f == null || f == '')
        break;
      var elementDef = tableDef.getElement(parts[i]);
      if (elementDef == null && tableDef.glide_var && parts.length > 3)
        elementDef = tableDef.getElement(parts[i] + "." + parts[++i]);
      if (elementDef == null)
        break;
      var childTable = tableName;
      if (elementDef.isReference()) {
        childTable = elementDef.getReference();
        if (elementDef.isExtensionElement())
          extension = childTable;
        else
          extension = '';
      } else {
        if (fieldName != null && fieldName.indexOf("...") > -1)
          childTable = parts[0];
        else
          break;
      }
      var parentTable = (extension != '') ? extension : elementDef.getTable().getName();
      tableDef = getTableReference(childTable, parentTable);
      if (cname.length)
        cname = cname + ".";
      cname += elementDef.getName();
      sPeriod = "." + sPeriod;
      var clabel = sPeriod + elementDef.getLabel() + " \u00bb " +
        elementDef.getRefLabel() + " " +
        messages['lowercase_fields'];
      o = addOption(s, cname + "...", clabel, false);
      o.tableName = tableDef.getName();
      o.style.color = 'blue';
      selindex++;
      indentLabel = true;
      headersAdded = true;
      if (labelPrefix.length)
        labelPrefix += ".";
      labelPrefix += elementDef.getLabel();
      if (prefix.length)
        prefix += ".";
      prefix += elementDef.getName();
    }
    return elementDef;
  }
}

function addSortSpec(name, fField, fOper) {
  if (!NOW.c14.setup(name))
    return null;
  var fDiv = getThing(currentTable, 'gcond_filters');
  var e = $('gcond_sort_order');
  if (e) {
    e.filterObject = fDiv.filterObject;
    fDiv = e;
  }
  if (!checkFilterSize(fDiv.filterObject))
    return;
  fDiv.filterObject.addSortRow(fField, fOper);
  _frameChanged();
}

function addFields(tableName, fValue, isSort, extendedFields) {
  NOW.c14.setup(tableName);
  var s = _createFilterSelect();
  if (!isSort)
    s.onchange = function() {
      updateFields(tableName, this, null, null, extendedFields);
    };
  else
    s.onchange = function() {
      updateSortFields(tableName, this);
    };
  var sname = tableName.split(".")[0];
  if (fValue)
    sname = sname + "." + fValue;
  if (isSort)
    addFirstLevelFields(s, sname, fValue, sortByFilter);
  else
    addFirstLevelFields(s, sname, fValue);
  return s;
}

function sortByFilter(item) {
  return item.canSort() && (g_lang == 'en' || item.canSortI18N());
}

function updateSortFields(name, select) {
  if (!NOW.c14.setup(name))
    return;
  name = currentTable;
  var o = getSelectedOption(select);
  var fieldName = o.value;
  name = name.split(".")[0];
  var idx = fieldName.indexOf("...");
  if (idx != -1) {
    NOW.c14.setShowRelated(fieldName, idx, name, select);
    return;
  }
  name = currentTable = getTableFromOption(o);
  var options = select.options;
  for (var i = 0; i < options.length; i++) {
    var option = options[i];
    if (optionWasSelected(option)) {
      option.innerHTML = getNormalLabel(option);
      option.style.color = 'black';
      option.wasSelected = 'false';
      break;
    }
  }
  if (!NOW.c14.setup(name))
    return;
  o.normalLabel = o.innerHTML;
  o.innerHTML = getFullLabel(o);
  o.style.color = 'green';
  o.wasSelected = 'true';
  $(select).addClassName('filter_type');
  $j(select).select2();
}

function addCondition(name) {
  if (!NOW.c14.setup(name))
    return null;
  var fDiv = getThing(currentTable, 'gcond_filters');
  if (!checkFilterSize(fDiv.filterObject))
    return;
  fDiv.filterObject.addConditionRowToFirstSection();
  _frameChanged();
}

function addConditionSpec(name, queryID, field, oper, value) {
  if (firstTable == null)
    firstTable = currentTable;
  if (!NOW.c14.setup(name))
    return null;
  var divName = "gcond_filters";
  if (fDiv != null)
    divName = fDiv + "gcond_filters";
  var fDiv = getThing(currentTable, divName);
  var filter = fDiv.filterObject;
  if (filter == null) {
    filter = new GlideFilter(currentTable, "");
    if (typeof field == "undefined") {
      return;
    }
  }
  if (!checkFilterSize(filter))
    return;
  var answer = filter.addConditionRow(queryID, field, oper, value);
  _frameChanged();
  return answer;
};
/*! RESOURCE: /scripts/doctype/condition14_templates.js */
function addTextArea(td, dValue) {
  if (!useTextareas)
    return addTextInput(td, dValue);
  var input = cel("textarea");
  td.fieldType = "textarea";
  if (dValue)
    input.value = dValue;
  input.className = "filerTableInput form-control";
  input.title = 'input value';
  input.wrap = "soft";
  input.rows = 5;
  input.style.width = "80%";
  input.maxlength = 80;
  td.appendChild(input);
  return input;
};
/*! RESOURCE: /scripts/doctype/condition14_reporting.js */
function columnsGetWithFilter(mft, filter, nu) {
  queueFilters[mft] = filter;
  queueTables[mft] = mft;
  columnsGet(mft, nu);
}

function reconstruct(table, column) {
  if (!column)
    return column;
  if (column.indexOf("...") < 0)
    return column;
  var ngfi = column.indexOf("...");
  var ngf = column.substring(0, ngfi);
  var te = new Table(table);
  var recon = ngf + "." + te.getDisplayName(ngf);
  return recon;
}

function resetFilters() {
  var t = getThing(currentTable, 'gcond_filters');
  clearNodes(t);
};
/*! RESOURCE: /scripts/doctype/GlideFilter14.js */
MESSAGES_FILTER_BUTTONS = ['Run Filter', 'Run', 'Add AND Condition', 'Add OR Condition', 'and', 'or', 'Delete'];
MESSAGES_FILTER_MISC = ['Run Filter', 'Run', 'Order results by the following fields'];
var GlideFilter = Class.create();
GlideFilter.prototype = {
    VARIABLES: "variables",
    LABELS_QUERY: "HASLABEL",
    OPERATOR_EQUALS: "=",
    FILTER_DIV: "gcond_filters",
    fIncludedExtendedOperators: {},
    fUsageContext: "default",
    fUseVariable: true,
    initialize: function(name, query, fDiv, runnable, synchronous, callback, originalQuery) {
      "use strict";
      this.synchronous = false;
      if (typeof synchronous != 'undefined')
        this.synchronous = synchronous;
      if (typeof query === 'function') {
        callback = query;
        query = null;
      }
      this.callback = callback;
      this.query = query;
      this.maintainPlaceHolder = false;
      this.conditionsWanted = !noConditionals;
      this.opsWanted = !noOps;
      this.defaultPlaceHolder = true;
      this.runable = runnable;
      this.textAreasWanted = useTextareas;
      this.tableName = name;
      this.restrictedFields = null;
      this.ignoreFields = null;
      this.onlyRestrictedFields = false;
      this.includeExtended = false;
      this.divName = "gcond_filters";
      this.filterReadOnly = false;
      this.isTemplate = false;
      if (fDiv != null)
        this.divName = fDiv + "gcond_filters";
      this.fDiv = getThing(this.tableName, this.divName);
      if (this.fDiv.filterObject) {
        this.fDiv.filterObject.destroy();
        this.fDiv.filterObject = null;
        this.fDiv = null;
      }
      this.fDiv = getThing(this.tableName, this.divName);
      this.fDiv.filterObject = this;
      this.fDiv.initialQuery = query;
      var mappingId = this.mappingId = this.fDiv.id.replace(/gcond_filters$/, "");
      this.elementSupportsMapping = !!gel("sys_mapping." + this.mappingId);
      this.sortElement = $('gcond_sort_order');
      if (this.sortElement)
        this.sortElement.filterObject = this;
      else
        this.sortElement = this.fDiv;
      this.sections = [];
      this.disabledFilter = false;
      this.originalQuery = originalQuery;
      var mappingRows = [];

      function cleanMappingFields() {
        for (var i = 0; mappingRows.length > i; i++) {
          var handler = mappingRows[i];
          if (!$j.contains(document.body, handler.tr)) {
            destroyHandler(handler);
            mappingRows.splice(i, 1);
            i--;
          }
        }
      }

      function initMapHandler(handler) {
        mappingRows.push(handler);
        CachedEvent.after("sys_mapping:loaded", function(mAPI) {
          mAPI.initOperand(handler, mappingId);
        });
        cleanMappingFields();
      }

      function destroyHandler(handler) {
        CachedEvent.after("sys_mapping:loaded", function(mAPI) {
          mAPI.destroyOperand(handler, mappingId);
        });
      }
      var currentMapState = "";

      function syncMappingStatus() {
        var active = false;
        for (var i = 0, l = mappingRows.length; l > i; i++) {
          if (mappingRows[i]._isMappingEnabled) {
            active = true;
            break;
          }
        }
        var status = active ? "partial" : "inactive";
        if (currentMapState !== status) {
          currentMapState = status;
          CustomEvent.fire("sys_mapping:set_field_state::" + mappingId, status);
        }
      }
      this.mappingMgr = {
        initElement: initMapHandler,
        destroyElement: function() {
          cleanMappingFields();
          syncMappingStatus();
        },
        notifyStateChange: function() {
          cleanMappingFields();
          syncMappingStatus();
        }
      };
      this.initMessageCache();
    },
    init2: function() {
      if (typeof this.query != 'undefined') {
        if (this.synchronous)
          this.setQuery(this.query);
        else
          this.setQueryAsync(this.query);
      } else {
        this.reset();
      }
      this.setOptionsFromParmsElement(this.tableName);
      if (this.callback) {
        this.callback(this);
      }
    },
    setValue: function(value) {
      this.setQuery(value);
    },
    _setValue: function(value) {
      this.setQuery(value);
    },
    setSectionClasses: function() {
      var tbody = $(this.getDiv() || getThing(this.tableName, this.divName));
      tbody.removeClassName('sn-filter-multi-clause');
      tbody.removeClassName('sn-filter-multi-condition');
      tbody.removeClassName('sn-filter-empty');
      if (!this.conditionsWanted)
        return;
      var showOr = false;
      $j("button.new-or-button").hide();
      var sections = this.sections;
      if (sections.length == 1) {
        var i = sections[0].conditions.length;
        if (i == 0)
          tbody.addClassName('sn-filter-empty');
        else if (i == 1)
          showOr = true;
        else if (i > 1) {
          tbody.addClassName('sn-filter-multi-condition');
          showOr = true;
        }
      } else if (sections.length > 1) {
        tbody.addClassName('sn-filter-multi-clause');
        showOr = true;
      }
      if (sections.length > 0)
        $j((sections[sections.length - 1]).table).addClass('sn-animate-filter-clause');
      if (showOr)
        $j("button.new-or-button").show();
    },
    setOptionsFromParmsElement: function(name) {
      var p = name.split(".");
      var elem = gel(p[1] + "." + p[2]);
      if (!elem)
        return;
      var ut = elem.getAttribute("data-usage_context");
      if (ut)
        this.setUsageContext(ut);
      var uv = elem.getAttribute("data-use-variables");
      if (uv)
        this.setUseVariables(uv);
      var rf = elem.getAttribute('data-restricted_fields');
      if (rf) {
        this.setRestrictedFields(rf);
        this.setOnlyRestrictedFields(true);
      }
      var eo = elem.getAttribute("data-extended_operators");
      if (eo)
        this.setIncludeExtended(eo);
    },
    setUsageContext: function(usage) {
      this.fUsageContext = usage;
      if (usage == "element_conditions") {
        this.addExtendedOperator("MATCH_PAT");
        this.addExtendedOperator("MATCH_RGX");
        this.ignoreVariables();
      }
    },
    getUsageContext: function() {
      return this.fUsageContext;
    },
    setUseVariables: function(useVariables) {
      this.fUseVariable = useVariables === 'true';
    },
    getUseVariables: function() {
      return this.fUseVariable;
    },
    destroy: function() {
      this.destroyed = true;
      if (this.fDiv) {
        this.fDiv.filterObject = null;
        this.fDiv = null;
      }
      this._clearSections();
    },
    _clearSections: function() {
      for (var i = 0; i < this.sections.length; i++)
        this.sections[i].destroy();
      if (this.sortSection)
        this.sortSection.destroy();
      this.sections = [];
      this.sortSection = null;
    },
    initMessageCache: function() {
      "use strict"
      var all = {};
      for (var key in sysvalues) {
        var values = sysvalues[key];
        var keys = buildMap(values, 0);
        for (var i = 0; i < keys.length; i++)
          all[keys[i]] = 't';
      }
      for (key in sysopers) {
        var values = sysopers[key];
        var keys = buildMap(values, 1);
        for (var i = 0; i < keys.length; i++)
          all[keys[i]] = 't';
      }
      var m = new Array();
      m = m.concat(MESSAGES_FILTER_BUTTONS, MESSAGES_FILTER_MISC, MESSAGES_CONDITION_RELATED_FILES);
      for (var i = 0; i < m.length; i++)
        all[m[i]] = 't';
      var send = [];
      for (key in all)
        send.push(key);
      NOW.msg.fetch(send, this.init2.bind(this));
    },
    setRestrictedFields: function(fields) {
      jslog("Received restricted fields " + fields);
      var fa = fields.split(",");
      if (fa.length == 0)
        return;
      this.restrictedFields = {};
      for (var i = 0; i < fa.length; i++)
        this.restrictedFields[fa[i]] = fa[i];
    },
    ignoreVariables: function(params) {
      var variables = params || ['variables', 'questions', 'sys_tags'];
      this.addIgnoreFields(variables.join(','));
    },
    addIgnoreFields: function(fields) {
      var fa = fields.split(",");
      if (fa.length == 0)
        return;
      if (!this.ignoreFields)
        this.ignoreFields = {};
      for (var i = 0; i < fa.length; i++)
        this.ignoreFields[fa[i]] = fa[i];
    },
    setOnlyRestrictedFields: function(only) {
      this.onlyRestrictedFields = only;
    },
    getIncludeExtended: function() {
      return this.fIncludedExtendedOperators;
    },
    setIncludeExtended: function(include) {
      var ops = include.split(";");
      for (var x = 0; x < ops.length; x++) {
        this.addExtendedOperator(ops[x]);
      }
    },
    addExtendedOperator: function(oper) {
      this.fIncludedExtendedOperators[oper] = true;
    },
    filterFields: function(item) {
      var name = item.getName();
      if (!this.restrictedFields) {
        if (!this.ignoreFields)
          return true;
        if (this.ignoreFields[name])
          return false;
        return true;
      }
      if (name.indexOf(".") > -1)
        return false;
      if (this.restrictedFields[name])
        return true;
      return false;
    },
    setFieldUsed: function(name) {},
    clearFieldUsed: function(name) {},
    refreshSelectList: function() {},
    isTemplatable: function() {
      return false;
    },
    setQuery: function(query) {
      jslog("setQuery Synchronously:  " + query);
      this.glideQuery = new GlideEncodedQuery(this.tableName, query);
      this.glideQuery.parse();
      this.reset();
      this.build();
    },
    setQueryAsync: function(query, defaultVal) {
      this.addLoadingIcon();
      this.glideQuery = new GlideEncodedQuery(this.tableName, query, this.setQueryCallback.bind(this));
      if (defaultVal)
        this.defaultVal = defaultVal.split(",");
      this.glideQuery.parse();
      this.queryProcessed = true;
    },
    setQueryCallback: function() {
      if (this.destroyed)
        return;
      this.reset();
      this.build();
      if (this.getFilterReadOnly()) {
        this.setReadOnly(true);
      }
      CustomEvent.fire('filter:' + this.type + '-done', true);
    },
    setRunable: function(b) {
      this.runable = b;
    },
    isRunable: function() {
      return this.runable;
    },
    setDefaultPlaceHolder: function(b) {
      this.defaultPlaceHolder = b;
    },
    setMaintainPlaceHolder: function(b) {
      this.maintainPlaceHolder = true;
    },
    getMaintainPlaceHolder: function() {
      return this.maintainPlaceHolder;
    },
    setFilterReadOnly: function(b) {
      this.filterReadOnly = b;
    },
    getFilterReadOnly: function() {
      return this.filterReadOnly;
    },
    setRunCode: function(code) {
      this.runCode = code;
    },
    reset: function() {
      var e = this.fDiv;
      if (!e)
        return;
      if (e.tagName == 'TBODY') {
        var toRemove = [];
        for (var i = 0; i < e.childNodes.length; i++) {
          var tr = e.childNodes[i];
          if ($(tr).hasClassName('no_remove'))
            continue;
          toRemove.unshift(i);
        }
        for (i = 0; i < toRemove.length; i++)
          e.removeChild(e.childNodes[toRemove[i]]);
      } else {
        clearNodes(this.fDiv);
      }
      this._clearSections();
    },
    getXML: function() {
      return this.glideQuery.getXML();
    },
    build: function() {
      this.queryProcessed = true;
      this.terms = this.glideQuery.getTerms();
      this.buildQuery();
      this.buildOrderBy();
    },
    buildOrderBy: function() {
      var orderArray = this.glideQuery.getOrderBy();
      if (orderArray.length == 0)
        return;
      for (var i = 0; i < orderArray.length; i++) {
        var order = orderArray[i];
        if (order.isAscending())
          this.addSortRow(order.getName(), 'ascending');
        else
          this.addSortRow(order.getName(), 'descending');
      }
    },
    buildQuery: function() {
      "use strict"
      this._loadTablesForQuery();
      this.preQuery();
      var partCount = 0;
      var section = this.addSection();
      var queryID = section.getQueryID();
      this.removeLoadingIcon();
      for (var i = 0; i < this.terms.length; i++) {
        var qp = this.terms[i];
        if (!qp.isValid())
          continue;
        partCount += 1;
        if (qp.isNewQuery()) {
          var section = this.addSection();
          queryID = section.getQueryID();
        }
        var field = qp.getField();
        var operator = qp.getOperator();
        var operands = qp.getValue();
        if (this.isHaslabelQuery(field, operator, operands)) {
          operands = operands.substring(1);
          field = "sys_tags";
          operator = this.OPERATOR_EQUALS;
        }
        if (this.defaultVal) {
          for (var n = 0; n < this.defaultVal.length; n++) {
            var fieldIsDefault = false;
            var defaultQuery = this.defaultVal[n].split("=");
            var defaultField = defaultQuery[0];
            if (defaultField == field) {
              fieldIsDefault = true;
              this.defaultVal.splice(n, 1);
              n = this.defaultVal.length;
            }
          }
        }
        gotoPart = qp.isGoTo();
        if (qp.isOR())
          this.currentCondition.addNewSubCondition(field, operator, operands);
        else
          this.addConditionRow(queryID, field, operator, operands, fieldIsDefault);
      }
      if (partCount == 0 && this.defaultPlaceHolder)
        this.addConditionRow(queryID);
      gotoPart = false;
    },
    addLoadingIcon: function() {
      var templateFilter = gel(this.fieldName + "filters_table");
      if (templateFilter && templateFilter.className !== 'filter_load_icon') {
        this.filterClasses = templateFilter.getAttribute("class");
        templateFilter.className = 'filter_load_icon';
      }
    },
    removeLoadingIcon: function() {
      var templateFilter = gel(this.fieldName + "filters_table");
      if (templateFilter && templateFilter.className === 'filter_load_icon')
        templateFilter.className = this.filterClasses;
    },
    isHaslabelQuery: function(field, operator, operands) {
      return field == this.VARIABLES &&
        operator == this.LABELS_QUERY &&
        operands.length > 1;
    },
    preQuery: function() {},
    isProtectedField: function(name) {
      return false;
    },
    _loadTablesForQuery: function() {
      for (var i = 0; i < this.terms.length; i++) {
        var qp = this.terms[i];
        if (!qp.isValid())
          continue;
        var field = qp.getField();
        this._loadTablesForField(field);
      }
    },
    _loadTablesForField: function(fieldName) {
      if (!fieldName)
        return;
      var tableName = this.tableName.split(".")[0];
      var parts = fieldName.split(".");
      for (var i = 0; i < parts.length; i++) {
        var tableDef = loadFilterTableReference(tableName, this.isTemplate);
        if (!tableDef)
          return;
        var edef = tableDef.getElement(parts[i]);
        if (edef == null && tableDef.glide_var)
          edef = tableDef.getElement(parts[i] + "." + parts[++i]);
        if (edef == null)
          return;
        if (!edef.isReference())
          return;
        tableName = edef.getReference();
      }
    },
    addSortRow: function(field, oper) {
      if (this.sortSection == null)
        this.sortSection = new GlideSortSection(this);
      this.sortSection.addField(field, oper);
      this.addRunButton();
    },
    addConditionRowToFirstSection: function() {
      if (this.sections.length == 0)
        this.addSection();
      var section = this.sections[0];
      this.addConditionRow(section.getQueryID());
    },
    addConditionRow: function(queryID, field, oper, value, defaultField) {
      var section = null;
      if (queryID) {
        var i = findInArray(this.sections, queryID);
        if (i != null)
          section = this.sections[i];
      }
      if (!section)
        section = this.addSection();
      var condition = section.addCondition(true, field, oper, value);
      if (defaultField) {
        condition.actionRow.className += " modal_template_icon";
      }
      this.setSectionClasses();
      if (!condition)
        return null;
      this.currentCondition = condition;
      return condition.getRow();
    },
    addSection: function() {
      var section = new GlideFilterSection(this);
      queryID = section._setup(this.sortSection == null, this.sections.length == 0);
      this.sections[this.sections.length] = section;
      if (this.sortSection != null && this.sortElement == this.fDiv) {
        var sortRow = this.sortSection.getSection().getRow();
        this.fDiv.insertBefore(section.getRow(), sortRow);
      }
      this.addRunButton();
      this.setSectionClasses();
      return section;
    },
    removeSection: function(queryID) {
      if (this.sortSection) {
        if (this.sortSection.getID() == queryID) {
          clearNodes(this.sortSection.getSection().getRow());
          fDiv = this.fDiv;
          var e = $('gcond_sort_order');
          if (e)
            fDiv = e;
          fDiv.removeChild(this.sortSection.getSection().getRow());
          this.sortSection = null;
          this.addRunButton();
          return;
        }
      }
      var i = findInArray(this.sections, queryID);
      if (i == null)
        return;
      var section = this.sections[i];
      this.sections.splice(i, 1);
      clearNodes(section.getRow());
      this.fDiv.removeChild(section.getRow());
      if (i == 0) {
        if (this.sections.length > 0)
          this.sections[0].setFirst(this.sections.length);
        else {
          if (this.defaultPlaceHolder)
            this.addConditionRow();
        }
      }
      this.addRunButton();
      this.updateDBValue();
      this.setSectionClasses();
    },
    singleCondition: function() {
      if (this.sections.length > 1)
        return false;
      var section = this.sections[0];
      count = section.getConditionCount();
      return count == 1;
    },
    runFilter: function() {
        var filter = getFilter(this.tableName, true);
        if (runFi