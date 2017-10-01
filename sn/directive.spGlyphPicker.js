/*! RESOURCE: /scripts/app.$sp/directive.spGlyphPicker.js */
angular.module('sn.$sp').directive('spGlyphPicker', function($rootScope) {
    return {
        template: '<span class="glyph-picker-container">' +
            '<button ng-show="!disabled()" class="btn btn-default" data-iconset="fontawesome" data-icon="fa-{{field.value}}" role="iconpicker" />' +
            '<div ng-show="disabled()" class="fa fa-{{field.value}} glyph-picker-disabled"/>' +
            '</span>',
        restrict: 'E',
        replace: true,
        scope: {
            field: '=',
            snOnChange: '&',
            snOnBlur: '&',
            snDisabled: '&'
        },
        link: function(scope, element, attrs, controller) {
            scope.disabled = function() {
                if (typeof scope.snDisabled() == "undefined")
                    return false;
                return scope.snDisabled();
            }
            var button = element.find('button');
            button.on('click', function(e) {
                var describedByAttr = this.attributes['aria-describedby'];
                if (describedByAttr && describedByAttr.value.startsWith("popover")) {
                    e.stopImmediatePropagation();
                }
            });
            button.iconpicker({
                cols: 6,
                rows: 6,
                placement: 'right',
                iconset: 'fontawesome'
            });
            scope.transferIcon = function() {
                if (scope.field) {
                    button.iconpicker('setIcon', 'fa-' + scope.field.value);
                }
            }
            scope.$watch(function() {
                return scope.field ? scope.field.value : null;
            }, function(newValue, oldValue) {
                if (newValue != oldValue)
                    scope.transferIcon();
            })
            scope.transferIcon();
            button.on('change', function(e) {
                scope.field.value = e.icon.replace(/^fa-/, '');
                if (!$rootScope.$$phase)
                    $rootScope.$digest();
                scope.snOnChange();
            })
            button.on('change', function(e) {
                scope.snOnBlur();
            })
        }
    }
});