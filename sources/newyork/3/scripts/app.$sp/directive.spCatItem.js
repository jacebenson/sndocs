/*! RESOURCE: /scripts/app.$sp/directive.spCatItem.js */
angular.module("sn.$sp").directive('spCatItem', function($http, $rootScope, i18n, spModal, spUtil) {
  return {
    restrict: 'E',
    link: function(scope, element, attrs) {
      scope.item = scope.$eval(attrs.item);
    },
    controller: function($scope) {
      var c = this;
      c.priceHasChanged = function(p, parms) {
        if (parms.force_update)
          return true;
        var changed = false;
        var t = parms.recurring_price + p.recurring_price;
        if (t != p.recurring_total) {
          changed = true;
          p.recurring_total = t;
        }
        t = parms.price + p.price;
        if (t != p.price_total) {
          changed = true;
          p.price_total = parms.price + p.price;
        }
        return changed;
      };
      c.getItemId = function() {
        return $scope.item.sys_id;
      };
      c.formatPrice = function(data) {
        var response = data.answer;
        var t = $scope.item;
        t.price = t.recurring_price = "";
        t.price = response.price;
        t.price_subtotal = response.price_subtotal;
        t.recurring_price = response.recurring_price;
        t.recurring_price_subtotal = response.recurring_price_subtotal;
        t.price_display = response.price_display;
        t.recurring_price_display = response.recurring_price_display;
        t.price_subtotal_display = response.price_subtotal_display;
        t.recurring_price_subtotal_display = response.recurring_price_subtotal_display;
      };
      var g_form;
      $scope.$on('spModel.gForm.initialized', function(e, gFormInstance) {
        if (gFormInstance.getSysId() != c.getItemId())
          return;
        g_form = gFormInstance;
        var scMandatoryAttachMessage = i18n.getMessage("Attachment(s) are not added");
        g_form.$private.events.on('onSubmit', function() {
          if ($scope.item.mandatory_attachment) {
            if (!$scope.item.attachment_submitted && !($scope.attachments && $scope.attachments.length > 0)) {
              var _response = spUtil.addErrorMessage(scMandatoryAttachMessage);
              var handledMessage = _response !== false;
              if (!handledMessage)
                spModal.alert(scMandatoryAttachMessage);
              $scope.submitting = false;
              return false;
            }
          }
          return true;
        });
      });

      function getCalculatedPrices() {
        if (!g_form)
          return;
        var o = {};
        o.sys_id = g_form.$private.options('itemSysId');
        o.sysparm_id = o.sys_id;
        o.variable_sequence1 = g_form.$private.options('getFieldSequence')();
        var getFieldParams = g_form.$private.options('getFieldParams');
        if (getFieldParams) {
          angular.extend(o, getFieldParams());
        }
        var transform = function(data) {
          for (var key in data) {
            if (key.indexOf("IO") == 0 && Array.isArray(data[key]))
              data[key] = JSON.stringify(data[key]);
          }
          return $.param(data);
        }
        var config = {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
          },
          transformRequest: transform
        };
        $http.post(spUtil.getURL('update_price'), o, config).success(c.formatPrice);
      }
      $scope.$on('variable.price.change', function(evt, parms) {
        var p = $scope.item._pricing;
        if (c.priceHasChanged(p, parms)) {
          getCalculatedPrices();
        }
      });
    }
  }
});;