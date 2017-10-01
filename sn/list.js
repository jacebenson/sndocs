/*! RESOURCE: /scripts/snm/cabrillo/list.js */
(function(window, cabrillo, undefined) {
    'use strict';
    var PACKAGE = 'list';
    cabrillo.extend(cabrillo, {
        list: {
            selectItem: selectItem,
            selectItems: selectItems
        }
    });

    function selectItem(title, tableName, query, selectedItem, params) {
        var _selectedItem;
        if (selectedItem) {
            _selectedItem = {
                value: selectedItem.value,
                displayValue: selectedItem.displayValue
            };
        }
        return callMethod('selectItem', {
            title: title,
            table: tableName,
            query: query,
            selectedItem: _selectedItem,
            params: params
        }).then(function(data) {
            cabrillo.log('selectItem response', arguments);
            return data.results;
        });
    }

    function selectItems(title, tableName, query, selectedItems, params) {
        return callMethod('selectItems', {
            title: title,
            table: tableName,
            query: query,
            selectedItems: selectedItems,
            params: params
        }).then(function(data) {
            cabrillo.log('selectItems response', arguments);
            return data.results;
        });
    }

    function callMethod(methodName, data) {
        return cabrillo.callMethod(cabrillo.PACKAGE + '.' + PACKAGE + '.' + methodName, data);
    }
})(window, window['snmCabrillo']);;