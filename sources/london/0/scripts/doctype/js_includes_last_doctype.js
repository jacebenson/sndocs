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
  document.body.on('click', '[data-type="ac_reference_input"]', function(evt, element) {
    openReferenceList(evt, element);
  });

  function openReferenceList(evt, element) {
    evt.preventDefault();
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
  }
  window.addEventListener('focus', function(evt, element) {
    if (window.popupClose)
      popupClose();
  });
  document.on('click', '[data-type="reference_popup"], [data-type="reference_hover"]', function(evt, element) {
    evt.preventDefault();
    var ref = element.getAttribute('data-ref');
    var view = element.getAttribute('data-view');
    var refKey = element.getAttribute('data-ref-key');
    popReferenceDiv(evt, ref, view, null, refKey);
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
    var name = element.getAttribute("data-user").replace(/\\'/, "'");
    addGlideListChoice('select_0' + ref, u, name);
    evt.stop();
  });
  document.body.on('click', '[data-type="glide_list_add_me_locked"]', function(evt, element) {
    var ref = element.getAttribute("data-ref");
    var u = element.getAttribute("data-user-id");
    var name = element.getAttribute("data-user").replace(/\\'/, "'");
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
    this._deactivateFocusTrap();
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
    this._activateFocusTrap();
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
    this._activateFocusTrap();
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
    iframe.name = iframe.id;
    iframe.title = this.options.title;
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
    this._deactivateFocusTrap();
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
  _focusHandlerPrototype: function(ev) {
    if (document === ev.target ||
      this._box === ev.target ||
      this._box.descendants().indexOf(ev.target) > -1) {
      return;
    }
    var tabbableNodes = tabbable(this._box);
    if (tabbableNodes.length === 0) {
      return;
    }
    if (ev.relatedTarget === tabbableNodes[0]) {
      tabbableNodes[tabbableNodes.length - 1].focus();
    } else {
      tabbableNodes[0].focus();
    }
  },
  _activateFocusTrap: function() {
    if (!this._focusHandler) {
      this._focusHandler = this._focusHandlerPrototype.bind(this);
      document.addEventListener('focusin', this._focusHandler);
    }
    if (!this._focusBouncer) {
      this._focusBouncer = $(document.createElement('div'));
      this._focusBouncer.setAttribute('class', 'focus-bouncer');
      this._focusBouncer.setAttribute('tabindex', 0);
      this._box.parentNode.insertBefore(this._focusBouncer, this._box.nextSibling);
    }
  },
  _deactivateFocusTrap: function() {
    if (this._focusHandler) {
      document.removeEventListener('focusin', this._focusHandler);
      this._focusHandler = null;
    }
    if (this._focusBouncer) {
      this._focusBouncer.parentNode.removeChild(this._focusBouncer);
      this._focusBouncer = null;
    }
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
var gb_BoxIFrameBody = '<div class="loading_wrap_outer"><div class="loading_wrap_inner">' + gb_LoadingBody + '</div></div><div class="iframe_container inner_wrap_outer"><div class="inner_wrap_inner"><iframe class="gb_iframe" frameborder="0" marginheight="0" marginwidth="0" tabindex="0" src="javascript:\'<html></html>\'"></iframe></div></div><div class="clear"></div>';;
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
    this.setPreference('focusTrap', true);
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
    this.setAriaLabel(this.msgs["Export in Progress"]);
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
      this.setTitle(this.msgs["Export Complete"]);
      this.setAriaLabel(this.msgs["Export Complete"]);
      var exportComplete = $('export_complete');
      exportComplete.setAttribute('tabindex', -1);
      exportComplete.setAttribute('role', 'status');
      exportComplete.setAttribute('aria-label', this.msgs["Export Complete"]);
      exportComplete.show();
      exportComplete.focus();
      var isAdmin = $('is_admin').value;
      if (this.action.indexOf('unload_') == 0 && isAdmin == "true") {
        var gr = new GlideRecord("sys_poll");
        gr.addQuery("job_id", this.jobId);
        gr.query(this._showExportStatusMsg.bind(this));
      }
      setTimeout(function() {
        download.focus();
      }, 2250);
      return;
    } else if (answer.indexOf('error') == 0) {
      this.setTitle(this.msgs["Export failed"]);
      this.setAriaLabel(this.msgs["Export failed"]);
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
      this.setAriaLabel(this.msgs['Export Canceled']);
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
var tearOffWindowID = 1;
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

function jsonView(ref, id) {
  var mytable = ref.split('.')[0];
  var myfield = ref.substring(mytable.length + 1);
  var w = 700;
  var h = 500;
  var url = new GlideURL(mytable + ".do");
  url.addParam("sysparm_sys_id", id);
  url.addParam("sysparm_target", myfield);
  url.addParam("sysparm_action", "getRecordColumn");
  url.addParam("JSONv2", "");
  popupOpen(url.getURL(), "jsonview", w, h,
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
  window.open(url.getURL(), sys_id + ("_" + tearOffWindowID++),
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
      if (type != "reference" && type != "glide_list" && type != "string" && type != "journal_input")
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

function _createFilterSelect(width, multi, associatedField) {
  var s = cel('select');
  var msg = NOW.msg;
  var defaultLabel = msg.getMessage('Choose option')
  s.className = "filerTableSelect";
  s.title = defaultLabel;
  if (associatedField)
    s.setAttribute('aria-label', msg.getMessage('Choose option for field: {0}', associatedField));
  else
    s.setAttribute('aria-label', defaultLabel);
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

function addOperators(td, type, dValue, isChoice, includeExtended, showDynamicReferenceOperator, filterClass, restrictI18NOpers, associatedField) {
  var msg = NOW.msg;
  var s = _createFilterSelect("150");
  var defaultLabel = msg.getMessage('Choose operator');
  s.title = defaultLabel;
  if (associatedField)
    s.setAttribute('aria-label', msg.getMessage('Choose operator for field: {0}', associatedField));
  else
    s.setAttribute('aria-label', defaultLabel)
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

function addTextInput(td, dValue, type, associatedField) {
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
  var msg = NOW.msg;
  var defaultLabel = msg.getMessage('Input value');
  input.title = defaultLabel;
  if (associatedField)
    input.setAttribute("aria-label", msg.getMessage('Input value for field: {0}', associatedField));
  else
    input.setAttribute("aria-label", defaultLabel);
  if (useTextareas) {
    input.style.width = "80%";
    input.style.resize = "vertical";
    input.maxlength = 80;
  }
  input.style.verticalAlign = "top";
  td.appendChild(input);
  td.setAttribute("data-value", associatedField);
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
    if (typeof sc_condition_builder == 'undefined' && filter.tableName == tableName && filter.query == query)
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

function deleteFilterByID(tablename, id, mappingId) {
  var td = getThing(tablename, id);
  var escapedMappingId = mappingId.replace(/\./g, '\\.');
  var table = $j('#' + escapedMappingId + 'filters_table');
  var originalPosition = getFilterConditionPosition(table, td);
  deleteTD(tablename, td);
  _frameChanged();
  var isRelatedList = table[0].getAttribute('data-isrelatedlist') === 'true';
  updateConditionFocus(originalPosition, escapedMappingId, table, isRelatedList);

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

  function getFilterConditionPosition(table, targetTD) {
    var trs = table.find('tr.filter_row_condition');
    var parentTR = $j(targetTD).closest('tr.filter_row_condition');
    var positionIndex = trs.index(parentTR);
    return positionIndex;
  }

  function updateConditionFocus(originalPosition, mappingId, table, isRelatedList) {
    var trs = table.find('tr.filter_row_condition');
    if (!isRelatedList)
      trs.splice(-1, 1);
    var position = (trs.length - 1 >= originalPosition) ? originalPosition : originalPosition - 1;
    var tr = $j(trs[position]);
    var container = tr.find('div.select2-container.select2.form-control.filter_type');
    container.addClass('select2-container-active');
    container.find('input.select2-focusser.select2-offscreen').focus();
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
      if (type != "variables" && type != "related_tags" && !elementDef.isEncrypted())
        type = "string_clob";
    } else if (elementDef.isEdgeEncrypted())
      type = elementDef.canSort() ? "edgeEncryptionOrder" : "edgeEncryptionEq";
    else if (elementDef.isEncrypted())
      type = "glide_encrypted";
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
  else if (descriptorName.startsWith("IO:"))
    tr.tableField = descriptorName;
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
  var associatedField = elementDef && elementDef.label;
  var operSel = addOperators(tdOperator, type, fOper, isChoice, includeExtended,
    showDynamicReferenceOperator, filterClass, restrictI18NOpers, associatedField);
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
  } else if (type == "glide_list") {
    var isTemplate = tableNameFull.endsWith(".template") || filter.isTemplate;
    tr.handler = isTemplate ?
      new GlideFilterReferenceMulti(tableName, elementDef) :
      new GlideFilterReference(tableName, elementDef);
  } else if (type == 'sortspec' || type == 'aggspec') {} else if (type == 'mask_code' || isChoice) {
    tr.handler = new GlideFilterChoiceDynamic(tableName, elementDef);
  } else if (type == 'glide_duration' || type == 'timer') {
    tr.handler = new GlideFilterDuration(tableName, elementDef);
  } else if (isFilterExtension(type)) {
    tr.handler = initFilterExtension(type, tableName, elementDef);
  } else if ((multi == 'yes') && (useTextareas)) {
    tr.setAttribute("isMulti", "true");
    tr.handler = new GlideFilterStringMulti(tableName, elementDef);
    tr.handler.setOriginalTable(tableNameFull);
  } else if (type == 'integer') {
    tr.handler = new GlideFilterNumber(tableName, elementDef);
  } else if (type == 'currency' || type == 'price') {
    tr.handler = new GlideFilterCurrency(tableName, elementDef);
  } else if (type == 'currency2') {
    tr.handler = new GlideFilterCurrency2(tableName, elementDef, isTemplate);
  } else {
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
  s.setAttribute("aria-label", "Choose Field");
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
  if (typeof sc_condition_builder == 'undefined' && !onlyRestrictedFields &&
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
  if (typeof sc_condition_builder == 'undefined' && filterExpanded && !onlyRestrictedFields) {
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

function addConditionSpec(name, queryID, field, oper, value, fDiv) {
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
function addTextArea(td, dValue, associatedField) {
  if (!useTextareas)
    return addTextInput(td, dValue, null, associatedField);
  var input = cel("textarea");
  td.fieldType = "textarea";
  if (dValue)
    input.value = dValue;
  var gMessage = new GwtMessage();
  var defaultLabel = gMessage.getMessage('Input value');
  if (associatedField)
    input.setAttribute('aria-label', gMessage.getMessage('Input value for field: {0}', associatedField));
  else
    input.setAttribute('aria-label', defaultLabel);
  input.className = "filerTableInput form-control";
  input.title = defaultLabel;
  input.wrap = "soft";
  input.rows = 5;
  input.style.width = "80%";
  input.maxlength = 80;
  td.setAttribute('data-value', associatedField);
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
MESSAGES_FILTER_BUTTONS = ['Run Filter', 'Run', 'Add AND Condition', 'Add OR Condition', 'and', 'or', 'Delete', 'Remove Condition'];
MESSAGES_FILTER_MISC = ['Run Filter', 'Run', 'Order results by the following fields'];
var GlideFilter = Class.create();
GlideFilter.prototype = {
  VARIABLES: "variables",
  LABELS_QUERY: "HASLABEL",
  OPERATOR_EQUALS: "=",
  FILTER_DIV: "gcond_filters",
  initialize: function(name, query, fDiv, runnable, synchronous, callback, originalQuery, listCollectorId) {
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
    this.listCollectorId = listCollectorId;
    this.includedExtendedOperators = {};
    this.usageContext = "default";
    this.useVariable = true;
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
    this.usageContext = usage;
    if (usage == "element_conditions") {
      this.addExtendedOperator("MATCH_PAT");
      this.addExtendedOperator("MATCH_RGX");
      this.ignoreVariables();
    }
  },
  getUsageContext: function() {
    return this.usageContext;
  },
  setUseVariables: function(useVariables) {
    this.useVariable = useVariables === 'true';
  },
  getUseVariables: function() {
    return this.useVariable;
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
    return this.includedExtendedOperators;
  },
  setIncludeExtended: function(include) {
    var ops = include.split(";");
    for (var x = 0; x < ops.length; x++) {
      this.addExtendedOperator(ops[x]);
    }
  },
  addExtendedOperator: function(oper) {
    this.includedExtendedOperators[oper] = true;
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
    setRemoveButtonAria();
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
    setRemoveButtonAria();
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
    if (runFilterHandlers[this.tableName]) {
      runFilterHandlers[this.tableName](this.tableName, filter);
      return;
    }
    var url = buildURL(this.tableName, filter);
    window.location = url;
  },
  getName: function() {
    return this.tableName;
  },
  getSortDiv: function() {
    return this.fDiv;
  },
  getDiv: function() {
    return this.fDiv;
  },
  getConditionsWanted: function() {
    return this.conditionsWanted;
  },
  getOpsWanted: function() {
    return this.opsWanted;
  },
  getTextAreasWanted: function() {
    return this.textAreasWanted;
  },
  isQueryProcessed: function() {
    return this.queryProcessed;
  },
  addRunButton: function() {
    if (!this.runable)
      return;
    var max = (this.sortSection == null) ? this.sections.length - 1 : this.sections.length;
    for (var i = 0; i < max; i++) {
      var section = this.sections[i];
      section.removeRunButton();
    }
    var section = this.sortSection;
    if (section == null)
      section = this.sections[this.sections.length - 1];
    section.addRunButton();
  },
  setReadOnly: function(disabled) {
    var parentElement = this.fDiv.parentNode;
    this._toggleReadOnlyAttribute(disabled);
    this._hideClass(parentElement, "filerTableAction", disabled);
    this._disableClass(parentElement, "filerTableSelect", disabled);
    this._disableClass(parentElement, "filerTableInput", disabled);
    this.setFilterReadOnly(disabled);
    this.disabledFilter = disabled;
  },
  _toggleReadOnlyAttribute: function(disabled) {
    var fieldName,
      element;
    if (this.fDiv && this.fDiv.id)
      fieldName = this.fDiv.id.replace('gcond_filters', '');
    if (fieldName)
      element = gel(fieldName);
    if (element)
      element.readOnly = disabled;
    return !!element;
  },
  isReadOnly: function() {
    return this.getFilterReadOnly();
  },
  _disableClass: function(parentElement, className, disabled) {
    var elements = $(parentElement).select("." + className);
    for (var i = 0; i < elements.length; i++) {
      g_form.setDisabledControl(elements[i], disabled);
    }
  },
  _hideClass: function(parentElement, className, hideIt) {
    var elements = $(parentElement).select("." + className);
    for (var i = 0; i < elements.length; i++) {
      if (hideIt)
        hideObject(elements[i]);
      else
        showObjectInline(elements[i]);
    }
    if (this.type == "GlideTemplateFilter") {
      if (hideIt && parentElement && parentElement.parentElement)
        parentElement.parentElement.removeChild(parentElement);
      else
        showObjectInline(parentElement);
    }
  },
  getValue: function() {
    return getFilter(this.tableName, false);
  },
  isDisabled: function() {
    return this.disabledFilter;
  },
  updateDBValue: function() {},
  type: "GlideFilter"
};
var GlideFilterSection = Class.create();
GlideFilterSection.prototype = {
  PLACE_HOLDER_FIELD: "-- choose field --",
  initialize: function(filter) {
    this.filter = filter;
    this.sort = false;
    this.queryID = null;
    this.tdMessage = null;
    this.runRow = null;
    this.conditions = [];
    var msg = NOW.msg;
    var values = MESSAGES_FILTER_MISC;
    this.answer = msg.getMessages(values);
  },
  destroy: function() {
    this.runRow = null;
    if (this.runCondition)
      this.runCondition.destroy();
    this.row.rowObject = null;
    this.row = null;
    this.table = null;
    this.tbody = null;
    for (var i = 0; i < this.conditions.length; i++)
      this.conditions[i].destroy();
  },
  _setup: function(link, first) {
    this.queryID = 'QUERYPART' + guid();
    this.row = cel('tr');
    this.row.queryID = this.queryID;
    this.row.queryPart = 'true';
    this.row.rowObject = this;
    var e = this.filter.getDiv() || getThing(this.filter.tableName, this.filter.divName);
    if (this.sort)
      e = this.filter.sortElement;
    e.appendChild(this.row);
    var td = cel('td', this.row);
    td.style.verticalAlign = "top";
    td.style.width = "100%";
    this.table = cel('table', td);
    $(this.table).addClassName('sn-filter-clause');
    if (!this.filter.getConditionsWanted() || this.sort)
      this.table.className = "wide";
    this.tbody = cel('TBODY', this.table);
    this.tbody.id = this.queryID;
    if (this.sort)
      this.addSortHeader();
    else
      this.addConditionHeader(first);
    return this.queryID;
  },
  addSortHeader: function() {
    var tr = '<tr class="sn-filter-order-message"><td class="sn-filter-top" >';
    tr += "<hr></hr><span style='padding: 10px'>" + this.answer['Order results by the following fields'] + "</span>";
    tr += "</td></tr>";
    $j(this.tbody).append(tr);
  },
  addConditionHeader: function(first) {
    this._addHRTR(first);
    this._addMessageTR(first);
  },
  _addHRTR: function(first) {
    var tr = $j('<tr><td class="sn-filter-top sn_multiple_conditions"><hr></hr><td></tr>');
    $j(this.tbody).append(tr);
    if (first)
      tr.hide();
  },
  _addMessageTR: function(first) {
    if (first)
      var m = getMessage("All of these conditions must be met");
    else
      m = getMessage("OR all of these conditions must be met");
    var tr = '<tr class="sn-filter-section-message"><td class="sn-filter-top">';
    tr += m;
    tr += "</td></tr>";
    this.sectionSepMessage = $j(tr);
    $j(this.tbody).append(this.sectionSepMessage);
  },
  setFirst: function(length) {
    this.sectionSepMessage.find("td").html(getMessage("All of these conditions must be met"));
  },
  addSortCondition: function() {
    var condition = new GlideSectionCondition(this, this.queryID);
    this.conditions[this.conditions.length] = condition;
    condition.setOrWanted(false);
    if (this.runRow == null)
      condition.build(this.tbody);
    else {
      condition.build(null);
      this.tbody.insertBefore(condition.getRow(), this.runRow);
    }
    return condition;
  },
  newPlaceHolder: function() {
    this.addPlaceHolder(true);
  },
  removePlaceHolder: function() {
    if (this.placeHolderCondition)
      this.placeHolderCondition.remove();
  },
  clearPlaceHolder: function() {
    if (!this.filter.getMaintainPlaceHolder())
      this.placeHolderCondition = null;
    else
      this.newPlaceHolder();
  },
  addPlaceHolder: function(wantOR) {
    this.placeHolderCondition = new GlideSectionCondition(this, this.queryID);
    this.conditions[this.conditions.length] = this.placeHolderCondition;
    this.placeHolderCondition.setPlaceHolder(true);
    this.placeHolderCondition.setOrWanted(true);
    if (this.runRow == null)
      this.placeHolderCondition.buildRow(this.tbody, this.PLACE_HOLDER_FIELD);
    else {
      this.placeHolderCondition.buildRow(null, this.PLACE_HOLDER_FIELD);
      this.tbody.insertBefore(this.placeHolderCondition.getRow(), this.runRow);
    }
  },
  addCondition: function(wantOR, field, oper, value) {
    if (this.filter.getMaintainPlaceHolder())
      return this.addConditionWithPlaceHolder(wantOR, field, oper, value);
    if (!field && !oper && !value) {
      this.newPlaceHolder();
      return null;
    }
    if (this.placeHolderCondition == null) {
      if (typeof field == "undefined" || field == '') {
        this.newPlaceHolder();
        return null;
      }
    }
    if (typeof field == "undefined")
      return null;
    var condition = new GlideSectionCondition(this, this.queryID);
    this.conditions[this.conditions.length] = condition;
    condition.setOrWanted(wantOR);
    if (this.runRow == null)
      condition.buildRow(this.tbody, field, oper, value);
    else {
      condition.buildRow(null, field, oper, value);
      this.tbody.insertBefore(condition.getRow(), this.runRow);
    }
    return condition;
  },
  addConditionWithPlaceHolder: function(wantOR, field, oper, value) {
    if (this.placeHolderCondition == null) {
      this.newPlaceHolder();
      if (typeof field == "undefined")
        return null;
    }
    if (typeof field == "undefined")
      return null;
    var condition = new GlideSectionCondition(this, this.queryID);
    this.conditions[this.conditions.length - 1] = condition;
    this.conditions[this.conditions.length] = this.placeHolderCondition;
    condition.setOrWanted(wantOR);
    condition.buildRow(null, field, oper, value);
    this.tbody.insertBefore(condition.getRow(), this.placeHolderCondition.getRow());
    return condition;
  },
  addRunButton: function() {
    if (this.runRow != null)
      return;
    this.runCondition = new GlideSectionCondition(this, this.queryID);
    this.runCondition.build(this.tbody);
    this.runRow = this.runCondition.getRow();
    this.runRow.basePart = '';
    this.runCondition.setAsRunRow(this.PLACE_HOLDER_FIELD);
  },
  removeRunButton: function() {
    if (this.runRow == null)
      return;
    this.tbody.removeChild(this.runRow);
    clearNodes(this.runRow);
    this.runRow = null;
  },
  getQueryID: function() {
    return this.queryID;
  },
  getID: function() {
    return this.queryID;
  },
  getRow: function() {
    return this.row;
  },
  getFilterTable: function() {
    return this.tbody;
  },
  setSort: function(b) {
    this.sort = b;
  },
  getName: function() {
    return this.filter.getName();
  },
  getFilter: function() {
    return this.filter;
  },
  getConditionCount: function() {
    return this.conditions.length;
  },
  firstCondition: function(condition) {
    return this.conditions[0] == condition;
  },
  removeCondition: function(id) {
    var i = findInArray(this.conditions, id);
    if (i == null)
      return;
    var condition = this.conditions[i];
    this.conditions.splice(i, 1);
    var row = condition.getRow();
    clearNodes(row);
    this.tbody.removeChild(row);
    if (condition == this.placeHolderCondition)
      this.placeHolderCondition = null;
    if ((this.placeHolderCondition != null && this.conditions.length == 1) || this.conditions.length == 0) {
      this.filter.removeSection(this.queryID);
    } else if (i == 0)
      this.conditions[0].makeFirst();
    setRemoveButtonAria();
  },
  refreshSelectList: function() {
    for (var i = 0; i < this.conditions.length; i++)
      this.conditions[i].refreshSelectList();
  },
  z: null
};
var GlideSectionCondition = Class.create();
GlideSectionCondition.prototype = {
  initialize: function(section, queryID) {
    this.section = section;
    this.filter = section.getFilter();
    this.queryID = queryID;
    this.id = guid();
    this.wantOR = true;
    this.subConditions = new Array();
    this.field = null;
    this.oper = null;
    this.value = null;
  },
  destroy: function() {
    this.section = null;
    this.filter = null;
    this.row = null;
    this.tbody.conditionObject = null;
    this.tbody = null;
    this.conditionRow.destroy();
    this.actionRow = null;
    for (var i = 0; i < this.subConditions.length; i++)
      this.subConditions[i].destroy();
  },
  build: function(parent) {
    trNew = celQuery('tr', parent, this.queryID);
    this.row = trNew;
    trNew.className = "filter_row";
    trNew.basePart = 'true';
    trNew.conditionObject = this;
    trNew.setAttribute("mapping_support", this.filter.elementSupportsMapping);
    var td = celQuery('td', trNew, this.queryID);
    td.style.width = "100%";
    td.style.paddingBottom = "4px";
    var table = celQuery('table', td, this.queryID);
    if (!this.filter.getConditionsWanted())
      table.className = "wide";
    this.tbody = celQuery('TBODY', table, this.queryID);
    this.tbody.conditionObject = this;
    var first = this.section.firstCondition(this) && !this.isPlaceHolder();
    this.conditionRow = new GlideConditionRow(this, this.queryID, this.wantOR, first);
    var tr = this.conditionRow.getRow();
    this.tbody.appendChild(tr);
    this.actionRow = tr;
    tr.conditionObject = this;
  },
  buildRow: function(parent, field, oper, value) {
    this.field = field;
    this.oper = oper;
    if (value)
      this.value = value.replace(/&amp;/g, '&');
    else
      this.value = value;
    this.build(parent);
    this.conditionRow.build(this.field, this.oper, this.value);
  },
  addNewSubCondition: function(field, oper, value) {
    if (field == null || typeof(field) == "undefined") {
      field = this.conditionRow.getField();
      oper = this.conditionRow.getOper();
    }
    var sub = new GlideSubCondition(this, this.queryID);
    sub.buildRow(this.tbody, field, oper, value);
    this.subConditions[this.subConditions.length] = sub;
    var $select = $j(sub.getFieldSelect());
    $select.css("margin-left", "10px").css("display", "inline-block").css("width", "inherit");
  },
  addLeftButtons: function() {
    this.conditionRow.addLeftButtons();
  },
  getRow: function() {
    return this.row;
  },
  getBody: function() {
    return this.tbody;
  },
  getActionRow: function() {
    return this.actionRow;
  },
  setAsRunRow: function() {
    this.conditionRow.setAsRunRow();
  },
  setOrWanted: function(b) {
    this.wantOR = b;
  },
  remove: function() {
    if (this.conditionRow)
      this.conditionRow.destroy();
    this.section.removeCondition(this.id);
    this.section.filter.setSectionClasses();
  },
  removeSub: function(id) {
    var i = findInArray(this.subConditions, id);
    if (i == null)
      return;
    var orc = this.subConditions[i];
    clearNodes(orc.getRow());
    this.tbody.removeChild(orc.getRow());
    this.subConditions.splice(i, 1);
  },
  getID: function() {
    return this.id;
  },
  getFilter: function() {
    return this.filter;
  },
  isFirst: function() {
    return this.section.firstCondition(this);
  },
  makeFirst: function() {
    this.conditionRow.makeFirst();
  },
  getName: function() {
    return this.section.getName();
  },
  setPlaceHolder: function(b) {
    this.placeHolder = b;
  },
  isPlaceHolder: function() {
    return this.placeHolder;
  },
  removePlaceHolder: function() {
    if (this.section)
      this.section.removePlaceHolder();
  },
  newPlaceHolder: function() {
    if (this.section)
      this.section.newPlaceHolder();
  },
  clearPlaceHolder: function() {
    if (this.section)
      this.section.clearPlaceHolder();
  },
  refreshSelectList: function() {
    if (this.conditionRow)
      this.conditionRow.refreshSelectList();
  },
  z: null
};
var GlideSubCondition = Class.create();
GlideSubCondition.prototype = {
  initialize: function(condition, queryID) {
    this.condition = condition;
    this.filter = condition.getFilter();
    this.queryID = queryID;
    this.id = guid();
  },
  destroy: function() {
    this.filter = null;
    this.condition = null;
    if (this.row)
      this.row.destroy();
  },
  buildRow: function(parent, field, oper, value) {
    this.field = field;
    this.oper = oper;
    if (value)
      this.value = value.replace(/&amp;/g, '&');
    else
      this.value = value;
    this.row = new GlideConditionRow(this.condition, queryID, false, false);
    var tr = this.row.getRow();
    parent.appendChild(tr);
    tr.conditionObject = this;
    this.row.build(field, oper, this.value)
  },
  getNameTD: function() {
    return this.row.getNameTD();
  },
  getFieldSelect: function() {
    return this.row.getFieldSelect();
  },
  getRow: function() {
    return this.row.getRow();
  },
  getID: function() {
    return this.id;
  },
  isPlaceHolder: function() {
    return this.condition.isPlaceHolder();
  },
  remove: function() {
    this.condition.removeSub(this.id);
  },
  z: null
};
var GlideConditionRow = Class.create();
GlideConditionRow.prototype = {
  initialize: function(condition, queryID, wantOr, first) {
    this.condition = condition;
    this.filter = condition.getFilter();
    this.first = first;
    this.wantOr = wantOr;
    this.tableName = this.condition.getName();
    this.queryID = queryID;
    this.currentText = [];
    var tr = celQuery('tr', null, queryID);
    tr.conditionObject = this.condition;
    tr.rowObject = this;
    tr.className = "filter_row_condition";
    tr.style.display = "table";
    this.row = tr;
    tr.conditionRow = this;
    this.addAndOrTextCell();
    td = this.addTD(tr, queryID);
    this.tdName = td;
    if (this.filter.listCollectorId)
      td.id = this.filter.listCollectorId + "_field";
    else
      td.id = "field";
    td.className += " condition-row__field-cell";
    tr.tdField = td;
    td = this.addTD(tr, queryID);
    this.tdOper = td;
    if (this.filter.listCollectorId)
      td.id = this.filter.listCollectorId + "_oper";
    else
      td.id = "oper";
    td.className += " condition-row__operator-cell";
    tr.tdOper = td;
    if (!this.filter.getOpsWanted())
      td.style.display = "none";
    td.style.width = "auto";
    td = this.addTD(tr, queryID);
    this.tdValue = td;
    if (this.filter.listCollectorId)
      td.id = this.filter.listCollectorId + "_value";
    else
      td.id = "value";
    td.noWrap = true;
    tr.tdValue = td;
    td.className += " form-inline condition-row__value-cell";
    if (this.filter.elementSupportsMapping) {
      this.addMappingTd(tr);
    }
    if (this.filter.getTextAreasWanted())
      td.style.width = "90%";
    this.addPlusImageCell();
    this.addRemoveButtonCell();
    this.answer = getMessages(MESSAGES_FILTER_BUTTONS);
  },
  destroy: function() {
    this.filter.clearFieldUsed(this.getField(), this.condition);
    this.filter = null;
    this.condition = null;
    this.rowCondition = null;
    if (this.row.handler)
      this.row.handler.destroy();
    this.row.tdOper = null;
    this.row.tdValue = null;
    this.row.tdField = null;
    this.row.conditionObject = null;
    this.row.rowObject = null;
    this.row = null;
    this.tdOper = null;
    this.tdValue = null;
    this.tdName = null;
    if (this.fieldSelect) {
      this.fieldSelect.onchange = null;
      this.fieldSelect = null;
    }
    this.tdOrButton = null;
    this.tdRemoveButton.conditionObject = null;
    this.tdRemoveButton = null;
    this.tdAndOrText = null;
  },
  setAsRunRow: function(field) {
    this.build(field);
    this.tdName.style.visibility = 'hidden';
    this.tdOper.style.visibility = 'hidden';
    this.tdAndOrText.style.visibility = 'hidden';
    this.row.removeChild(this.tdValue);
    this.row.removeChild(this.tdOrButton);
    this.row.removeChild(this.tdRemoveButton);
    clearNodes(this.tdValue);
    clearNodes(this.tdOrButton);
    clearNodes(this.tdRemoveButton);
    var td = celQuery('td', this.row, this.queryID);
    td.style.width = "100%";
    td.style.paddingBottom = "4px";
    td.filterObject = this.filter;
    var runCode = "runThisFilter(this);";
    if (this.filter.runCode)
      runCode = this.filter.runCode;
    td.innerHTML = this.buildRunButton(runCode);
  },
  addAndOrTextCell: function() {
    var td = this.addTD(this.row, this.queryID);
    td.className += " condition-row__and-or-text-cell";
    this.tdAndOrText = td;
    td.style.textAlign = "right";
    if (!this.filter.getConditionsWanted())
      td.style.display = "none";
  },
  addPlusImageCell: function() {
    var td = this.addTD(this.row, this.queryID);
    td.style.whiteSpace = "nowrap";
    td.className += " condition_buttons_cell";
    this.tdOrButton = td;
    this.row.tdOrButton = td;
    if (!this.filter.getConditionsWanted())
      td.style.display = "none";
  },
  addRemoveButtonCell: function() {
    var td = this.addTD(this.row, this.queryID);
    this.tdRemoveButton = td;
    this.row.tdRemoveButton = td;
    td.conditionObject = this.condition;
    td.className += " condition-row__remove-cell";
    if (this.wantOr)
      td.hasOrButton = 'true';
  },
  addTD: function(row, queryID) {
    var td = celQuery('td', row, queryID);
    $j(td).addClass("sn-filter-top");
    return td;
  },
  addMappingTd: function(tr) {
    var mappingTd = cel("td");
    mappingTd.className = "condition-row__sys-mapping-cell form-inline";
    tr.appendChild(mappingTd);
    tr.tdMapping = mappingTd;
  },
  build: function(field, oper, value) {
    this.field = field;
    this.oper = oper;
    this.value = value;
    var tableName = this.getName();
    var tds = this.row.getElementsByTagName("td");
    this.fieldSelect = _createFilterSelect();
    this.fieldSelect.onchange = this.fieldOnChange.bind(this);
    var sname = tableName.split(".")[0];
    if (this.field != null)
      sname = sname + "." + field;
    this.filter.setFieldUsed(field);
    addFirstLevelFields(this.fieldSelect, sname, field, this.filter.filterFields.bind(this.filter), null, this.filter, this.filter);
    if (!this.tdName) {
      return [];
    }
    this.tdName.appendChild(this.fieldSelect);
    updateFields(tableName, this.fieldSelect, oper, value, this.filter.getIncludeExtended(), this.filter);
    if (this.filter.isProtectedField(field))
      this._setReadOnly();
    if (this.filter.fieldName == "sys_template.template" || this.filter.isTemplate)
      this.addHelpText();
    currentTable = tableName;
    this.addLeftButtons();
    return tds;
  },
  _setReadOnly: function() {
    this.filter._hideClass(this.row, "filerTableAction", true);
    this.filter._disableClass(this.row, "filerTableSelect", true);
    this.filter._disableClass(this.row, "filerTableInput", true);
  },
  fieldOnChange: function() {
    this.filter.setFieldUsed(this.getField());
    this.filter.clearFieldUsed(this.field, this.condition);
    this.field = this.getField();
    var b = this.condition.isPlaceHolder();
    this.condition.setPlaceHolder(false);
    updateFields(this.getName(), this.fieldSelect, null, null, this.filter.getIncludeExtended(), this.filter);
    if (b) {
      this.condition.setPlaceHolder(false);
      this.showFields();
      this.condition.clearPlaceHolder();
      if (this.condition.isFirst())
        this.makeFirst();
    }
    this.filter.refreshSelectList();
    if (this.filter.fieldName == "sys_template.template" || this.filter.isTemplate)
      this.addHelpText();
    var form = this.getFieldSelect().up('form');
    if (form) {
      var nameWithoutTablePrefix = this.getName().substring(this.getName().indexOf(".") + 1);
      form.fire("glideform:onchange", {
        id: nameWithoutTablePrefix,
        value: unescape(getFilter(this.getName())),
        modified: true
      });
    }
    setRemoveButtonAria();
  },
  addHelpText: function() {
    this.fieldElements = this.condition.actionRow.getAttribute("type");
    if (this.fieldElements) {
      switch (this.fieldElements) {
        case "color":
          this.helpText("Insert HTML color name or hex value");
          break;
        case "glide_list":
        case "slushbucket":
        case "user_roles":
          this.helpText("Separate individual references with a comma");
          break;
        case "composite_name":
          this.helpText("Use the following format: TableName.FieldName");
          break;
        case "days_of_week":
          this.helpText("1 for Monday, 2 for Tuesday, etc. Multiple values can be entered, like '135' for Monday, Wednesday, and Friday");
          break;
        case "html":
        case "translated_html":
          this.helpText("Enter text in HTML format");
          break;
        default:
          this.removeHelpText();
      }
    }
  },
  helpText: function(text) {
    this.removeHelpText();
    var newDiv = document.createElement("div");
    var newContent = document.createTextNode(text);
    newDiv.appendChild(newContent);
    newDiv.id = this.fieldElements;
    newDiv.className = 'fieldmsg';
    var currentDiv = this.condition.tbody;
    currentDiv.insertBefore(newDiv, null);
    this.currentText.push(this.fieldElements);
  },
  removeHelpText: function() {
    for (i = 0; i < this.currentText.length; i++) {
      var parNode = gel(this.currentText[i]).parentElement;
      var chilNode = parNode.childNodes;
      chilNode[1].remove();
      this.currentText.splice(i, 1);
    }
  },
  getNameTD: function() {
    return this.tdName;
  },
  getFieldSelect: function() {
    return this.fieldSelect;
  },
  getField: function() {
    var select = getSelectedOption(this.fieldSelect);
    if (select != null)
      return select.value;
    return null;
  },
  getOper: function() {
    var s = this.getOperSelect();
    return getSelectedOption(s).value;
  },
  getOperSelect: function() {
    return this.tdOper.getElementsByTagName("select")[0];
  },
  getValueInput: function() {
    return this.tdValue.getElementsByTagName("input")[0];
  },
  getRow: function() {
    return this.row;
  },
  getName: function() {
    return this.tableName;
  },
  showFields: function() {
    this.tdRemoveButton.style.visibility = 'visible';
    this.tdOrButton.style.visibility = 'visible';
    if (!this.first)
      this.tdAndOrText.style.visibility = 'visible';
    this.getOperSelect().disabled = false;
    var cel = this.getValueInput();
    if (cel)
      cel.disabled = false;
  },
  addLeftButtons: function() {
    if (this.wantOr) {
      tdAddOr = this.tdOrButton;
      var fDiv = this.filter.getDiv() || getThing(this.filter.tableName, this.filter.divName);
      fDiv = fDiv.id.split("gcond_filters", 1);
      var andOnClick = "addConditionSpec('" + htmlEscape(this.tableName) + "','" + htmlEscape(this.queryID) + "','','','','" + fDiv + "'); return false;";
      var orOnClick = "newSubRow(this,'" + fDiv + "'); return false;";
      tdAddOr.innerHTML = this.getAndButtonHTML(andOnClick) + this.getOrButtonHTML(orOnClick);
      if (this.condition.isPlaceHolder())
        tdAddOr.style.visibility = 'hidden';
    }
    var td = this.tdRemoveButton;
    var tdMessage = this.tdAndOrText;
    if (!this.wantOr) {
      if (td.parentNode.sortSpec != true) {
        var fieldTD = this.row.childNodes[1];
        var orSpan = "<span class='sn-or-message'>" + this.answer['or'] + "</span>";
        $(fieldTD).insert({
          top: orSpan
        });
      } else {
        tdMessage.innerHTML = '';
      }
    }
    tdMessage.style.width = DEFAULT_WIDTH;
    var id = 'r' + guid();
    var mappingId = this.filter.mappingId;
    td.id = id;
    var deleteOnClick = "deleteFilterByID('" + htmlEscape(this.getName()) + "','" + id + "','" + mappingId + "');";
    td.innerHTML = this.getDeleteButtonHTML(id, deleteOnClick);
    if (!this.condition.isPlaceHolder())
      return;
    if (!this.filter.defaultPlaceHolder)
      return;
    if (this.filter.getMaintainPlaceHolder() || this.filter.singleCondition())
      td.style.visibility = 'hidden';
  },
  getAndButtonHTML: function(onClick) {
    return "<button onclick=\"" + onClick + "\" title='" + this.answer['Add AND Condition'] + "' alt='" + this.answer['Add AND Condition'] + "' class='btn btn-default filerTableAction'>" + this.answer['and'].toUpperCase() + "</button>";
  },
  getOrButtonHTML: function(onClick) {
    return "<button onclick=\"" + onClick + "\" title='" + this.answer['Add OR Condition'] + "' alt='" + this.answer['Add OR Condition'] + "' class='btn btn-default filerTableAction'>" + this.answer['or'].toUpperCase() + "</button>";
  },
  getDeleteButtonHTML: function(id, onClick) {
    return "<button onclick=\"" + onClick + "\" title='" + this.answer['Delete'] + "' type='button' class='filerTableAction btn btn-default deleteButton'><span class='icon-cross'></span><span class=\"sr-only\">'" + this.answer['Delete'] + "'</span></button>";
  },
  makeFirst: function() {
    var tdMessage = this.tdAndOrText;
    tdMessage.innerHTML = '';
    tdMessage.style.color = tdMessage.style.backgroundColor;
    tdMessage.style.visibility = 'hidden';
    tdMessage.style.width = DEFAULT_WIDTH;
  },
  refreshSelectList: function() {
    if (this.condition.isPlaceHolder())
      return;
    var tableName = this.getName();
    var sname = tableName.split(".")[0];
    if (this.field != null)
      sname = sname + "." + this.field;
    addFirstLevelFields(this.fieldSelect, sname, this.field, this.filter.filterFields.bind(this.filter), null, this.filter);
  },
  buildRunButton: function(f) {
    var m = new GwtMessage();
    return '<button class="btn btn-default" tabindex="0" onclick="' + f + '" title="' + m.getMessage('Run Filter') + '">' + m.getMessage('Run') + '</button>';
  },
  z: null
};
var GlideSortSection = Class.create();
GlideSortSection.prototype = {
  initialize: function(filter) {
    this.filter = filter;
    this.locateSection();
  },
  destroy: function() {
    this.filter = null;
    this.section = null;
    this.rowTable = null;
  },
  locateSection: function() {
    this.section = null;
    this.rowTable = null;
    var divRows = this.filter.sortElement.getElementsByTagName("tr");
    for (var i = 0; i < divRows.length; i++) {
      var rowTR = divRows[i];
      if (rowTR.sortRow == 'true') {
        this.section = rowTR.rowObject;
        this.rowTable = this.section.getFilterTable();
        this.queryID = this.section.getQueryID();
        break;
      }
    }
    if (!this.section) {
      section = new GlideFilterSection(this.filter);
      section.setSort(true);
      this.queryID = section._setup(true);
      this.section = section;
      this.rowTable = section.getFilterTable();
      this.section.getRow().sortRow = 'true';
    }
  },
  addField: function(field, oper) {
    this.locateSection();
    if (!oper)
      oper = "ascending";
    var condition = this.section.addSortCondition(false);
    var row = condition.getRow();
    row.sortSpec = true;
    row = condition.getActionRow();
    row.sortSpec = true;
    var fSelect = addFields(this.getName(), field, true, this.filter.getIncludeExtended());
    var tdName = row.tdField;
    tdName.appendChild(fSelect);
    updateFields(this.getName(), fSelect, oper, null, this.filter.getIncludeExtended(), this.filter);
    condition.addLeftButtons();
  },
  getSection: function() {
    return this.section;
  },
  getName: function() {
    return this.filter.getName();
  },
  getID: function() {
    return this.queryID;
  },
  removeRunButton: function() {
    this.section.removeRunButton();
  },
  addRunButton: function() {
    this.section.addRunButton();
  },
  z: null
};
var GlideEncodedQuery = Class.create();
GlideEncodedQuery.prototype = {
  initialize: function(name, query, callback) {
    this.init();
    this.callback = callback;
    this.name = name;
    this.encodedQuery = query;
  },
  init: function() {
    this.orderBy = [];
    this.groupBy = [];
    this.terms = [];
  },
  parse: function() {
    this.reset(this.name, this.encodedQuery);
  },
  destroy: function() {
    for (var i = 0; i < this.orderBy.length; i++)
      this.orderBy[i].destroy();
    for (var i = 0; i < this.groupBy.length; i++)
      this.groupBy[i].destroy();
  },
  reset: function(name, query) {
    this.init();
    this.tableName = name;
    this.encodedQuery = query;
    this.decode();
  },
  decode: function() {
    this.getEncodedParts();
  },
  getEncodedParts: function() {
    if (typeof g_filter_description != 'undefined' && this.tableName == g_filter_description.getName() &&
      this.encodedQuery == g_filter_description.getFilter()) {
      this.partsXML = loadXML(g_filter_description.getParsedQuery());
      this.parseXML();
      return;
    }
    var ajax = new GlideAjax('QueryParseAjax');
    ajax.addParam('sysparm_chars', this.encodedQuery);
    ajax.addParam('sysparm_name', this.tableName);
    if (this.callback)
      ajax.getXML(this.getEncodedPartsResponse.bind(this));
    else {
      this.partsXML = ajax.getXMLWait();
      this.parseXML();
    }
  },
  getEncodedPartsResponse: function(response) {
    if (!response || !response.responseXML)
      this.callback();
    this.partsXML = response.responseXML;
    this.parseXML();
  },
  parseXML: function() {
    var items = this.partsXML.getElementsByTagName("item");
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var qp = new GlideQueryPart(item);
      if (qp.isGroupBy()) {
        this.addGroupBy(qp.getValue())
      } else if (qp.isOrderBy()) {
        this.addOrderBy(qp.getValue(), qp.isAscending());
      } else
        this.terms[this.terms.length] = qp;
    }
    if (this.callback)
      this.callback();
  },
  getXML: function() {
    return this.partsXML;
  },
  addGroupBy: function(groupBy) {
    this.groupBy[this.groupBy.length] = groupBy;
  },
  addOrderBy: function(orderBy, ascending) {
    this.orderBy[this.orderBy.length] = new GlideSortSpec(orderBy, ascending);
  },
  getTerms: function() {
    return this.terms;
  },
  getOrderBy: function() {
    return this.orderBy;
  },
  getGroupBy: function() {
    return this.groupBy;
  },
  z: null
};
var GlideQueryPart = Class.create();
GlideQueryPart.prototype = {
  initialize: function(item) {
    this.item = item;
    this.groupBy = false;
    this.orderBy = false;
    this.ascending = false;
    this.Goto = item.getAttribute("goto");
    this.EndQuery = item.getAttribute("endquery");
    this.NewQuery = item.getAttribute("newquery");
    this.OR = item.getAttribute("or");
    this.displayValue = item.getAttribute("display_value");
    this.valid = true;
    this.extract();
  },
  destroy: function() {
    this.item = null;
  },
  isOR: function() {
    return this.OR == 'true';
  },
  isNewQuery: function() {
    return this.NewQuery == 'true';
  },
  isGoTo: function() {
    return this.Goto == 'true';
  },
  extract: function() {
    if (this.EndQuery == 'true') {
      this.valid = false;
      return;
    }
    this.operator = this.item.getAttribute("operator");
    this.value = this.item.getAttribute("value");
    this.field = this.item.getAttribute("field");
    if (this.operator == 'GROUPBY') {
      this.groupBy = true;
      return;
    }
    if (this.operator == 'ORDERBYDESC') {
      this.orderBy = true;
      this.ascending = false;
      return;
    }
    if (this.operator == 'ORDERBY') {
      this.orderBy = true;
      this.ascending = true;
      return;
    }
    for (i = 0; i < operators.length; i++) {
      if (this.operator == operators[i])
        break;
    }
    if (i == operators.length) {
      this.valid = false;
      return;
    }
    if (this.field.startsWith("variables.")) {
      this.value = this.field.substring(10) + this.operator + this.value;
      this.field = "variables";
      this.operator = '=';
    }
    if (this.field.startsWith("sys_tags."))
      this.field = "sys_tags";
    if (this.operator == "HASVARIABLE" || this.operator == "HASITEMVARIABLE") {
      this.operator = '=';
      this.field = "variables";
      this.value = this.value.substring(1);
    }
    if (this.operator == "HASQUESTION") {
      this.operator = '=';
      this.field = "variables";
      this.value = this.value.substring(1);
    }
  },
  getOperator: function() {
    this.operator.title = "Operator";
    return this.operator;
  },
  getField: function() {
    this.field.title = "Field";
    return this.field;
  },
  getValue: function() {
    this.value.title = "Value";
    return this.value;
  },
  isValid: function() {
    return this.valid;
  },
  isGroupBy: function() {
    return this.groupBy;
  },
  isOrderBy: function() {
    return this.orderBy;
  },
  isAscending: function() {
    return this.ascending;
  },
  z: null
};
var GlideSortSpec = Class.create();
GlideSortSpec.prototype = {
  initialize: function(name, ascending) {
    this.field = name;
    this.ascending = ascending;
  },
  getName: function() {
    return this.field;
  },
  isAscending: function() {
    return this.ascending;
  },
  z: null
};

function setRemoveButtonAria() {
  var answer = getMessages(MESSAGES_FILTER_BUTTONS);
  var deleteButtons = $j(".condition-row__remove-cell");
  for (var i = 0; i < deleteButtons.length; i++) {
    var conditionRow = deleteButtons[i].parentNode.childNodes;
    for (var n = 0; n < conditionRow.length; n++) {
      var filterCondition = conditionRow[n].getAttribute("data-value");
      if (filterCondition) {
        deleteButtons[i].childNodes[0].setAttribute("aria-label", answer['Remove Condition'] + " " + (i + 1) + ": " + filterCondition);
      }
    }
  }
}

function newSubRow(elBut, name) {
  var fDiv = getThing(name, 'gcond_filters');
  if (fDiv && !checkFilterSize(fDiv.filterObject))
    return;
  var butTD = elBut.parentNode;
  var butTR = butTD.parentNode;
  var butTable = butTR.parentNode;
  butTable.conditionObject.addNewSubCondition();
  _frameChanged();
}

function findInArray(a, searchID) {
  for (var i = 0; i < a.length; i++) {
    var condition = a[i];
    if (condition.getID() == searchID)
      return i;
  }
  return null;
}

function celQuery(name, parent, queryID) {
  var e = cel(name);
  if (parent)
    parent.appendChild(e);
  e.queryID = queryID;
  return e;
}

function runThisFilter(atag) {
  var filterObj = atag.parentNode.filterObject;
  var tableName = filterObj.getName();
  if (runFilterHandlers[tableName]) {
    var filter = getFilter(tableName);
    runFilterHandlers[tableName](tableName, filter);
    return;
  }
  filterObj.runFilter();
}

function buildURL(tableName, query) {
  var url = (tableName.split("."))[0] + "_list.do?sysparm_query=" + query;
  var view = gel('sysparm_view');
  if (view) {
    view = view.value;
    url += '&sysparm_view=' + view;
  }
  var refQuery = gel('sysparm_ref_list_query');
  if (refQuery)
    url += "&sysparm_ref_list_query=" + refQuery.value;
  var target = gel('sysparm_target');
  if (target) {
    target = target.value;
    url += '&sysparm_target=' + target;
    url += '&sysparm_stack=no';
    var e = gel("sysparm_reflist_pinned");
    if (e)
      url += '&sysparm_reflist_pinned=' + e.value;
  }
  return url;
}

function createCondFilter(tname, query, fieldName, elem) {
  "use strict"
  noOps = false;
  noSort = false;
  noConditionals = false;
  useTextareas = false;
  new GlideConditionsHandler(tname, function(filter) {
    if (filter) {
      var filterDiv = filter.getDiv() || getThing(filter.tableName, filter.divName);
      if (filterDiv) {
        filterDiv.initialQuery = query;
      }
      filter.setQuery(query);
      g_form.registerHandler(fieldName, filter);
      if (elem && elem.getAttribute("readonly") === "readonly") {
        var formTable = g_form.getTableName();
        var fieldNameWithoutPrefix = fieldName.replace(formTable + '.', '');
        g_form.setReadOnly(fieldNameWithoutPrefix, true);
      }
      $(filterDiv).fire('glide:filter.create.condition_filter', filter);
    }
  }, fieldName);
}

function checkFilterSize(filterObject) {
  var validFilterSize = true;
  var filterString = "";
  if (isNaN(g_glide_list_filter_max_length) || g_glide_list_filter_max_length <= 0)
    return validFilterSize;
  if (filterObject === undefined || filterObject === null)
    return validFilterSize;
  if (typeof filterObject === "object" && filterObject["type"] === 'GlideFilter')
    filterString = getFilter(filterObject.getDiv().id.split("gcond_filters", 1));
  if (filterString && filterString.length > g_glide_list_filter_max_length) {
    var dialog = new GlideDialogWindow('filter_limit_window', false);
    dialog.setTitle(getMessage("Filter Limit Reached"));
    dialog.setBody("<div style='padding: 10px'>" + getMessage("The filter you are using is too big. Remove some conditions to make it smaller.") + "</div>", false, false);
    $("filter_limit_window").style.visibility = "visible";
    validFilterSize = false;
  }
  return validFilterSize;
}
document.on('click', 'button.filter_add_sort', function(evt, element) {
  evt.preventDefault();
  var name = element.getAttribute('data-name');
  addSortSpec(name);
  evt.stopPropagation();
});
document.on('click', 'button.filter_add_filter', function(evt, element) {
  evt.preventDefault();
  var name = element.getAttribute('data-name');
  addConditionSpec(name);
  evt.stopPropagation();
});
document.on('click', 'button.filter_and_filter', function(evt, element) {
  evt.preventDefault();
  var name = element.getAttribute('data-name');
  addCondition(name);
  evt.stopPropagation();
});;
/*! RESOURCE: /scripts/classes/util/NameMapEntry.js */
var NameMapEntry = Class.create({
  initialize: function(prettyName, realName, label) {
    this.prettyName = prettyName;
    this.realName = realName;
    this.label = label;
  }
});;
/*! RESOURCE: /scripts/doctype/form_submitted_mask.js */
addLoadEvent(function() {
  var isDoctype = document.documentElement.getAttribute('data-doctype') == 'true';
  if (!isDoctype)
    return;
  CustomEvent.observe('glide:form_submitted', function() {
    $(document.body).addClassName('submitted');
    setTimeout(function() {
      CustomEvent.fireTop('glide:nav_form_stay', window);
    }, 750);
  })
  CustomEvent.observe('glide:nav_form_stay', function(originWindow) {
    var ga = new GlideAjax('AJAXFormLoad');
    ga.addParam('sysparm_name', 'canFormReload');
    if (window.g_form && g_form.isNewRecord()) {
      ga.addParam('sysparm_table', g_form.getTableName());
      ga.addParam('sysparm_sys_id', g_form.getUniqueValue());
    }
    ga.getXMLAnswer(function(answer) {
      if (answer == 'submitted') {
        jslog("Record already submitted, not re-enabling form controls");
        return;
      }
      enableFormControls(originWindow);
    })
  });

  function enableFormControls(originWindow) {
    if (originWindow != self)
      return;
    $(document.body).removeClassName('submitted');
    if (window.g_form)
      g_form.submitted = false;
    if (window.g_submitted)
      g_submitted = false;
  }
});
/*! RESOURCE: /scripts/plugins/InPlaceEdit.js */
Plugin.create('inPlaceEdit', {
  initialize: function(elem, options) {
    if (elem.retrieve('inPlaceEdit'))
      return;
    this.options = Object.extend({
      editOnSingleClick: false,
      turnClickEditingOff: false,
      onBeforeEdit: function() {},
      onEditCancelled: function() {},
      onAfterEdit: function() {},
      selectOnStart: false,
      convertNbspToSpaces: true,
      titleText: null
    }, options || {});
    this.elem = elem;
    this.elem.setAttribute('class', 'content_editable');
    var mouseEvent;
    if (!this.options.turnClickEditingOff) {
      if (this.options.editOnSingleClick)
        mouseEvent = 'click';
      else
        mouseEvent = 'dblclick';
      this.elem.observe(mouseEvent, this.beginEdit.bind(this));
    }
    this.elem.onselectstart = function() {
      return true;
    };
    this.elem.style.MozUserSelect = 'text';
    if (this.options.titleText)
      this.elem.writeAttribute('title', this.options.titleText);
    this.keyPressHandler = this.keyPress.bind(this);
    this.keyDownHandler = this.keyDown.bind(this);
    this.endEditHandler = this.endEdit.bind(this);
    this.elem.beginEdit = this.beginEdit.bind(this);
    this.elem.store('inPlaceEdit', this);
  },
  beginEdit: function(event) {
    this.options.onBeforeEdit.call(this);
    this.elem.writeAttribute("contentEditable", "true");
    this.elem.addClassName("contentEditing");
    this.elem.observe('keypress', this.keyPressHandler);
    this.elem.observe('keydown', this.keyDownHandler);
    this.elem.observe('blur', this.endEditHandler);
    this.elem.focus();
    if (this.options.selectOnStart) {
      this.elem.select();
      var range;
      if ((range = document.createRange)) {
        if (range.selectNodeContents) {
          range.selectNodeContents(this.elem);
          window.getSelection().addRange(range);
        }
      } else if (document.body.createTextRange) {
        range = document.body.createTextRange();
        if (range.moveToElementText) {
          range.moveToElementText(this.elem);
          range.collapse(true);
          range.select();
        }
      }
    }
    this.oldValue = this.elem.innerHTML;
    if (typeof event != 'undefined' && event)
      Event.stop(event);
  },
  keyPress: function(event) {
    return this._submitEdit(event);
  },
  keyDown: function(event) {
    return this._submitEdit(event);
  },
  endEdit: function(event) {
    this.elem.writeAttribute("contentEditable", "false");
    this.elem.removeClassName("contentEditing");
    this.elem.stopObserving('keypress', this.keyPressHandler);
    this.elem.stopObserving('blur', this.endEditHandler);
    var newValue = this.elem.innerHTML.replace(/<br>$/, '');
    if (this.options.convertNbspToSpaces)
      newValue = newValue.replace(/&nbsp;/g, ' ');
    if (newValue != this.oldValue) {
      newValue = newValue.replace(/^\s+|\s+$/g, '');
      this.elem.update(newValue);
      this.options.onAfterEdit.call(this, newValue);
    } else {
      this.options.onEditCancelled.call(this);
    }
    return false;
  },
  _submitEdit: function(event) {
    var key = event.which || event.keyCode;
    var e = Event.element(event);
    if (key == Event.KEY_RETURN) {
      e.blur();
      Event.stop(event);
      return false;
    }
    if (key == Event.KEY_ESC) {
      this.elem.innerHTML = this.oldValue;
      e.blur();
      return false;
    }
    return true;
  }
});;
/*! RESOURCE: /scripts/doctype/PersonalizeForm.js */
var PersonalizeForm = Class.create({
  initialize: function(toggleButtonSelector) {
    var self = this;
    this.$toggleButton = $j(toggleButtonSelector);
    this.$toggleButton.hideFix();
    if (this.$toggleButton.length < 1)
      return;
    this.isOpen = false;
    this.isInitialized = false;
    this.ref = this.$toggleButton.data("ref");
    this.$container = $j(this.$toggleButton.data('target'));
    this.$fieldLabelHideButtons = null;
    this.$fields = null;
    this.$toggleButton.click(function() {
      if (self.isOpen) {
        self.hideSidebar();
      } else {
        if (!self.isInitialized) {
          self.initializeSidebar();
        } else
          self.showSidebar();
      }
    });
    $j('html').on('click', function(e) {
      if (self.isOpen && !self.$toggleButton.is(e.target) && self.$container.parents('.popover').has($j(e.target)).length == 0) {
        self.hideSidebar();
      }
    });
    $j(document).keyup(function(e) {
      if (e.keyCode == 27) {
        if (self.isOpen && self.$container.parents('.popover').has($j(e.target)).length == 0) {
          self.hideSidebar();
        }
      }
    });
    $j(window).on('resize', function() {
      if (self.isOpen)
        self.hideSidebar();
    });
    this.initializeForm();
  },
  initializeForm: function() {
    var fields = g_form._getPersonalizeHiddenFields();
    fields.forEach(function(f) {
      g_form.setDisplay(f, false);
    })
  },
  initializeSidebar: function() {
    var self = this;
    this.$toggleButton.popover({
      html: true,
      placement: 'bottom',
      trigger: 'manual',
      content: function() {
        self.$container.show();
        return self.$container;
      }
    });
    this.render();
    this.isInitialized = true;
    this.showSidebar();
  },
  hideSidebar: function() {
    this.$toggleButton.removeClass("icon-cog-selected").addClass("icon-cog");
    this.$toggleButton.popover('hide');
    if (this.$fieldLabelHideButtons != null)
      this.$fieldLabelHideButtons.hide();
    this.isOpen = false;
    this.$toggleButton.attr('aria-expanded', 'false');
    if (window && window.accessibilityEnabled && this.focusTrap) {
      this.focusTrap.deactivate();
    }
  },
  showSidebar: function() {
    this.$toggleButton.removeClass("icon-cog").addClass("icon-cog-selected");
    this.$toggleButton.popover('show');
    this.$container.parent().parent().find('h3.popover-title').hide();
    this.setPopoverHeight();
    if (this.$fieldLabelHideButtons != null)
      this.$fieldLabelHideButtons.show();
    var self = this;
    if (g_form.personalizeHiddenFields.length) {
      $j(".personalize_form_preference_reset").show().click(function(e) {
        for (var i = g_form.personalizeHiddenFields.length; i >= 0; i--) {
          document.getElementById(g_form.personalizeHiddenFields[i]).checked = true;
          g_form.setUserDisplay(g_form.personalizeHiddenFields[i], true);
        }
        self.hideSidebar();
        $j(".personalize_form_preference_reset").hide();
        e.preventDefault();
      });
    }
    if (this.$fields != null)
      this.$fields.change(this, function(event) {
        var fieldName = $j(this).attr('name');
        var display = $j(this).prop('checked');
        g_form.setUserDisplay(fieldName, display);
        event.preventDefault();
        event.stopPropagation();
      });
    this.isOpen = true;
    this.$toggleButton.attr('aria-expanded', 'true');
    this.$container.on('click', '.dismiss', function(e) {
      self.hideSidebar();
    });
    if (window && window.accessibilityEnabled && window.focusTrap) {
      this.focusTrap = window.focusTrap(this.$container[0]);
      this.focusTrap.activate();
    }
  },
  setPopoverHeight: function() {
    var bootstrapPopoverContentPadding = 28;
    var popoverMaxHeight = window.innerHeight - 120;
    var popoverContentsHeight = this.$container.height();
    var topOffset = this.$container.position().top;
    var popoverOuterHeight = popoverMaxHeight;
    var popoverInnerHeight = (popoverMaxHeight - topOffset) + bootstrapPopoverContentPadding;
    if (popoverContentsHeight + bootstrapPopoverContentPadding <= popoverMaxHeight) {
      popoverOuterHeight = popoverContentsHeight;
      popoverInnerHeight = popoverContentsHeight;
    }
    this.$container.parent(".popover-content").height(popoverOuterHeight);
    this.$container.height(popoverInnerHeight);
  },
  render: function() {
    var formElements = this.getFormElements();
    var container = this.$container.find('.personalize_form_fields');
    var template = new XMLTemplate('personalize_item');
    var self = this;
    formElements.forEach(function(e) {
      var html = $j(template.evaluate(e));
      var input = html.find('input').prop('checked', e.display);
      if (e.isDisabled)
        input.attr("disabled", "disabled");
      else {
        var fieldLabelTd = $j(gel("label." + self.ref + "." + e.name));
        fieldLabelTd.css("position", "relative");
        if (window && !window.accessibilityEnabled) {
          var hideButton = $j("<a class='icon icon-delete personalize_form_hide_field' href='#'></a>");
          hideButton.attr("title", "Hide " + e.label);
          hideButton.data("input", input);
          fieldLabelTd.find('label').prepend(hideButton);
        }
        fieldLabelTd.parent().mouseenter(self, function(event) {
          if (event.data.isOpen)
            $j(self).addClass("personalize_hover");
        }).mouseleave(self, function(event) {
          if (event.data.isOpen)
            $j(self).removeClass("personalize_hover");
        });
        input.next().mouseenter(fieldLabelTd, function(event) {
          event.data.parent().addClass("personalize_hover");
        }).mouseleave(fieldLabelTd, function(event) {
          event.data.parent().removeClass("personalize_hover");
        });
        if (self.$fieldLabelHideButtons === null)
          self.$fieldLabelHideButtons = hideButton;
        else if (window && !window.accessibilityEnabled)
          self.$fieldLabelHideButtons = self.$fieldLabelHideButtons.add(hideButton);
        if (self.$fields === null)
          self.$fields = input;
        else
          self.$fields = self.$fields.add(input);
      }
      container.append(html);
    });
    if (this.$fieldLabelHideButtons != null)
      this.$fieldLabelHideButtons.click(function(event) {
        $j(this).data("input").click();
        event.preventDefault();
        event.stopPropagation();
      });
  },
  getFormElements: function() {
    var fieldNames = g_form.elements.sort(function(a, b) {
      return a.fieldName <= b.fieldName ? -1 : 1;
    });
    var answer = [];
    fieldNames.each(function(item) {
      if (item.tableName == "variable")
        return;
      answer.push({
        name: item.fieldName,
        label: g_form.getLabelOf(item.fieldName),
        display: !g_form.isUserPersonalizedField(item.fieldName),
        isDisabled: (g_form.isMandatory(item.fieldName) || g_form.isDisplayNone(item, g_form.getControl(item.fieldName))) && !g_form.isUserPersonalizedField(item.fieldName)
      })
    });
    return answer;
  },
  toString: function() {
    return 'PersonalizeForm';
  }
});
$j(function() {
  "use strict";
  if (typeof g_form !== "undefined")
    new PersonalizeForm("#togglePersonalizeForm");
});;
/*! RESOURCE: /scripts/doctype/deferred_related_lists.js */
$j(function($) {
  "use strict";
  if (window.NOW.concourseLists) {
    return;
  }
  var timeout = 50;
  var loadingTimeout = 3000;
  var loadingTimer = null;
  setTimeout(function() {
    if (!window.g_form || window.g_related_list_timing != 'deferred')
      return;
    getRelatedLists();
  }, timeout);
  $('.related-list-trigger').on('click', function() {
    $(this).closest('.related-list-trigger-container').hide();
    loadingTimeout = 0;
    getRelatedLists();
  })

  function getRelatedLists() {
    setupLoadingMessage();
    var deferred_start_time = new Date();
    var listContainer = $('#related_lists_wrapper');
    if (listContainer.length === 0)
      return;
    var url = new GlideURL('list2_deferred_related_lists.do');
    url.addParam('sysparm_table', g_form.getTableName());
    url.addParam('sysparm_keep_related_lists_open', 'true');
    url.addEncodedString('sysparm_sys_id=' + g_form.getUniqueValue().trim());
    url.addParam('sysparm_view', $('#sysparm_view').val());
    if ($('#sysparm_domain'))
      url.addParam('sysparm_domain', $('#sysparm_domain').val());
    if ($('#sysparm_domain_scope'))
      url.addParam('sysparm_domain_scope', $('#sysparm_domain_scope').val());
    url.addParam('sysparm_stack', 'no');
    url.addParam('partial_page', 'related_lists');
    url.addEncodedString('sysparm_embedded=' + $('#sysparm_embedded').val());
    var ga = new GlideAjax(null, url.getURL());
    ga.getXML(function(response) {
      var deferred_responsetime = new Date();
      CustomEvent.fire('page_timing', {
        name: 'RLV2',
        child: 'Delay until load',
        ms: (deferred_responsetime - deferred_start_time)
      });
      var html = response.responseText;
      listContainer[0].innerHTML = html;
      html.evalScripts(true);
      CustomEvent.fire('partial.page.reload');
      CustomEvent.fire('list.initialize.tags');
      clearLoadingMessage();
      var lists_loaded_time = new Date();
      var deferred_loadtime = lists_loaded_time - deferred_start_time;
      CustomEvent.fire('page_timing', {
        name: 'RLV2',
        child: 'Network time',
        ms: (lists_loaded_time - deferred_responsetime)
      });
    });
  }
  CustomEvent.observe('list.loaded', function(table, list) {
    if (!table) {
      return;
    }
    if (!list) {
      return;
    }
    if (list.getReferringURL().indexOf('list2_deferred_related_lists.do') != -1 ||
      list.getReferringURL() == 'undefined')
      list.setReferringURL(window.location.pathname + window.location.search);
  });

  function setupLoadingMessage() {
    loadingTimer = setTimeout(function() {
      $('.related-list-loading').fadeIn();
    }, loadingTimeout)
  }

  function clearLoadingMessage() {
    if (loadingTimer)
      clearTimeout(loadingTimer);
    $('.related-list-loading').hide();
  }
});
/*! RESOURCE: /scripts/classes/GlideNavigation.js */
;
(function() {
  var GlideNavigation = function() {};
  var MAX_URL_LENGTH = 2000;
  var _open = function(url, target) {
    if (target) {
      window.open(url, target);
      return;
    }
    window.location.href = url;
  };
  GlideNavigation.prototype = {
    open: function(url, target) {
      if (url.length <= MAX_URL_LENGTH) {
        _open(url, target);
        return;
      }
      jQuery.ajax({
        type: "POST",
        url: '/api/now/tinyurl',
        data: JSON.stringify({
          url: url
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json"
      }).done(function(response) {
        _open(response.result, target);
      });
    },
    openList: function(table, query) {
      var url = table + '_list.do';
      if (query)
        url += "?sysparm_query=" + encodeURIComponent(query);
      this.open(url);
    },
    openRecord: function(table, sys_id) {
      var url = table + '.do?sys_id=' + sys_id;
      this.open(url);
    },
    reloadWindow: function() {
      if (window.location.reload)
        window.location.reload();
    },
    refreshNavigator: function() {
      CustomEvent.fireTop('navigator.refresh');
    },
    getURL: function() {
      return window.location.href;
    },
    openPopup: function(url, name, features, noStack) {
      if (noStack === true && url.indexOf("sysparm_nameofstack") == -1)
        url += "&sysparm_stack=no";
      var win = window.open(url, name, features, false);
      return win;
    },
    setPermalink: function(title, relativePath) {
      CustomEvent.fireTop('magellanNavigator.permalink.set', {
        title: title,
        relativePath: relativePath
      });
    },
    addUserHistoryEntry: function(title, relativePath, description, isTable) {
      if (typeof description == "undefined")
        description = "";
      if (typeof isTable == "undefined")
        isTable = false;
      CustomEvent.fireTop('magellanNavigator.sendHistoryEvent', {
        title: title,
        url: relativePath,
        description: description,
        isTable: isTable
      });
    }
  };
  window.g_navigation = new GlideNavigation();
})();;
/*! RESOURCE: /scripts/classes/GlideAPI1.js */
window.g_api = 1;;
/*! RESOURCE: /scripts/ac.js */
var g_isInternetExplorer = isMSIE;
var KEY_RETURN = 3;
var KEY_BACKSPACE = 8;
var KEY_TAB = 9;
var KEY_ENTER = 13;
var KEY_PAGEUP = 33;
var KEY_PAGEDOWN = 34;
var KEY_END = 35;
var KEY_HOME = 36;
var KEY_ARROWLEFT = 37;
var KEY_ARROWUP = 38;
var KEY_ARROWRIGHT = 39;
var KEY_ARROWDOWN = 40;
var KEY_INSERT = 45;
var KEY_DELETE = 46;
var KEY_ESC = 27;
var NO_INVISIBLE = 0;
var itemHeight = 16;
var ctimeVal = {};
var TAG_DIV = "div";
var TAG_SPAN = "span";
var ONE_TO_MANY = "OTM";
var g_ac_objects = new Array();

function acKeyDown(evt, elementName, type, dependent) {
  var typedChar = getKeyCode(evt);
  if (typedChar == KEY_ARROWDOWN || typedChar == KEY_ARROWUP)
    fieldChange(evt, elementName, type, dependent);
}

function acKeyUp(evt, elementName, type, dependent) {
  var typedChar = getKeyCode(evt);
  if (typedChar != KEY_ARROWDOWN && typedChar != KEY_ARROWUP)
    fieldChange(evt, elementName, type, dependent);
}

function fieldChange(event, elementName, type, dependent) {
  if (document.readyState && document.readyState != "complete") {
    jslog("fieldChange delayed due to document not being ready");
    return;
  }
  var table = elementName.split('.')[0];
  var additional = null;
  if (dependent != null) {
    var dparts = dependent.split(",");
    var el = document.getElementsByName(table + "." + dparts[0])[0];
    if (el != null) {
      var selectValue = "";
      if (el.tagName == "INPUT") {
        var selectValue = el.value;
      } else {
        selectValue = el.options[el.selectedIndex].value;
      }
      additional = "sysparm_value=" + selectValue;
    }
  }
  fieldProcess(event, elementName, type, false, true, null, additional);
}

function fieldProcess(evt, elementName, type, noMax, useInvisible, uFieldName, additional, refField) {
  var typedChar = getKeyCode(evt);
  if (ctimeVal[elementName] > 0 && typedChar != 0)
    clearTimeout(ctimeVal[elementName]);
  var displayField;
  var invisibleField;
  if (type == "Reference") {
    displayField = gel("sys_display." + elementName);
    if (useInvisible)
      invisibleField = gel(elementName);
  } else {
    displayField = gel(elementName);
    if (useInvisible)
      invisibleField = gel("sys_display." + elementName);
  }
  var updateField;
  if (uFieldName != null)
    updateField = gel(uFieldName);
  var ac = displayField.ac;
  if (ac == null) {
    ac = getAC(displayField.name);
    if (ac == null) {
      ac = newAC(displayField, invisibleField, updateField, elementName, type);
      if (ac.isOTM())
        ac.refField = refField;
    }
  }
  if (typedChar != KEY_TAB) {
    ac.fieldChanged = true;
    ac.matched = false;
    ac.ignoreAJAX = false;
    if (ac.type == 'Reference')
      ac.dirty = true;
  }
  var waitTime = 50;
  if (typedChar == KEY_ARROWDOWN || typedChar == KEY_ARROWUP || typedChar == NO_INVISIBLE)
    waitTime = 0;
  ctimeVal[elementName] = setTimeout(function() {
    fieldProcessNow(typedChar, elementName, type, noMax, useInvisible, uFieldName, additional, refField);
  }, g_acWaitTime || waitTime);
}

function initAutoCompleteField(ac) {
  if (ac.getUpdateField())
    return;
  Event.observe(ac.getField(), 'blur', fieldBlurred.bind(ac.getField()), false);
  setDropDownSizes();
  setStyle(ac.getMenu(), "dropDownTableStyle");
  window.onresize = setDropDownSizes;
  setSavedText(ac, new Array((ac.getInvisibleField() ? ac.getInvisibleField().value : null), ac.getField().value));
  var request = new Object();
  request.responseXML = new Object();
  request.responseXML.ac = ac;
  storeResults(ac, "", request);
}

function setDropDownSizes() {
  for (var i = 0; i < g_ac_objects.length; i++) {
    var ac = g_ac_objects[i];
    if (!ac)
      continue;
    setDropDownSize(ac);
  }
}

function setDropDownSize(ac) {
  var field = ac.getField();
  var mLeft = grabOffsetLeft(field) + "px";
  var mTop = grabOffsetTop(field) + (field.offsetHeight - 1) + "px";
  var mWidth = estimateWidth(ac) + "px";
  var menu = ac.getMenu();
  if (menu.offsetWidth > parseInt(mWidth))
    mWidth = menu.offsetWidth + "px";
  acSetTopLeftWidth(menu.style, mTop, mLeft, mWidth);
  var iframe = ac.getIFrame();
  if (iframe)
    acSetTopLeftWidth(iframe.style, mTop, mLeft, mWidth);
}

function acSetTopLeftWidth(style, top, left, width) {
  style.left = left;
  style.top = top;
  style.width = width;
}

function estimateWidth(ac) {
  var field = ac.getField();
  if (g_isInternetExplorer)
    return field.offsetWidth - (ac.menuBorderSize * 2);
  else
    return field.offsetWidth;
}

function fieldBlurred() {
  var theField = this;
  var ac = theField.ac;
  ac.ignoreAJAX = true;
  var cc = ac.getField().value;
  if (cc.indexOf("javascript:") != 0) {
    if (ac.type == 'Reference' && ac.matched == false && ac.fieldChanged == true) {
      setReferenceField(ac, cc);
    }
  }
  ac.matched = false;
  ac.fieldChanged = false;
  ac.previousTextValue = '';
  checkForDirty(ac);
  ac.hideDropDown();
}

function setReferenceField(ac, cc) {
  var encodedText = encodeText(cc);
  var url = "xmlhttp.do?sysparm_processor=" + ac.type +
    "&sysparm_name=" + ac.elementName +
    "&sysparm_exact_match=yes" +
    "&sysparm_chars=" + encodedText +
    "&sysparm_type=" + ac.type;
  var response = serverRequestWait(url);
  var items = response.responseXML.getElementsByTagName("item");
  if (items.length == 1) {
    var item = items[0];
    var name = trim(item.getAttribute("name"));
    var label = trim(item.getAttribute("label"));
    ac.getField().value = label;
    ac.getInvisibleField().value = name;
  } else {
    var e = ac.getField();
    var f = e.filter;
    if (!f || f == '') {
      ac.getInvisibleField().value = "x";
      ac.getField().value = "";
      ac.getInvisibleField().value = "";
    }
  }
  fieldSet(ac);
  refFlipImage(ac.getField(), ac.elementName);
  ac.dirty = true;
}

function stripNewlines(data) {
  var retData = "";
  var Ib = "\n\r";
  for (var c = 0; c < data.length; c++) {
    if (Ib.indexOf(data.charAt(c)) == -1)
      retData += data.charAt(c);
    else
      retData += " ";
  }
  return retData;
}

function grabMenuInfo(j) {
  var spanTag = j.getElementsByTagName(TAG_SPAN);
  var spanInfo = new Array();
  if (!spanTag)
    return spanInfo;
  for (var i = 0; i < spanTag.length; i++) {
    var e = spanTag[i];
    if (e.className != "selected_item")
      continue;
    var spanData = e.innerHTML;
    if (spanData != "&nbsp;") {
      spanInfo = new Array(e.gname, stripNewlines(e.glabel));
    }
    break;
  }
  return spanInfo;
}

function storeResults(ac, searchString, req) {
  ac.resultsStorage[searchString] = req;
}

function retrieveStorage(ac, textStr) {
  return ac.resultsStorage[textStr];
}

function storeZeroString(ac, searchString, req) {
  ac.emptyResults[searchString] = req;
}

function findRelatedZeroString(ac, searchString) {
  for (var str in ac.emptyResults) {
    if (searchString.substring(0, str.length) == str) {
      return ac.emptyResults[str];
    }
  }
}
var handleClickedDropDown = function() {
  setAllText(this.ac, grabMenuInfo(this));
  this.ac.dirty = false;
}
var handleMouseOverDropDown = function() {
  setStyle(this, "selectedItemStyle");
}
var handleMouseOutDropDown = function() {
  setStyle(this, "nonSelectedItemStyle");
}

function dropDownHilight(ac, direction) {
  setTextField(ac, new Array((ac.getInvisibleField() ? ac.savedInvisibleTextValue : null), ac.savedTextValue));
  ac.matched = true;
  if (!ac.currentMenuItems || ac.currentMenuCount <= 0)
    return;
  ac.showDropDown();
  var toSelect = ac.selectedItemNum + direction;
  if (toSelect >= ac.currentMenuCount)
    toSelect = ac.currentMenuCount - 1;
  if (ac.selectedItemNum != -1 && toSelect != ac.selectedItemNum) {
    setStyle(ac.selectedItemObj, "nonSelectedItemStyle");
    ac.selectedItemNum = -1;
  }
  if (toSelect < 0) {
    ac.selectedItemNum = -1;
    ac.getField().focus();
    return;
  }
  ac.selectItem(toSelect);
  setStyle(ac.selectedItemObj, "selectedItemStyle");
  setTextField(ac, grabMenuInfo(ac.selectedItemObj));
  ac.dirty = true;
}

function setPreviousText(ac, textArray) {
  if (textArray[1] != null)
    ac.previousTextValue = textArray[1];
}

function setSavedText(ac, textArray) {
  ac.setSavedText(textArray);
}

function setTextValue(ac, textArray) {
  ac.textValue = textArray[1].replace(/\r\n/g, "\n");
  if (textArray[0] != null && ac.getInvisibleField()) {
    ac.invisibleTextValue = textArray[0];
  }
}

function setTextField(ac, textArray) {
  var f;
  if (textArray[0] != null && ac.getInvisibleField()) {
    f = ac.getInvisibleField();
    f.value = textArray[0];
  }
  f = ac.getField();
  f.value = textArray[1];
  fireOnFormat(ac);
}

function setAllText(ac, textArray) {
  setSavedText(ac, textArray);
  setTextValue(ac, textArray);
  setTextField(ac, textArray);
  setPreviousText(ac, textArray);
  fieldSet(ac);
}

function fieldSet(ac) {
  ac.dirty = false;
  ac.matched = true;
  updateRelated(ac);
  fireChange(ac);
  fireOnFormat(ac);
}

function fireChange(ac) {
  callOnChange(ac.getInvisibleField());
  callOnChange(ac.getField());
}

function callOnChange(f) {
  if (!f)
    return;
  if (f["onchange"])
    f.onchange();
}

function fireOnFormat(ac) {
  var f = ac.getField();
  if (f.getAttribute("onformat"))
    eval(f.getAttribute("onformat"));
}

function updateRelated(ac) {
  var elementName = ac.elementName;
  var elementValue = ac.invisibleTextValue;
  if (elementValue != '')
    updateRelatedGivenNameAndValue(elementName, elementValue);
  if (ac["fCall"]) {
    var onset = ac["fCall"];
    eval(onset);
  }
}

function clearRelated(ac) {
  var elementName = ac.elementName;
  var nodes = document.getElementsByTagName('input');
  var sName = elementName + ".";
  for (var i = 0; i < nodes.length; i++) {
    var current = nodes[i];
    var id = current.id;
    var index = id.indexOf(sName);
    if (index == -1)
      continue;
    index = id.lastIndexOf(".");
    var fName = id.substring(index + 1, id.length);
    var select = gel(elementName + "." + fName);
    if (select != null) {
      var x = select.tagName;
      if (x == 'select' || x == 'SELECT') {
        var selindex = select.selectedIndex;
        if (selindex != -1) {
          var option = select.options[selindex];
          option.selected = false;
        }
        var options = select.options;
        for (oi = 0; oi < options.length; oi++) {
          var option = options[oi];
          var optval = option.value;
          if (optval == '') {
            option.selected = true;
            break;
          }
        }
      }
    }
    current.value = '';
  }
}

function setStyle(child, styleName) {
  child.className = styleName;
  var style = child.style;
  var ac = child.ac;
  if (styleName == "dropDownTableStyle") {
    style.fontSize = "13px";
    style.fontFamily = "arial,sans-serif";
    style.wordWrap = "break-word";
  } else if (styleName == "nonSelectedItemStyle") {
    ac.setNonSelectedStyle(child);
  } else if (styleName == "selectedItemStyle") {
    ac.setSelectedStyle(child);
  } else if (styleName == "dropDownRowStyle") {
    style.display = "block";
    style.paddingLeft = 3;
    style.paddingRight = 3;
    style.height = itemHeight + "px";
    style.overflow = "hidden";
    style.whiteSpace = "nowrap";
  }
}

function createDropDown(ac, foundStrings) {
  ac.clearDropDown();
  for (var c = 0; c < foundStrings.length; c++) {
    var child = createChild(ac, foundStrings[c]);
    ac.appendItem(child);
  }
  setSavedText(ac, new Array((ac.getInvisibleField() ? ac.invisibleTextValue : null), ac.textValue));
  if (ac.currentMenuCount != 0) {
    var height = (itemHeight * ac.currentMenuCount) + 4;
    ac.setHeight(height);
  }
  ac.selectedItemObj = null;
  ac.selectedItemNum = -1;
}

function createChild(ac, sa) {
  var theDiv = cel(TAG_DIV);
  theDiv.ac = ac;
  setStyle(theDiv, "nonSelectedItemStyle");
  theDiv.onmousedown = handleClickedDropDown;
  theDiv.onmouseover = handleMouseOverDropDown;
  theDiv.onmouseout = handleMouseOutDropDown;
  var menuRow = cel(TAG_SPAN);
  setStyle(menuRow, "dropDownRowStyle");
  if (false && sa.length == 4) {
    var r = cel(TAG_SPAN);
    r.innerHTML = sa[3];
    menuRow.appendChild(r);
    r = cel(TAG_SPAN);
    r.innerHTML = "&nbsp;";
    menuRow.appendChild(r);
  }
  var itemInRow = cel(TAG_SPAN);
  itemInRow.innerHTML = sa[1].escapeHTML();
  itemInRow.gname = sa[0];
  if (ac.type == "PickList")
    itemInRow.glabel = sa[2];
  else
    itemInRow.glabel = sa[1];
  itemInRow.className = "selected_item";
  menuRow.appendChild(itemInRow);
  theDiv.appendChild(menuRow);
  return theDiv;
}

function encodeText(txt) {
  if (encodeURIComponent)
    return encodeURIComponent(txt);
  if (escape)
    return escape(txt);
}

function newAC(fld, invfld, ufld, elementName, type) {
  var name = fld.name + "_form";
  var ac = new AJAXOtherCompleter(name, elementName);
  ac.setType(type);
  ac.setField(fld);
  ac.setInvisibleField(invfld);
  ac.setUpdateField(ufld);
  var oCount = g_ac_objects.length;
  g_ac_objects[oCount] = ac;
  initAutoCompleteField(ac);
  ac.firstUse = true;
  return ac;
}

function removeAC(name) {
  for (var i = 0; i < g_ac_objects.length; i++) {
    if (g_ac_objects[i] == null)
      continue;
    if (g_ac_objects[i].elementName == name)
      g_ac_objects[i] = null;
  }
}

function getAC(name) {
  for (var i = 0; i < g_ac_objects.length; i++) {
    if (g_ac_objects[i] == null)
      continue;
    if (g_ac_objects[i].name == name)
      return g_ac_objects[i];
  }
  return getacPerInput(name);
}

function getacPerInput(elementName) {
  var f = gel("sys_display." + elementName);
  if (f != null && f.ac != null)
    return f.ac;
  f = gel(elementName);
  if (f != null && f.ac != null)
    return f.ac;
  return null;
}

function checkEnter(e, elementName) {
  var ac = getAC(elementName);
  if (ac == null)
    return true;
  var keyCode = getKeyCode(e);
  if (keyCode == KEY_ENTER) {
    if (ac.type != 'PickList') {
      Event.stop(e);
      return false;
    }
  }
  return true;
}

function checkForDirty(ac) {
  if (!ac.dirty)
    return;
  setTextValue(ac, new Array((ac.getInvisibleField() ? ac.getInvisibleField().value : null), ac.getField().value));
  fieldSet(ac);
}

function fieldChangeSlush(event, elementName, type, noMax, uFieldName, additional) {
  fieldProcess(event, elementName, type, noMax, false, uFieldName, additional);
}

function fieldChangeSlush1(event, elementName, fieldName, type, noMax, uFieldName) {
  var filter = getFilter();
  displayField = document.getElementsByName(elementName)[0];
  displayField.value = filter;
  fieldProcess(event, elementName, ONE_TO_MANY, noMax, false, uFieldName, 1, fieldName);
}

function fieldChangeSlush2(event, elementName, fieldName, type, noMax, uFieldName, queryAddOn, additional, fDiv) {
  var filter = getFilter(elementName, '', fDiv);
  filter += "^" + queryAddOn;
  displayField = gel(elementName);
  displayField.value = filter;
  fieldProcess(event, elementName, ONE_TO_MANY, noMax, false, uFieldName, additional, fieldName);
}

function updateSlushField(ac, values) {
  var updateField = ac.getUpdateField();
  destroyUpdateField(ac);
  if (values != null) {
    for (var zi = 0; zi < values.length; zi++) {
      updateField.options[zi] = new Option(values[zi][1], values[zi][0]);
      updateField.options[zi].setAttribute('aria-selected', 'false');
    }
  }
  if (updateField["onchange"])
    updateField.onchange();
}

function destroyUpdateField(ac) {
  ac.getUpdateField().options.length = 0;
}

function getKeyCode(e) {
  if (e == null)
    return 0;
  return g_isInternetExplorer && window.event ? event.keyCode : e.keyCode;
}

function fieldProcessNow(typedChar, elementName, type, noMax, useInvisible, uFieldName, additional, refField) {
  var displayField;
  var invisibleField;
  var updateField;
  if (type == "Reference") {
    displayField = gel("sys_display." + elementName);
    if (useInvisible)
      invisibleField = gel(elementName);
  } else {
    displayField = gel(elementName);
    if (useInvisible)
      invisibleField = gel("sys_display." + elementName);
  }
  if (uFieldName != null)
    updateField = gel(uFieldName);
  var ac = displayField.ac;
  if (ac == null) {
    ac = getAC(displayField.name);
    if (ac == null) {
      ac = newAC(displayField, invisibleField, updateField, elementName, type);
      if (ac.isOTM())
        ac.refField = refField;
    }
  }
  ac.element = displayField;
  var itemName = ac.element.getAttribute("function");
  if (itemName != null)
    ac.fCall = itemName;
  setTextValue(ac, new Array((invisibleField ? invisibleField.value : null), displayField.value));
  if (typedChar == KEY_TAB)
    return;
  ac.fieldChanged = true;
  if (typedChar != 0 || updateField || ac.isOTM()) {
    if (ac.isOTM() || ((typedChar == KEY_ARROWDOWN || typedChar == KEY_ARROWUP) && !updateField)) {
      if (ac.isOTM() || !ac.isVisible()) {
        if (ac.isOTM())
          searchForData(ac, elementName, 'M2MList', noMax, additional);
        else
          searchForData(ac, elementName, type, noMax, additional);
      } else {
        ac.showDropDown();
        dropDownHilight(ac, typedChar == KEY_ARROWUP ? -1 : 1);
      }
    } else {
      if (!updateField)
        setSavedText(ac, new Array((invisibleField ? ac.invisibleTextValue : null), ac.textValue));
      if (typedChar != KEY_ENTER && typedChar != KEY_RETURN) {
        if (ac.firstUse || ac.previousTextValue != ac.textValue) {
          searchForData(ac, elementName, type, noMax, additional);
          ac.firstUse = false;
        } else
          clearRelated(ac);
      } else {
        var selectedItemNum = ac.selectedItemNum;
        ac.hideDropDown();
        if (ac.matched == false && selectedItemNum == -1) {
          jslog("Enter hit without matches, ignoring it");
          return;
        }
        fieldSet(ac);
        ac.previousTextValue = '';
      }
    }
  }
}

function updateRelatedGivenNameAndValue(elementName, elementValue) {
  var viewField = gel("view." + elementName);
  if (viewField == null)
    return;
  if (isDoctype())
    viewField.style.display = '';
  else
    viewField.style.display = "inline";
  var viewRField = gel("viewr." + elementName);
  var viewHideField = gel("view." + elementName + ".no");
  if (viewRField != null) {
    if (isDoctype())
      viewRField.style.display = '';
    else
      viewRField.style.display = "inline";
  }
  if (viewHideField != null)
    viewHideField.style.display = "none";
  if (typeof(g_form) == 'undefined')
    return;
  var list = g_form.getDerivedFields(elementName);
  if (list == null)
    return;
  var url = "xmlhttp.do?sysparm_processor=GetReferenceRecord" +
    "&sysparm_name=" + elementName +
    "&sysparm_value=" + elementValue +
    "&sysparm_derived_fields=" + list.join(',');
  var args = new Array(elementName, list.join(','));
  serverRequest(url, refFieldChangeResponse, args);
}

function emptySubstr(ac) {
  return findRelatedZeroString(ac, ac.textValue);
}

function searchForData(ac, elementName, type, noMax, additional) {
  var cachedData;
  if (!additional && !ac.isOTM())
    cachedData = retrieveStorage(ac, ac.textValue);
  window.status = "Searching for: " + ac.textValue;
  if (ac.textValue != '^' && emptySubstr(ac))
    cachedData = emptySubstr(ac);
  if (cachedData) {
    fieldChangeResponse(cachedData, true);
  } else {
    var encodedText = encodeText(ac.textValue);
    var url = "sysparm_processor=" + type +
      "&sysparm_name=" + elementName +
      "&sysparm_chars=" + encodedText +
      "&sysparm_nomax=" + noMax +
      "&sysparm_type=" + type;
    if (ac.isOTM())
      url += "&sysparm_field=" + ac.refField;
    if (additional)
      url += "&" + additional;
    if (type != "Reference" && typeof(g_form) != "undefined")
      url += "&" + g_form.serialize();
    serverRequestPost("xmlhttp.do", url, fieldChangeResponse);
    var target = ac.getField();
    if (target.type != 'hidden' && ac.ignoreAJAX != true)
      ac.getField().focus();
  }
  setPreviousText(ac, new Array(ac.invisibleTextValue, ac.textValue));
}

function fieldChangeResponse(request, nozero) {
  if (request == null)
    return;
  var ac = request.responseXML.ac;
  if (request.responseXML.documentElement) {
    var xml = request.responseXML;
    var e = xml.documentElement;
    var cancelMessage = e.getAttribute('cancel_message');
    if (cancelMessage) {
      GlideUI.get().addOutputMessage({
        msg: cancelMessage,
        type: 'error'
      });
      $j('#select_0')[0].firstChild.text = new GwtMessage().getMessage("List's data could not be retrieved");
      return;
    }
    var items = xml.getElementsByTagName("item");
    var elementName = e.getAttribute("sysparm_name");
    var searchText = e.getAttribute("sysparm_chars");
    var type = e.getAttribute("sysparm_type");
    var displayField;
    var invisibleField;
    if (type == "Reference") {
      displayField = gel("sys_display." + elementName);
      invisibleField = gel(elementName);
    } else {
      displayField = gel(elementName);
      invisibleField = gel("sys_display." + elementName);
    }
    var ac = displayField.ac;
    if (ac.ignoreAJAX == true)
      return;
    var values = new Array();
    window.status = "Matches" + (searchText ? " for " + searchText : "") + ": " + items.length;
    if (items.length == 0) {
      if (ac.getInvisibleField())
        ac.getInvisibleField().value = "";
      if (nozero != true)
        storeZeroString(ac, searchText, request);
    }
    if (searchText && ac.textValue && searchText != ac.textValue)
      return;
    storeResults(ac, (searchText ? searchText : ""), request);
    for (var iCnt = 0; iCnt < items.length; iCnt++) {
      var item = items[iCnt];
      var name = item.getAttribute("name");
      var label = item.getAttribute("label");
      var value = item.getAttribute("value");
      var className = item.getAttribute("sys_class_name");
      value = replaceRegEx(value, document, elementName.split(".")[0]);
      values[values.length] = new Array(name, label, value, className);
    }
    if (type == "Reference") {
      if (items.length == 1 && searchText != null && fieldMatches(searchText, items[0].getAttribute("label"))) {
        displayField.value = items[0].getAttribute("label");
        invisibleField.value = items[0].getAttribute("name");
        fieldSet(ac);
      } else {
        var viewField = document.getElementById("view." + elementName);
        var viewHideField = document.getElementById("view." + elementName + ".no");
        if (viewField != null)
          viewField.style.display = "none";
        if (viewHideField != null)
          viewHideField.style.display = "inline";
        invisibleField.value = "";
        ac.dirty = true;
      }
    }
    if (ac.getUpdateField()) {
      updateSlushField(ac, values);
    } else {
      createDropDown(ac, values);
      ac.showDropDown();
    }
  } else {
    window.status = "";
    if (ac.getUpdateField())
      updateSlushField(ac, null);
    else {
      clearRelated(ac);
      ac.clearDropDown();
    }
  }
  if (!ac.getUpdateField() && ac.currentMenuCount < 1)
    ac.hideDropDown();
}

function fieldMatches(search, retitem) {
  if (search.length >= retitem.length) {
    var cc = retitem.substring(0, search.length);
    if (search.toLowerCase() == cc.toLowerCase()) {
      return true;
    }
  }
  return false;
}

function lightWeightReferenceLink(inputName, tableName, addOnRefClick) {
  var input = gel(inputName);
  var sys_id = input.value;
  var url = tableName + ".do?sys_id=" + sys_id;
  var frame = top.gsft_main;
  if (!frame)
    frame = top;
  frame.location = url;
}

function clearDependents(name) {
  var nodes = document.getElementsByTagName('input');
  for (var i = 0; i < nodes.length; i++) {
    var current = nodes[i];
    var dependentField = current.dependent_field;
    if (!dependentField)
      continue;
    if (name == dependentField) {
      current.value = "";
      var ac = getAC(current.name);
      if (ac) {
        ac.resultsStorage = new Object();
        ac.emptyResults = new Object();
      }
      clearDependents(current.id);
    }
  }
};
/*! RESOURCE: /scripts/ac_derived_field_support.js */
function refFieldChangeResponse(request, args) {
  if (request == null)
    return;
  var elementName = args[0];
  var parts = elementName.split(".");
  parts.shift();
  var sName = parts.join(".") + ".";
  if (args[1]) {
    var fields = args[1].split(',');
    setNodes(sName, fields, request);
    return;
  }
  jslog("************** WHAT ARE WE DOING HERE *********************");
}

function setNodes(sName, array, request) {
  for (var i = 0; i < array.length; i++) {
    var fn = array[i];
    var eln = sName + fn;
    var elo = g_form.getGlideUIElement(eln);
    if (!elo)
      continue;
    var field = request.responseXML.getElementsByTagName(fn);
    if (field.length != 1) {
      g_form.clearValue(eln);
      if (g_form._isDerivedWaiting(eln)) {
        g_form.setReadOnly(eln, false);
        g_form._removeDerivedWaiting(eln);
      }
      continue;
    }
    var dv = field[0].getAttribute('value');
    var v = field[0].getAttribute('db_value');
    if (elo.getType() == 'glide_list' || elo.getType() == 'reference') {
      g_form._setValue(eln, v, dv.split(","), false);
    } else if (v)
      g_form.setValue(eln, v, dv);
    else
      g_form.setValue(eln, dv);
    if (g_form._isDerivedWaiting(eln)) {
      g_form.setReadOnly(eln, false);
      g_form._removeDerivedWaiting(eln);
    }
  }
};
/*! RESOURCE: /scripts/lib/glide_updates/prototype.effects.js */
(function() {
  var elemdisplay = {};
  var rfxtypes = /^(?:toggle|show|hide)$/;
  var ralpha = /alpha\([^)]*\)/i;
  var rdigit = /\d/;
  var ropacity = /opacity=([^)]*)/;
  var rfxnum = /^([+\-]=)?([\d+.\-]+)(.*)$/;
  var rnumpx = /^-?\d+(?:px)?$/i;
  var rnum = /^-?\d/;
  var timerId;
  var fxAttrs = [
    ["height", "marginTop", "marginBottom", "paddingTop", "paddingBottom"],
    ["width", "marginLeft", "marginRight", "paddingLeft", "paddingRight"],
    ["opacity"]
  ];
  var shrinkWrapBlocks = false;
  var inlineBlockNeedsLayout = false;
  var cssFloat = false;
  var curCSS;
  var opacitySupport;
  document.observe("dom:loaded", function() {
    var div = document.createElement("div");
    div.style.width = div.style.paddingLeft = "1px";
    document.body.appendChild(div);
    if ("zoom" in div.style) {
      div.style.display = "inline";
      div.style.zoom = 1;
      inlineBlockNeedsLayout = div.offsetWidth === 2;
      div.style.display = "";
      div.innerHTML = "<div style='width:4px;'></div>";
      shrinkWrapBlocks = div.offsetWidth !== 2;
      document.body.removeChild(div);
    }
    div = document.createElement("div");
    div.style.display = "none";
    div.innerHTML = "<link/><table></table><a href='/a' style='color:red;float:left;opacity:.55;'>a</a><input type='checkbox'/>";
    document.body.appendChild(div);
    var a = div.getElementsByTagName("a")[0];
    opacitySupport = /^0.55$/.test(a.style.opacity);
    cssFloat = !!a.style.cssFloat;
    document.body.removeChild(div);
    if (!opacitySupport) {
      Prototype.cssHooks.opacity = {
        get: function(elem, computed) {
          return ropacity.test((computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "") ?
            (parseFloat(RegExp.$1) / 100) + "" :
            computed ? "1" : "";
        },
        set: function(elem, value) {
          var style = elem.style;
          style.zoom = 1;
          var opacity = Prototype.isNaN(value) ?
            "" :
            "alpha(opacity=" + value * 100 + ")",
            filter = style.filter || "";
          style.filter = ralpha.test(filter) ?
            filter.replace(ralpha, opacity) :
            style.filter + ' ' + opacity;
        }
      };
    }
  });
  if (document.defaultView && document.defaultView.getComputedStyle) {
    curCSS = function(elem, newName, name) {
      var ret;
      var defaultView;
      var computedStyle;
      name = name.replace(rupper, "-$1").toLowerCase();
      if (!(defaultView = elem.ownerDocument.defaultView))
        return undefined;
      if ((computedStyle = defaultView.getComputedStyle(elem, null))) {
        ret = computedStyle.getPropertyValue(name);
        if (ret === "" && !contains(elem.ownerDocument.documentElement, elem))
          ret = style(elem, name);
      }
      return ret;
    };
  } else if (document.documentElement.currentStyle) {
    curCSS = function(elem, name) {
      var left;
      var rsLeft;
      var ret = elem.currentStyle && elem.currentStyle[name];
      var style = elem.style;
      if (!rnumpx.test(ret) && rnum.test(ret)) {
        left = style.left;
        rsLeft = elem.runtimeStyle.left;
        elem.runtimeStyle.left = elem.currentStyle.left;
        style.left = name === "fontSize" ? "1em" : (ret || 0);
        ret = style.pixelLeft + "px";
        style.left = left;
        elem.runtimeStyle.left = rsLeft;
      }
      return ret === "" ? "auto" : ret;
    };
  }

  function contains(a, b) {
    return document.compareDocumentPosition ? a.compareDocumentPosition(b) & 16 :
      (a !== b && (a.contains ? a.contains(b) : true));
  }

  function style(elem, name, value, extra) {
    if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style)
      return;
    var ret;
    var origName = name.camelize();
    var s = elem.style;
    var hooks = Prototype.cssHooks[origName];
    name = Prototype.cssProps[origName] || origName;
    if (value !== undefined) {
      if (typeof value === "number" && isNaN(value) || value == null)
        return;
      if (typeof value === "number" && !Prototype.cssNumber[origName])
        value += "px";
      if (!hooks || !("set" in hooks) || (value = hooks.set(elem, value)) !== undefined) {
        try {
          s[name] = value;
        } catch (e) {}
      }
    } else {
      if (hooks && "get" in hooks && (ret = hooks.get(elem, false, extra)) !== undefined)
        return ret;
      return s[name];
    }
  }

  function isEmptyObject(obj) {
    for (var name in obj)
      return false;
    return true;
  }

  function isWindow(obj) {
    return obj && typeof obj === "object" && "setInterval" in obj;
  }

  function arrayMerge(first, second) {
    var i = first.length;
    var j = 0;
    if (typeof second.length === "number") {
      for (var l = second.length; j < l; j++)
        first[i++] = second[j];
    } else {
      while (second[j] !== undefined)
        first[i++] = second[j++];
    }
    first.length = i;
    return first;
  }

  function makeArray(array) {
    var ret = [];
    if (array != null) {
      var type = typeof array;
      if (array.length == null || type === "string" || type === "function" || type === "regexp" || isWindow(array))
        Array.prototype.push.call(ret, array);
      else
        arrayMerge(ret, array);
    }
    return ret;
  }

  function genFx(type, num) {
    var obj = {};
    fxAttrs.concat.apply([], fxAttrs.slice(0, num)).each(function(context) {
      obj[context] = type;
    });
    return obj;
  }

  function defaultDisplay(nodeName) {
    if (elemdisplay[nodeName])
      return elemdisplay[nodeName];
    var e = $(document.createElement(nodeName));
    document.body.appendChild(e);
    var display = e.getStyle("display");
    e.remove();
    if (display === "none" || display === "")
      display = "block";
    elemdisplay[nodeName] = display;
    return display;
  }
  Prototype.effects = {
    speed: function(speed, easing, fn) {
      var opt = speed && typeof speed === "object" ? Object.extend({}, speed) : {
        complete: fn || !fn && easing || typeof speed == 'function' && speed,
        duration: speed,
        easing: fn && easing || easing && !(typeof easing == 'function') && easing
      };
      opt.duration = Prototype.effects.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
        opt.duration in Prototype.effects.fx.speeds ? Prototype.effects.fx.speeds[opt.duration] : Prototype.effects.fx.speeds._default;
      opt.old = opt.complete;
      opt.complete = function() {
        if (opt.queue !== false)
          $(this).dequeue();
        if (typeof opt.old == 'function')
          opt.old.call(this);
      };
      return opt;
    },
    easing: {
      linear: function(p, n, firstNum, diff) {
        return firstNum + diff * p;
      },
      swing: function(p, n, firstNum, diff) {
        return ((-Math.cos(p * Math.PI) / 2) + 0.5) * diff + firstNum;
      }
    },
    timers: [],
    fx: function(elem, options, prop) {
      this.elem = elem;
      this.options = options;
      this.prop = prop;
      if (!options.orig)
        options.orig = {};
    }
  };
  Prototype.effects.fx.prototype = {
    update: function() {
      if (this.options.step)
        this.options.step.call(this.elem, this.now, this);
      (Prototype.effects.fx.step[this.prop] || Prototype.effects.fx.step._default)(this);
    },
    cur: function() {
      if (this.elem[this.prop] != null && (!this.elem.style || this.elem.style[this.prop] == null))
        return this.elem[this.prop];
      var r = parseFloat(this.elem.getStyle(this.prop));
      return r || 0;
    },
    custom: function(from, to, unit) {
      var self = this;
      var fx = Prototype.effects.fx;
      this.startTime = new Date().getTime()
      this.start = from;
      this.end = to;
      this.unit = unit || this.unit || "px";
      this.now = this.start;
      this.pos = this.state = 0;

      function t(gotoEnd) {
        return self.step(gotoEnd);
      }
      t.elem = this.elem;
      if (t() && Prototype.effects.timers.push(t) && !timerId)
        timerId = setInterval(fx.tick, fx.interval);
    },
    show: function() {
      this.options.orig[this.prop] = style(this.elem, this.prop);
      this.options.show = true;
      this.custom(this.prop === "width" || this.prop === "height" ? 1 : 0, this.cur());
      $(this.elem).show();
    },
    hide: function() {
      this.options.orig[this.prop] = style(this.elem, this.prop);
      this.options.hide = true;
      this.custom(this.cur(), 0);
    },
    step: function(gotoEnd) {
      var t = new Date().getTime();
      var done = true;
      if (gotoEnd || t >= this.options.duration + this.startTime) {
        this.now = this.end;
        this.pos = this.state = 1;
        this.update();
        this.options.curAnim[this.prop] = true;
        for (var i in this.options.curAnim) {
          if (this.options.curAnim[i] !== true)
            done = false;
        }
        if (done) {
          if (this.options.overflow != null && !shrinkWrapBlocks) {
            var elem = this.elem;
            var options = this.options;
            var overflowArray = ["", "X", "Y"];
            for (var ii = 0, ll = overflowArray.length; ii < ll; ii++)
              elem.style["overflow" + overflowArray[ii]] = options.overflow[ii];
          }
          if (this.options.hide) {
            $(this.elem).hide();
            if (Prototype.Browser.IE)
              $(this.elem).setStyle({
                filter: ''
              });
          }
          if (this.options.hide || this.options.show) {
            for (var p in this.options.curAnim)
              style(this.elem, p, this.options.orig[p]);
          }
          this.options.complete.call(this.elem);
        }
        return false;
      } else {
        var n = t - this.startTime;
        this.state = n / this.options.duration;
        var specialEasing = this.options.specialEasing && this.options.specialEasing[this.prop];
        var defaultEasing = this.options.easing || (Prototype.effects.easing.swing ? "swing" : "linear");
        this.pos = Prototype.effects.easing[specialEasing || defaultEasing](this.state, n, 0, 1, this.options.duration);
        this.now = this.start + ((this.end - this.start) * this.pos);
        this.update();
      }
      return true;
    }
  };
  Object.extend(Prototype.effects.fx, {
    tick: function() {
      var timers = Prototype.effects.timers;
      for (var i = 0; i < timers.length; i++) {
        if (!timers[i]())
          timers.splice(i--, 1);
      }
      if (!timers.length)
        Prototype.effects.fx.stop();
    },
    interval: 13,
    stop: function() {
      clearInterval(timerId);
      timerId = null;
    },
    speeds: {
      slow: 600,
      fast: 200,
      _default: 400
    },
    step: {
      opacity: function(fx) {
        fx.elem.setStyle({
          opacity: fx.now
        });
      },
      _default: function(fx) {
        if (fx.elem.style && fx.elem.style[fx.prop] != null)
          fx.elem.style[fx.prop] = (fx.prop === "width" || fx.prop === "height" ? Math.max(0, fx.now) : fx.now) + fx.unit;
        else
          fx.elem[fx.prop] = fx.now;
      }
    }
  });
  Object.extend(Prototype, {
    isNaN: function(obj) {
      return obj == null || !rdigit.test(obj) || isNaN(obj);
    },
    queue: function(elem, type, data) {
      if (!elem)
        return;
      type = (type || "fx") + "queue";
      var q = elem.retrieve(type);
      if (!data)
        return q || [];
      if (!q || Object.isArray(data))
        q = elem.store(type, makeArray(data));
      else
        q.push(data);
      return q;
    },
    dequeue: function(elem, type) {
      type = type || "fx";
      var queue = Prototype.queue(elem, type);
      var fn = queue.shift();
      if (fn === "inprogress")
        fn = queue.shift();
      if (fn) {
        if (type === "fx")
          queue.unshift("inprogress");
        fn.call(elem, function() {
          Prototype.dequeue(elem, type);
        });
      }
    },
    cssHooks: {
      opacity: {
        get: function(elem, computed) {
          if (computed) {
            var ret = curCSS(elem, "opacity", "opacity");
            return ret === "" ? "1" : ret;
          }
          return elem.style.opacity;
        }
      }
    },
    cssProps: {
      "float": cssFloat ? "cssFloat" : "styleFloat"
    },
    cssNumber: {
      "zIndex": true,
      "fontWeight": true,
      "opacity": true,
      "zoom": true,
      "lineHeight": true
    }
  });

  function show(elem, speed, easing, callback) {
    if (speed || speed === 0)
      return animate(elem, genFx("show", 3), speed, easing, callback);
    var display = elem.style.display;
    if (!elem.retrieve("olddisplay") && display === "none")
      display = elem.style.display = "";
    if (display === "" && elem.getStyle("display") === "none")
      elem.store("olddisplay", defaultDisplay(elem.nodeName));
    display = elem.style.display;
    if (display === "" || display === "none")
      elem.style.display = elem.retrieve("olddisplay") || "";
    return elem;
  }

  function hide(elem, speed, easing, callback) {
    if (speed || speed === 0)
      return animate(elem, genFx("hide", 3), speed, easing, callback);
    var display = elem.getStyle('display');
    if (display !== "none")
      elem.store("olddisplay", elem.getStyle('display'));
    elem.style.display = "none";
    return elem;
  }

  function toggle(elem, fn, fn2, callback) {
    var bool = typeof fn === "boolean";
    if (typeof fn == 'function' && typeof fn2 == 'function')
      toggle.apply(this, arguments);
    else if (fn == null || bool) {
      var state = bool ? fn : !elem.visible();
      elem[state ? "show" : "hide"]();
    } else
      animate(elem, genFx("toggle", 3), fn, fn2, callback);
    return elem;
  }

  function fadeTo(elem, speed, to, easing, callback) {
    elem.setStyle({
      opacity: 0
    });
    if (!elem.visible())
      elem.show();
    return animate(elem, {
      opacity: to
    }, speed, easing, callback);
  }

  function animate(elem, prop, speed, easing, callback) {
    var optall = Prototype.effects.speed(speed, easing, callback);
    if (isEmptyObject(prop))
      return optall.complete;
    return elem[optall.queue === false ? "_execute" : "queue"](function() {
      var opt = Object.extend({}, optall);
      var p;
      var isElement = elem.nodeType === 1;
      var hidden = isElement && !elem.visible();
      for (p in prop) {
        var name = p.camelize();
        if (p !== name) {
          prop[name] = prop[p];
          delete prop[p];
          p = name;
        }
        if (prop[p] === "hide" && hidden || prop[p] === "show" && !hidden)
          return opt.complete.call(this);
        if (isElement && (p === "height" || p === "width")) {
          opt.overflow = [elem.style.overflow, elem.style.overflowX, elem.style.overflowY];
          if (elem.getStyle("display") === "inline" && elem.getStyle("float") === "none") {
            if (!inlineBlockNeedsLayout)
              elem.style.display = "inline-block";
            else {
              var display = defaultDisplay(this.nodeName);
              if (display === "inline")
                elem.style.display = "inline-block";
              else {
                elem.style.display = "inline";
                elem.style.zoom = 1;
              }
            }
          }
        }
        if (Object.isArray(prop[p])) {
          (opt.specialEasing = opt.specialEasing || {})[p] = prop[p][1];
          prop[p] = prop[p][0];
        }
      }
      if (opt.overflow != null)
        elem.style.overflow = "hidden";
      opt.curAnim = Object.extend({}, prop);
      for (var i in prop) {
        var name = i;
        var val = prop[i];
        var e = new Prototype.effects.fx(elem, opt, name);
        if (rfxtypes.test(val)) {
          e[val === "toggle" ? hidden ? "show" : "hide" : val](prop);
        } else {
          var parts = rfxnum.exec(val);
          var start = e.cur() || 0;
          if (parts) {
            var end = parseFloat(parts[2]);
            var unit = parts[3] || "px";
            if (unit !== "px") {
              style(elem, name, (end || 1) + unit);
              start = ((end || 1) / e.cur()) * start;
              style(name, start + unit);
            }
            if (parts[1])
              end = ((parts[1] === "-=" ? -1 : 1) * end) + start;
            e.custom(start, end, unit);
          } else {
            e.custom(start, val, "");
          }
        }
      }
      return true;
    });
  }

  function stop(elem, clearQueue, gotoEnd) {
    var timers = Prototype.effects.timers;
    if (clearQueue)
      elem.queue([]);
    for (var i = timers.length - 1; i >= 0; i--) {
      if (timers[i].elem === elem) {
        if (gotoEnd) {
          timers[i](true);
        }
        timers.splice(i, 1);
      }
    }
    if (!gotoEnd)
      elem.dequeue();
    return elem;
  }

  function queue(elem, type, data) {
    if (typeof type !== "string") {
      data = type;
      type = "fx";
    }
    if (data === undefined)
      return Prototype.queue(elem, type);
    var queue = Prototype.queue(elem, type, data);
    if (type === "fx" && queue[0] !== "inprogress")
      Prototype.dequeue(elem, type);
    return elem;
  }

  function dequeue(elem, type) {
    Prototype.dequeue(elem, type);
    return elem;
  }

  function delay(elem, time, type) {
    time = Prototype.effects.fx ? Prototype.effects.fx.speeds[time] || time : time;
    type = type || "fx";
    return elem.queue(type, function() {
      setTimeout(function() {
        Prototype.dequeue(elem, type);
      }, time);
    });
  }

  function clearQueue(elem, type) {
    return elem.queue(type || "fx", []);
  }
  return Element.addMethods({
    show: show,
    hide: hide,
    toggle: toggle,
    fadeTo: fadeTo,
    animate: animate,
    slideDown: function(elem, speed, easing, callback) {
      return animate(elem, genFx('show', 1), speed, easing, callback);
    },
    slideUp: function(elem, speed, easing, callback) {
      return animate(elem, genFx('hide', 1), speed, easing, callback);
    },
    slideToggle: function(elem, speed, easing, callback) {
      return animate(elem, genFx('toggle', 1), speed, easing, callback);
    },
    fadeIn: function(elem, speed, easing, callback) {
      return animate(elem, {
        opacity: 'show'
      }, speed, easing, callback);
    },
    fadeOut: function(elem, speed, easing, callback) {
      return animate(elem, {
        opacity: 'hide'
      }, speed, easing, callback);
    },
    fadeToggle: function(elem, speed, easing, callback) {
      return animate(elem, {
        opacity: 'toggle'
      }, speed, easing, callback);
    },
    stop: stop,
    queue: queue,
    dequeue: dequeue,
    delay: delay,
    clearQueue: clearQueue,
    _execute: function(elem, f) {
      f();
      return elem;
    }
  });
}());;
/*! RESOURCE: /scripts/classes/doctype/GlideModal.js */
(function(global, $) {
  "use strict";
  var GlideModal = function() {
    GlideModal.prototype.initialize.apply(this, arguments);
  };
  GlideModal.prototype = {
    initialize: function(id, readOnly, width, height) {
      this.preferences = {};
      this.id = id;
      this.readOnly = readOnly;
      this.backdropStatic = false;
      this.nologValue = false;
      this.setDialog(id);
      this.setSize(width, height);
      this.setPreference('renderer', 'RenderForm');
      this.setPreference('type', 'direct');
      this.setPreference('focusTrap', false);
      this.setPreference('autoFocus', true);
    },
    setDialog: function(dialogName) {
      this.setPreference('table', dialogName);
    },
    setPreference: function(name, value) {
      this.preferences[name] = value;
    },
    getPreference: function(name) {
      return this.preferences[name];
    },
    setAutoFullHeight: function(isAutoFullHeight) {
      this.isAutoFullHeight = isAutoFullHeight;
    },
    setSize: function(width) {
      this.size = 'modal-md';
      if (!width)
        this.size = 'modal-md';
      else if (typeof width == 'string' && width.indexOf('modal-') == 0)
        this.size = width;
      else if (width < 350)
        this.size = 'modal-alert';
      else if (width < 450)
        this.size = 'modal-sm';
      else if (width < 650)
        this.size = 'modal-md';
      else
        this.size = 'modal-lg';
    },
    setWidth: function(width) {
      this.setSize(width);
    },
    setTitle: function(title) {
      this.title = title;
    },
    setBackdropStatic: function(makeStatic) {
      this.backdropStatic = makeStatic;
    },
    setNologValue: function(nolog) {
      this.nologValue = !!nolog;
    },
    updateTitle: function() {
      $('.modal-title', this.$window).html(this.title);
    },
    updateSize: function() {
      $('.modal-dialog', this.$window).attr('class', 'modal-dialog').addClass(this.size);
    },
    setFocus: function(el) {},
    render: function() {
      var description = this.getDescribingText();
      var ajax = new GlideAjax("RenderInfo");
      if (this.nologValue)
        ajax.addParam("ni.nolog.sysparm_value", true);
      ajax.addParam("sysparm_value", description);
      ajax.addParam("sysparm_name", this.id);
      ajax.getXML(this._renderFromAjax.bind(this));
    },
    switchView: function(newView) {
      this.setPreferenceAndReload({
        'sysparm_view': newView
      });
    },
    setPreferenceAndReload: function(params) {
      for (var key in params)
        this.preferences[key] = params[key];
      this.render();
    },
    _renderFromAjax: function(response) {
      var xml = response.responseXML;
      var newBody = xml.getElementsByTagName("html")[0];
      xml = newBody.xml ? newBody.xml :
        new XMLSerializer().serializeToString(newBody);
      if (!xml)
        return;
      this.setPreferencesFromBody(response.responseXML);
      this.setEscapedBody(xml);
      this.applyAutoFocus();
      this._evalScripts(xml);
    },
    maximizeHeight: function(callback) {
      if (this.resizeTimeout)
        clearTimeout(this.resizeTimeout);
      var context = this;
      this.resizeTimeout = setTimeout(function() {
        var padding = 100;
        var $modalBody = context.$modalContent.find('.modal-body');
        var modalHeight = context.$modalContent.height();
        var modalToolsHeight = modalHeight - $modalBody.height();
        var newHeight = $(window).height() - padding - modalToolsHeight;
        $modalBody.height(newHeight);
        if (callback)
          callback.apply(context);
      }, 150);
    },
    renderWithContent: function(content) {
      this._createModal();
      if (typeof content == 'string')
        $('.modal-body', this.$window)[0].innerHTML = content;
      else
        $('.modal-body', this.$window).html(content);
      var self = this;
      this.$window.on('show.bs.modal', function() {
        self.isOpen = true;
        self.$modalContent = self.$window.find('.modal-content');
        if (self.isAutoFullHeight)
          self.maximizeHeight();
      }).on('hidden.bs.modal', function() {
        self.isOpen = false;
      });
      this.$window.modal({
        backdrop: this.readOnly || this.backdropStatic ? 'static' : undefined,
        keyboard: !this.readOnly
      });
      this.fireEvent("bodyrendered", this);
      _frameChanged();
    },
    renderIframe: function(url, onloadCallback) {
      var loadingMessage = 'Loading...';
      var div = document.createElement('div');
      div.setAttribute('style', 'position: absolute; top: 2px; right: 2px; bottom: 2px; left: 2px;');
      var loading = document.createElement('div');
      loading.setAttribute('style', 'position: absolute; top: 10px; left: 10px;');
      loading.setAttribute('class', 'loading');
      if (loading.textContent)
        loading.textContent = loadingMessage;
      else
        loading.innerText = loadingMessage;
      var iframe = document.createElement('iframe');
      iframe.setAttribute('style', 'width: 100%; height: 100%; border: 0; background-color: white; visibility: hidden;');
      iframe.src = url;
      div.appendChild(loading);
      div.appendChild(iframe);
      var context = this;
      this.on('bodyrendered', function() {
        context.$modalContent.find('iframe').load(function(evt) {
          context.$modalContent.find('.loading').hide();
          iframe.setAttribute('style', 'width: 100%; height: 100%; border: 0; background-color: white;');
          if (onloadCallback && evt.target && evt.target.contentWindow)
            onloadCallback.apply(evt.target.contentWindow);
        });
      });
      this.renderWithContent(div);
    },
    _createModal: function() {
      var template;
      if (this.$window) {
        this.updateTitle();
        this.updateSize();
        return;
      }
      if (this.template) {
        template = this.template
      } else {
        template = getTemplate();
      }
      this._closeIdenticalModals();
      var html = new Template(template).evaluate({
        title: this.title,
        id: this.id,
        size: this.size,
        readOnly: this.readOnly ? 'true' : 'false',
        showHelp: this.showHelp ? 'true' : 'false',
        focusEscape: !this.getPreference('focusTrap') ? 'true' : 'false'
      });
      var $modal = $(html);
      $modal.data('gWindow', this);
      this.$window = $modal;
      $(document.body).append(this.$window);
      this._watchForClose();
      this._watchHelp();
    },
    locate: function(domElement) {
      while (domElement.parentNode) {
        domElement = domElement.parentNode;
        if (jQuery(domElement).data('gWindow'))
          return jQuery(domElement).data('gWindow');
      }
      alert('GlideModal.locate: window not found');
      return null;
    },
    _onWindowResize: function(context) {
      return function() {
        if (context.isOpen && context.isAutoFullHeight) {
          context.maximizeHeight();
        }
      }
    },
    setEscapedBody: function(body) {
      if (!body)
        return;
      body = body.replace(/\t/g, "");
      body = body.replace(/\r/g, "");
      body = body.replace(/\n+/g, "\n");
      body = body.replace(/%27/g, "'");
      body = body.replace(/%3c/g, "<");
      body = body.replace(/%3e/g, ">");
      body = body.replace(/&amp;/g, "&");
      this.setBody(body, true);
    },
    setBody: function(html, noEvaluate) {
      if (typeof html == 'string') {
        html = this._substituteGet(html);
        html = this._fixBrowserTags(html);
        this.renderWithContent(html);
        if (!noEvaluate)
          this._evalScripts(html);
      } else {
        this.renderWithContent(html);
      }
    },
    setPreferencesFromBody: function(xml) {
      var prefs = xml.getElementsByTagName("renderpreference");
      if (prefs.length > 0) {
        for (var i = 0; i < prefs.length; i++) {
          var pref = prefs[i];
          var name = pref.getAttribute("name");
          var valu = pref.getAttribute("value");
          this.setPreference(name, valu);
          if (name == "title")
            this.setTitle(valu);
          if (name == "render_title" && valu == "false")
            this.setTitle("");
        }
      }
    },
    _substituteGet: function(html) {
      if (!html)
        return html;
      var substitutions = [this.type(), 'GlideDialogWindow', 'GlideDialogForm'];
      for (var i = 0; i < substitutions.length; i++) {
        var reg = new RegExp(substitutions[i] + ".get\\(", "g");
        html = html.replace(reg, this.type() + ".prototype.get('" + this.getID() + "'");
      }
      return html;
    },
    _fixBrowserTags: function(html) {
      if (!html)
        return html;
      var tags = ["script", "a ", "div", "span", "select"];
      for (var i = 0; i < tags.length; i++) {
        var tag = tags[i];
        html = html.replace(new RegExp('<' + tag + '([^>]*?)/>', 'img'), '<' + tag + '$1></' + tag + '>');
      }
      return html;
    },
    _evalScripts: function(html) {
      html = this._substituteGet(html, this.type());
      var x = loadXML("<xml>" + html + "</xml>");
      if (x) {
        var scripts = x.getElementsByTagName("script");
        for (var i = 0; i < scripts.length; i++) {
          var script = scripts[i];
          var s = "";
          if (script.getAttribute("type") == "application/xml")
            continue;
          if (script.getAttribute("src")) {
            var url = script.getAttribute("src");
            var req = serverRequestWait(url);
            s = req.responseText;
          } else {
            s = getTextValue(script);
            if (!s)
              s = script.innerHTML;
          }
          if (s)
            evalScript(s, true);
        }
      }
      if (!window.G_vmlCanvasManager)
        return;
      window.G_vmlCanvasManager.init_(document)
    },
    getID: function() {
      return this.id;
    },
    getPreferences: function() {
      return this.preferences;
    },
    getDescribingXML: function() {
      var section = document.createElement("section");
      section.setAttribute("name", this.getID());
      var preferences = this.getPreferences();
      for (var name in preferences) {
        if (!preferences.hasOwnProperty(name))
          continue;
        var p = document.createElement("preference");
        var v = preferences[name];
        p.setAttribute("name", name);
        if (v !== null && typeof v == 'object') {
          if (typeof v.join == "function") {
            v = v.join(",");
          } else if (typeof v.toString == "function") {
            v = v.toString();
          }
        }
        if (v && typeof v.escapeHTML === "function")
          v = v.escapeHTML();
        if (v)
          p.setAttribute("value", v);
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
    destroy: function() {
      if (!this.fireEvent('closeconfirm', this))
        return;
      if (this.$window)
        this.$window.modal('hide');
    },
    _removeWindow: function() {
      this.fireEvent('beforeclose', this);
      this.$window.remove();
    },
    get: function(id) {
      if (!id)
        return this;
      var win = document.getElementById(id);
      if (!win)
        return this;
      return $(win).data('gWindow');
    },
    _watchForClose: function() {
      this.$window.on('click', '[data-dismiss=GlideModal]', function() {
        this.destroy();
      }.bind(this));
      this.$window.on('hidden.bs.modal', function() {
        this._removeWindow(true);
      }.bind(this));
    },
    _watchHelp: function() {
      this.$window.on('click', '.help', function() {
        if (this._helpCallback)
          this._helpCallback.call();
      }.bind(this));
    },
    on: function(evtName, callbackFn) {
      if (!this._events)
        this._events = {};
      if (!this._events[evtName])
        this._events[evtName] = [];
      this._events[evtName].push(callbackFn);
    },
    fireEvent: function() {
      var args = Array.prototype.slice.call(arguments, 0);
      var evtName = args.shift();
      if (!this._events || !this._events[evtName])
        return true;
      for (var i = 0; i < this._events[evtName].length; i++) {
        var ev = this._events[evtName][i];
        if (!ev)
          continue;
        if (ev.apply(this, args) === false)
          return false;
      }
      return true;
    },
    _closeIdenticalModals: function() {
      var $existingModal = $('#' + this.id).data('gWindow');
      if (!$existingModal)
        return;
      $existingModal.destroy();
    },
    addDecoration: function(decorationElement, leftSide) {},
    addFunctionDecoration: function(imgSrc, imgAlt, func, side) {
      if (imgSrc == 'images/help.gif')
        this.addHelpDecoration(func);
    },
    addHelpDecoration: function(func) {
      this.showHelp = true;
      this._helpCallback = func;
    },
    type: function() {
      return "GlideModal";
    },
    applyAutoFocus: function() {
      var autoFocus = this.getPreference('autoFocus');
      if (autoFocus)
        $('#' + this.id + '_closemodal').focus()
    }
  };

  function getTemplate() {
    return '<div id="#{HTML:id}" tabindex="-1" ' +
      'aria-hidden="true" class="modal" role="dialog" ' +
      'aria-labelledby="#{HTML:id}_title" data-readonly="#{HTML:readOnly}" data-has-help="#{HTML:showHelp}" focus-escape="#{HTML:focusEscape}">' +
      '	<div class="modal-dialog #{size}">' +
      '		<div class="modal-content">' +
      '			<header class="modal-header">' +
      '				<button data-dismiss="GlideModal" class="btn btn-icon close icon-cross" id="#{HTML:id}_closemodal">' +
      '					<span class="sr-only">Close</span>' +
      '				</button>' +
      '			<h1 id="#{HTML:id}_title" class="modal-title h4">' +
      '				#{HTML:title}' +
      '			<button class="btn btn-icon icon-help help">' +
      '				<span class="sr-only">Help</span>' +
      '			</button>' +
      '			</h1>' +
      '			</header>' +
      '			<div class="modal-body container-fluid"></div>' +
      '		</div>' +
      '	</div>' +
      '</div>';
  }
  global.GlideModal = GlideModal;
})(window, jQuery);;
/*! RESOURCE: /scripts/classes/doctype/GlideModalForm.js */
(function(global, $) {
  "use strict";
  var GlideModalForm = function() {
    GlideModalForm.prototype.init.apply(this, arguments);
  };
  GlideModalForm.prototype = $.extend({}, GlideModal.prototype, {
    IGNORED_PREFERENCES: {
      'renderer': true,
      'type': true,
      'table': true
    },
    init: function(title, tableName, onCompletionCallback, readOnly) {
      this.initialize.call(this, tableName, readOnly, 800);
      this.tableName = tableName;
      if (title) {
        this.setTitle(title);
      }
      if (onCompletionCallback) {
        this.setCompletionCallback(onCompletionCallback);
      }
    },
    setSize: function(width) {
      this.size = 'modal-95';
    },
    setFooter: function(bool) {
      this.hasFooter = !!bool;
    },
    setSysID: function(id) {
      this.setPreference('sys_id', id);
    },
    setType: function(type) {
      this.setPreference('type', type);
    },
    setTemplate: function(template) {
      this.template = template;
    },
    setCompletionCallback: function(func) {
      this.onCompletionFunc = func;
    },
    setOnloadCallback: function(func) {
      this.onFormLoad = func;
    },
    render: function() {
      this._createModal();
      var body = $('.modal-body', this.$window)[0];
      body.innerHTML = getFormTemplate();
      var frame = $('.modal-frame', this.$window);
      frame.on('load', function() {
        this._formLoaded();
      }.bind(this));
      this.$window.modal({
        backdrop: 'static'
      });
      this._bodyHeight = $('#' + this.id)[0].getHeight();
      var margin = $('.modal-dialog', this.$window)[0].offsetTop * 2;
      margin += frame.offset().top;
      if (this._bodyHeight > margin)
        this._bodyHeight -= margin;
      if (this.hasFooter) {
        this._bodyHeight = this._bodyHeight - 40;
      }
      frame.css('height', this._bodyHeight);
      var $doc = frame[0].contentWindow ? frame[0].contentWindow.document : frame[0].contentDocument;
      var $body = $($doc.body);
      $body.html('');
      $body.append($('link').clone());
      $body.append('<center>' + getMessage('Loading') + '... <br/><img src="images/ajax-loader.gifx"/></center></span>');
      var f = $('.modal_dialog_form_poster', this.$window)[0];
      f.action = this.getPreference('table') + '.do';
      addHidden(f, 'sysparm_clear_stack', 'true');
      addHidden(f, 'sysparm_nameofstack', 'formDialog');
      addHidden(f, 'sysparm_titleless', 'true');
      addHidden(f, 'sysparm_is_dialog_form', 'true');
      var sysId = this.getPreference('sys_id');
      if (!sysId)
        sysId = '';
      addHidden(f, 'sys_id', sysId);
      var targetField = '';
      if (this.fieldIDSet)
        targetField = this.getPreference('sysparm_target_field');
      for (var id in this.preferences) {
        if (!this.IGNORED_PREFERENCES[id])
          addHidden(f, id, this.preferences[id]);
      }
      var parms = [];
      parms.push('sysparm_skipmsgs=true');
      parms.push('sysparm_nostack=true');
      parms.push('sysparm_target_field=' + targetField);
      parms.push('sysparm_returned_action=$action');
      parms.push('sysparm_returned_sysid=$sys_id');
      parms.push('sysparm_returned_value=$display_value');
      addHidden(f, 'sysparm_goto_url', 'modal_dialog_form_response.do?' + parms.join('&'));
      f.submit();
    },
    switchView: function(newView) {
      this.setPreferenceAndReload({
        'sysparm_view': newView
      });
    },
    setPreferenceAndReload: function(params) {
      for (var key in params)
        this.preferences[key] = params[key];
      this.render();
    },
    _formLoaded: function() {
      var frame = $('.modal-frame', this.$window);
      var pathname = frame.contents().get(0).location.pathname.indexOf('modal_dialog_form_response.do');
      if (pathname >= 0) {
        if (this.onCompletionFunc) {
          var f = $('.modal_dialog_form_response form', frame.contents())[0];
          this.onCompletionFunc(f.action.value, f.sysid.value, this.tableName, f.value.value);
        }
        this.destroy();
        return;
      }
      if (this.onFormLoad)
        this.onFormLoad(this);
    },
    addParm: function(k, v) {
      this.setPreference(k, v);
    }
  });

  function getFormTemplate() {
    return '<form class="modal_dialog_form_poster" target="dialog_frame" method="POST" style="display: inline;"/>' +
      '<iframe id="dialog_frame" name="dialog_frame" class="modal-frame" style="width:100%;height:100%;" frameborder="no" />';
  }
  global.GlideModalForm = GlideModalForm;
})(window, jQuery);;
/*! RESOURCE: /scripts/doctype/AngularBootstrapper.js */
window.ANGULAR_BOOTSTRAPPER = (function angularBootstrapper() {
  function createBootstrapModule(baseModules) {
    var allModules = baseModules.slice();
    $j('[sn-ng-formatter]').each(function(index, item) {
      var formatterModule = item.getAttribute('sn-ng-formatter');
      if (!formatterModule)
        return;
      try {
        angular.module(formatterModule);
        allModules.push(formatterModule);
      } catch (e) {
        jslog("Skipped loading of module " + formatterModule + " from " + item + " because it does not exist");
      }
    });
    var bootstrapModule = angular.module('appBootstrap', allModules);
    bootstrapModule.config(['$compileProvider', function($compileProvider) {}]);
    return bootstrapModule;
  }

  function getElemDepth(elem) {
    var parent = elem;
    var depth = 0;
    while (parent = parent.parentElement)
      depth++;
    return depth;
  }

  function getElemsOrderedByDepth(selectors) {
    return selectors.reduce(function(memo, selector) {
      return memo.concat(Array.prototype.slice.call(document.querySelectorAll(selector)));
    }, []).map(function(elem) {
      return {
        elem: elem,
        depth: getElemDepth(elem)
      }
    }).sort(function(a, b) {
      return a.depth - b.depth
    }).map(function(a) {
      return a.elem;
    });
  }

  function scheduleCompilation(selectors) {
    var elems = getElemsOrderedByDepth(selectors);
    if (!elems.length > 0) {
      jslog("Element matching selector not found, skipping Angular compilation of: " + selectors);
      return;
    }
    addLateLoadEvent(function compile() {
      var injector = angular.element(document.documentElement).injector();
      var $compile = injector.get('$compile');
      var $scope = injector.get('$rootScope').$new();
      var uncompiledElems = [];
      var compiledParent = null;
      for (var i = 0; i < elems.length; i++) {
        if (compiledParent = getCompiledParent(elems[i])) {
          continue;
        }
        uncompiledElems.push(elems[i]);
        markElementCompiled(elems[i]);
      }
      console.log("Compiling in AngularBootstrapper.js", uncompiledElems);
      $compile(uncompiledElems)($scope);
    });
  }

  function markElementCompiled(elem) {
    elem.setAttribute('sn-ng-compiled', 'true');
  }

  function getCompiledParent(elem) {
    var parent = elem;
    while (parent != null) {
      if (parent.getAttribute('sn-ng-compiled'))
        return parent;
      if (parent.getAttribute('ng-non-bindable'))
        return null;
      if (parent.classList && parent.classList.contains('ng-non-bindable'))
        return null;
      parent = parent.parentElement;
    }
    return null;
  }

  function compileTemplates() {
    var templates = document.querySelectorAll('script[type="text/ng-template"]');
    if (!templates.length)
      return;
    var $templateCache = angular.element(document.documentElement).injector().get('$templateCache');
    var i;
    for (i = 0; i < templates.length; ++i)
      $templateCache.put(templates[i].id, templates[i].textContent);
  }

  function bootstrap(baseModules) {
    if (!window.angular)
      return;
    window.NOW = window.NOW || {};
    window.NOW.singleFormBootstrap = true;
    var bootstrapModule = createBootstrapModule(baseModules);
    angular.bootstrap(document.documentElement, [bootstrapModule.name]);
    compileTemplates();
    var compilationTargets = [
      'now-message',
      '.activity_table',
      '.section_zero',
      'sn-related-list',
      'sn-record-preview',
      'sn-reference-selector',
      '[sn-ng-formatter]'
    ];
    scheduleCompilation(compilationTargets);
  }
  return {
    bootstrap: bootstrap
  }
})();;;