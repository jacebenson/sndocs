var CurrencyElement = Class.create({
  initialize: function(name) {
    this.name = name;
  },
  setReadOnly: function(disabled) {
    var pd = gel(this.name + '.display');
    if (!pd)
      return;
    var ps = gel(this.name + '.currency');
    var pe = gel(this.name + '.editLink');
    g_form.setDisabledControl(pd, disabled);
    if (ps)
      g_form.setDisabledControl(ps, disabled);
    if (pe) {
      if (disabled)
        pe.style.display = 'none';
      else
        pe.style.display = 'inline';
    }
  }
});