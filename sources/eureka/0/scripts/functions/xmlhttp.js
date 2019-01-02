var isMicrosoftXMLHTTP = false;
var XML_HTTP = "xmlhttp.do";

function AJAXEvaluateSynchronously(expression) {
  var ajax = new GlideAjax("AJAXEvaluator");
  ajax.addParam("sysparm_expression", expression);
  ajax.getXMLWait();
  return ajax.getAnswer();
}

function AJAXEvaluate(expression, callbackAndArgs) {
  var ajax = new GlideAjax("AJAXEvaluator");
  ajax.addParam("sysparm_expression", expression);
  ajax.getXML(AJAXEvaluateResponse, "", callbackAndArgs);
}

function AJAXEvaluateResponse(response, callbackAndArgs) {
  var xml = response.responseXML;
  var answer = xml.documentElement.getAttribute("answer");
  if (callbackAndArgs != null) {
    var callback = callbackAndArgs;
    var args = new Array();
    if (typeof callbackAndArgs != "function" && callbackAndArgs.length > 1) {
      callback = callbackAndArgs.splice(0, 1)[0];
      args = callbackAndArgs;
    }
    callback.call(answer, answer, response, args);
  }
}

function AJAXFunction(func, args, callback, callbackArgs) {
  for (var i = 0; i < args.length; i++) {
    if (typeof args[i] == "function")
      continue;
    args[i] = args[i].replace(/"/g, "\\\"");
  }
  var expression = func + '("' + args.join('","') + '");';
  var newArgs = new Array();
  newArgs.push(callback);
  newArgs = newArgs.concat(callbackArgs);
  AJAXEvaluate(expression, newArgs);
}

function serverRequest(url, loadedFunction, args) {
  ajaxRequest(url, null, true, loadedFunction, args);
}

function serverRequestWait(url, postString) {
  var req = ajaxRequest(url, postString, false);
  if (req.status == 200)
    return req;
}

function serverRequestPost(url, postString, loadedFunction, args) {
  ajaxRequest(url, postString, true, loadedFunction, args);
}

function ajaxRequest(url, postString, async, responseFunction, responseFunctionArgs) {
  var req = getRequest();
  showLoading();
  if (req) {
    if (async && (responseFunction != null))
      req.onreadystatechange = function() {
        processReqChange(req, responseFunction, responseFunctionArgs);
      };
    req.open((postString ? "POST" : "GET"), url, async);
    if (typeof g_ck != 'undefined' && g_ck != "")
      req.setRequestHeader('X-UserToken', g_ck);
    if (postString) {
      req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
      req.send(postString);
    } else {
      if (isMicrosoftXMLHTTP)
        req.send();
      else
        req.send(null);
    }
  }
  if (!async)
    hideLoading();
  return req;
}

function getRequest() {
  var req = null;
  if (window.XMLHttpRequest) {
    req = new XMLHttpRequest();
  } else if (window.ActiveXObject) {
    isMicrosoftXMLHTTP = true;
    req = new ActiveXObject("Microsoft.XMLHTTP");
  }
  return req;
}

function processReqChange(r, docLoadedFunction, docLoadedFunctionArgs) {
  if (r.readyState == 4) {
    hideLoading();
    if (r.status == 200) {
      lastActivity = new Date();
      docLoadedFunction(r, docLoadedFunctionArgs);
    } else {
      try {
        window.status = "There was a problem retrieving the XML data: " + r.statusText;
      } catch (e) {}
    }
  }
}

function showLoading() {
  try {
    CustomEvent.fireAll("ajax.loading.start");
  } catch (e) {}
}

function hideLoading() {
  try {
    CustomEvent.fireAll("ajax.loading.end");
  } catch (e) {}
}