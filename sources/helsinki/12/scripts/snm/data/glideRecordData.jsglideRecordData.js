/*! RESOURCE: /scripts/snm/data/glideRecordData.js */
angular.module('snm.data').factory('glideRecordData', function($q, $http, urlTools) {
  'use strict';

  function loadRecord(tableName, sysId, viewName, queryFields) {
    var record = new GlideRecordData(tableName, 'sys_id', sysId, viewName, queryFields);
    return record.load();
  }

  function loadRecordByKey(tableName, referenceKey, referenceValue, viewName, queryFields) {
    if (typeof referenceKey === 'undefined' || referenceKey == null) {
      referenceKey = 'sys_id';
    }
    var record = new GlideRecordData(tableName, referenceKey, referenceValue, viewName, queryFields);
    return record.load();
  }

  function GlideRecordData(tableName, referenceKey, referenceValue, viewName, queryFields) {
    this.tableName = tableName;
    this.referenceKey = referenceKey;
    this.referenceValue = referenceValue;
    this.viewName = viewName;
    this.queryFields = typeof queryFields === 'string' ? _parseQueryFields(queryFields) : queryFields;
  }
  var NEW_SYS_ID = '-1';
  angular.extend(GlideRecordData.prototype, {
    getDisplayTitle: function() {
      return this.displayTitle;
    },
    isNewRecord: function() {
      return this.referenceValue === NEW_SYS_ID;
    },
    getField: function(fieldName) {
      for (var i = 0, iM = this.fields.length; i < iM; i++) {
        if (this.fields[i].name == fieldName) {
          return this.fields[i];
        }
      }
    },
    load: function() {
      var queryParams = {
        table: this.tableName,
        reference_key: this.referenceKey,
        sys_id: this.referenceValue,
        query: null,
        sysparm_extended_metadata: true
      };
      if (this.viewName != null && typeof this.viewName !== 'undefined') {
        queryParams['sysparm_view'] = this.viewName;
      }
      var url = urlTools.getURL('record_data', queryParams);
      var record = this;
      return $http.get(url).then(function(response) {
        var data = response.data;
        if (typeof data.sys_id === 'undefined' && typeof data.table === 'undefined') {
          return $q.reject({
            status: 404
          });
        }
        record.sysId = data.sys_id;
        record.displayTitle = data.$$title;
        var formFields = [];
        data.fields.forEach(function(field) {
          switch (field.name) {
            case '.end_split':
            case '.start_split':
              break;
            default:
              formFields.push(field);
              break;
          }
        });
        record.fields = formFields;
        record.variables = null;
        if (data.variables && data.variables.length > 0) {
          var variables = mapCatalogFieldTypes(data.variables);
          variables.forEach(function(variable) {
            record.fields.push(variable);
          });
          record.variables = variables;
        }
        record.itemSysId = data.itemSysId;
        record.label = data.label;
        record.encodedRecord = data.encoded_record || '';
        record.relatedLists = data.relatedLists;
        record.uiPolicy = data.policy;
        record.uiActions = data.actions;
        record.clientScripts = data.client_script;
        record.g_scratchpad = data.g_scratchpad;
        _applyQueryFields(record);
        return record;
      });
    }
  });

  function mapCatalogFieldTypes(fields) {
    var mappedFields = [];
    fields.forEach(function(field) {
      var fieldType = field.type;
      field.is_variable = true;
      if (field.ref_table && !field.refTable) {
        field.refTable = field.ref_table;
      }
      field.dbType = fieldType;
      field.catalogType = fieldType;
      if (field.fields) {
        field.fields = mapCatalogFieldTypes(field.fields);
      }
      switch (fieldType) {
        case 1:
          field.catalogType = 'yesno';
          field.type = 'choice';
          break;
        case 2:
          field.catalogType = 'multilinetext';
          field.type = 'text_area';
          break;
        case 3:
          field.catalogType = 'multiplechoice';
          field.type = 'choice';
          break;
        case 4:
          field.catalogType = 'numericscale';
          field.type = 'integer';
          break;
        case 100:
          field.catalogType = 'quantity';
          field.type = 'choice';
          break;
        case 5:
          field.catalogType = 'selectbox';
          field.type = 'choice';
          break;
        case 6:
          field.catalogType = 'singlelinetext';
          field.type = 'string';
          break;
        case 7:
          field.catalogType = 'checkbox';
          field.type = 'boolean';
          break;
        case 8:
          field.type = 'reference';
          break;
        case 9:
          field.catalogType = 'date';
          field.type = 'glide_date';
          break;
        case 10:
          field.catalogType = 'datetime';
          field.type = 'glide_date_time';
          break;
        case 11:
          field.type = 'label';
          break;
        case 12:
          field.type = 'break';
          break;
        case 0:
          field.catalogType = 'block_container';
          field.type = 'block_container';
          break;
        case 99:
          field.catalogType = 'checkbox_container';
          field.type = 'checkbox_container';
          break;
        case 14:
          field.type = 'macro';
          break;
        case 15:
          field.type = 'uipage';
          break;
        case 16:
          field.catalogType = 'widesinglelinetext';
          field.type = 'string';
          break;
        case 17:
          field.type = 'macrowithlabel';
          break;
        case 18:
          field.type = 'lookupselectbox';
          break;
        case 19:
          field.type = 'containerstart';
          break;
        case 20:
          field.type = 'containerend';
          break;
        case 21:
          field.type = 'listcollector';
          break;
        case 22:
          field.type = 'lookupmultiplechoice';
          break;
        case 23:
          field.type = 'html';
          break;
        case 24:
          field.catalogType = 'containersplit';
          field.type = 'split';
          return;
          break;
        case 25:
          field.type = 'masked';
          break;
        default:
          $log.warn('Unknown field type:', fieldType);
      }
      mappedFields.push(field);
    });
    return mappedFields;
  }

  function _parseQueryFields(fields) {
    var splitFields = fields.split('^');
    var fields = {};
    splitFields.forEach(function(fieldPair) {
      var field = fieldPair.split('=', 2);
      fields[field[0]] = field[1];
    });
    return fields;
  }

  function _applyQueryFields(record) {
    if (record.isNewRecord() && record.queryFields) {
      var queryFields = record.queryFields;
      record.fields.forEach(function(field) {
        field.dirtyQueryField = false;
        var fieldValue = queryFields[field.name];
        if (typeof fieldValue !== 'undefined') {
          if (field.value !== fieldValue) {
            field.dirtyQueryField = true;
          }
          field.value = fieldValue;
        }
      });
    }
  }
  return {
    NEW_SYS_ID: NEW_SYS_ID,
    loadRecord: loadRecord,
    loadRecordByKey: loadRecordByKey,
    mapCatalogFieldTypes: mapCatalogFieldTypes
  };
});;