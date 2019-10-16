/*! RESOURCE: /scripts/app.$sp/directive.spListMenu.js */
angular.module('sn.$sp').directive('spListMenu', function(i18n, spAriaUtil, $window) {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      onclickFn: '&',
      onclearFn: '&',
      ontoggleFn: '&',
      showClear: '=',
      listView: '=',
      showToggle: '=',
      collapsed: '=',
      menu: '='
    },
    templateUrl: 'sp_list_menu.xml',
    controllerAs: 'c',
    controller: function($scope) {
      var MULTI_SELECT = "MULTI_SELECT";
      var c = this;
      var selectedItems = computeSelectedItems();
      var initialSelectedItems = selectedItems;
      c.selectionIsDirty = false;
      c.isMultiSelect = $scope.menu.type === MULTI_SELECT;
      c.onItemClickFn = function(menu, item) {
        if (!c.isMultiSelect && item.selected)
          return;
        item.selected = !item.selected;
        selectedItems = (c.isMultiSelect) ? computeSelectedItems() : item;
        if (!c.isMultiSelect)
          c.submit();
      };
      c.submit = function() {
        if (selectedItems.length == 0)
          c.clear();
        else
          $scope.onclickFn({
            menu: $scope.menu,
            input: selectedItems
          });
      }
      c.clear = function() {
        $scope.onclearFn({
          menu: $scope.menu
        });
      };
      c.show = function() {
        return $scope.menu && $scope.menu.items && $scope.menu.items.length > 0;
      };
      c.i18n = {
        clear: i18n.getMessage('Clear'),
        apply: i18n.getMessage('Apply'),
        collapse: i18n.getMessage('Collapse'),
        isCollapsed: i18n.getMessage('is collapsed'),
        isExpanded: i18n.getMessage('is Expanded')
      };

      function isSmallScreenSize() {
        return $window.matchMedia('(max-width: 767px)').matches;
      }
      c.collapsed = $scope.collapsed;
      c.showToggle = $scope.showToggle;
      c.toggleIcon = function(evt, menuLabel) {
        c.collapsed = !c.collapsed;
        $scope.ontoggleFn({
          menuId: $scope.menu.id,
          collapsed: c.collapsed
        });
        if (c.collapsed)
          spAriaUtil.sendLiveMessage(menuLabel + " " + c.i18n.isCollapsed);
        else
          spAriaUtil.sendLiveMessage(menuLabel + " " + c.i18n.isExpanded);
      };
      c.showClearButton = function() {
        return $scope.showClear && !c.showApplyButton()
      }
      c.showApplyButton = function() {
        return c.isMultiSelect && c.selectionIsDirty;
      }

      function computeSelectedItems() {
        var newSelectedItems = $scope.menu.items.filter(function(item) {
          return item.selected;
        });
        if (initialSelectedItems)
          c.selectionIsDirty = dirtyCheck(newSelectedItems, initialSelectedItems);
        return newSelectedItems;
      }

      function dirtyCheck(newItems, initialItems) {
        if (newItems.length !== initialItems.length)
          return true;
        var initialValueArr = initialItems.map(function(item) {
          return item.value;
        });
        return !newItems.every(function(newItem) {
          if (initialValueArr.indexOf(newItem.value) > -1)
            return true;
        });
      }
      $scope.$on("sp.search.cancel", function() {
        selectedItems = initialSelectedItems;
        c.selectionIsDirty = false;
        $scope.menu.items.forEach(function(item) {
          var initialValueArr = initialSelectedItems.map(function(item) {
            return item.value;
          });
          item.selected = initialValueArr.indexOf(item.value) > -1;
        });
      });
    }
  }
});;