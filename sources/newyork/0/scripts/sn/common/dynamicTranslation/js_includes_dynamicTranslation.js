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
        $http.post(GET_DYNAMIC_TRANSLATION, requestBody, config).success(function(data) {
          if (!data.result.isError)
            defer.resolve(getOnSuccessResponse(data));
          else
            defer.reject(getOnErrorResponse(data));
        }).error(function(error, status) {
          if (status === 400) {
            i18n.getMessage("Dynamic Translation plugin is not installed", function(response) {
              defer.reject({
                'code': '40001',
                'message': response
              });
            });
          } else {
            i18n.getMessage("Unknown error occurred", function(response) {
              defer.reject({
                'code': '40051',
                'message': response
              });
            });
          }
        });
        return defer.promise;
      },
      isTranslationEnabled: function(translator) {
        function getDynamicTranslationURL(translator) {
          var IS_DYNAMIC_TRANSLATION_ENABLED = "/api/sn_dt/v1/dynamic_translation/is_dynamic_translation_enabled";
          return translator ? IS_DYNAMIC_TRANSLATION_ENABLED + "?translator=" + translator : IS_DYNAMIC_TRANSLATION_ENABLED;
        }
        var defer = $q.defer();
        if ((translator) && (typeof translator !== 'string')) {
          i18n.getMessage("Translator (\"translator\" field) is invalid", function(response) {
            defer.reject({
              'code': '40003',
              'message': response
            });
          });
        } else {
          var URL = getDynamicTranslationURL(translator);
          var config = getDynamicTranslationRequestConfig();
          $http.get(URL, config).success(function(data) {
              defer.resolve(data.result.isDynamicTranslationEnabled);
            })
            .error(function() {
              defer.reject(false);
            });
        }
        return defer.promise;
      },
      getDetectedLanguage: function(text, parms) {
        var GET_DETECTED_LANGUAGE = '/api/sn_dt/v1/dynamic_translation/get_detected_language';

        function getOnSuccessResponse(data) {
          return {
            'detectedLanguage': data.result.detectedLanguage,
            'alternatives': data.result.alternatives,
            'translator': data.result.translator
          };
        }

        function getOnErrorResponse(data) {
          return JSON.parse(data.result.errorMessage);
        }
        var defer = $q.defer();
        if ((!text) || (typeof text != 'string')) {
          i18n.getMessage("Text (\"text\" field) is missing or invalid", function(response) {
            defer.reject({
              'code': '40000',
              'message': response
            });
          });
        } else if ((parms) && (parms.constructor != {}.constructor)) {
          i18n.getMessage("Additional parameters are invalid", function(response) {
            defer.reject({
              'code': '40006',
              'message': response
            });
          });
        } else {
          var requestBody = {
            'text': text,
            'parms': parms
          };
          var config = getDynamicTranslationRequestConfig();
          $http.post(GET_DETECTED_LANGUAGE, requestBody, config).success(function(data) {
            if (!data.result.isError)
              defer.resolve(getOnSuccessResponse(data));
            else
              defer.reject(getOnErrorResponse(data));
          }).error(function(response, status) {
            if (status === 400) {
              i18n.getMessage("Dynamic Translation plugin is not installed", function(response) {
                defer.reject({
                  'code': '40001',
                  'message': response
                });
              });
            } else {
              i18n.getMessage("Unknown error occurred", function(response) {
                defer.reject({
                  'code': '40051',
                  'message': response
                });
              });
            }
          });
        }
        return defer.promise;
      },
      isEnabled: function(translator) {
        function getIsEnabledURL(translator) {
          var IS_ENABLED = "/api/sn_dt/v1/dynamic_translation/is_enabled";
          return translator ? IS_ENABLED + "?translator=" + translator : IS_ENABLED;
        }
        var defer = $q.defer();
        if ((translator) && (typeof translator !== 'string')) {
          i18n.getMessage("Translator (\"translator\" field) is invalid", function(response) {
            defer.reject({
              'code': '40003',
              'message': response
            });
          });
        } else {
          var URL = getIsEnabledURL(translator);
          var config = getDynamicTranslationRequestConfig();
          $http.get(URL, config).success(function(data) {
              defer.resolve(data.result);
            })
            .error(function() {
              defer.reject({
                'translation': false,
                'detection': false
              });
            });
        }
        return defer.promise;
      }
    };
  };
});;;