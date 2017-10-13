/*! RESOURCE: /scripts/snm/serviceCatalog/data/catalogItemFactory.js */
angular.module('snm.serviceCatalog.data').factory('catalogItemFactory', function(
  $q,
  $log,
  $http,
  glideRecordData,
  urlTools
) {
  'use strict';
  var DEBUG_LOG = false;
  var TYPE_ITEM = 'item';
  var TYPE_PRODUCER = 'producer';

  function loadItem(categorySysId, itemSysId, type) {
    switch (type) {
      case TYPE_ITEM:
      case TYPE_PRODUCER:
        break;
      default:
        type = TYPE_ITEM;
    }
    var url = urlTools.getURL('catalog_item', {
      type: type,
      sys_id: itemSysId,
      category_sys_id: categorySysId
    });
    return $http.get(url).then(function(response) {
      var data = response.data;
      if (DEBUG_LOG) {
        $log.log('(catalogItemFactory) loadItem', data);
      }
      return createCatalogItem(response.data, type);
    });
  }

  function loadProducer(categorySysId, itemSysId) {
    return loadItem(categorySysId, itemSysId, TYPE_PRODUCER).then(function(item) {
      angular.extend(item, {
        recordParams: {
          tableName: item.table,
          sysId: item.sysparm_item_guid
        }
      });
      return item;
    });
  }

  function createCatalogItem(data, itemType, viewLayout) {
    if (!data.type) {
      data.type = itemType;
    }
    if (data.fields) {
      data.fields = glideRecordData.mapCatalogFieldTypes(data.fields);
    }
    if (data.item_sys_id) {
      data.sysId = data.item_sys_id;
      data.cartItemSysId = data.sys_id;
    } else {
      data.sysId = data.sys_id;
    }
    if (data.category_sys_id) {
      data.categorySysId = data.category_sys_id;
    }
    if (data.picture && (data.picture !== 'sc_placeholder_image.png')) {
      data.pictureUrl = '/' + data.picture;
    }
    angular.extend(data, {
      getTitle: function() {
        if (typeof data.displayValue === 'undefined') {
          return data.name;
        }
        return data.name;
      },
      getDescription: function() {
        if (data.getTitle() == data.short_description) {
          return '';
        }
        return data.short_description;
      },
      getCategoryTitle: function() {
        var total = data.breadcrumbs.length;
        return data.breadcrumbs[total - 2].displayValue;
      },
      getPrice: function() {
        return data.price_raw ? data.price_raw : parseFloat(data.price.replace(/\$|,/g, ''));
      },
      getRecurringPrice: function() {
        return data.recurring_price_raw ? data.recurring_price_raw : parseFloat(data.recurring_price.replace(/\$|,/g, ''));
      },
      hasDescription: function() {
        if (viewLayout && !viewLayout.sc_descriptions) {
          return false;
        }
        return true;
      },
      hasQuantity: function() {
        if (viewLayout && !viewLayout.sc_quantity) {
          return false;
        }
        return !data.no_quantity ? data.quantity > 1 : false;
      },
      hasPrice: function() {
        if (viewLayout && !viewLayout.sc_price) {
          return false;
        }
        return data.price !== -1;
      },
      hasRecurring: function() {
        if (viewLayout && !viewLayout.sc_recurring_price) {
          return false;
        }
        return data.recurring_price !== -1;
      }
    });
    return data;
  }

  function loadItemScripts(itemSysId) {
    return $q.all([loadItemUiPolicy(itemSysId), loadItemClientScripts(itemSysId)]).then(function(results) {
      return {
        uiPolicy: results[0],
        clientScripts: results[1]
      };
    });
  }

  function loadItemUiPolicy(itemSysId) {
    var url = urlTools.getURL('catalog_ui_policy', {
      item: itemSysId
    });
    return $http.get(url).then(function(response) {
      var data = response.data;
      if (DEBUG_LOG) {
        $log.log('(catalogItemFactory) loadItemUiPolicy', data);
      }
      return data.policy || [];
    });
  }

  function loadItemClientScripts(itemSysId) {
    var url = urlTools.getURL('catalog_client_script', {
      item: itemSysId
    });
    return $http.get(url).then(function(response) {
      var data = response.data;
      if (DEBUG_LOG) {
        $log.log('(catalogItemFactory) loadItemClientScripts', data);
      }
      return data;
    });
  }

  function executeProducerSubmit(itemSysId, itemGuid, fieldParams, fieldSequence) {
    var requestFields = angular.extend({}, fieldParams, {
      type: 'produce_record',
      sysparm_action: 'execute_producer',
      sysparm_item_guid: itemGuid,
      sysparm_id: itemSysId,
      variable_sequence: fieldSequence
    });
    var url = urlTools.getURL('catalog_item');
    return $http({
      method: 'post',
      url: url,
      data: urlTools.encodeURIParameters(requestFields),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=iso-8859-1'
      }
    }).then(function(response) {
      if (DEBUG_LOG) {
        $log.log('(catalogItemFactory) producerSubmit', data);
      }
      var data = response.data;
      return data;
    });
  }
  return {
    TYPE_ITEM: TYPE_ITEM,
    TYPE_PRODUCER: TYPE_PRODUCER,
    loadItem: loadItem,
    loadProducer: loadProducer,
    loadItemScripts: loadItemScripts,
    executeProducerSubmit: executeProducerSubmit,
    create: createCatalogItem
  };
});;