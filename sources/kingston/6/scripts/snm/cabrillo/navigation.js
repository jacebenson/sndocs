/*! RESOURCE: /scripts/snm/cabrillo/navigation.js */
(function(window, cabrillo, undefined) {
  'use strict';
  var PACKAGE = 'navigation';
  var packageUtils = cabrillo.getPackageUtils(PACKAGE);
  cabrillo.extend(cabrillo, {
    navigation: {
      goto: goto,
      goBack: goBack
    }
  });

  function goto(uri, params) {
    if (!packageUtils.isAvailable('goto')) {
      return false;
    }
    params = params || {};
    packageUtils.post('goto', {
      uri: uri,
      table: params.table,
      sysId: params.sysId,
      query: params.query,
      view: params.view
    });
    return true;
  }

  function goBack() {
    if (!packageUtils.isAvailable('goBack')) {
      return false;
    }
    packageUtils.post('goBack');
    return true;
  }
})(window, window['snmCabrillo']);;