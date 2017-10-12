/*! RESOURCE: /scripts/js_includes_customer.js */
/*! RESOURCE: NoRole.User.Redirect */
addLoadEvent(ESSUserRedirect);

function ESSUserRedirect() {
  try {
    var u_user = g_user.userName;
    var ga = new GlideAjax('validateLoginUserAccess');
    ga.addParam('sysparm_name', 'validateUser');
    ga.addParam('sysparm_user_name', u_user);
    ga.getXMLWait();
    var u_validated_ans = ga.getAnswer();
    if (u_validated_ans.toString() == false || u_validated_ans.toString() == "false") {
      var notPortal = document.URL.indexOf('it_service_desk') == -1;
      var notSurvey = document.URL.indexOf('survey_take.do') == -1;
      var notRedirector = document.URL.indexOf('saml_redirector.do') == -1;
      var notOnPortal = document.URL.indexOf('liftportal') == -1;
      var notLogindo = document.URL.indexOf('login.do') == -1;
      var notknowledge = document.URL.indexOf('knowledge.do') == -1;
      var notkbview = document.URL.indexOf('kb_view.do') == -1;
      var notincident = document.URL.indexOf('incident.do') == -1;
      var notadhoc = document.URL.indexOf('u_ad_hoc_request.do') == -1;
      var portalForward = (notPortal && notSurvey && notRedirector && notOnPortal && notLogindo && notknowledge && notkbview && notincident && notadhoc);
      if (portalForward) {
        window.location = "../liftportal";
      }
    }
  } catch (err) {}
}
/*! RESOURCE: Validate Client Script Functions */
function validateFunctionDeclaration(fieldName, functionName) {
  var code = g_form.getValue(fieldName);
  if (code == "")
    return true;
  code = removeCommentsFromClientScript(code);
  var patternString = "function(\\s+)" + functionName + "((\\s+)|\\(|\\[\r\n])";
  var validatePattern = new RegExp(patternString);
  if (!validatePattern.test(code)) {
    var msg = new GwtMessage().getMessage('Missing function declaration for') + ' ' + functionName;
    g_form.showErrorBox(fieldName, msg);
    return false;
  }
  return true;
}

function validateNoServerObjectsInClientScript(fieldName) {
  var code = g_form.getValue(fieldName);
  if (code == "")
    return true;
  code = removeCommentsFromClientScript(code);
  var doubleQuotePattern = /"[^"\r\n]*"/g;
  code = code.replace(doubleQuotePattern, "");
  var singleQuotePattern = /'[^'\r\n]*'/g;
  code = code.replace(singleQuotePattern, "");
  var rc = true;
  var gsPattern = /(\s|\W)gs\./;
  if (gsPattern.test(code)) {
    var msg = new GwtMessage().getMessage('The object "gs" should not be used in client scripts.');
    g_form.showErrorBox(fieldName, msg);
    rc = false;
  }
  var currentPattern = /(\s|\W)current\./;
  if (currentPattern.test(code)) {
    var msg = new GwtMessage().getMessage('The object "current" should not be used in client scripts.');
    g_form.showErrorBox(fieldName, msg);
    rc = false;
  }
  return rc;
}

function validateUIScriptIIFEPattern(fieldName, scopeName, scriptName) {
  var code = g_form.getValue(fieldName);
  var rc = true;
  if ("global" == scopeName)
    return rc;
  code = removeCommentsFromClientScript(code);
  code = removeSpacesFromClientScript(code);
  code = removeNewlinesFromClientScript(code);
  var requiredStart = "var" + scopeName + "=" + scopeName + "||{};" + scopeName + "." + scriptName + "=(function(){\"usestrict\";";
  var requiredEnd = "})();";
  if (!code.startsWith(requiredStart)) {
    var msg = new GwtMessage().getMessage("Missing closure assignment.");
    g_form.showErrorBox(fieldName, msg);
    rc = false;
  }
  if (!code.endsWith(requiredEnd)) {
    var msg = new GwtMessage().getMessage("Missing immediately-invoked function declaration end.");
    g_form.showErrorBox(fieldName, msg);
    rc = false;
  }
  return rc;
}

function validateNotCallingFunction(fieldName, functionName) {
  var code = g_form.getValue(fieldName);
  var rc = true;
  var reg = new RegExp(functionName, "g");
  var matches;
  code = removeCommentsFromClientScript(code);
  if (code == '')
    return rc;
  matches = code.match(reg);
  rc = (matches && (matches.length == 1));
  if (!rc) {
    var msg = "Do not explicitly call the " + functionName + " function in your business rule. It will be called automatically at execution time.";
    msg = new GwtMessage().getMessage(msg);
    g_form.showErrorBox(fieldName, msg);
  }
  return rc;
}

