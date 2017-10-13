/*! RESOURCE: /scripts/snm/cabrillo/angular/cabrillo.factory.js */
if (typeof angular !== 'undefined') {
  'use strict';
  angular.module('snm.cabrillo', []).factory('cabrillo', function($window, $q) {
    var cabrillo = $window['snmCabrillo'];
    cabrillo.q = $q;
    return cabrillo;
  });
};