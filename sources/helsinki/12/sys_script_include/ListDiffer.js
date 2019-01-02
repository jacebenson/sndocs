var ListDiffer = Class.create();

ListDiffer.prototype = Object.extendsObject(SimplifiedDiffer, {
    _getParentRecord: function(root){
        var table = root.getElementsByTagName("name").item(0).getFirstChild().getNodeValue();
        var view = root.getElementsByTagName("view").item(0).getFirstChild().getNodeValue();
        var gr1 = new GlideRecord(root.getLastChild().getTagName());
        gr1.addQuery("name", table);
        gr1.addQuery("view", view);
        gr1.query();
        gr1.next();
        var sys_id = gr1.getValue("sys_id");
        if (sys_id == null) 
            sys_id = "";
        var gr = new GlideRecord(root.getFirstChild().getTagName());
        gr.query(this._getParentType(), sys_id);
        return gr;
    },
    
    getURL: function(root){
        var sys_id = root.getElementsByTagName(this._getParentType()).item(0).getFirstChild().getNodeValue();
        return "sys_ui_list.do?sys_id=" + sys_id;
    },
    
    _getParentType: function(){
        return "list_id";
    }
    
});
