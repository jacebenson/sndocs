var DefaultTableSetter = Class.create();

DefaultTableSetter.prototype = {
  initialize: function() {
	  
  },
	
  process: function() {
    // This method should be overridden in the subclass
  },

  getTableNames: function(propertyName) {
    var propertyValue = gs.getProperty(propertyName);
    var arrTablePatterns = this.list2array(propertyValue);
    var arrTableNames = this.buildTableNames(arrTablePatterns);
    arrTableNames = this.sortTableNames(arrTableNames);
    return arrTableNames;
  },
  
  list2array: function(listTokens, delimiter) {
    delimiter = (delimiter? delimiter : ",");    
    var arrPatterns = listTokens.split(delimiter);
    for(var index = 0; index < arrPatterns.length; ++index) {
      arrPatterns[index] = trim(arrPatterns[index]);
    }
    return arrPatterns;
  },
  
  buildTableNames: function(arrTablePatterns) {
    var arrTableNames = [];
    for (var index = 0; index < arrTablePatterns.length; index++) {
      var pattern = arrTablePatterns[index];
      var extended = pattern.indexOf(".extended");
      var addExtended = (extended >= 0);
      var tableName = addExtended? pattern.slice(0, extended) : pattern;
      arrTableNames = this.addTableNames(tableName, addExtended, arrTableNames);
    } 
    return arrTableNames;
  },
  
  addTableNames: function(tableName, addExtended, arrTableNames) {
    if(gs.tableExists(tableName)) {
      if(addExtended) {
        var tableUtils = new TableUtils(tableName);
        var tablePlusExtendedTableNames = tableUtils.getAllExtensions();
          var asJavaScriptArray = j2js(tablePlusExtendedTableNames);
	  var arrayUtils = new ArrayUtil();
	  arrTableNames = arrayUtils.union(arrTableNames, asJavaScriptArray);
      } else {
	  arrTableNames.push(tableName);
      }
    }
    return arrTableNames;
  },
  
  sortTableNames: function(arrTableNames) {
    var sorter = new SortTableArrayByLabel();
    return sorter.sortTablesByLabel(arrTableNames);
  },
  
  type: "DefaultTableSetter"  
};