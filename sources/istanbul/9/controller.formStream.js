/*! RESOURCE: /scripts/app.form_presence/controller.formStream.js */
(function() {
  var journalModel = {};
  window.journalModel = journalModel;
  CustomEvent.observe('sn.form.journal_field.add', function(name, mandatory, readonly, visible, value, label) {
    journalModel[name] = {
      name: name,
      mandatory: mandatory,
      readonly: readonly,
      visible: visible,
      value: value,
      label: label,
      messages: []
    };
  });
  CustomEvent.observe('sn.form.journal_field.readonly', function(name, readonly) {
    modifyJournalAttribute(name, "readonly", readonly);
  });
  CustomEvent.observe('sn.form.journal_field.value', function(name, value) {
    modifyJournalAttribute(name, "value", value);
  });
  CustomEvent.observe('sn.form.journal_field.mandatory', function(name, mandatory) {
    modifyJournalAttribute(name, "mandatory", mandatory);
  });
  CustomEvent.observe('sn.form.journal_field.visible', function(name, visible) {
    modifyJournalAttribute(name, "visible", visible);
  });
  CustomEvent.observe('sn.form.journal_field.label', function(name, visible) {
    modifyJournalAttribute(name, "label", visible);
  });
  CustomEvent.observe('sn.form.journal_field.show_msg', function(input, message, type) {
    var messages = journalModel[input]['messages'].concat([{
      type: type,
      message: message
    }]);
    modifyJournalAttribute(input, 'messages', messages);
  });
  CustomEvent.observe('sn.form.journal_field.hide_msg', function(input, clearAll) {
    if (journalModel[input]['messages'].length == 0)
      return;
    var desiredValue = [];
    if (!clearAll)
      desiredValue = journalModel[input]['messages'].slice(1);
    modifyJournalAttribute(input, 'messages', desiredValue);
  });
  CustomEvent.observe('sn.form.hide_all_field_msg', function(type) {
    var fields = Object.keys(journalModel);
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      if (journalModel[f].messages.length == 0)
        continue;
      var messages = [];
      if (type) {
        var oldMessages = angular.copy(journalModel[f].messages);
        for (var j = 0; j < oldMessages.length; j++) {
          if (oldMessages[j].type != type)
            messages.push(oldMessages[j]);
        }
      }
      modifyJournalAttribute(f, 'messages', messages);
    }
  });
  CustomEvent.observe('sn.stream.insert', function(field, text) {
    if (typeof window.g_form !== "undefined")
      g_form.getControl(field).value = NOW.STREAM_VALUE_KEY + text;
  });

  function modifyJournalAttribute(field, prop, value) {
    if (journalModel[field][prop] === value)
      return;
    journalModel[field][prop] = value;
    CustomEvent.fire('sn.form.journal_field.changed');
  }
  angular.module('sn.common.stream').controller('formStream', function($scope, snCustomEvent) {
    $scope.formJournalFields = journalModel;
    $scope.formJournalFieldsVisible = false;
    setUp();
    snCustomEvent.observe('sn.form.journal_field.changed', function() {
      setUp();
      if (!$scope.$$phase)
        $scope.$apply();
    });

    function setUp() {
      setInputValue();
    }

    function setInputValue() {
      angular.forEach($scope.formJournalFields, function(item) {
        if (typeof window.g_form === "undefined")
          return;
        item.value = g_form.getValue(item.name);
        if (!item.readonly && item.visible && (item.value !== undefined || item.value !== null)) {
          $scope.$broadcast('sn.stream.input_value', item.value);
          return false;
        }
      });
    }
  })
})();;