/*! RESOURCE: /scripts/app.ng_chat/util/service.notificationPreferences.js */
angular.module('sn.common.glide').factory("notificationPreferences", function(
    snHttp, $q, amb, unwrappedHTTPPromise, snNotifier, initGlobalNotificationPreferences, urlTools, snCustomEvent, isLoggedIn) {
    "use strict";
    var BASE_URL = isLoggedIn ? "/api/now/connect/conversations/" : "/api/now/connect/support/anonymous/conversations/";
    var preferencesCache = {};

    function fromGlobalObject(rawGlobalPreference) {
        function update(field, preferenceValue) {
            rawGlobalPreference[field] = preferenceValue;
            var eventName = 'connect.notifications.' + field;
            var targetURL = urlTools.getURL('user_preference', {
                "sysparm_pref_name": eventName,
                "sysparm_action": "set",
                "sysparm_pref_value": "" + !!preferenceValue
            });
            snHttp.get(targetURL).then(function() {
                snCustomEvent.fireAll(eventName + '.update', preferenceValue);
            });
        }
        snCustomEvent.on('connect.notifications.mobile.update', function(newVal) {
            rawGlobalPreference.mobile = newVal;
        });
        snCustomEvent.on('connect.notifications.desktop.update', function(newVal) {
            rawGlobalPreference.desktop = newVal;
            updateDesktopNotificationPermission();
        });
        snCustomEvent.on('connect.notifications.email.update', function(newVal) {
            rawGlobalPreference.email = newVal;
        });
        snCustomEvent.on('connect.notifications.audio.update', function(newVal) {
            rawGlobalPreference.audio = newVal;
        });

        function updateDesktopNotificationPermission() {
            if (!rawGlobalPreference.desktop)
                return;
            if (snNotifier().canUseNativeNotifications())
                return;
            snNotifier().requestNotificationPermission();
        }
        updateDesktopNotificationPermission();
        return {
            get mobile() {
                return rawGlobalPreference.mobile
            },
            get desktop() {
                return rawGlobalPreference.desktop;
            },
            get email() {
                return rawGlobalPreference.email;
            },
            get audio() {
                return rawGlobalPreference.audio;
            },
            set mobile(value) {
                return update('mobile', value);
            },
            set desktop(value) {
                return update('desktop', value);
            },
            set email(value) {
                return update('email', value);
            },
            set audio(value) {
                return update('audio', value);
            }
        }
    }
    var globalPreferences = fromGlobalObject(initGlobalNotificationPreferences);

    function fromObject(rawPreferences) {
        function update(field, value) {
            rawPreferences[field] = value;
            if (rawPreferences.loading)
                return;
            snHttp.post(BASE_URL + rawPreferences.sys_id + "/notifications", rawPreferences).then(function(response) {
                addRaw(response.data.result);
            });
        }
        return {
            get loading() {
                return rawPreferences.loading;
            },
            get mobile() {
                return rawPreferences.push_notification_preference;
            },
            get desktop() {
                return rawPreferences.browser_notification_preference;
            },
            get email() {
                return rawPreferences.email_notification_preference;
            },
            get audio() {
                return rawPreferences.audio_notification_preference;
            },
            get canEmail() {
                return rawPreferences.can_email;
            },
            get systemMessage() {
                return rawPreferences.system_message_notification_preference;
            },
            set mobile(value) {
                update('push_notification_preference', value);
            },
            set desktop(value) {
                update('browser_notification_preference', value);
            },
            set email(value) {
                update('email_notification_preference', value);
            },
            set audio(value) {
                update('audio_notification_preference', value);
            },
            set canEmail(value) {
                update('can_email', value);
            },
            set systemMessage(value) {
                update('system_message_notification_preference', value);
            }
        }
    }

    function getPreferences(conversationID) {
        if (!preferencesCache[conversationID]) {
            addRaw({
                sys_id: conversationID,
                push_notification_preference: 'all',
                browser_notification_preference: 'all',
                email_notification_preference: 'all',
                audio_notification_preference: 'all',
                can_email: true,
                system_message_notification_preference: true,
                loading: true
            });
            snHttp.get(BASE_URL + conversationID + "/notifications").then(function(response) {
                addRaw(response.data.result);
            });
        }
        return preferencesCache[conversationID];
    }

    function addRaw(preference) {
        preferencesCache[preference.sys_id] = fromObject(preference);
    }
    return {
        get: getPreferences,
        addRaw: addRaw,
        globalPreferences: globalPreferences
    };
});;