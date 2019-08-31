/*! RESOURCE: /scripts/app.$sp/directive.spCLink.js */
angular.module('sn.$sp').directive('spCLink', function(i18n) {
  return {
    restrict: 'E',
    scope: {
      rectangle: '=',
      target: '@',
      table: '=',
      id: '=',
      query: '='
    },
    replace: true,
    template: '<span class="sp-convenience-link-wrapper" ng-if="display()"><a href="{{href}}" target="_blank" class="sp-convenience-link">{{getText()}}</a></span>',
    link: function(scope, element, attrs, controller) {
      scope.display = function() {
        return scope.href && window.NOW.sp_debug;
      }
      var href = '';
      if (scope.target) {
        var target = scope.target;
        if (target == 'form')
          href = scope.table + '.do?sys_id=' + scope.id;
        if (target == 'kb_article')
          href = 'kb_view.do?sysparm_article=' + scope.id;
        if (target == 'sc_cat_item')
          href = 'com.glideapp.servicecatalog_cat_item_view.do?sysparm_id=' + scope.id + '&sysparm_catalog_view=catalog_default';
        if (target == 'list') {
          scope.$watch(function() {
            return scope.table + " | " + scope.query;
          }, function(newValue, oldValue) {
            if (newValue != oldValue)
              scope.href = scope.table + '_list.do?sysparm_query=' + scope.query;
          })
          href = scope.table + '_list.do?sysparm_query=' + scope.query;
        }
      }
      scope.href = href;
      scope.getText = function() {
        return i18n.getMessage('Open');
      }
    }
  }
});