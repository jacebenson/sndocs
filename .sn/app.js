/*! RESOURCE: /scripts/app.magellan/app.js */
angular.module('Magellan', ['sn.base', 'sn.common', 'sn.dragdrop', 'sn.timeAgo', 'heisenberg', 'ng.shims.placeholder', 'Magellan.createFavorite'])
    .constant('VIEW_NAMES', {
        History: 'history',
        AllApps: 'allApps',
        Favorites: 'favorites',
        Filtered: 'filtered'
    }).config(['$locationProvider', function($locationProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false,
            rewriteLinks: false
        });
    }]).config(['$compileProvider', function($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|javascript):/);
    }]);;