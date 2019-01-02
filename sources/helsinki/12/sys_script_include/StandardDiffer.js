var StandardDiffer = Class.create();

StandardDiffer.prototype = Object.extendsObject(Differ, {

    diffXML: function(root1, root2){
        var length1 = root1.getChildNodes().getLength();
        var length2 = root2.getChildNodes().getLength();
        var action =  this._getActionCompare(root1, root2);
        if (root1.getTagName() != "record_update") {
            var diff = this._diffUpdateXMLString(root1, root2, false);
            if (diff == "") 
                return this._noInfo();
            return action + diff;
        }
        if (length1 > length2) 
            return action + this._diffAllNodes(root1, root2, length1, true);
        else 
            return action + this._diffAllNodes(root2, root1, length2, false);
    },
    
    diffUpdateSet: function(root1){
        var gr = this._getParentRecord(root1);
        var root2;
        if (gr.next()) {
            var xmlSerializer = new GlideRecordXMLSerializer();
            var xml = xmlSerializer.serialize(gr);
            root2 = this._getRoot(xml);
            return this.diffXML(root2, root1);
        }
        else {
            return this._noInfo();
        }
    },
    
    getURL: function(root){
        var sys_id = root.getElementsByTagName("sys_id").item(0).getFirstChild().getNodeValue();
        return root.getTagName() + ".do?sys_id=" + sys_id;
    },
    
    _diffAllNodes: function(root1, root2, length, left2right){
        var result = "";
        for (var i = 0; i < length; i++) {
            if (root1.getChildNodes().item(i).getNodeType() == 3) 
                continue;
            var element = root1.getChildNodes().item(i);
            if (left2right) 
                result += this._diffUpdateXMLString(element, this._getMatchingElement(element, root2), false);
            else 
                result += this._diffUpdateXMLString(this._getMatchingElement(element, root2), element, false);
        }
        if (result == "") 
            return this._noInfo();
        return result;
    },
    
    _diffUpdateXMLString: function(item1, item2, showMatching){
        if (showMatching == null) 
            showMatching = false;
        if ((item1 == null || item1.getChildNodes().getLength() == 0)
            && (item2 == null || item2.getChildNodes().getLength() == 0))
            return "";
        if (item1 == null || item1.getChildNodes().getLength() == 0)
            return this._diffAddedElement(item2, true);
        if (item2 == null || item2.getChildNodes().getLength() == 0)
            return this._diffAddedElement(item1, false);
        var elements1 = item1.getChildNodes();
        var elements2 = item2.getChildNodes();
        var result = "";
        var multipleLineResults = "";
        for (var i = 0; i < elements1.getLength(); i++) {
            var found = false;
            var name = "";
            for (var n = 0; n < elements2.getLength(); n++) {
                if (elements1.item(i).getNodeName() != elements2.item(n).getNodeName()) 
                    continue;
                else {
                    var text1 = elements1.item(i).getFirstChild();
                    var text2 = elements2.item(n).getFirstChild();
                    name = elements1.item(i).getTagName();
                    if (!this._ignoreField(name))
                       found = true;
                }
            }
            if (!found) 
                continue;
            var textValue1 = " ";
            var textValue2 = " ";
            if (text1 != null)
               textValue1 = text1.getNodeValue() + "";
            if (text2 != null) 
               textValue2 = text2.getNodeValue() + "";
            var diffResult = this.diff(textValue1, textValue2, name, showMatching) + "";
            if (diffResult.match('<td class="count">2:</td>') != null) 
               multipleLineResults += diffResult + "<td class='zebra' colspan=5></td>";
            else 
               result += diffResult;
            
        }
        if (result == "" && multipleLineResults == "" && showMatching == false) 
            return this._diffUpdateXMLString(item1, item2, true);
        return result + multipleLineResults;
    },

    /*
     * Ignore fields that give no value to the user.
     * for example sys_mod_count always shows up because its always changed  
     */
    _ignoreField: function(name) {
        if (name == "sys_mod_count")
            return true;

        return false;
    },
    
    _getMatchingElement: function(item1, root2){
        var sys_id1;
        for (var i = 0; i < item1.getChildNodes().getLength(); i++) 
            if (item1.getChildNodes().item(i).getTagName() == "sys_id") 
                sys_id1 = item1.getChildNodes().item(i).getFirstChild().getNodeValue();
        var childNodes = root2.getChildNodes();
        for (var i = 0; i < childNodes.getLength(); i++) {
            var element = childNodes.item(i);
            for (var n = 0; n < element.getChildNodes().getLength(); n++) 
                if (element.item(n).getTagName() == "sys_id") {
                    if (sys_id1 == element.item(n).getFirstChild().getNodeValue()) 
                        return element;
                }
        }
        return null;
    },
    
    _diffAddedElement: function(item1, isSecond){
	    var result = "";
        var elements1 = item1.getChildNodes();
        for (var i = 0; i < elements1.getLength(); i++) {
            var text1 = elements1.item(i).getChildNodes().item(0);
            if (text1 != null) {
				if (isSecond) {
					result += this.diff("", text1.getNodeValue() + "", elements1.item(i).getTagName(), true) + "";
				}
				else {
			    	result += this.diff(text1.getNodeValue() + "", "", elements1.item(i).getTagName(), true) + "";
				}
			}
        }
        return result;
    },
    _getParentRecord: function(root){
        var sys_ids = root.getElementsByTagName("sys_id");
        
        if (sys_ids.getLength() < 1) 
            var sys_id = "";
        else 
            var sys_id = sys_ids.item(sys_ids.getLength() - 1).getFirstChild().getNodeValue();
        var gr = new GlideRecord(root.getTagName());
        gr.query("sys_id", sys_id + "");
        return gr;
    }
});
