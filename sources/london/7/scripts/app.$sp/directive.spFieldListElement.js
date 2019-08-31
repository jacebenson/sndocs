/*! RESOURCE: /scripts/app.$sp/directive.spFieldListElement.js */
angular.module('sn.$sp').directive('snFieldListElement', function($http, $sanitize, i18n, $filter, nowServer) {
  "use strict";
  return {
    restrict: 'E',
    replace: true,
    scope: {
      field: '=',
      snChange: '&',
      getGlideForm: '&glideForm',
      snDisabled: '='
    },
    template: '<input type="text" ng-disabled="snDisabled" style="min-width: 150px;" name="{{::field.name}}" ng-model="field.value" id="sp_formfield_{{::field.name}}"/>',
    controller: function($scope) {
      $scope.table = $scope.field.ed.dependent_value;
      $scope.$watch('field.dependentValue', function(newVal, oldVal) {
        if (!angular.isDefined(newVal))
          return;
        if (newVal != oldVal)
          console.log("Should have changed tables to " + newVal);
        $scope.table = $scope.field.dependentValue;
        var src = nowServer.getURL('table_fields', 'exclude_formatters=true&fd_table=' + newVal);
        $http.post(src).success(function(response) {
          $scope.field.choices = response;
        });
      });
    },
    link: function(scope, element) {
      var orderBy = $filter('orderBy');
      var isExecuting = false;
      var fieldCache = {};
      var data = [];
      var term = "";
      var initTimeout = null;
      var value = scope.field.value;
      var oldValue = scope.field.value;
      var $select;
      var previousScrollTop;
      var remove = i18n.getMessage("Remove");

      function getRemoveItem(label) {
        return jQuery("<span class='sr-only' tabindex='0' />").text(remove + " " + label);
      };
      var select2Helpers = {
        query: function(q) {
          term = q.term;
          if (data.length == 0) {
            getFieldsForTable(scope.table, function(tableName, fields) {
              data = fields;
              filterData(q);
            });
          } else
            filterData(q);
        },
        initSelection: function(elem, callback) {
          if (scope.field.displayValue) {
            var items = [];
            var values = scope.field.value.split(',');
            var displayValues = scope.field.displayValue.split(',');
            for (var i = 0; i < values.length; i++)
              items.push({
                id: values[i],
                text: displayValues[i]
              });
            callback(items);
          } else
            callback([]);
        },
        formatResult: function(item) {
          var row = item.text;
          if (item.reference && !item.children)
            row += "<span style='float: right' class='expand fa fa-chevron-right' data-id='" + item.id + "' data-reference='" + item.reference + "'></span>";
          return row;
        },
        formatSelectionCssClass: function(item, el) {
          var parentEl = el.parent();
          parentEl.find("a").append(getRemoveItem(item.text));
        }
      };
      var config = {
        containerCssClass: 'select2-reference ng-form-element',
        placeholder: '    ',
        formatSearching: '',
        allowClear: true,
        query: select2Helpers.query,
        initSelection: select2Helpers.initSelection,
        formatResult: select2Helpers.formatResult,
        formatSelectionCssClass: select2Helpers.formatSelectionCssClass,
        closeOnSelect: false,
        multiple: true
      };

      function filterData(q) {
        var r = {
          results: []
        };
        for (var c in data) {
          var row = data[c];
          if (q.term.length == 0 || row.text.toUpperCase().indexOf(q.term.toUpperCase()) >= 0 || row.id.toUpperCase().indexOf(q.term.toUpperCase()) >= 0)
            r.results.push(row);
        }
        q.callback(r);
      }

      function init() {
        scope.$evalAsync(function() {
          i18n.getMessage('Searching...', function(searchingMsg) {
            config.formatSearching = function() {
              return searchingMsg;
            };
          });
          i18n.getMessage('No matches found', function(msg) {
            config.formatNoMatches = function() {
              return msg;
            };
          });
          i18n.getMessage('Loading more results...', function(msg) {
            config.formatLoadMore = function(pageNumber) {
              return msg;
            };
          });
          element.css("opacity", 1);
          element.select2("destroy");
          $select = element.select2(config);
          $select.bind("select2-open", onDropdownShow);
          $select.bind("select2-close", onDropdownClose);
          $select.bind("select2-selecting", onSelecting);
          $select.bind("select2-removing", onRemoving);
          $select.bind("change", onChange);
          $select.bind("select2-loaded", onResultsLoaded);
          var sortable = new Sortable($select.select2("container").find("ul.select2-choices").get(0), {
            onStart: function() {
              $select.select2("onSortStart");
            },
            onEnd: function() {
              $select.select2("onSortEnd");
            }
          });
        });
      }

      function expandHandler(e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.type == 'click') {
          var $el = angular.element(this);
          previousScrollTop = $el.parents('ul.select2-results').scrollTop();
          var d = $el.data();
          var targetRow = getDataRowByFieldName(d.id);
          getFieldsForTable(d.reference, function(tableName, refFields) {
            for (var i = 0; i < refFields.length; i++)
              refFields[i].id = d.id + '.' + refFields[i].id;
            targetRow.children = refFields;
            $select.select2("search", term);
          });
        }
      };

      function getDataRowByFieldName(fieldName) {
        var fieldNames = fieldName.split('.');
        var row = getDataRowByFieldNamePart(fieldNames[0], data);
        if (fieldNames.length > 1)
          for (var i = 1; i < fieldNames.length; i++)
            row = getDataRowByFieldNamePart(fieldNames[i], row.children);
        return row;
      }

      function getDataRowByFieldNamePart(fieldNamePart, fieldArr) {
        for (var i = 0; i < fieldArr.length; i++)
          if (fieldArr[i].fieldName == fieldNamePart) return fieldArr[i];
      }

      function getFieldsForTable(tableName, callback) {
        if (tableName in fieldCache) {
          var fields = getOrderedFieldsFromCache(tableName);
          callback.call(this, tableName, fields);
          return;
        }
        $http.get('/api/now/ui/meta/' + tableName).then(function(r) {
          var fields = [];
          if (r.data && r.data.result && r.data.result.columns) {
            fieldCache[tableName] = r.data.result.columns;
            fields = getOrderedFieldsFromCache(tableName);
          }
          callback.call(this, tableName, fields);
        });

        function getOrderedFieldsFromCache(tableName) {
          var col, cols = [],
            fields = fieldCache[tableName];
          for (var c in fields) {
            col = fields[c];
            cols.push({
              fieldName: col.name,
              id: col.name,
              text: col.label,
              reference: col.reference
            });
          }
          return orderBy(cols, 'text', false);
        }
      }

      function onResultsLoaded() {
        if (!previousScrollTop)
          return;
        scope.$evalAsync(function() {
          angular.element('ul.select2-results').scrollTop(previousScrollTop);
          previousScrollTop = null;
        });
      }

      function onDropdownShow() {
        angular.element('ul.select2-results').on('mousedown click mouseup', 'span.expand', expandHandler);
      }

      function onDropdownClose() {
        angular.element('ul.select2-results').off('mousedown click mouseup', 'span.expand', expandHandler);
      }

      function onChange(e) {
        setValue(e.val, e);
      }

      function onSelecting(e) {
        var selectedItem = e.choice;
        if (selectedItem['id'] != '') {
          var values = scope.field.value == '' ? [] : scope.field.value.split(',');
          values.push(selectedItem['id']);
          setValue(values, e);
        }
      }

      function onRemoving(e) {
        var removed = e.choice;
        var values = scope.field.value.split(',');
        for (var i = values.length - 1; i >= 0; i--) {
          if (removed['id'] == values[i]) {
            values.splice(i, 1);
            break;
          }
        }
        setValue(values, e);
      }

      function setValue(values, e) {
        isExecuting = true;
        oldValue = scope.field.value;
        scope.field.value = scope.field.displayValue = values.join(',');
        e.preventDefault();
        $select.select2('val', scope.field.value.split(','));
        scope.$apply(function() {
          if (scope.snChange)
            scope.snChange({
              field: scope.field,
              newValue: scope.field.value,
              displayValue: scope.field.displayValue,
              oldValue: oldValue
            });
          isExecuting = false;
        });
      }
      scope.$watch("field.value", function(newValue) {
        if (isExecuting) return;
        if (angular.isDefined(newValue) && $select) {
          $select.select2('val', newValue.split(',')).select2('close');
        }
      });
      init();
    }
  };
});;