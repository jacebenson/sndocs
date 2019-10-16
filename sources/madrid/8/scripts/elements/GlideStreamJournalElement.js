/*! RESOURCE: /scripts/elements/GlideStreamJournalElement.js */
window.NOW.STREAM_VALUE_KEY = "_123STREAMENTRY321_";
var GlideStreamJournalElement = Class.create({
      initialize: function(name) {
        this.name = name;
        this.tablename = name.substring(0, name.indexOf('.'));
        this.fieldname = name.substring(name.indexOf('.') + 1);
        if (this.tablename != g_form.getTableName())
          return;
        CustomEvent.observe('sn.form.change_input_display', this._changeLegacyInputs.bind(this));
        this._hideLegacyInputs();
        CustomEvent.fire('sn.form.journal_field.add', this.fieldname,
          g_form.isMandatory(this.fieldname),
          g_form.isDisabled(this.fieldname),
          true,
          '',
          g_form.getLabelOf(this.fieldname)
        );
      },
      isEditableField: function(ge, control) {
        return !g_form.isDisabled(control.id);
      },
      setReadOnly: function(disabled) {
        CustomEvent.fire('sn.form.journal_field.readonly', this.fieldname, disabled);
      },
      setValue: function(value) {
        var control = g_form.getControl(this.fieldname);
        if (control)
          control.value = value;
        CustomEvent.fire('sn.form.journal_field.value', this.fieldname, value);
      },
      getValue: function() {
        var value = g_form.getControl(this.fieldname).value;
        if (value && value.startsWith(NOW.STREAM_VALUE_KEY))
          value = value.substring(NOW.STREAM_VALUE_KEY.length);
        return value;
      },
      setMandatory: function(value) {
        CustomEvent.fire('sn.form.journal_field.mandatory', this.fieldname, value);
      },
      setDisplay: function(value) {
        if (this._isHidingLegacy)
          return;
        CustomEvent.fire('sn.form.journal_field.visible', this.fieldname, value === '');
      },
      setLabelOf: function(value) {
        CustomEvent.fire('sn.form.journal_field.label', this.fieldname, value);
        return true;
      },
      showFieldMsg: function(input, message, type) {
        CustomEvent.fire('sn.stream.toggle_multiple_inputs');
        CustomEvent.fire('sn.form.journal_field.show_msg', input, message, type);
      },
      hideFieldMsg: function(input, clearAll) {
          CustomEvent.fire('sn.form.journal_f