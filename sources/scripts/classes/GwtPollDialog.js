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