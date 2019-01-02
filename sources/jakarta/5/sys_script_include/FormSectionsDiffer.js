var FormSectionsDiffer = Class.create();

FormSectionsDiffer.prototype = Object.extendsObject(SimplifiedDiffer, {
    _getParentType: function(){
        return "sys_ui_form";
    },
    
    _getFieldType: function(){
        return "sys_ui_section";
    },
    
    getURL: function(root){
        var sys_id = root.getElementsByTagName(this._getParentType()).item(0).getFirstChild().getNodeValue();
        return "sys_ui_section.do?sys_id=" + sys_id;
    },
    
    _getParentRecord: function(root){
        var sys_id = root.getAttribute("form_id");
        var gr = new GlideRecord("sys_ui_form_section");
        gr.addQuery(this._getParentType(), sys_id + "");
        gr.orderBy("position");
        gr.query();
        return gr;
    }

});
