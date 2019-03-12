/*! RESOURCE: /scripts/classes/GwtWHTPScheduleDialog.js */
var GwtWHTPScheduleDialog = Class.create(GlideDialogWindow, {
  initialize: function(url, dataDoctype, defaultValues) {
    GlideDialogWindow.prototype.initialize.call(this, 'export_schedule_dialog', false, 350);
    this.defaultValues = defaultValues || {};
    var keys = ["Export to PDF", "Please specify an email address", "PDF file will be emailed to {0}", "The email address specified is not valid"];
    this.msgs = getMessages(keys);
    if (url != undefined)
      this.url = url;
    else
      this.url = self.location.pathname + self.location.search;
    this.deliveryPref = 'wait';
    this.setPreference('sysparm_target', this.url);
    this.dataDoctype = dataDoctype === true || dataDoctype === 'true';
    if (this.dataDoctype) {
      this.setPreference('table', 'whtp_export_schedule');
      this.setTitle("<div style='padding-top: 15px; padding-left:15px; font-size: 20px; font-weight: normal'>" + this.msgs["Export to PDF"] + "</h4>");
    } else {
      this.setPreference('table', 'whtp_export_schedule_nondoctype');
      this.setTitle(this.msgs["Export to PDF"]);
    }
    this.setWidth('385');
    g_export_schedule_dialog = this;
  },
  execute: function() {
    this.render();
  },
  close: function() {
    g_export_schedule_dialog = null;
    this.destroy();
  },
  ok: function() {
    if (this.deliveryPref == 'email')
      this.emailMe();
    else
      this.waitForIt();
  },
  emailMe: function() {
    var address = gel('email_address');
    if (!address)
      return;
    if (address.value == '') {
      alert(this.msgs["Please specify an email address"]);
      return;
    }
    if (!isEmailValid(address.value)) {
      alert(this.msgs["The email address specified is not valid"]);
      return;
    }
    var fName = 'sys_confirm_whtp.do';
    var confirm_form = gel(fName);
    var childNodes = confirm_form.childNodes;
    for (var i = 0; i < childNodes.length; i++) {
      if (childNodes[i].id == 'email')
        childNodes[i].value = address.value;
      else if (childNodes[i].id == 'sysparm_query')
        childNodes[i].value = this._serializeOptions();
    }
    var serial = Form.serialize(confirm_form);
    var args = new GwtMessage().format(this.msgs["PDF file will be emailed to {0}"], address.value);
    serverRequestPost(fName, serial, this.ack, args);
    this.close();
  },
  saveDeliveryChange: function(pref) {
    this.deliveryPref = pref;
    var emailAddr = gel('input_address');
    if (pref == 'email')
      showObject(emailAddr, false);
    else
      hideObject(emailAddr, false);
  },
  waitForIt: function() {
    var url = this.url;
    if ($j('#pdf_all_tabs').is(':checked')) {
      url += '&sysparm_tab=all_tabs';
    } else if (this.defaultValues.currentTab) {
      url += '&sysparm_tab=' + this.defaultValues.currentTab;
    }
    var dialog = new GwtPollDialog(url, this._serializeOptions(), 0, '', 'whtpexport');
    dialog.execute();
    this.close();
  },
  ack: function(request, message) {
    alert(message);
  },
  _serializeOptions: function() {
    var options = {
      dataDoctype: this.dataDoctype,
      paperSize: $j('#pdf_papersize').val(),
      zoomFactor: $j('#pdf_zoomfactor').val(),
      orientation: $j('input[name=pdf_orientation]:checked').val().toLowerCase(),
      smartShrink: $j('#pdf_smartshrink').is(':checked'),
      avoidPageBreakInside: $j('#pdf_avoidpagebreak').is(':checked')
    };
    for (var prop in this.defaultValues) {
      if (this.defaultValues.hasOwnProperty(prop)) {
        options[prop] = this.defaultValues[prop];
      }
    }
    return JSON.stringify(options);
  }
});;