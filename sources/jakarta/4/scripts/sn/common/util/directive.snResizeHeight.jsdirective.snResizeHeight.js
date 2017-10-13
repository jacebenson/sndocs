/*! RESOURCE: /scripts/sn/common/util/directive.snResizeHeight.js */
angular.module('sn.common.util').directive('snResizeHeight', function($timeout, $window) {
  "use strict";
  return {
    restrict: 'A',
    link: function(scope, elem, attrs) {
      var typographyStyles = [
        'fontFamily',
        'fontSize',
        'fontWeight',
        'fontStyle',
        'letterSpacing',
        'textTransform',
        'wordSpacing',
        'textIndent'
      ];
      var maxHeight = parseInt(elem.css('max-height'), 10) || 0;
      var offset = 0;
      var IS_EDGE = $window.navigator.userAgent.indexOf("Edge") > -1;
      if (elem.css('box-sizing') === 'border-box' || elem.css('-moz-box-sizing') === 'border-box' || elem.css('-webkit-box-sizing') === 'border-box')
        offset = elem.outerHeight() - elem.height();
      var styles = {};
      angular.forEach(typographyStyles, function(val) {
        styles[val] = elem.css(val);
      });
      var $clone = angular.element('<textarea rows="1" tabindex="-1" style="position:absolute; top:-999px; left:0; right:auto; bottom:auto; border:0; padding: 0; -moz-box-sizing:content-box; -webkit-box-sizing:content-box; box-sizing:content-box; word-wrap:break-word; height:0 !important; min-height:0 !important; overflow:hidden; transition:none; -webkit-transition:none; -moz-transition:none;"></textarea>');
      $clone.css(styles);
      $timeout(function() {
        angular.element(document.body).append($clone);
        if (elem[0].value) {
          reSize();
        }
      }, 0, false);

      function _fixValueForEdge(value) {
        if (typeof value === "undefined" || !value) {
          return "";
        }
        var valueWithoutReturns = value.replace(/\r?\n|\r/gm, "").length;
        if (valueWithoutReturns === 0) {
          return value + '&nbsp';
        }
        return value;
      }

      function reSize() {
        var elemValue;
        if (!isVisible(elem[0]) || !setWidth())
          return;
        if (IS_EDGE) {
          elemValue = _fixValueForEdge(elem[0].value);
        } else {
          elemValue = elem[0].value;
        }
        if (!elem[0].value && attrs['placeholder'])
          $clone[0].value = attrs['placeholder'] || '';
        else
          $clone[0].value = elemValue;
        $clone[0].scrollTop = 0;
        $clone[0].scrollTop = 9e4;
        var newHeight = $clone[0].scrollTop;
        if (maxHeight && newHeight > maxHeight) {
          newHeight = maxHeight;
          elem[0].style.overflow = "auto";
        } else
          elem[0].style.overflow = "hidden";
        newHeight += offset;
        elem[0].style.height = newHeight + "px";
      }
      var style, bordersAndPadding;

      function setWidth() {
        style = style || window.getComputedStyle(elem[0], null);
        var width = elem[0].getBoundingClientRect().width;
        if (width === 0 || typeof width !== 'number')
          width = parseInt(style.width, 10);
        if (width === 0 || typeof width !== 'number') {
          if (style.width.length && style.width[style.width.length - 1] === '%') {
            $timeout(reSize, 0, false);
            return false;
          }
          width = parseInt(style.width, 10);
        }
        if (!bordersAndPadding) {
          bordersAndPadding = ['paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth'].reduce(function(acc, val) {
            return acc + parseInt(style[val], 10);
          }, 0);
        }
        $clone[0].style.width = (width - bordersAndPadding) + 'px';
        return true;
      }
      scope.$watch(
        function() {
          return elem[0].value
        },
        function watchBinding(newValue, oldValue) {
          if (newValue === oldValue)
            return;
          reSize();
        }
      );
      elem.on('input.resize', reSize);
      if (attrs['snResizeHeight'] == "trim") {
        elem.on('blur', function() {
          elem.val(elem.val().trim());
          reSize();
        });
      }
      scope.$on('$destroy', function() {
        $clone.remove();
      });

      function isVisible(elem) {
        return !!elem.offsetParent;
      }
    }
  }
});;