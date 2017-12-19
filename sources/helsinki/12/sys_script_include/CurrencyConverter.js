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
    var refCurrency = getCurrency(sysLocale);
    var to = refCurrency.getCurrencyCode();
    var c = new GlideConverter();
    var amount = c.convert(current.amount, from);
    gr.reference_amount = amount; 
    gr.reference_currency = c.getReferenceCurrencyCode();
  },

  convertStorageValue: function(from, value) {
    var c = new GlideConverter();
    return c.convert(value, from, 'USD');
  },

  getCurrencies: function() {
    var list = new Array();;
    var refCode = GlideLocale.get().getCurrencyCode();
	list.push(refCode + '');
    var currencyTypes = new GlideRecord('fx_currency');
    currencyTypes.addActiveQuery();
    currencyTypes.query();
    while (currencyTypes.next())
           if (currencyTypes.code != refCode) list.push(currencyTypes.code + '');

    return list.join(",");
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
