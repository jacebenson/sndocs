// Class Imports
var TimelineFrameSeparator = GlideTimelineFrameSeparator;

var AbstractTimelineSchedulePage = Class.create();
AbstractTimelineSchedulePage.prototype = Object.extendsObject(AbstractAjaxProcessor, {

  ERROR_TITLE: gs.getMessage('Error'),
  ERROR_INVALID_FUNC_MSG: gs.getMessage('You specified an invalid event: '),
  ERROR_NO_FUNC_MSG: gs.getMessage('No script include function defined for the specified event: '),
  AJAXRESPONSE: { NODE_PAGE_TITLE: 'pagetitle',
                  NODE_STATUS: 'statusresult',
                  NODE_ITEM: 'item',
                  ATTR_RENDER: 'render',
                  ATTR_STATUS: 'status',
                  ATTR_MESSAGE: 'message',
                  ATTR_TITLE: 'title',
                  ATTR_OK_FUNC: 'ok_func',
                  ATTR_CANCEL_FUNC: 'cancel_func',
                  ATTR_CLOSE_FUNC: 'close_func',
                  CUSTOM_FUNC: 'sysparm_custom_func',
                  PROMPT: 'prompt',
                  SUCCESS: 'success',
                  ERROR: 'error' },

  /**
   * Core function that obtains AJAX parameters and calls appropriate script include. This
   * method should NOT be overriden by any sub classes.
   */
  process: function() {
    if (this.getName() == 'getItems') {
      return this.__getItems();
    } else if (this.getName() == 'elementMoveX') {
      return this.__elementMoveX();
    } else if (this.getName() == 'elementMoveY') {
      return this.__elementMoveY();
    } else if (this.getName() == 'elementMoveXY') {
      return this.__elementMoveXY();
    } else if (this.getName() == 'elementSuccessor') {
      return this.__elementSuccessor();
    } else if (this.getName() == 'elementTimeAdjustStart') {
      return this.__elementTimeAdjustStart();
    } else if (this.getName() == 'elementTimeAdjustEnd') {
      return this.__elementTimeAdjustEnd();
    } else if (this.getName() == 'inputBox') {
      return this.__inputBox();
    } else if (this.getName() == 'itemMove') {
      return this.__itemMove();
    } else {
      return this.setStatusError(this.ERROR_TITLE, this.ERROR_INVALID_FUNC_MSG + this.getName());
    }
  },


  ////////////////////////////////////////////////////////////////////////////////////////////
  // PUBLIC METHODS
  ////////////////////////////////////////////////////////////////////////////////////////////

  add: function(node) {
    node.appendXML(this.getDocument(), this.getRootElement());
  },

  addSeparator: function() {
    var node = new TimelineFrameSeparator();
    node.appendXML(this.getDocument(), this.getRootElement());
  },

  setPageTitle: function(strTitle) {
    var e = this.__getNode(this.AJAXRESPONSE.NODE_PAGE_TITLE);
    if (strTitle != '') 
      e.setAttribute(this.AJAXRESPONSE.ATTR_TITLE, strTitle);
  },
  
  setDoReRenderTimeline: function(bool) {
    var e = this.__getNode(this.AJAXRESPONSE.NODE_STATUS);
    e.setAttribute(this.AJAXRESPONSE.ATTR_RENDER, bool);
  },

  setStatusError: function(strTitle, strMsg) {
    this.__setStatus(this.AJAXRESPONSE.ERROR, strTitle, strMsg);
  },

  setStatusSuccess: function(strTitle, strMsg) {
    this.__setStatus(this.AJAXRESPONSE.SUCCESS, strTitle, strMsg);
  },

  setStatusPrompt: function(strTitle, strMsg, strOkFunc, strCancelFunc, strCloseFunc) {
    this.__setStatus(this.AJAXRESPONSE.PROMPT, strTitle, strMsg, strOkFunc, strCancelFunc, strCloseFunc);
  },


  ////////////////////////////////////////////////////////////////////////////////////////////
  // PRIVATE
  ////////////////////////////////////////////////////////////////////////////////////////////

  __setStatus: function(strType, strTitle, strMsg, strOkFunc, strCancelFunc, strCloseFunc) {
    var e = this.__getNode(this.AJAXRESPONSE.NODE_STATUS);
    e.setAttribute(this.AJAXRESPONSE.ATTR_STATUS, strType);
    if (strMsg != '')
      e.setAttribute(this.AJAXRESPONSE.ATTR_MESSAGE, strMsg);
    if (strTitle != '')
      e.setAttribute(this.AJAXRESPONSE.ATTR_TITLE, strTitle);
    if (strOkFunc != '')
      e.setAttribute(this.AJAXRESPONSE.ATTR_OK_FUNC, strOkFunc);
    if (strCancelFunc != '')
      e.setAttribute(this.AJAXRESPONSE.ATTR_CANCEL_FUNC, strCancelFunc);
    if (strCloseFunc != '')
      e.setAttribute(this.AJAXRESPONSE.ATTR_CLOSE_FUNC, strCloseFunc);
  },

  __getNode: function(node) {
    var nodes = this.getDocument().getElementsByTagName(node);
    if (nodes.getLength() > 0)
      return nodes.item(0);
    else {
      var e = this.getDocument().createElement(node);
      this.getRootElement().appendChild(e);
      return e;
    }
  },
	
	__functionExistsString: function(f) {
		return typeof this[f] == 'function';
	},

  __functionExists: function(f) {
    return typeof f == 'function';
  },
															 
	__getFunctionName: function(f) {
		var func = f.toString();
		if (func.length() > 5 && func.substring(0, 5) == "this.")
			return func.substring(5, f.length());
		return func;
	},

  __getItems: function() { 
    if (this.__functionExists(this.getItems)) {
      this.getItems();
      
      // Generate a hash code against the current XML document
      var transformer = Packages.javax.xml.transform.TransformerFactory.newInstance().newTransformer();
      var result = new Packages.javax.xml.transform.stream.StreamResult(new Packages.java.io.StringWriter());
      var source = new Packages.javax.xml.transform.dom.DOMSource(this.getDocument());
      transformer.transform(source, result);
      var hashCode = result.getWriter().toString().hashCode();
      this.getRootElement().setAttribute('sysparm_hashcode', hashCode);

      if (this.getParameter("sysparm_hashcode") == hashCode)
        this.getRootElement().setTextContent('');
  
      return;
    }
    
    this.setStatusError(this.ERROR_TITLE, this.ERROR_NO_FUNC_MSG  + this.getName());
  },
  
  __elementMoveX: function() {
    var f = this.getParameter(this.AJAXRESPONSE.CUSTOM_FUNC);
	if (f != null)
		f = this.__getFunctionName(f);
    if (this.__functionExistsString(f))
      return this[f](this.getParameter('sysparm_span_id'), 
					 this.getParameter('sysparm_new_start_date_time_ms'));
    else if (this.__functionExists(this.elementMoveX))
      return this.elementMoveX(this.getParameter('sysparm_span_id'),
                               this.getParameter('sysparm_new_start_date_time_ms'));

    this.setStatusError(this.ERROR_TITLE, this.ERROR_NO_FUNC_MSG + this.getName());
  },

  __elementMoveY: function() {
    var f = this.getParameter(this.AJAXRESPONSE.CUSTOM_FUNC);
	if (f != null)
		f = this.__getFunctionName(f);
    if (this.__functionExistsString(f))
      return this[f](this.getParameter('sysparm_span_id'),
                               this.getParameter('sysparm_item_id'),
                               this.getParameter('sysparm_new_item_id'));
    else if (this.__functionExists(this.elementMoveY))
      return this.elementMoveY(this.getParameter('sysparm_span_id'),
                               this.getParameter('sysparm_item_id'),
                               this.getParameter('sysparm_new_item_id'));

    this.setStatusError(this.ERROR_TITLE, this.ERROR_NO_FUNC_MSG + this.getName());
  },

  __elementMoveXY: function() {
    var f = this.getParameter(this.AJAXRESPONSE.CUSTOM_FUNC);
	if (f != null)
		f = this.__getFunctionName(f);
    if (this.__functionExistsString(f))
      return this[f](this.getParameter('sysparm_span_id'), 
					 this.getParameter('sysparm_item_id'), 
					 this.getParameter('sysparm_new_item_id'), 
					 this.getParameter('sysparm_new_start_date_time_ms'));
    else if (this.__functionExists(this.elementMoveXY))
      return this.elementMoveXY(this.getParameter('sysparm_span_id'),
                                this.getParameter('sysparm_item_id'),
                                this.getParameter('sysparm_new_item_id'),
                                this.getParameter('sysparm_new_start_date_time_ms'));

    this.setStatusError(this.ERROR_TITLE, this.ERROR_NO_FUNC_MSG + this.getName());
  },
  
  __elementSuccessor: function() {
    var f = this.getParameter(this.AJAXRESPONSE.CUSTOM_FUNC);
	if (f != null)
		f = this.__getFunctionName(f);
    if (this.__functionExistsString(f))
      return this[f](this.getParameter('sysparm_span_id'),
					 this.getParameter('sysparm_new_succ_span_id'));
    else if (this.__functionExists(this.elementSuccessor))
      return this.elementSuccessor(this.getParameter('sysparm_span_id'),
                                   this.getParameter('sysparm_new_succ_span_id'));

    this.setStatusError(this.ERROR_TITLE, this.ERROR_NO_FUNC_MSG + this.getName());
  },

  __elementTimeAdjustStart: function() {
    var f = this.getParameter(this.AJAXRESPONSE.CUSTOM_FUNC);
	if (f != null)
		f = this.__getFunctionName(f);
    if (this.__functionExistsString(f))
      return this[f](this.getParameter('sysparm_span_id'),
					 this.getParameter('sysparm_new_start_date_time_ms'));
    else if (this.__functionExists(this.elementTimeAdjustStart))
      return this.elementTimeAdjustStart(this.getParameter('sysparm_span_id'),
                                         this.getParameter('sysparm_new_start_date_time_ms'));

    this.setStatusError(this.ERROR_TITLE, this.ERROR_NO_FUNC_MSG + this.getName());
  },

  __elementTimeAdjustEnd: function() {
    var f = this.getParameter(this.AJAXRESPONSE.CUSTOM_FUNC);
	if (f != null)
		f = this.__getFunctionName(f);
    if (this.__functionExistsString(f))
      return this[f](this.getParameter('sysparm_span_id'),
                      this.getParameter('sysparm_new_end_date_time_ms'));
    else if (this.__functionExists(this.elementTimeAdjustEnd))
      return this.elementTimeAdjustEnd(this.getParameter('sysparm_span_id'),
                                       this.getParameter('sysparm_new_end_date_time_ms'));

    this.setStatusError(this.ERROR_TITLE, this.ERROR_NO_FUNC_MSG + this.getName());
  },

  __inputBox: function() {
    var f = this.getParameter(this.AJAXRESPONSE.CUSTOM_FUNC);
	if (f != null)
		f = this.__getFunctionName(f);
    if (this.__functionExistsString(f))
      return this[f](this.getParameter('sysparm_input_text'));
    else if (this.__functionExists(this.inputBox))
      return this.inputBox(this.getParameter('sysparm_input_text'));

    this.setStatusError(this.ERROR_TITLE, this.ERROR_NO_FUNC_MSG + this.getName());
  },

  __itemMove: function() {
    var f = this.getParameter(this.AJAXRESPONSE.CUSTOM_FUNC);
	if (f != null)
		f = this.__getFunctionName(f);
    if (this.__functionExistsString(f))
	  return this[f](this.getParameter('sysparm_item_sys_id'), this.getParameter('sysparm_new_item_sys_id'));
    else if (this.__functionExists(this.itemMove))
      return this.itemMove(this.getParameter('sysparm_item_sys_id'), this.getParameter('sysparm_new_item_sys_id'));

    this.setStatusError(this.ERROR_TITLE, this.ERROR_NO_FUNC_MSG + this.getName());
  }
  
});