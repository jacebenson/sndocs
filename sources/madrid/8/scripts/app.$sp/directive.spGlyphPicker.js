/*! RESOURCE: /scripts/app.$sp/directive.spGlyphPicker.js */
angular.module('sn.$sp').directive('spGlyphPicker', function($rootScope, i18n) {
      return {
        template: '<span class="glyph-picker-container">' +
          '<button ng-show="!disabled()" class="btn btn-default iconpicker" data-iconset="fontawesome" data-icon="fa-{{field.value}}" id="sp_formfield_{{::field.name}}" aria-label="{{::label}}" tabindex="0"/>' +
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
            var button = element.find('button'