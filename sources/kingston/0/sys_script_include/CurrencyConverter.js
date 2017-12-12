gs.include("PrototypeServer");

var CurrencyConverter = Class.create();

CurrencyConverter.prototype = Object.extendsObject(AbstractAjaxProcessor, {
  process: function() {
    if(this.getName() == 'convertStorageValue')
       return this.convertStorageValue(this.getType(), this.getValue());
    if(this.getName() == 'getCurrencies')
       return this.getCurrencies();
  },

  convert: function(gr) {
    if (!gr.currency) {
      // user locale
      var locale = getLocale();
      var c = getCurrency(locale);
      gr.currency.setDisplayValue(c.getCurrencyCode());
    }

    var from = gr.currency.getDisplayValue();

    // system locale (reference currency)
    var sysLocale = getSystemLocale();
    var converter = new GlideConverter();
    var referenceCurrency = converter.getReferenceCurrencyCode();
    var amount = converter.parseValueAndConvert(current.amount, from, referenceCurrency);
    gr.reference_amount = amount; 
    gr.reference_currency = referenceCurrency;
  },

  convertStorageValue: function(from, value) {
    var c = new GlideConverter();
    return c.convert(value, from, 'USD');
  },

  getCurrencies: function() {
    var array = new SNC.CurrencyAccessor().getActiveCurrencies().toArray();
    return array.map(function(item) {
		return item.getCode();
	}).join(",");
  },
  
  isPublic: function() {
    return false;
  }
});

function getSystemLocale() {
  return GlideLocale.get().getSystemLocale();
}


// session locale
function getLocale() {
  return GlideLocale.get().getCurrent();
}

function getCurrency(locale) {
  return Packages.java.util.Currency.getInstance(locale);
}
