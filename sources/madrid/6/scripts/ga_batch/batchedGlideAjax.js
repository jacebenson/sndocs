/*! RESOURCE: /scripts/ga_batch/batchedGlideAjax.js */
window.NOW.batchedGlideAjax = function batchedGlideAjax(toProcess) {
  var batchGA = new GlideAjax("AJAXXMLHttpAggregator");
  batchGA.disableRunInBatch();

  function batchErrorHandler(onCompletionFn) {
    return function(error) {
      console.log("BatchedGlideAjax: Got error", error);
      toProcess.forEach(function(ga) {
        handleChildResponseError({
          status: 500,
          glideAjax: ga,
          error: "Batch failed"
        });
      });
      if (onCompletionFn)
        onCompletionFn([]);
    }
  }

  function batchResponseHandler(onCompletionFn) {
    return function(response) {
      console.log("BatchedGlideAjax: Got response", response);
      if (!response || !response.responseXML) {
        batchErrorHandler(onCompletionFn)(response);
        return;
      }
      var doc = response.responseXML.documentElement;
      if (!doc || !doc.childNodes) {
        batchErrorHandler(onCompletionFn)(response);
        return;
      }
      var unprocessedGas = processIndividualResponses(Array.prototype.slice.apply(doc.childNodes));
      if (onCompletionFn)
        onCompletionFn(unprocessedGas);
    }
  }

  function processIndividualResponses(nodes) {
    var processedIndicies = [];
    nodes.forEach(function(node) {
      var response = responseNode(node);
      try {
        if (response.succeeded)
          handleChildResponseSuccess(response);
        else
          handleChildResponseError(response);
      } catch (e) {
        console.warn("BatchedGlideAjax: Error processing child response", response, ":", e);
      } finally {
        processedIndicies.push(response.queueIndex);
      }
    });
    return toProcess.filter(function(ga, idx) {
      return processedIndicies.indexOf(idx) < 0;
    });
  }

  function responseNode(node) {
    var processorIdx = ~~node.getAttribute("sysparm_processor_index");
    if (processorIdx < 0 || processorIdx >= toProcess.length) {
      console.error("BatchedGlideAjax: Processor index " + processorIdx + " out of bounds for batch queue", toProcess);
      return null;
    }
    var ga = toProcess[processorIdx];
    var status = ~~node.getAttribute("status");
    var error = node.getAttribute("error");
    var answer = node.getAttribute("answer");
    var responseDocument = null;
    return {
      queueIndex: processorIdx,
      status: status,
      error: error,
      answer: answer,
      glideAjax: ga,
      succeeded: status >= 200 && status < 300,
      get responseDocument() {
        if (responseDocument == null) {
          responseDocument = document.implementation.createDocument("", "", null);
          var clonedNode = responseDocument.importNode(node, true);
          responseDocument.appendChild(clonedNode);
        }
        return responseDocument;
      }
    };
  }

  function handleChildResponseError(response) {
    var errorObject = {
      status: response.status,
      statusText: response.error,
      error: response.error,
      description: response.error,
      responseText: response.error
    };
    var ga = response.glideAjax;
    if (ga.errorCallbackFunction)
      setTimeout(function() {
        ga.errorCallbackFunction(errorObject, ga.callbackArgs)
      }, 0);
  }

  function handleChildResponseSuccess(response) {
    var ga = response.glideAjax;
    if (!ga.callbackFunction)
      return;
    if (ga.wantAnswer) {
      var answer = response.answer;
      setTimeout(function() {
        ga.callbackFunction(answer, ga.callbackArgs);
      }, 0);
    } else {
      var requestObject = {
        responseXML: response.responseDocument,
        status: status
      };
      setTimeout(function() {
        ga.callbackFunction(requestObject, ga.callbackArgs)
      }, 0);
    }
  }

  function addParamsToBatch(params, index) {
    var param;
    if (!params)
      return;
    for (param in params) {
      if (!params.hasOwnProperty(param))
        continue;
      batchGA.addParam(index + '.' + param, params[param]);
    }
  }

  function decodeFormURI(value) {
    value = value ? value.replace(/\+/g, '%20') : value;
    return decodeURIComponent(value);
  }

  function addCustomQueryStringToBatch(qs, index) {
    if (!qs)
      return;
    if (qs.startsWith('?'))
      qs = qs.substring(1);
    var params = qs.split('&');
    params.forEach(function(param) {
      var i = param.indexOf('=');
      var name = param,
        value;
      if (i > -1) {
        name = param.substring(0, i);
        value = param.substring(i + 1);
      }
      var decodedName = decodeFormURI(name);
      var decodedValue = decodeFormURI(value);
      batchGA.addParam(index + '.' + decodedName, decodedValue);
    });
  }
  return {
    execute: function(unprocessedCallback) {
      toProcess.forEach(function(ga, idx) {
        addParamsToBatch(ga.params, idx);
        addParamsToBatch(ga.additionalProcessorParams, idx);
        addCustomQueryStringToBatch(ga.postString, idx);
      });
      batchGA.addParam("sysparm_aggregation_size", toProcess.length);
      batchGA.setErrorCallback(batchErrorHandler(unprocessedCallback));
      batchGA.getXML(batchResponseHandler(unprocessedCallback));
    }
  }
};;