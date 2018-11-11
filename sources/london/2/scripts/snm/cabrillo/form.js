/*! RESOURCE: /scripts/snm/cabrillo/form.js */
(function(window, cabrillo, undefined) {
  'use strict';
  var PACKAGE = 'form';
  var packageUtils = cabrillo.getPackageUtils(PACKAGE);
  var _isPreviewRecordAvailable = packageUtils.isAvailable('previewRecord');
  cabrillo.extend(cabrillo, {
    form: {
      didChangeRecord: didChangeRecord,
      previewRecord: previewRecord,
      isPreviewRecordAvailable: isPreviewRecordAvailable
    }
  });

  function didChangeRecord(isNewRecord, tableName, sysId) {
    if (isNewRecord) {
      didCreateRecord(tableName, sysId);
    } else {
      didUpdateRecord(tableName, sysId);
    }
  }

  function didCreateRecord(tableName, sysId) {
    callMethod('didCreateRecord', {
      table: tableName,
      sysId: sysId
    });
  }

  function didUpdateRecord(tableName, sysId) {
    callMethod('didUpdateRecord', {
      table: tableName,
      sysId: sysId
    });
  }

  function previewRecord(tableName, referenceKey, referenceValue, view, title) {
    callMethod('previewRecord', {
      table: tableName,
      referenceKey: referenceKey,
      referenceValue: referenceValue,
      view: view,
      title: title
    });
  }

  function callMethod(methodName, data) {
    return cabrillo.callMethod(cabrillo.PACKAGE + '.' + PACKAGE + '.' + methodName, data);
  }

  function isPreviewRecordAvailable() {
    return _isPreviewRecordAvailable;
  }
})(window, window['snmCabrillo']);;