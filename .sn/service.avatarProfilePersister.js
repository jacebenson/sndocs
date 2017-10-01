/*! RESOURCE: /scripts/sn/common/avatar/service.avatarProfilePersister.js */
angular.module('sn.common.avatar').service('avatarProfilePersister', function() {
    "use strict";
    var avatars = {};

    function setAvatar(id, payload) {
        avatars[id] = payload;
    }

    function getAvatar(id) {
        return avatars[id];
    }
    return {
        setAvatar: setAvatar,
        getAvatar: getAvatar
    }
});;