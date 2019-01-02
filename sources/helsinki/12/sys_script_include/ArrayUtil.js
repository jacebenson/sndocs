var ArrayUtil = Class.create();
ArrayUtil.prototype = {
    initialize: function(){
    },
    
    contains: function(array, element){
        array = this.convertArray(array);
        for (var i = 0; i < array.length; i++) {
            if (array[i] == element) {
                return true;
            }
        }
        return false;
    },
    
    indexOf: function(array, item, startIndex){
        array = this.convertArray(array);
        var len = array.length;
        if (startIndex == null) {
            startIndex = 0;
        }
        else 
            if (startIndex < 0) {
                startIndex += len;
                if (startIndex < 0) 
                    startIndex = 0;
            }
        
        for (var i = startIndex; i < len; i++) {
            var val = array[i] || array.charAt && array.charAt(i);
            if (val == item) 
                return i;
        }
        
        return -1;
    },
    
    ensureArray: function(obj){
        var array = new Array();
        
        if (obj == null || typeof obj == "undefined") 
            return array;
        
        if (obj.constructor.toString().indexOf("Array") > -1) 
            return obj;
        
        array.push(obj);
        return array;
    },
    
    concat: function(parent, children){
        for (var i = 0; i < children.length; i++) {
            var item = children[i];
            parent.push(item);
        }
        
        return parent;
    },
    
    convertArray: function(a){
        if (typeof a.size === 'function' && a.size() > 0) {
            var newArray = new Array();
            for (var i = 0; i < a.size(); i++) {
                var val = a.get(i);
                newArray.push(val);
            }
            a = newArray;
        }
        
        return a;
    },
    
    /**
     * Find the difference between two or more arrays
     * diff(a,b,c)
     * will return an array of items from a that were not found in either b or c
     * Duplicate items are removed from the result
     * @param two or more arrays
     * @return Array
     */
    diff: function(){
        if (!arguments.length) 
            return [];
        
        var a1 = arguments[0];
        if (arguments.length == 1) 
            return a1;
        
        var a = a2 = null;
        var n = 1;
        while (n < arguments.length) {
            a = [];
            a2 = arguments[n];
            var l = a1.length;
            var l2 = a2.length;
            var diff = true;
            for (var i = 0; i < l; i++) {
                for (var j = 0; j < l2; j++) {
                    if (a1[i] === a2[j]) {
                        diff = false;
                        break;
                    }
                }
                diff ? a.push(a1[i]) : diff = true;
            }
            a1 = a;
            n++;
        }
        return this.unique(a);
    },
    
    /**
     * Find the intersect between two or more arrays
     * intersect(a,b,c)
     * will return an array of items from a that were also found in both b or c
     * Duplicate items are removed from the result
     * @param two or more arrays
     * @return Array
     */
    intersect: function(){
        if (!arguments.length) 
            return [];
        
        var a1 = arguments[0];
        if (arguments.length == 1) 
            return a1;

        var a1 = arguments[0];
        var a = a2 = null;
        var n = 1;
        while (n < arguments.length) {
            a = [];
            a2 = arguments[n];
            var l = a1.length;
            var l2 = a2.length;
            for (var i = 0; i < l; i++) {
                for (var j = 0; j < l2; j++) {
                    if (a1[i] === a2[j]) 
                        a.push(a1[i]);
                }
            }
            a1 = a;
            n++;
        }
        return this.unique(a);
    },
    
    /**
     * Merge two or more arrays together
     * union(a,b,c)
     * will return an array of items with items from all arrays, duplicate items are removed from the result
     * @param two or more arrays
     * @return Array
     */
    union: function(){
        if (!arguments.length) 
            return [];
        
        var a1 = arguments[0];
        var a = [].concat(a1);
        var l = arguments.length;
        var n = 1;
        for (var i = n; i < l; i++) {
            a = a.concat(arguments[i]);
        }
        return this.unique(a);
    },
    
    /**
     * Removes duplicate items from an array
     * @param Array a1
     * @return Array
     */
    unique: function(a1){
        var a = [];
        var l = a1.length;
        for (var i = 0; i < l; i++) {
            for (var j = i + 1; j < l; j++) {
                if (a1[i] === a1[j]) 
                    j = ++i;
            }
            a.push(a1[i]);
        }
        return a;
    },
    
    type: "ArrayUtil"
}


