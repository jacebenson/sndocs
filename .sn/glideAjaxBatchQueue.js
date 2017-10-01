/*! RESOURCE: /scripts/ga_batch/glideAjaxBatchQueue.js */
window.NOW.GlideAjaxBatchRequestQueue = (function() {
    var queue = [];
    var startProcessingTimeout;
    var MAX_TIME_IN_QUEUE = window.NOW.batch_glide_ajax_requests_max_time_in_queue || 50;
    if (MAX_TIME_IN_QUEUE < 0)
        MAX_TIME_IN_QUEUE = 50;

    function processQueue() {
        clearProcessingTimeout();
        var toProcess = queue.slice(0);
        if (toProcess.length == 0)
            return;
        var batchGa = window.NOW.batchedGlideAjax(toProcess);
        batchGa.execute(function requeueUnprocessed(unprocessedGas) {
            queue = unprocessedGas.concat(queue);
            processQueue();
        });
        queue.length = 0;
    }

    function clearProcessingTimeout() {
        if (startProcessingTimeout) {
            clearTimeout(startProcessingTimeout);
            startProcessingTimeout = undefined;
        }
    }
    return {
        enqueue: function(glideAjax) {
            queue.push(glideAjax);
            if (!startProcessingTimeout)
                startProcessingTimeout = setTimeout(processQueue, MAX_TIME_IN_QUEUE);
        },
        processQueue: processQueue
    }
})();;