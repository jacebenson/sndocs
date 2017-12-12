var DepreciationCalculations = Class.create();
DepreciationCalculations.prototype = {
    initialize: function() {
    }, 
    
    calcDDBCost: function(offset, value, salvage, dep_date) {
    	// Sanity check
   		if (gs.dateDiff(dep_date.getDisplayValue(), gs.now(), true) < 0)
   			return value;

        var end = new GlideDateTime().getDate();
        var residual = (value-salvage);
        var depreciation = (value-salvage) - residual;
        var years = 1;
        
        while (this._daysBetween(dep_date, end) > 0 && years < offset) {
            residual -= residual / 2;
            depreciation = (value-salvage) - residual;
            end.addYears(-1);
            years++;
        }
        
		residual += Math.round((salvage*100)/100);
        dep_date.addYears(years-1);
        depreciation += this._getSLDepreciation(1, residual, salvage, dep_date);
		return Math.round((value-depreciation)*100)/100;
    },
    
    calcSLCost: function(offset, value, salvage, dep_date) {
    	// Sanity check
   		if (gs.dateDiff(dep_date.getDisplayValue(), gs.now(), true) < 0)
   			return value;

		var depreciation = this._getSLDepreciation(offset, value, salvage, dep_date);
		return Math.round((value-depreciation)*100)/100;
    },
    
    _getSLDepreciation: function(offset, value, salvage, dep_date) {
		var netbook = (value-salvage);
        var start = new GlideDateTime().getDate();
        var end = new GlideDateTime().getDate();
        start.addYears(-(offset));
       	var depreciation = (netbook / this._daysBetween(start, end)) * this._daysBetween(dep_date, end);
       	if (depreciation > netbook)
           	return netbook;
       	else
           	return depreciation;
    },
    
    _daysBetween: function(start, end) {
        return parseInt((gs.dateDiff(start.getDisplayValue(), end.getDisplayValue(), true)/60/60/24),10);
    },
    
    type: 'DepreciationCalculations'
}