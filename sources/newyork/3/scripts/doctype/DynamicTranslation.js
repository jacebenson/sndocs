/*! RESOURCE: /scripts/doctype/DynamicTranslation.js */
var GET_DYNAMIC_TRANSLATION = "/api/sn_dt/v1/dynamic_translation/get_dynamic_translation";
var IS_DYNAMIC_TRANSLATION_ENABLED = "/api/sn_dt/v1/dynamic_translation/is_dynamic_translation_enabled";
var GET_DETECTED_LANGUAGE = '/api/sn_dt/v1/dynamic_translation/get_detected_language';
var IS_ENABLED = "/api/sn_dt/v1/dynamic_translation/is_enabled";
var DynamicTranslation = Class.create({
  getTranslation: function(msg, parms) {
    function getOnSuccessResponse(response) {
      var successResponse = {
        'translations': response.result.translations,
        'translator': response.result.translator
      };
      if (response.result.detectedLanguage) {
        successResponse['detectedLanguage'] = response.result.detectedLanguage;
      }
      return successResponse;
    }

    function getOnErrorResponse(response) {
      return JSON.parse(response.result.errorMessage);
    }
    return new Promise(function(resolve, reject) {
      if ((!msg) || (typeof msg != "string")) {
        getMessage("Text (\"text\" field) is missing or invalid", function(response) {
          reject({
            'code': '40000',
            'message': response
          });
        });
      }
      if (parms) {
        if (parms.constructor != {}.constructor) {
          getMessage("Additional parameters are invalid", function(response) {
            reject({
              'code': '40006',
              'message': response
            });
          });
        } else if ((parms.additionalParameters) && (!Array.isArray(parms.additionalParameters))) {
          getMessage("Additional parameters are invalid", function(response) {
            reject({
              'code': '40006',
              'message': response
            });
          });
        }
      }
      translationRequest = JSON.stringify({
        'textToTranslate': msg,
        'parms': parms
      });
      $j.ajaxSetup({
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      $j.post(GET_DYNAMIC_TRANSLATION, translationRequest, function(response) {
          if (!response.result.isError)
            resolve(getOnSuccessResponse(response));
          else
            reject(getOnErrorResponse(response));
        })
        .fail(function(response) {
          if (response.status == 400) {
            getMessage("Dynamic Translation plugin is not installed", function(response) {
              reject({
                'code': '40001',
                'message': response
              });
            });
          } else {
            getMessage("Unknown error occurred", function(response) {
              reject({
                'code': '40051',
                'message': response
              });
            });
          }
        });
    });
  },
  isTranslationEnabled: function(translator) {
    return new Promise(function(resolve, reject) {
      if ((translator) && (typeof translator != "string")) {
        getMessage("Translator (\"translator\" field) is invalid", function(response) {
          reject({
            'code': '40003',
            'message': response
          });
        });
      } else {
        var URL = getTranslationURL(translator);
        $j.get(URL, function(response) {
            var res = response.result.isDynamicTranslationEnabled;
            resolve(res);
          })
          .fail(function() {
            reject(false);
          });
      }
    });

    function getTranslationURL(translator) {
      var URL;
      if (translator)
        URL = IS_DYNAMIC_TRANSLATION_ENABLED + "?translator=" + translator;
      else
        URL = IS_DYNAMIC_TRANSLATION_ENABLED;
      return URL;
    }
  },
  getDetectedLanguage: function(text, parms) {
    function getOnSuccessResponse(response) {
      return {
        'detectedLanguage': response.result.detectedLanguage,
        'alternatives': response.result.alternatives,
        'translator': response.result.translator
      };
    }

    function getOnErrorResponse(response) {
      return JSON.parse(response.result.errorMessage);
    }
    return new Promise(function(resolve, reject) {
      if ((!text) || (typeof text != 'string')) {
        getMessage("Text (\"text\" field) is missing or invalid", function(response) {
          reject({
            'code': '40000',
            'message': response
          });
        });
      } else if ((parms) && (parms.constructor != {}.constructor)) {
        getMessage("Additional parameters are invalid", function(response) {
          reject({
            'code': '40006',
            'message': response
          });
        });
      } else {
        detectionRequest = JSON.stringify({
          'text': text,
          'parms': parms
        });
        $j.ajaxSetup({
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        $j.post(GET_DETECTED_LANGUAGE, detectionRequest, function(response) {
            if (!response.result.isError)
              resolve(getOnSuccessResponse(response));
            else
              reject(getOnErrorResponse(response));
          })
          .fail(function(response) {
            if (response.status === 400) {
              getMessage("Dynamic Translation plugin is not installed", function(response) {
                reject({
                  'code': '40001',
                  'message': response
                });
              });
            } else {
              getMessage("Unknown error occurred", function(response) {
                reject({
                  'code': '40051',
                  'message': response
                });
              });
            }
          });
      }
    });
  },
  isEnabled: function(translator) {
    return new Promise(function(resolve, reject) {
      if ((translator) && (typeof translator != 'string')) {
        getMessage("Translator (\"translator\" field) is invalid", function(response) {
          reject({
            'code': '40003',
            'message': response
          });
        });
      } else {
        var URL = getIsEnabledURL(translator);
        $j.get(URL, function(response) {
            var res = response.result;
            resolve(res);
          })
          .fail(function() {
            reject({
              'translation': false,
              'detection': false
            });
          });
      }
    });

    function getIsEnabledURL(translator) {
      return translator ? IS_ENABLED + "?translator=" + translator : IS_ENABLED;
    }
  }
});
DynamicTranslation.getTranslation = function(textToTranslate, parms) {
  return new DynamicTranslation().getTranslation(textToTranslate, parms);
};
DynamicTranslation.isTranslationEnabled = function(translator) {
  return new DynamicTranslation().isTranslationEnabled(translator);
};
DynamicTranslation.getDetectedLanguage = function(text, parms) {
  return new DynamicTranslation().getDetectedLanguage(text, parms);
};
DynamicTranslation.isEnabled = function(translator) {
  return new DynamicTranslation().isEnabled(translator);
};;