var SimplifiedDiffer = Class.create();

SimplifiedDiffer.prototype = Object.extendsObject(Differ, {

    diffXML: function(root1, root2, fileName){ 
        var list1 = this._getList(root1);
        var list2 = this._getList(root2);
        if (list1 == "" && list2 == "") 
            return this._noInfo();
		var listDiff = "";
		if (list1 != "" && list2 != "")
            listDiff = this._getActionCompare(root1.getChildNodes().item(0),root2.getChildNodes().item(0));  
		else 
			listDiff = this._getActionCompare(root1,root2); 
	    listDiff += this.diff(list1, list2, "fields", true);
        return listDiff;
    },
    
    getURL: function(root){
        var sys_id = root.getAttribute("section_id");
        return "sys_ui_section.do?sys_id=" + sys_id;
    },
    
    diffUpdateSet: function(root1){
        var gr = this._getParentRecord(root1);
        var list2 = "";
        while (gr.next()) 
            list2 += gr.getValue(this._getFieldType()) + "\n";
        if (list2 == "") 
            return this._noInfo();
        
        list2 = list2.substring(0, list2.length - 1);
        var listDiff = this.diff(list2 , this._getList(root1), "fields", true);
        return this.diff(root1.getTagName() + "", root1.getTagName() + "", "name", true) + listDiff;
    },
    
    _getList: function(root){
        var length = root.getChildNodes().getLength();
        var list = "";
        for (var i = 0; i < length; i++) {
            if (root.getChildNodes().item(i).getNodeType() == 3) 
                continue;
            
            var element = root.getChildNodes().item(i);
            for (var n = 0; n < element.getChildNodes().getLength(); n++) 
                if (element.getChildNodes().item(n).getTagName() == this._getFieldType() && element.getChildNodes().item(n).getFirstChild() != null) 
                    list += element.getChildNodes().item(n).getFirstChild().getNodeValue() + "\n";
        }
        return list.substring(0, list.length - 1);
    },
    
    _getFieldType: function(){
        return "element";
    },
    
    _getParentType: function(){
        return "sys_ui_section";
    },
    
    _getParentRecord: function(root){
        var sys_ids = root.getElementsByTagName("sys_id");
        var sys_id = sys_ids.item(sys_ids.getLength() - 1).getFirstChild().getNodeValue();
  
        if (root.getFirstChild().getTagName() == "sys_ui_element")
           root = root.getFirstChild()
        var gr = new GlideRecord(root.getTagName());
        if (gr.isValidField(this._getParentType()))
          gr.addQuery(this._getParentType(), sys_id + "");
        else
          gr.addQuery("sys_id",sys_id +"");
        gr.orderBy("position");
        gr.query();
        return gr;
    },
    
    _exists: function(table, sys_id){
        gs.print(table + " " + sys_id);
        var exists = new GlideRecord(table + "");
        exists.query("sys_id", sys_id + "");
        if (!exists.next()) 
            return false;
        return true;
    },

});
