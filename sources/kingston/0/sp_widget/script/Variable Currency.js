(function() {
	var csym = {};
	csym.usd = {symbol: "$", location: "prefix"};
	csym.cad = {symbol: "$", location: "prefix"};
	csym.mxn = {symbol: "$", location: "prefix"};
	csym.eur = {symbol: "€", location: "prefix"};
	csym.gbp = {symbol: "£", location: "prefix"};
	
	var locale = GlideLocale.get();
	var cc = data.symbol = locale.getCurrencyCode();
	cc = cc.toLowerCase();
	data.cc = cc;
	locale.getCurrencyCode();
	if (csym[cc]) 
		data.symbol = csym[cc].symbol;
})();