/*! RESOURCE: /scripts/js_includes_cascading_filters.js */
/*! RESOURCE: /scripts/ng.cascading.filters/module.snCanvas.js */
(function() {
  try {
    var app = angular.module('sn.canvas');
  } catch (e) {
    var app = angular.module('sn.canvas', []);
  }
})();;
/*! RESOURCE: /scripts/ng.cascading.filters/controller.snCascadingFilter.js */
angular.module('sn.canvas').controller('snCascadingFilter', ['$scope', 'filterStore', 'canvasEventBus', function($scope, filterStore, canvasEventBus) {
  $scope.filterStore = new filterStore();
  $scope.isInCanvas = typeof window.SNC !== "undefined" && typeof window.SNC.canvas !== "undefined" && typeof window.SNC.canvas.isGridCanvasActive !== "undefined" && typeof window.SNC.canvas.interactiveFilters !== "undefined";
  $scope.initCascadingFilter = function(ref, pubconfig, persistence) {
    if (!persistence)
      persistence = new InteractiveFilterPersistedValues();
    $scope.ref = ref;
    $scope.pubconfig = typeof pubconfig === "string" ? JSON.parse(pubconfig) : pubconfig;
    $scope.filterStore.initializeFilterSetup($scope.ref, $scope.pubconfig, persistence);
  };
  $scope.publishFilter = function() {
    $scope.filterStore.publishFilter();
  };
  $scope.resetFilter = function() {
    $scope.filterStore.removeAllFilter($scope.ref);
    if ($scope.pubconfig.config && $scope.pubconfig.config[0] && $scope.pubconfig.config[0].cascading_filter) {
      var sysId = $scope.pubconfig.config[0].cascading_filter.sys_id;
      var element = angular.element("#" + sysId + "-cascading");
      element.attr("value", "All");
      element.trigger("change");
    }
  };
  if ($scope.isInCanvas) {
    canvasEventBus.subscribe("remove-interactive-filter", function(config) {
      if ($scope.ref === config.sys_id) {
        $scope.filterStore.removeAllFilter();
        canvasEventBus.unsubscribe("remove-interactive-filter");
        canvasEventBus.unsubscribe("reset-interactive-filter");
      }
    });
    canvasEventBus.subscribe("reset-interactive-filter", $scope.resetFilter);
  } else
    $scope.$on("reset-interactive-filter", $scope.resetFilter);
}]);;
/*! RESOURCE: /scripts/ng.cascading.filters/directive.snCascadingFilter.js */
angular.module('sn.canvas').directive('snCascadingFilter', ['$timeout', '$compile', function($timeout, $compile) {
  var compileHelper = function(element, link) {
    if (angular.isFunction(link)) {
      link = {
        post: link
      };
    }
    var contents = element.contents().remove();
    var compiledContents;
    return {
      pre: (link && link.pre) ? link.pre : null,
      post: function(scope, element) {
        if (!compiledContents) {
          compiledContents = $compile(contents);
        }
        compiledContents(scope, function(clone) {
          element.append(clone);
        });
        if (link && link.post) {
          link.post.apply(null, arguments);
        }
      }
    };
  };
  return {
    restrict: 'A',
    scope: {
      filter: "=filter",
      initialLoad: "=initialLoad",
      selectedParent: "=selectedParent",
      defaultValue: "=defaultValue"
    },
    template: '' +
      '<div class="form-group">' +
      '<label class="interactive-filter__cascading-filter--label" for="{{filter.sys_id}}">{{filter.name}}</label>' +
      '<input type="hidden" ng-disabled="disable" id="{{filter.sys_id}}-cascading" aria-label="{{filter.name}}" ng-change="selectFilter()" ng-model="selectedOption"></input>' +
      '</div>' +
      '<div ng-if="hasChildren(filter)" sn-cascading-filter="sn-cascading-filter-alt" filter="filter.child_filter" default-value="defaultValue" initial-load="fetchChildOptions" selected-parent="selectedOption" ></div>',
    controller: function($scope) {
      $scope.fetchChildOptions = false;
      $scope.defaultPageSize = 50;
      $scope.filterChange = function() {
        $scope.fetchChildOptions = true;
        $scope.filterStore.addFilter($scope.filter, $scope.selectedOption);
        $scope.filterStore.saveFilter();
      };
      $scope.hasChildren = function(filter) {
        return filter && filter.child_filter && Object.keys(filter.child_filter).length > 0;
      };
      $scope.$watch('selectedParent', function(newValue, oldValue) {
        if (oldValue && newValue !== oldValue) {
          $scope.selectedOption = $scope.defaultValue.id;
          $scope.element.select2('data', $scope.defaultValue).trigger("change");
        }
        $scope.disable = $scope.isRoot ? false : newValue === $scope.defaultValue.id || newValue === undefined;
      });
    },
    compile: function(element) {
      return compileHelper(element, function(scope, element, attrs, controller, transcludeFn) {
        scope.filterStore = scope.$parent.filterStore;
        scope.filterOptions = [];
        if (!scope.defaultValue)
          scope.defaultValue = {
            id: element[0].getAttribute("default_value"),
            text: element[0].getAttribute("default_label")
          };
        scope.isRoot = attrs.isRoot === "true";
        if (!scope.filter)
          return;
        $timeout(function() {
          scope.element = angular.element("#" + scope.filter.sys_id + "-cascading");
          scope.element.select2({
            containerCssClass: "form-control",
            minimumInputLength: 0,
            ajax: {
              url: "/api/now/v1/interactive_filter/cascading_filter/" + scope.filter.sys_id,
              dataType: "json",
              quietMillis: 300,
              data: function(search, page) {
                var condition = "";
                if (search !== "") {
                  condition = scope.filter.display_field + "LIKE" + search
                }
                return {
                  sysparm_query: condition,
                  parentFilterValue: scope.selectedParent,
                  sysparm_limit: scope.defaultPageSize,
                  sysparm_offset: ((page - 1) * scope.defaultPageSize),
                  sysparam_search: search !== "" ? true : false
                }
              },
              transport: function(params) {
                var callback = params.success;
                params.success = function(data, textStatus, jqXHR) {
                  callback({
                    filter: data.result.filter,
                    searching: params.data.sysparam_search
                  }, textStatus, jqXHR);
                };
                if (scope.initialLoad)
                  return $j.ajax(params);
                else
                  callback({
                    filter: undefined,
                    searching: params.data.sysparam_search
                  }, 200);
              },
              results: function(data, page) {
                var hasMoreResults = data.filter ? (data.filter.values.length < scope.defaultPageSize ? false : true) : false;
                if (page === 1 || data.searching)
                  scope.filterOptions = [];
                var filters = scope.getUniqueFilters(data.filter.values);

                function formatResult(filters) {
                  var self = this;
                  if (filters) {
                    return $j.map(filters, function(item) {
                      return {
                        id: item["key"],
                        text: item["value"],
                        data: item
                      }
                    });
                  } else {
                    return [];
                  }
                }
                if (page === 1 && !data.searching)
                  return {
                    results: [scope.defaultValue].concat(formatResult(filters)),
                    more: hasMoreResults
                  };
                else
                  return {
                    results: formatResult(filters),
                    more: hasMoreResults
                  };
              }
            },
            initSelection: function(element, callback) {
              var filterDefault = scope.filterStore.getFilterDefault(scope.filter);
              var hasFilterDefault = filterDefault && filterDefault.length > 0;
              var isFirstTimeSelection = !scope.initialSelection;
              if (hasFilterDefault && isFirstTimeSelection) {
                $timeout(function() {
                  var filter = filterDefault[0].filter ? filterDefault[0].filter.split("=")[1] : filterDefault;
                  scope.selectedOption = filter;
                  scope.fetchChildOptions = true;
                  var selectionURL = "/api/now/v1/interactive_filter/cascading_filter/" + scope.filter.sys_id + "?sysparm_query=" + scope.filter.unique_field + "=" + filter;
                  if (scope.selectedParent)
                    selectionURL += "&parentFilterValue=" + scope.selectedParent;
                  $j.ajax(selectionURL).done(function(data) {
                    var value = data.result.filter.values[0];
                    if (value) {
                      callback({
                        id: value["key"],
                        text: value["value"]
                      });
                    } else {
                      callback({
                        id: scope.defaultValue.id,
                        text: scope.defaultValue.text
                      });
                    }
                  });
                });
              } else {
                $timeout(function() {
                  callback({
                    id: scope.defaultValue.id,
                    text: scope.defaultValue.text
                  });
                }, 100);
              }
              scope.initialSelection = true;
            }
          }).on("change", function(e) {
            scope.selectedOption = e.target.value;
            $timeout(function() {
              scope.filterChange();
            });
          }).bind('select2-focus', function() {
            NOW.select2LabelFix(scope.element);
          });
        }, 100);
        scope.getUniqueFilters = function(filters) {
          var uniqueFilters = [];
          for (var i = 0; i < filters.length; i++) {
            var currentFilter = filters[i];
            if (scope.filterOptions.indexOf(currentFilter.key) < 0) {
              scope.filterOptions.push(currentFilter.key);
              uniqueFilters.push(currentFilter);
            }
          }
          return uniqueFilters;
        }
      });
    }
  }
}]);;
/*! RESOURCE: /scripts/ng.cascading.filters/service.filterApi.js */
angular.module('sn.canvas').service('canvasEventBus', function() {
  if (typeof window.SNC !== "undefined" && typeof window.SNC.canvas !== "undefined" && typeof window.SNC.canvas.isGridCanvasActive !== "undefined" && typeof window.SNC.canvas.interactiveFilters !== "undefined")
    return window.SNC.canvas.eventbus;
  else
    return;
}).service('filterStore', ['$timeout', function($timeout) {
  function filterStore() {
    var self = this;
    self.temporaryFilters = {};
    self.filters = {};
    self.selectedFilters = {};
    self.filterUniqueId = "";
    self.dashboardMessageHandler;
    self.addFilter = function(filterConfig, selectedOption) {
      removeChildFilters(filterConfig);
      var isAllOrNoneSelected = selectedOption == 'All' || selectedOption === undefined;
      if (isAllOrNoneSelected) {
        self.removeFilter(filterConfig.sys_id);
        return;
      }
      var filterItem = getFilterItem(filterConfig, selectedOption);
      var isFiltersDefined = filterItem.filters.length > 0;
      if (isFiltersDefined)
        self.temporaryFilters[filterItem.id] = filterItem.filters;
      self.selectedFilters[filterConfig.sys_id] = {
        field: filterConfig.unique_field,
        value: selectedOption
      };
    };
    self.removeFilter = function(id) {
      delete self.temporaryFilters[id];
      delete self.selectedFilters[id];
    };
    self.removeAllFilter = function(id) {
      Object.getOwnPropertyNames(self.filters).forEach(function(prop) {
        delete self.filters[prop];
      });
      self.dashboardMessageHandler.removeFilter();
      self.temporaryFilters = {};
      self.filters = {};
      self.selectedFilters = {};
      if (self.persistence.isPersistence)
        self.persistence.setDefaultValue(self.persistence.emptyFilter, self.filterUniqueId, self.isPublisher);
    };
    self.saveFilter = function() {
      self.filters = self.clone(self.temporaryFilters);
      var canPublishFilters = self.autoPublish && self.isPublisher;
      if (canPublishFilters)
        publishMessage();
    };
    self.resetFilter = function() {
      self.temporaryFilters = self.clone(self.filters);
    };
    self.publishFilter = function() {
      self.saveFilter();
      if (self.isPublisher)
        publishMessage();
    };
    self.getFilter = function() {
      return self.filters;
    };
    self.getFilterDefault = function(filter) {
      if (self.persistence.isPersistence) {
        var defaultFilter = self.persistence.getDefaultValueByKey(self.filterUniqueId);
        var doFilterPersistedInPreferences = defaultFilter && defaultFilter[filter.sys_id];
        var doFilterSavedWithoutConfig = self.selectedFilters && self.selectedFilters[filter.sys_id] && self.selectedFilters[filter.sys_id].field === filter.unique_field;
        if (doFilterPersistedInPreferences) {
          return defaultFilter[filter.sys_id];
        } else if (doFilterSavedWithoutConfig) {
          return self.selectedFilters[filter.sys_id].value;
        } else
          return;
      }
    };
    self.clone = function(source) {
      var dest = {};
      for (var key in source) {
        dest[key] = source[key];
      }
      return dest;
    };

    function checkCascadingFilter(cascadingFilter) {
      return cascadingFilter && Object.keys(cascadingFilter).length > 0;
    }

    function setInitialContextOfFilters(pubconfig) {
      var filterKeys = Object.keys(self.filters);
      if (filterKeys.length === 0)
        return
      var filterFound = {};
      var cascadingFilter = pubconfig.config[0].cascading_filter;
      if (checkCascadingFilter(cascadingFilter)) {
        while (checkCascadingFilter(cascadingFilter)) {
          if (self.filters[cascadingFilter.sys_id])
            filterFound[cascadingFilter.sys_id] = true;
          cascadingFilter = cascadingFilter.child_filter;
        }
        var filterSameAsFilterFound = Object.keys(filterFound).length !== filterKeys.length;
        if (filterSameAsFilterFound) {
          for (var i = 0; i < filterKeys.length; i++) {
            if (!filterFound[filterKeys[i]])
              delete self.filters[filterKeys[i]];
          }
          $timeout(function() {
            publishMessage();
            self.temporaryFilters = self.clone(self.filters);
          });
        }
      } else
        $timeout(function() {
          self.removeAllFilter();
        });
    }
    self.initializeFilterSetup = function(id, pubconfig, persistence) {
      self.filterUniqueId = id;
      self.persistence = persistence;
      self.autoPublish = pubconfig.autoPublish === true;
      self.isPublisher = pubconfig.isPublisher === "true";
      if (!self.persistence)
        self.persistence = new InteractiveFilterPersistedValues();
      initMessageHandler();
      if (self.persistence.isPersistence) {
        var defaultFilter = self.persistence.getDefaultValueByKey(self.filterUniqueId);
        if (defaultFilter) {
          self.filters = self.clone(defaultFilter);
          if (defaultFilter.selectedFilters)
            self.selectedFilters = self.clone(defaultFilter.selectedFilters);
          self.temporaryFilters = self.clone(self.filters);
          setInitialContextOfFilters(pubconfig);
        }
      }
    };

    function getFilterItem(filterConfig, selectedOption) {
      var filterItem = {};
      filterItem["id"] = filterConfig.sys_id;
      var dateTypes = ["due_date", "glide_date", "glide_date_time"];
      var OPERATOR = (filterConfig.display_field_type && dateTypes.indexOf(filterConfig.display_field_type) > -1) ? "ON" : "=";
      var filters = filterConfig.target_table_config.map(function(filterTarget) {
        var queryString = filterTarget.field + OPERATOR + selectedOption;
        return {
          table: filterTarget.table,
          filter: queryString,
          allow_extended_table: filterTarget.allow_extended_table
        };
      });
      filterItem["filters"] = filters;
      return filterItem;
    }

    function removeChildFilters(filterConfig, selectedOption) {
      if (hasChildren(filterConfig)) {
        delete self.temporaryFilters[filterConfig.child_filter.sys_id];
        delete self.selectedFilters[filterConfig.child_filter.sys_id];
        removeChildFilters(filterConfig.child_filter);
      }
    }

    function hasChildren(filterConfig) {
      return (filterConfig.child_filter && Object.keys(filterConfig.child_filter).length > 1);
    }

    function initMessageHandler() {
      self.dashboardMessageHandler = new DashboardMessageHandler(self.filterUniqueId);
    }

    function publishMessage() {
      var filterLength = Object.keys(self.filters).length;
      var isFilterToPublish = filterLength > 0;
      if (isFilterToPublish) {
        self.dashboardMessageHandler.publishMessage(self.filters);
      } else {
        self.dashboardMessageHandler.removeFilter();
      }
      if (self.persistence.isPersistence) {
        var filters = filterLength > 0 ? self.filters : angular.copy(self.persistence.emptyFilter);
        filters.selectedFilters = self.selectedFilters;
        self.persistence.setDefaultValue(filters, self.filterUniqueId, self.isPublisher);
      }
    }
  }
  return filterStore;
}]);;
/*! RESOURCE: /scripts/InteractiveFilterPersistedValues.js */
var InteractiveFilterPersistedValues = Class.create({
  isPersistence: true,
  initialize: function() {
    this.isPersistence = typeof window.SNC !== "undefined" && typeof window.SNC.canvas !== "undefined" && typeof window.SNC.canvas.isGridCanvasActive !== "undefined" && typeof window.SNC.canvas.interactiveFilters !== "undefined";
  },
  emptyFilter: [{
    "table": "",
    "filter": ""
  }],
  getDefaultValueByKey: function(id) {
    if (this.isPersistence)
      return SNC.canvas.interactiveFilters.getDefaultValueByKey(id);
    return;
  },
  getQueryPartByKey: function(id) {
    var queryParts = [];
    var queryPart;
    if (this.isPersistence) {
      queryParts = SNC.canvas.interactiveFilters.queryParts;
      queryPart = queryParts[id];
      if (queryPart && queryPart.length) {
        var queryPartRet = {};
        var queryPartObj = queryPart[0];
        for (var key in queryPartObj) {
          if (queryPartObj.hasOwnProperty(key)) {
            queryPartRet[key] = queryPartObj[key].values;
          }
        }
        return queryPartRet;
      }
    }
    return queryPart;
  },
  setDefaultValue: function(val, uniqueId, isPersistFilterEnabled) {
    if (this.isPersistence)
      SNC.canvas.interactiveFilters.setDefaultValue({
        id: uniqueId,
        filters: val
      }, isPersistFilterEnabled);
  },
  removeDefaultValue: function(uniqueId, isPersistFilterEnabled) {
    if (this.isPersistence)
      SNC.canvas.interactiveFilters.removeDefaultValue(uniqueId, isPersistFilterEnabled);
  }
});;;