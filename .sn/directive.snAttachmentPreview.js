/*! RESOURCE: /scripts/sn/common/ui/directive.snAttachmentPreview.js */
angular.module('sn.common.ui').directive('snAttachmentPreview', function(getTemplateUrl, snCustomEvent) {
    return {
        restrict: 'E',
        templateUrl: getTemplateUrl('sn_attachment_preview.xml'),
        controller: function($scope) {
            snCustomEvent.observe('sn.attachment.preview', function(evt, attachment) {
                if (evt.stopPropagation)
                    evt.stopPropagation();
                if (evt.preventDefault)
                    evt.preventDefault();
                $scope.image = attachment;
                $scope.$broadcast('dialog.attachment_preview.show');
                return false;
            });
        }
    }
});;