/*! RESOURCE: /scripts/sn/common/controls/directive.snSyncWith.js */
angular.module("sn.common.controls").directive('snSyncWith', function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    scope: false,
    link: function(scope, elem, attr) {
      scope.journalField = scope.$eval(attr.snSyncWith);
      scope.value = scope.$eval(attr.ngModel);
      if (attr.snSyncWithValueInFn)
        scope.$eval(attr.ngModel + "=" + attr.snSyncWithValueInFn, {
          text: scope.value
        });
      scope.$watch(function() {
        return scope.$eval(attr.snSyncWith);
      }, function(nv, ov) {
        if (nv !== ov)
          scope.journalField = nv;
      });
      scope.$watch(function() {
        return scope.$eval(attr.ngModel);
      }, function(nv, ov) {
        if (nv !== ov)
          scope.value = nv;
      });
      if (!window.g_form)
        return;
      scope.$watch('value', function(n, o) {
        if (n !== o)
          setFieldValue();
      });

      function setFieldValue() {
        setValue(scope.journalField, scope.value);
      }

      function setValue(field, value) {
        value = !!value ? value : '';
        var control = g_form.getControl(field);
        if (attr.snSyncWithValueOutFn)
          value = scope.$eval(attr.snSyncWithValueOutFn, {
            text: value
          })
        control.value = value;
        onChange(control.id);
      }
      scope.$watch('journalField', function(newValue, oldValue) {
        if (newValue !== oldValue) {
          if (oldValue)
            setValue(oldValue, '');
          if (newValue)
            setFieldValue();
        }
      }, true);
    }
  };
});;