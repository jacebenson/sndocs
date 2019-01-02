/*! RESOURCE: /scripts/app.$sp/directive.spRadioOption.js */
angular.module('sn.$sp').directive('spRadioOption', function(spUtil, $http) {
  var REF_QUAL_ELEMENTS = "ref_qual_elements";

  function isRefQualElement(field, fieldName) {
    var refQualElements = [];
    if (field.attributes && field.attributes.indexOf(REF_QUAL_ELEMENTS) > -1) {
      var attributes = spUtil.parseAttributes(field.attributes);
      refQualElements = attributes[REF_QUAL_ELEMENTS].split(',');
    }
    return field.reference_qual.indexOf(fieldName) != -1 || refQualElements.indexOf(fieldName) != -1;
  }
  return {
    template: '<ng-include src="getTemplateUrl()" />',
    restrict: 'E',
    scope: {
      'field': '=',
      'getGlideForm': '&glideForm'
    },
    link: function(scope, element, attrs) {
      var g_form = scope.getGlideForm();
      var field = scope.field;
      scope.getTemplateUrl = function() {
        return field.choice_direction === 'across' ? 'sp_element_radio_across.xml' : 'sp_element_radio_down.xml';
      }
      scope.fieldValue = function(newValue, displayValue) {
        if (angular.isDefined(newValue)) {
          g_form.setValue(field.name, newValue, displayValue);
        }
        return field.value;
      };
      g_form.$private.events.on('change', function(fieldName, oldValue, newValue) {
        if (fieldName == field.name)
          return;
        else if (typeof field.variable_name !== 'undefined' && field.reference_qual && isRefQualElement(field, fieldName))
          refreshReferenceChoices();
      });

      function selectValueOrNone() {
        var hasSelectedValue = false;
        angular.forEach(field.choices, function(c) {
          if (field.value == c.value)
            hasSelectedValue = true;
        });
        if (!hasSelectedValue && field.choices.length > 0)
          g_form.setValue(field.name, field.choices[0].value, field.choices[0].label);
      }

      function refreshReferenceChoices() {
        var params = {};
        params['qualifier'] = field.reference_qual;
        params['table'] = field.lookup_table;
        params['sysparm_include_variables'] = true;
        params['variable_ids'] = field.sys_id;
        var getFieldSequence = g_form.$private.options('getFieldSequence');
        if (getFieldSequence) {
          params['variable_sequence1'] = getFieldSequence();
        }
        var itemSysId = g_form.$private.options('itemSysId');
        params['sysparm_id'] = itemSysId;
        var getFieldParams = g_form.$private.options('getFieldParams');
        if (getFieldParams) {
          angular.extend(params, getFieldParams());
        }
        params.sysparm_type = 'sp_ref_list_data';
        var url = spUtil.getURL({
          sysparm_type: 'sp_ref_list_data'
        });
        console.log("Posting from directive");
        return $http.post(url, params).then(function(response) {
          if (!response.data)
            return;
          field.choices = [];
          angular.forEach(response.data.items, function(item) {
            item.label = item.$$displayValue;
            item.value = item.sys_id;
            field.choices.push(item);
          });
          selectValueOrNone();
        });
      }
    }
  };
});;