/*! RESOURCE: /scripts/TestClient.js */
function popTestClient(test_definition, test_subject) {
  var test_execution;
  if (!test_subject)
    test_execution = test_definition;
  var dialog = new GlideDialogWindow('test_client', false, "50em", "25em");
  if (test_execution) {
    dialog.setPreference('sysparm_test_execution', test_execution);
  } else {
    dialog.setPreference('sysparm_test_definition', test_definition);
    dialog.setPreference('sysparm_test_subject', test_subject);
  }
  dialog.render();
}
var TestClient = Class.create();
TestClient.prototype = {
  TEST_STATES: ["Pending", "Running", "Succeeded", "Failed"],
  STATUS_IMAGES: ["images/workflow_skipped.gif",
    "images/loading_anim2.gifx", "images/workflow_complete.gifx",
    "images/workflow_rejected.gifx"
  ],
  TRANSLATED_TEXT: ["Pending", "Running", "Succeeded", "Failed",
    "Details", "more", "Hide Details", "Show Details"
  ],
  TIMEOUT_INTERVAL: 1000,
  translator: new GwtMessage(),
  detailStates: {},
  id: "",
  container: null,
  initialize: function(test_definition, test_subject) {
    this.container = $("container");
    this._setContainerStyles(this.container);
    this.translator.getMessages(this.TRANSLATED_TEXT);
    var test_execution;
    if (!test_subject) {
      this.id = test_definition
      return
    }
    this.testDefinition = test_definition;
    this.testSubject = test_subject;
  },
  start: function() {
    if (this.id) {
      this.getStatus();
      return;
    }
    var ga = new GlideAjax('AJAXTestProcessor');
    ga.addParam('sysparm_name', 'startTest');
    ga.addParam('sysparm_test_definition', this.testDefinition);
    ga.addParam('sysparm_test_subject', this.testSubject);
    ga.getXML(this.handleStart.bind(this));
  },
  handleStart: function(response) {
    this.id = response.responseXML.documentElement.getAttribute("answer");
    this.getStatus();
  },
  getStatus: function() {
    var ga = new GlideAjax('AJAXTestProcessor');
    ga.addParam('sysparm_name', 'getStatus');
    ga.addParam('sysparm_execution_id', this.id);
    if (typeof this.id != "string" || this.id == "")
      return;
    ga.getXML(this.handleGetStatus.bind(this));
  },
  handleGetStatus: function(response) {
    var answer = response.responseXML.documentElement.getAttribute("answer");
    eval("var so = " + answer);
    this.renderStatus(so);
    this.container = $("container");
    if (this.container == null)
      return;
    if (so.state == "0" || so.state == "1")
      setTimeout(this.getStatus.bind(this), this.TIMEOUT_INTERVAL);
  },
  renderStatus: function(so) {
    if (!so)
      return;
    var new_container = new Element("div");
    this._setContainerStyles(new_container);
    new_container.appendChild(this.getStatusRow(so));
    this.container.replace(new_container);
    this.container = new_container;
  },
  getStatusRow: function(obj, order) {
    var name = obj.name;
    var state = obj.state;
    var message = obj.message;
    var percent = NaN;
    if (obj.percent_complete) {
      percent = parseInt(obj.percent_complete);
    }
    var hasPercent = (!isNaN(percent) && percent > 0 && percent <= 100);
    var hasDetails = (obj.results.length >= 1 || message != "");
    var tr = new Element("div", {
      id: "row_container-" + obj.sys_id
    });
    tr.style.padding = "5px";
    var simp = new Element("div");
    simp.appendChild(this._getImage(obj));
    simp.appendChild(this._getItemTitleElement(name, order));
    var det = this._getDetailElement();
    var dtl;
    if (hasDetails || hasPercent)
      dtl = det.appendChild(this._getShowDetailsLink(obj.sys_id));
    simp.appendChild(det);
    simp.appendChild(this._getFloatClear("both"));
    tr.appendChild(simp);
    if (hasDetails || hasPercent) {
      var dtd = new Element("div");
      var ddc = new Element("div");
      ddc.style.marginTop = ".5em";
      ddc.style.marginLeft = "30px";
      ddc.id = "detail_cont-" + obj.sys_id;
      dtd.appendChild(ddc);
      if (hasPercent) {
        ddc.appendChild(this._getProgressBar(percent));
        ddc.appendChild(this._getFloatClear("both"));
      }
      if (message != "") {
        var dds = new Element("div");
        dds.appendChild(this._getDetailsText(message, obj));
        dds.style.fontSize = "smaller";
        dds.style.marginBottom = ".5em";
        ddc.appendChild(dds);
      }
      dtl.details_container = ddc;
      if (typeof this.detailStates[obj.sys_id] == "boolean" && this.detailStates[obj.sys_id] == false && dtl != null)
        dtl.onclick();
      tr.appendChild(dtd);
      this.renderChildren(obj, ddc);
    }
    return tr;
  },
  _getItemTitleElement: function(name, order) {
    var nameHtml = "<b>" + name + "</b>";
    if (order) {
      nameHtml = "\t" + order + ".\t" + nameHtml;
    }
    var nsp = new Element("span");
    nsp.innerHTML = nameHtml;
    nsp.style.float = "left";
    return nsp;
  },
  _getImage: function(obj) {
    var state = obj.state;
    var si = new Element("img");
    si.id = "img-" + obj.sys_id;
    si.src = this.STATUS_IMAGES[state];
    si.style.marginRight = "10px";
    si.style.float = "left";
    si.title = this.TEST_STATES[state];
    return si;
  },
  _getDetailElement: function() {
    var det = new Element("span");
    det.style.marginLeft = "10px";
    det.style.float = "left";
    return det;
  },
  _getShowDetailsLink: function(objSysID) {
    var da = new Element("a");
    da.id = objSysID;
    da.controller = this;
    da.innerHTML = "(" + this.translator.getMessage("Hide Details") + ")";
    da.toggleText = "(" + this.translator.getMessage("Show Details") + ")";
    da.style.fontSize = "8pt";
    da.style.float = "left";
    da.onclick = this.__detailsToggle;
    return da;
  },
  __detailsToggle: function() {
    var cont = this.details_container;
    cont.toggle();
    this.controller.detailStates[this.id] = cont.visible();
    var nt = this.toggleText;
    this.toggleText = this.innerHTML;
    this.innerHTML = nt;
  },
  _getDetailsText: function(message, obj) {
    if (message.length > 150) {
      var new_message = new Element("span");
      new_message.innerHTML = "<b>" +
        this.translator.getMessage("Details") + ": </b>" +
        message.slice(0, 150) + "... ";
      var anch = new Element("a");
      anch.href = "test_execution.do?sys_id=" + obj.sys_id;
      anch.innerHTML = "<b>(" + this.translator.getMessage("more") +
        ")</b>";
      new_message.appendChild(anch);
      return new_message;
    } else {
      var new_message = new Element("span")
      new_message.innerHTML = "<b>" +
        this.translator.getMessage("Details") + ": </b>" +
        message;
      return new_message;
    }
  },
  _getProgressBar: function(percent) {
    percent = Math.max(0, Math.min(100, percent));
    var progressContainer = new Element("div");
    progressContainer.style.width = "300px";
    progressContainer.style.height = "8px";
    progressContainer.style.border = "1px solid black";
    progressContainer.style.borderRadius = "10px";
    progressContainer.style.padding = "2px";
    progressContainer.style.marginTop = "2px";
    progressContainer.style.marginBottom = "2px";
    progressContainer.style.float = "left";
    var progressBar = new Element("div");
    progressBar.style.width = percent + "%";
    progressBar.style.height = "100%";
    progressBar.style.borderRadius = "10px";
    progressBar.style.backgroundColor = "#667788";
    progressContainer.appendChild(progressBar);
    return progressContainer;
  },
  _getFloatClear: function(which) {
    var br = new Element("br");
    br.style.clear = which;
    return br;
  },
  renderChildren: function(so, pr_cont) {
    if (!so.results)
      return;
    for (var i = 0; i < so.results.length; i++) {
      pr_cont.appendChild(this.getStatusRow(so.results[i], i + 1)).style.marginLeft = "15px";
    }
  },
  _setContainerStyles: function(container) {
    container.id = "container";
    container.style.overflowY = "auto";
    container.style.maxHeight = "50em";
    container.style.marginRight = ".25em";
    container.style.marginLeft = ".25em";
  },
  type: 'TestClient'
};;