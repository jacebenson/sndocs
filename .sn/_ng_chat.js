/*! RESOURCE: /scripts/app.ng_chat/_ng_chat.js */
(function() {
    'use strict';
    var dependencies = [
        'sn.connect.profile',
        'sn.connect.presence',
        'sn.connect.conversation',
        'sn.connect.document',
        'sn.connect.queue',
        'ng.amb',
        'sn.angularstrap',
        'mentio',
        'sn.dragdrop'
    ];
    if (window.concoursePluginInstalled) {
        dependencies.unshift('sn.concourse');
        dependencies.push('sn.overviewhelp');
    }
    if (window.notificationPluginInstalled) {
        dependencies.push('sn.notification_preference');
    }
    angular.module('sn.connect', dependencies)
        .run(function(i18n) {
            i18n.preloadMessages();
        });
})();;