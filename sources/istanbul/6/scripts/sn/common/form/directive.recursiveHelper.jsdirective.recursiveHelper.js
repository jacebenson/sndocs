/*! RESOURCE: /scripts/sn/common/form/directive.recursiveHelper.js */
angular.module('sn.common.form').directive('recursiveHelper', function($compile) {
  return {
    restrict: "EACM",
    priority: 100000,
    compile: function(tElement, tAttr) {
      var contents = tElement.contents().remove();
      var compiledContents;
      return function(scope, iElement, iAttr) {
        if (!compiledContents)
          compiledContents = $compile(contents);
        iElement.append(compiledContents(scope, function(clone) {
          return clone;
        }));
      };
    }
  };
});;