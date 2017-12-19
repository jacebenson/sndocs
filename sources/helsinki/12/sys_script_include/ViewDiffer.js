var ViewDiffer = Class.create();

ViewDiffer.prototype = Object.extendsObject(StandardDiffer, {
     _getParentRecord: function(root){
        var names = root.getElementsByTagName("name");
        
        if (names.getLength() < 1) 
            var name = "";
        else 
            var name = names.item(names.getLength() - 1).getFirstChild().getNodeValue();
        var gr = new GlideRecord(root.getTagName());
        gr.query("name", name + "");
        return gr;
    }
    

    
});
