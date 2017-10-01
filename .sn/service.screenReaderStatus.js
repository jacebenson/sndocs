/*! RESOURCE: /scripts/sn/common/accessibility/service.screenReaderStatus.js */
angular.module('sn.common.accessibility').service('screenReaderStatus', function($document) {
    function getAnnouncer() {
        var el = $document[0].getElementById('ngStatus');
        if (el)
            return el;
        el = $document[0].createElement('span')
        el.id = 'ngStatus';
        el.setAttribute('role', 'status');
        el.setAttribute('aria-live', 'polite');
        el.classList.add('sr-only');
        $document[0].body.appendChild(el);
    }

    function cleanOldMessages(el) {
        var nodes = el.childNodes;
        for (var i = 0; i < nodes.length; i++) {
            el.removeChild(nodes[i]);
        }
    }

    function announce(text) {
        var statusEl = getAnnouncer();
        cleanOldMessages(statusEl);
        var textNode = $document[0].createTextNode(text);
        statusEl.appendChild(textNode);
        statusEl.style.display = 'none';
        statusEl.style.display = 'inline';
    }
    getAnnouncer();
    return {
        announce: announce
    }
});;