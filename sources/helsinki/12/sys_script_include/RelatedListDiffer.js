var RelatedListDiffer = Class.create();

RelatedListDiffer.prototype = Object.extendsObject(ListDiffer, {
    _getFieldType: function(){
        return "related_list";
    },
    _getParentRecord: function(root){
        var table = root.getAttribute("table");
        var view = root.getAttribute("view"); 
        if (view == "") 
          view = "Default view";
        var gr1 = new GlideRecord("sys_ui_related_list");
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
        var sysIds = root.getElementsByTagName("sys_id");
        var sys_id = sysIds.item(sysIds.getLength() - 1).getFirstChild().getNodeValue();
        var url = "sys_ui_related_list.do?sys_id=" + sys_id;
        return url;
    }
    
});
