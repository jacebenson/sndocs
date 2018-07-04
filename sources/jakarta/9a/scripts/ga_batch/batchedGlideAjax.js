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