function removeCommentsFromClientScript(code) {
  var pattern1 = /\/\*(.|[\r\n])*?\*\//g;
  code = code.replace(pattern1, "");
  var pattern2 = /\/\/.*/g;
  code = code.replace(pattern2, "");
  return code;
}

function removeSpacesFromClientScript(code) {
  var pattern = /\s*/g;
  return code.replace(pattern, "");
}

function removeNewlinesFromClientScript(code) {
  var pattern = /[\r\n]*/g;
  return code.replace(pattern, "");
}
/*! RESOURCE: SMAPortal - Global UI */
(function() {
  var _this = {
    portalUrl: '/liftportal/',
    initialize: function() {
      var pageUrlSuffix = _this.createPageUrlSuffix();
      _this.setupIframeSelector();
      _this.setupBodySelector(pageUrlSuffix);
      _this.resizeFrame();
      _this.setExternalLinksOpenNewWindow();
      if (window.top === window.self) {}
      switch (pageUrlSuffix) {
        case 'smaportal_kb_find':
          $$("a[href^=kb_view.do]").each(function(element) {
            var sysId = element.href.substr(element.href.indexOf('sys_kb_id=') + 10, 32);
            element.setAttribute('href', 'knowledge.do?sysparm_document_key=kb_knowledge,' + sysId);
            element.setAttribute('target', '_top');
          });
          break;
      }
    },
    setExternalLinksOpenNewWindow: function() {
      $$("a[href^=http]").each(function(element) {
        if (element.href.indexOf(location.hostname) == -1) {
          element.setAttribute('target', '_blank');
        }
      });
    },
    createPageUrlSuffix: function() {
      var pageUrlSuffix = window.location.pathname;
      pageUrlSuffix = pageUrlSuffix.split('.do')[0];
      pageUrlSuffix = pageUrlSuffix.replace(_this.portalUrl, '');
      pageUrlSuffix = pageUrlSuffix.replace(/\./g, '_');
      return pageUrlSuffix;
    },
    setupIframeSelector: function() {
      if (window.top !== window.self) {
        var bodyElement = $$('body')[0];
        bodyElement.addClassName('in_frame');
      }
    },
    setupBodySelector: function(pageUrlSuffix) {
      var bodyElement = $$('body')[0];
      bodyElement.addClassName(pageUrlSuffix);
    },
    resizeFrame: function() {
      if ($('gsft_main')) {
        window.setInterval(function() {
          var gsftMain = $('gsft_main');
          var frameBody = window.frames['gsft_main'].window.document.body;
          var frameHeight = gsftMain.getHeight();
          var frameBodyHeight = frameBody.scrollHeight;
          var frameWidth = gsftMain.getWidth();
          var frameBodyWidth = frameBody.scrollWidth;
          if (frameBodyHeight > frameHeight) {
            gsftMain.style.height = (frameBodyHeight + 15) + 'px';
          }
          if (frameBodyWidth > frameWidth) {
            gsftMain.style.width = (frameBodyWidth + 15) + 'px';
          }
        }, 500);
      }
    },
  };
  var pathname = top.location.pathname;
  if (pathname.startsWith(_this.portalUrl)) {
    document.observe("dom:loaded", function() {
      _this.initialize();
    });
  }
})();
/*! RESOURCE: UI Action Context Menu */
function showUIActionContext(event) {
  if (!g_user.hasRole("ui_action_admin"))
    return;
  var element = Event.element(event);
  if (element.tagName.toLowerCase() == "span")
    element = element.parentNode;
  var id = element.getAttribute("gsft_id");
  var mcm = new GwtContextMenu('context_menu_action_' + id);
  mcm.clear();
  mcm.addURL(getMessage('Edit UI Action'), "sys_ui_action.do?sys_id=" + id, "gsft_main");
  contextShow(event, mcm.getID(), 500, 0, 0);
  Event.stop(event);
}
addLoadEvent(function() {
  document.on('contextmenu', '.action_context', function(evt, element) {
    showUIActionContext(evt);
  });
});
/*! RESOURCE: /scripts/lib/jquery/jquery_clean.js */
(function() {
  if (!window.jQuery)
    return;
  if (!window.$j_glide)
    window.$j = jQuery.noConflict();
  if (window.$j_glide && jQuery != window.$j_glide) {
    if (window.$j_glide)
      jQuery.noConflict(true);
    window.$j = window.$j_glide;
  }
})();;;