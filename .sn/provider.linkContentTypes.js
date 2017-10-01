/*! RESOURCE: /scripts/sn/common/link/provider.linkContentTypes.js */
angular.module('sn.common.link').provider('linkContentTypes', function linkContentTypesProvider() {
    "use strict";
    var linkDirectiveMap = {
        'record': "sn-link-content-record",
        'attachment': "sn-link-content-attachment",
        'video': "sn-link-content-youtube",
        'music.song': "sn-link-content-soundcloud",
        'link': 'sn-link-content-article',
        'article': 'sn-link-content-article',
        'website': 'sn-link-content-article',
        'image': 'sn-link-content-image'
    };
    this.$get = function linkContentTypesFactory() {
        return {
            forType: function(link) {
                if (link.isUnauthorized)
                    return "sn-link-content-error";
                return linkDirectiveMap[link.type] || "no-card";
            }
        }
    };
});;