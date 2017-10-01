/*! RESOURCE: /scripts/sn/common/clientScript/angular/xmlUtil.js */
angular.module('sn.common.clientScript').factory('xmlUtil', function($log) {
    function xmlToElement(xmlText) {
        if (typeof DOMParser !== 'undefined') {
            try {
                var parser = new DOMParser();
                return parser.parseFromString(xmlText, 'application/xml');
            } catch (e) {
                $log.error(e);
                return null;
            }
        } else {
            var xml = angular.element(xmlText);
            $log.warn('DOMParser is not supported on this browser');
            return angular.element(xml[1]);
        }
    }

    function getDataFromXml(text, nodeName) {
        var dataSet = [];
        var el = angular.element(xmlToElement(text));
        if (el && el.length) {
            var nodes = angular.isString(nodeName) ? el.find(nodeName) : el.find('xml');
            angular.forEach(nodes, function(n) {
                if (n.attributes && n.attributes.length) {
                    var data = {};
                    angular.forEach(n.attributes, function(attr) {
                        data[attr.nodeName] = attr.nodeValue;
                    });
                    dataSet.push(data);
                }
            });
        }
        return dataSet;
    }
    return {
        xmlToElement: xmlToElement,
        getDataFromXml: getDataFromXml
    };
});;