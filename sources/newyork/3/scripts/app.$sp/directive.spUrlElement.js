/*! RESOURCE: /scripts/app.$sp/directive.spUrlElement.js */
angular.module('sn.$sp').directive('spUrlElement', function($rootScope, i18n) {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'sp_element_url.xml',
    require: '?ngModel',
    scope: {
      field: '='
    },
    controller: function($scope) {},
    link: function($scope, $element, $attrs) {
      var unlockEmptyUrl = $attrs.unlockEmptyUrl;
      var ref = "sp_formfield_" + $attrs.name;
      var lockId = ref + "_lock";
      var unlockId = ref + "_unlock";
      var emptySpan = $element.find('[id*="empty_url"]');
      var lockButton = $element.find('button[id*="_lock"]');
      var unlockButton = $element.find('button[id*="_unlock"]');
      if (!$scope.field.value && unlockEmptyUrl == "true") {
        $(emptySpan).css('display', 'none');
        $element.find('input').css('display', '');
        $element.find('a').css('display', 'none');
        lockButton.css('display', '');
        unlockButton.css('display', 'none');
      }
      lockButton.on('click', function() {
        lock(this, ref, ref, ref + "_link", ref, ref + "_link", true);
      });
      unlockButton.on('click', function() {
        unlock(this, ref, ref, ref + "_link", ref, ref + "_link");
      });

      function lock(me, ref, edit_id, nonedit_id, current_value_id, update_id, keep_focus) {
        if (!$scope.field.value)
          $(emptySpan).css('display', '');
        if (me)
          me.style.display = "none";
        var unlock = gel(ref + '_unlock');
        unlock.style.display = "";
        var edit_span = gel(edit_id);
        edit_span.style.display = "none";
        var nonedit_span = gel(nonedit_id);
        nonedit_span.style.display = "inline-block";
        var current_value = gel(current_value_id);
        var the_value = current_value.value;
        var update_element = gel(update_id);
        if (update_element.href) {
          update_element.href = the_value;
          update_element.style.removeProperty('display');
        }
        update_element.innerHTML = htmlEscape(the_value);
        if (keep_focus)
          unlock.focus();
      }

      function unlock(me, ref, edit_id, nonedit_id) {
        $(emptySpan).css('display', 'none');
        if (me)
          me.style.display = "none";
        var unlock = gel(ref + '_lock');
        if (unlock)
          unlock.style.display = "inline-block";
        var edit_span = gel(edit_id);
        edit_span.style.display = "";
        var nonedit_span = gel(nonedit_id);
        nonedit_span.style.display = "none";
        unlock.focus();
      }

      function gel(id) {
        if (typeof id != 'string')
          return id;
        return document.getElementById(id);
      }

      function htmlEscape(s) {
        return s.replace(/&/g, "&amp;").replace(/'/g, "&#39;").replace(/"/g,
          "&quot;").replace(/</g, "&#60;").replace(/>/g, "&#62;");
      }
    }
  }
});;