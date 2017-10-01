/*! RESOURCE: /scripts/app.magellan/factory.magellan_Permalink.js */
angular.module('Magellan').factory('magellan_Permalink', ['snCustomEvent', '$location', '$timeout', function(snCustomEvent, $location, $timeout) {
    return {
        init: function() {
            var originalTitle, formattedTitle;
            var setLocation = function(obj) {
                if (typeof obj.relativePath == 'string' && obj.relativePath != '')
                    $timeout(function() {
                        $location.path('nav_to.do').search({
                            uri: obj.relativePath
                        }).replace();
                    }, 10);
                setTitle(obj.title);
            };
            var setTitle = function(title) {
                if (typeof title == 'string' && title != '' && title != originalTitle) {
                    if (title.indexOf(formattedTitle) == -1)
                        title += formattedTitle;
                    document.title = title;
                } else
                    document.title = originalTitle;
            };
            var initTitle = function(title) {
                originalTitle = title;
                formattedTitle = ' | ' + title;
            };
            initTitle(document.title);
            snCustomEvent.observe('magellanNavigator.permalink.set', function(obj) {
                if (obj)
                    setLocation(obj);
            });
            snCustomEvent.observe('glide.product.name', function(value) {
                if (typeof value === "undefined" || value == "")
                    value = 'ServiceNow';
                initTitle(value);
                setTitle(value);
            });
        }
    };
}]);;