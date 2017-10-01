/*! RESOURCE: /scripts/sn/common/util/service.urlTools.js */
angular.module('sn.common.util').constant('angularProcessorUrl', 'angular.do?sysparm_type=');
angular.module('sn.common.util').factory("urlTools", function(getTemplateUrl, angularProcessorUrl) {
    "use strict";

    function getPartialURL(name, parameters) {
        var url = getTemplateUrl(name);
        if (parameters) {
            if (typeof parameters !== 'string') {
                parameters = encodeURIParameters(parameters);
            }
            if (parameters.length) {
                url += "&" + parameters;
            }
        }
        if (window.NOW && window.NOW.ng_cache_defeat)
            url += "&t=" + new Date().getTime();
        return url;
    }

    function getURL(name, parameters) {
        if (parameters && typeof parameters === 'object')
            return urlFor(name, parameters);
        var url = angularProcessorUrl;
        url += name;
        if (parameters)
            url += "&" + parameters;
        return url;
    }

    function urlFor(route, parameters) {
        var p = encodeURIParameters(parameters);
        return angularProcessorUrl + route + (p.length ? '&' + p : '');
    }

    function getPropertyURL(name) {
        var url = angularProcessorUrl + "get_property&name=" + name;
        url += "&t=" + new Date().getTime();
        return url;
    }

    function encodeURIParameters(parameters) {
        var s = [];
        for (var parameter in parameters) {
            if (parameters.hasOwnProperty(parameter)) {
                var key = encodeURIComponent(parameter);
                var value = parameters[parameter] ? encodeURIComponent(parameters[parameter]) : '';
                s.push(key + "=" + value);
            }
        }
        return s.join('&');
    }

    function parseQueryString(qs) {
        qs = qs || '';
        if (qs.charAt(0) === '?') {
            qs = qs.substr(1);
        }
        var a = qs.split('&');
        if (a === "") {
            return {};
        }
        if (a && a[0].indexOf('http') != -1)
            a[0] = a[0].split("?")[1];
        var b = {};
        for (var i = 0; i < a.length; i++) {
            var p = a[i].split('=', 2);
            if (p.length == 1) {
                b[p[0]] = "";
            } else {
                b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
            }
        }
        return b;
    }
    return {
        getPartialURL: getPartialURL,
        getURL: getURL,
        urlFor: urlFor,
        getPropertyURL: getPropertyURL,
        encodeURIParameters: encodeURIParameters,
        parseQueryString: parseQueryString
    };
});;