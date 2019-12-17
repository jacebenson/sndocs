/*! RESOURCE: /scripts/sn/common/dynamicTranslation/js_includes_dynamicTranslation.js */
/*! RESOURCE: /scripts/sn/common/dynamicTranslation/_module.js */
angular.module('sn.common.dynamicTranslation', ['sn.common.i18n']);;
/*! RESOURCE: /scripts/sn/common/dynamicTranslation/service.dynamicTranslation.js */
angular.module('sn.common.dynamicTranslation').provider('dynamicTranslation', function() {
      function getDynamicTranslationRequestConfig() {
        return {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        };
      }
      this.$get = function($http, $q, i18n) {
          return {
            getTranslation: function(textToTranslate, parms) {
                var GET_DYNAMIC_TRANSLATION = "/api/sn_dt/v1/dynamic_translation/get_dynamic_translation";

                function getOnSuccessResponse(data) {
                  var successResponse = {
                    'translations': data.result.translations,
                    'translator': data.result.translator
                  };
                  if (data.result.detectedLanguage) {
                    successResponse['detectedLanguage'] = data.result.detectedLanguage;
                  }
                  return successResponse;
                }

                function getOnErrorResponse(data) {
                  return JSON.parse(data.result.errorMessage);
                }
                var defer = $q.defer();
                if ((!textToTranslate) || (typeof textToTranslate !== 'string')) {
                  i18n.getMessage("Text (\"text\" field) is missing or invalid", function(response) {
                    defer.reject({
                      'code': '40000',
                      'message': response
                    });
                  });
                }
                if (parms) {
                  if (parms.constructor != {}.constructor) {
                    i18n.getMessage("Additional parameters are invalid", function(response) {
                      defer.reject({
                        'code': '40006',
                        'message': response
                      });
                    });
                  } else if ((parms.additionalParameters) && (!Array.isArray(parms.additionalParameters))) {
                    i18n.getMessage("Additional parameters are invalid", function(response) {
                      defer.reject({
                        'code': '40006',
                        'message': response
                      });
                    });
                  }
                }
                var requestBody = {
                  'textToTranslate': textToTranslate,
                  'parms': parms
                };
                var config = getDynamicTranslationRequestConfig();
                $http.post(GET_DYNA