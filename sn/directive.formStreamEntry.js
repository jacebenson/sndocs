/*! RESOURCE: /scripts/sn/common/stream/directive.formStreamEntry.js */
angular.module('sn.common.stream').directive('formStreamEntry', function(getTemplateUrl) {
    return {
        restrict: 'A',
        templateUrl: getTemplateUrl('record_stream_entry.xml')
    }
});;