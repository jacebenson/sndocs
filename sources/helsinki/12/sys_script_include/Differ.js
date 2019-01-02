var Differ = Class.create();

Differ.prototype = {

    /*****************************************
     * Given two text strings return a table representing the diff of those two strings
     * name is the field name that represents those strings.
     * (optional) change is whether or not to return a result if text strings are equal
     *****************************************/
    diff: function(text1, text2, name, change){
        if (change == null) 
            change = false;
        text1 = this._replaceSpaces(text1);
        text2 = this._replaceSpaces(text2);
        var difflib = new DiffLib();
        var base = difflib.stringAsLines(text1);
        var newText = difflib.stringAsLines(text2);
        var sm = new difflib.SequenceMatcher(base, newText);
        var opcodes = sm.get_opcodes();
        if (!change && (opcodes.length == 0 || (opcodes.length <= 1 && opcodes[0][0] == "equal"))) 
            return "";
        
        var diffview = new DiffView();
        var view = diffview.buildView({
            baseTextLines: base,
            newTextLines: newText,
            opcodes: opcodes,
            baseTextName: "Base System",
            newTextName: "Customized",
            contextSize: null,
            viewType: 0,
            element: name
        });
        return GlideXMLUtil.toString(view);
    },
    
    getOpcodes: function(text1, text2){
        var text1 = this._replaceSpaces(text1);
        var text2 = this._replaceSpaces(text2);
        var difflib = new DiffLib();
        var base = difflib.stringAsLines(text2);
        var newText = difflib.stringAsLines(text1);
        var sm = new difflib.SequenceMatcher(base, newText);
        return sm.get_opcodes() + "";
        
    },
    
    _getRoot: function(xmlstring){
        var xml = GlideXMLUtil.parse(xmlstring);
        var root = xml.getFirstChild();
        if (root.getTagName() == "record_update") 
            root = root.getFirstChild();
        
        return root;
    },
    
    /*
     *  When Diffing an XML String add a line that describes the action.
     */
    _getActionCompare: function(element1, element2) {
         if (JSUtil.nil(element1.getAttribute("action") + "")){
            element1 = element1.getFirstChild();
            element2 = element2.getFirstChild();
         }   
         var action1 = element1.getAttribute("action");
         var action2 = element2.getAttribute("action");
         if (!JSUtil.nil(action1) && !JSUtil.nil(action2)) 
           return this.diff(action1 + "",action2 + "", "action", false) + "";
        
         return "";
    },
    _noInfo: function(){
        return null;
    },
    
    /******************************************
     *  html removes spaces so this function replaces the spaces at the begining
     *  of each line with special space.  Can't replace all spaces because this will mess up wrapping.
     ******************************************/
    _replaceSpaces: function(text){
        var lines = text.split("\n");
        text = "";
        for (var i = 0; i < lines.length; i++) {
            var spaces = "";
            var characters = "";
            for (var j = 0; j < lines[i].length; j++) {
                if (lines[i][j] == " ") {
				   //uses special space character no visible in browser
                    spaces += " ";
                }
                else {
                    characters = lines[i].substring(j, lines[i].length);
                    break;
                }
            }
            text += spaces + characters + "\n";
        }
        
        return text.substring(0, text.length - 1);
    }
}
