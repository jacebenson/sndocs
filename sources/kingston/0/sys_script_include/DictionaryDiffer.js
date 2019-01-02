var DictionaryDiffer = Class.create();

DictionaryDiffer.prototype =  Object.extendsObject(StandardDiffer, {
   _getParentRecord: function(root){
        var element = root.getAttribute("element");
        var table = root.getAttribute("table");
        var gr = new GlideRecord(root.getTagName());
        gr.addQuery("name", table + "");
        if ( element == "") 
           element = "NULL";
        var qc = gr.addQuery("element",element + "");
        if (element == "NULL")
          qc.addOrCondition("element","NIL");
        gr.query();
        return gr;
    }
});