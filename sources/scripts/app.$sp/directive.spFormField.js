/*! RESOURCE: /scripts/app.$sp/directive.spFormField.js */
angular.module('sn.$sp').directive('spFormField', function($location, glideFormFieldFactory, $timeout, spLabelHelper, spAriaUtil, i18n, spModelUtil, $ocLazyLoad, $sce) {
  'use strict';

  function getDeps(fieldType) {
    var deps = {
      codeMirror: [
        '/styles/sp_codemirror_includes.css',
        '/scripts/libs/sp_codemirror_includes.js'
      ],
      spectrum: [
        '/styles/spectrum.css',
        '/scripts/lib/spectrum.js'
      ]
    };
    deps.momentLocale = function() {
      var lookup = {
        pb: "pt-br",
        zh: "zh-cn",
        cs: "cs",
        nl: "nl",
        et: "et",
        fi: "fi",
        fr: "fr",
        fq: "fr-ca",
        de: "de",
        he: "he",
        hu: "hu",
        it: "it",
        ja: "ja",
        ko: "ko",
        pl: "pl",
        pt: "pt",
        ru: "ru",
        es: "es",
        th: "th",
        zt: "zh-cn",
        tr: "tr"
      };
      if (lookup[g_lang]) {
        return ['/scripts/libs/moment/locale/' + lookup[g_lang] + '.js'];
      }
      return;
    };
    return {
      css: deps.codeMirror,
      xml: deps.codeMirror,
      json: deps.codeMirror,
      script: deps.codeMirror,
      properties: deps.codeMirror,
      script_server: deps.codeMirror,
      html_template: deps.codeMirror,
      color: deps.spectrum,
      glide_date: deps.momentLocale(),
      glide_date_time: deps.momentLocale()
    }[fieldType];
  }
  return {
    restrict: 'E',
    templateUrl: 'sp_form_field.xml',
    replace: true,
    controllerAs: 'c',
    scope: {
      field: '=',
      formModel: '=',
      getGlideForm: '&glideForm',
      setDefaultValue: '&defaultValueSetter'
    },
    controller: function($element, $scope) {
      var c = this;
      var field = $scope.field;
      if (!field)
        throw "spFormField used without providing a field.";
      c.depsLoaded = false;
      c.getAttachmentGuid = function() {
        if ($scope.formModel) {
          return $scope.formModel._attachmentGUID;
        }
        return "";
      }
      var deps = getDeps(field.type);
      if (deps && deps.length) {
        $ocLazyLoad.load(deps).then(function() {
          c.depsLoaded = true;
        });
      } else {
        c.depsLoaded = true;
      }
      if (typeof field.isMandatory === "undefined")
        spModelUtil.extendField(field);
      var _setDefaultValue = $scope.setDefaultValue;
      $scope.setDefaultValue = function(fieldName, fieldInternalValue, fieldDisplayValue) {
        _setDefaultValue({
          fieldName: fieldName,
          fieldInternalValue: fieldInternalValue,
          fieldDisplayValue: fieldDisplayValue
        });
      };
      $scope.getGlideForm().$private.events.on("change", function(fieldName, oldValue, newValue) {
        if (fieldName == field.name)
          field.stagedValue = newValue;
      });
      $scope.stagedValueChange = function() {
        $scope.$emit('sp.spFormField.stagedValueChange', null);
      };
      $scope.fieldValue = function(newValue, displayValue) {
        if (angular.isDefined(newValue)) {
          $scope.getGlideForm().setValue(field.name, newValue, displayValue);
        }
        return field.value;
      };
      $scope.getEncodedRecordValues = function() {
        var result = {};
        angular.forEach($scope.formModel._fields, function(f) {
          if (f.type != 'user_image')
            result[f.name] = f.value;
          else if (f.value)
            result[f.name] = 'data:image/jpeg;base64,A==';
        });
        return result;
      };
      $scope.onImageUpload = function(thumbnail) {
        $scope.getGlideForm().setValue(field.name, thumbnail, thumbnail);
      };
      $scope.onImageDelete = function() {
        $scope.getGlideForm().setValue(field.name, '');
      };
      $scope.hasValueOrFocus = function() {
        var val = $scope.hasFocus || glideFormFieldFactory.hasValue(field);
        if (field.type == "user_image")
          val = true;
        return val;
      };
      c.showLabel = function showLabel(field) {
        return field.type != "boolean" && field.type != "boolean_confirm";
      };
    },
    link: function(scope, element, attr) {
      scope.$applyAsync(function() {
        var inputField;
        switch (scope.field.type) {
          case "field_list":
          case "glide_list":
          case "reference":
          case "field_name":
          case "table_name":
            return;
            break;
          default:
            inputField = element.find("[name='" + scope.field.name + "']");
            break;
        }
        var focusHandler = function() {
          scope.hasFocus = true;
          scope.$emit("sp.spFormField.focus", element, inputField);
          if (!scope.$root.$$phase)
            scope.$apply();
        };
        var blurHandler = function() {
          scope.fieldValue(scope.field.stagedValue);
          scope.hasFocus = false;
          scope.$emit("sp.spFormField.blur", element, inputField);
          if (!scope.$root.$$phase)
            scope.$apply();
        };
        inputField.on('focus', focusHandler).on('blur', blurHandler);
        scope.$on('$destroy', function() {
          inputField.off('focus', focusHandler).off('blur', blurHandler);
        });
        scope.$emit("sp.spFormField.rendered", element, inputField);
        $(function() {
          $('[tooltip-right]').tooltip({
            'delay': {
              show: 500
            },
            'placement': 'right',
            'trigger': 'hover'
          });
          $('[tooltip-top]').tooltip({
            'delay': {
              show: 500
            },
            'placement': 'top',
            'trigger': 'focus'
          });
        });
      });
      scope.$on('select2.ready', function(e, $el) {
        e.stopPropagation();
        var focusHandler = function(e) {
          $el.select2('open');
        };
        $el.on('focus', focusHandler);
        scope.$on('$destroy', function() {
          $el.off('focus', focusHandler);
        });
        scope.$emit("sp.spFormField.rendered", element, $el);
      });
      scope.getReferenceLabelContents = function(field) {
        return spLabelHelper.getReferenceLabelContents(field);
      }
      scope.accessible = spAriaUtil.isAccessibilityEnabled();
      scope.getCheckBoxPrice = function(field) {
        return spLabelHelper.getPriceLabelForCheckbox(field);
      }
      scope.setPriceLabelForChoice = function(field) {
        if (angular.isDefined(field) && field._cat_variable === true) {
          var labelArrayPromise = spLabelHelper.getPriceLabelForChoices(field, scope.formModel.recurring_price_frequency);
          labelArrayPromise.then(
            function(labelArray) {
              if (!labelArray || field.choices.length != labelArray.length)
                return;
              for (var i = 0; i < field.choices.length; i++) {
                field.choices[i].priceLabel = labelArray[i];
              }
            },
            function(errorMessage) {
              console.log(errorMessage);
            });
        }
      }
      scope.trustedHTML = function(html) {
        return $sce.trustAsHtml(html);
      };
      var isChoice = function(field) {
        var choiceTypes = ["choice", "multiple_choice"];
        if (choiceTypes.indexOf(field.type) > -1) {
          return true;
        }
        return false;
      };
      if (isChoice(scope.field)) {
        scope.$on("field.change." + scope.field.name, function($event, payload) {
          var field = payload.field;
          scope.setPriceLabelForChoice(field);
        });
      }
    }
  }
});;