gs.include("PrototypeServer");
var SortTableArrayByLabel = Class.create();

SortTableArrayByLabel.prototype = { 
  initialize : function() {
  },    
  
  sortTablesByLabel: function(tables) {
    var ts = [];
    for (var i = 0; i < tables.length; i++) {
        var t = [];
        t.push(tables[i]);
        t.push(GlideTableDescriptor.get(tables[i]).getLabel());
        ts.push(t);
    }
    ts.sort(function(a,b) {return (a[1] < b[1]) ? -1 :((a[1] > b[1]) ? 1 : 0);});
    var tss = [];
    for (var j = 0; j < ts.length; j++) {
        tss.push(ts[j][0]);
    }
    return tss;
    
  },

  type: "SetTables"
};



