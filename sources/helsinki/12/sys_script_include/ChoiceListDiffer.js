var ChoiceListDiffer = Class.create();

ChoiceListDiffer.prototype = Object.extendsObject(ListDiffer, {
    _getFieldType: function(){
        return "label";
    },
    
    getURL: function(root){
        var url = "sys_choice_list.do?sysparm_query=";
        var table = root.getAttribute("table");
        var element = root.getElementsByTagName("element").item(0).getFirstChild().getNodeValue();
        
        return url + "name=" + table + "^element=" + element;
    },
    
    _getParentRecord: function(root){
        var element = root.getAttribute("field");
        var name = root.getAttribute("table");
        var gr = new GlideRecord(root.getTagName());
        gr.addQuery("element", element);
        gr.addQuery("name", name);
        gr.query();
        return gr;
    }
    
});
