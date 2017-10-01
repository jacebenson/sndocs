/*! RESOURCE: /scripts/concourse_view_stack/js_includes_concourse_view_stack.js */
/*! RESOURCE: /scripts/concourse_view_stack/_module.js */
angular.module('sn.concourse_view_stack', []);;
/*! RESOURCE: /scripts/concourse_view_stack/service.viewStack.js */
angular.module('sn.concourse_view_stack').service('viewStackService', function(i18n, systemProperties) {
    "use strict";
    var defaultViews = [{
            tab: 'general',
            name: 'general',
            replace: true,
            template: 'concourse_settings_general.xml',
            icon: 'cog',
            title: i18n.getMessage('General')
        },
        {
            tab: 'theme',
            name: 'theme',
            template: 'concourse_settings_theme.xml',
            replace: true,
            icon: 'image',
            title: i18n.getMessage('Theme')
        },
        {
            tab: 'list',
            name: 'list',
            template: 'concourse_settings_lists.xml',
            replace: true,
            icon: 'table',
            title: i18n.getMessage('Lists')
        },
        {
            tab: 'form',
            name: 'form',
            template: 'concourse_settings_forms.xml',
            replace: true,
            icon: 'form',
            title: i18n.getMessage('Forms')
        },
        {
            tab: 'notifications',
            name: 'notifications_category',
            template: 'notification_preference_category.xml',
            title: i18n.getMessage('Applications')
        },
        {
            tab: 'notifications',
            name: 'notifications_channel',
            template: 'notification_preference_channel.xml',
            title: i18n.getMessage('Channels')
        },
        {
            tab: 'notifications',
            name: 'notifications_form',
            template: 'notification_preference_form.xml',
            title: i18n.getMessage('Apply Conditions')
        },
        {
            tab: 'notifications',
            name: 'notifications_general',
            template: systemProperties.notifications ? 'notification_preference_general.xml' : 'concourse_settings_notifications_connect.xml',
            replace: true,
            icon: 'notification-bell',
            title: i18n.getMessage('Notifications')
        }
    ];
    if (systemProperties.developer) {
        defaultViews.push({
            tab: 'developer',
            name: 'developer',
            template: 'concourse_settings_developer.xml',
            replace: true,
            icon: 'console',
            title: i18n.getMessage('Developer')
        })
    }
    return {
        get: function get(key, options) {
            var defaultView = defaultViews.filter(function(item) {
                return item.name == key;
            })[0];
            if (!defaultView) {
                throw 'Invalid view key: ' + key;
            }
            return angular.extend({}, defaultView, options);
        },
        getTopLevelViews: function getTopLevelViews() {
            return defaultViews
                .filter(function(view) {
                    return view.replace;
                })
                .map(function(view) {
                    return angular.extend({}, view);
                })
        }
    };
});;;