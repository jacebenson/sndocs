/*! RESOURCE: /scripts/app.$sp/factory.spLabelHelper.js */
angular.module('sn.$sp').factory('spLabelHelper', function($q, $http, i18n, spUtil, glideFormFieldFactory) {
  'use strict'

  function getReferenceLabelContents(field) {
    if (!field)
      return;
    var label = "";
    if (glideFormFieldFactory.isMandatory(field) && (field.mandatory_filled && !field.mandatory_filled())) {
      label = i18n.getMessage("Required") + " - ";
    }
    label = label + field.label;
    if (field.displayValue) {
      label = label + ", " + field.displayValue
    }
    return label;
  }

  function getPriceLabelForCheckbox(field) {
    if (!field || !field._pricing)
      return;
    if (!(field._pricing.price_if_checked || field._pricing.rec_price_if_checked))
      return '';
    var label = " [ ";
    if (field.value == "true") {
      if (field._pricing.price_if_checked && field._pricing.rec_price_if_checked)
        label += i18n.getMessage("has added {0} | has added {1}").withValues([field._pricing.price_if_checked_display, field._pricing.rec_price_if_checked_display]);
      else if (field._pricing.price_if_checked || field._pricing.rec_price_if_checked)
        label += i18n.getMessage("has added {0}").withValues([field._pricing.price_if_checked_display || field._pricing.rec_price_if_checked_display]);
    } else {
      if (field._pricing.price_if_checked && field._pricing.rec_price_if_checked)
        label += i18n.getMessage("will add {0} | will add {1}").withValues([field._pricing.price_if_checked_display, field._pricing.rec_price_if_checked_display]);
      else if (field._pricing.price_if_checked || field._pricing.rec_price_if_checked)
        label += i18n.getMessage("will add {0}").withValues([field._pricing.price_if_checked_display || field._pricing.rec_price_if_checked_display]);
    }
    label += " ]";
    return label;
  }

  function preparePriceMap(field) {
    var priceMap = {};
    var selectedPrice = field.price || 0;
    var selectedRecurringPrice = field.recurring_price || 0;
    for (var i = 0; i < field.choices.length; i++) {
      var choicePrice = 0;
      var choiceRecurringPrice = 0;
      if (field.choices[i].price) {
        choicePrice = field.choices[i].price;
      }
      if (field.choices[i].recurring_price) {
        choiceRecurringPrice = field.choices[i].recurring_price;
      }
      var adjustedPrice = selectedPrice - choicePrice;
      var adjustedRecurringPrice = selectedRecurringPrice - choiceRecurringPrice;
      var adjustedPriceAbs = Math.abs(selectedPrice - choicePrice);
      var adjustedRecurringPriceAbs = Math.abs(selectedRecurringPrice - choiceRecurringPrice);
      var key1 = adjustedPriceAbs + '';
      var key2 = adjustedRecurringPriceAbs + '';
      if (!priceMap.hasOwnProperty(key1)) {
        priceMap[key1] = adjustedPriceAbs;
      }
      if (!priceMap.hasOwnProperty(key2)) {
        priceMap[key2] = adjustedRecurringPriceAbs;
      }
    }
    return priceMap;
  }

  function getPriceLabelArray(field, recurringPriceFreq, formattedPriceMap) {
    var priceLableArray = [];
    var selectedPrice = field.price || 0;
    var selectedRecurringPrice = field.recurring_price || 0;
    for (var i = 0; i < field.choices.length; i++) {
      var choicePrice = 0;
      var choiceRecurringPrice = 0;
      if (field.choices[i].price) {
        choicePrice = field.choices[i].price;
      }
      if (field.choices[i].recurring_price) {
        choiceRecurringPrice = field.choices[i].recurring_price;
      }
      var label = " [ ";
      var message;
      var formattedValues;
      var adjustedPrice = selectedPrice - choicePrice;
      var adjustedRecurringPrice = selectedRecurringPrice - choiceRecurringPrice;
      var adjustedPriceAbs = Math.abs(selectedPrice - choicePrice);
      var adjustedRecurringPriceAbs = Math.abs(selectedRecurringPrice - choiceRecurringPrice);
      var key1 = adjustedPriceAbs + '';
      var key2 = adjustedRecurringPriceAbs + '';
      if (adjustedPrice != 0 && adjustedRecurringPrice != 0 && recurringPriceFreq) {
        message = (adjustedPrice > 0 ? "subtract" : "add") + " {0} | " + (adjustedRecurringPrice > 0 ? "subtract" : "add") + " {1}";
        formattedValues = [(formattedPriceMap[key1] ? formattedPriceMap[key1] : ''), (formattedPriceMap[key2] ? formattedPriceMap[key2] : '')];
        label += i18n.getMessage(message).withValues(formattedValues) + " " + recurringPriceFreq;
      } else if (adjustedPrice != 0) {
        message = (adjustedPrice > 0 ? "subtract" : "add") + " {0}";
        formattedValues = [(formattedPriceMap[key1] ? formattedPriceMap[key1] : '')];
        label += i18n.getMessage(message).withValues(formattedValues);
      } else if (adjustedRecurringPrice != 0 && recurringPriceFreq) {
        message = (adjustedRecurringPrice > 0 ? "subtract" : "add") + " {0}";
        formattedValues = [(formattedPriceMap[key2] ? formattedPriceMap[key2] : '')];
        label += i18n.getMessage(message).withValues(formattedValues) + " " + recurringPriceFreq;
      } else {
        priceLableArray.push("");
        continue;
      }
      label += " ]";
      priceLableArray.push(label);
    }
    return priceLableArray;
  }

  function getPriceLabelForChoices(field, recurringPriceFreq) {
    return $http.post(spUtil.getURL('format_prices'), preparePriceMap(field))
      .then(function(response) {
        return response.data
      })
      .then(function(data) {
        return getPriceLabelArray(field, recurringPriceFreq, data)
      });
  }
  return {
    getReferenceLabelContents: getReferenceLabelContents,
    getPriceLabelForCheckbox: getPriceLabelForCheckbox,
    getPriceLabelForChoices: getPriceLabelForChoices
  }
});;