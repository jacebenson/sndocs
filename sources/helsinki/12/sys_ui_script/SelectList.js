/**
 * The SelectList manages a multiline select box 
 */

var SelectList = Class.create();

// companion script to ui_select_list macro
SelectList.prototype = {
	initialize: function(id, sortFlag) {
		this.id = id;
		this.sortFlag = sortFlag;
		this.userDblClick = null;
	},

    getSort: function() {
        return this.sortFlag;
    },

    setSort: function(sortFlag) {
        this.sortFlag = sortFlag;
    },

    setDblClick: function(func) {
        this.userDblClick = func;
    },
    
	addChoice: function(value, text) {
	   var opt = cel("option");
	   opt.value = value;
	   opt.text = text;
	   this.getSelect().options.add(opt);
    },
    
    // clear select box
    clear: function() {
    	this.getSelect().options.length = 0;
    },
    
    // return an array of all the values in the select box
    getValues: function() {
		var values = new Array();
	    var options = this.getSelect().options;
	    for (var i = 0; i < options.length; i++) {
	    	values[i] = options[i].value;
	    }
		return values;    	
    },
    
    // get the text and value for a specific option
    getTextAndValue: function(ndx) {
        var options = this.getSelect().options;
        if (ndx < options.length) {
            return {'text' : options[ndx].text, 'value' : options[ndx].value};
        } else {
            return null;
        }
    },
    
    // get a specific option 
    getOption: function(ndx) {
        var options = this.getSelect().options;
        if (ndx < options.length) {
            return options[ndx];
        } else {
            return null;
        }
    },
    
    // return an array of selected option ids
    getSelectedIds: function() {
        // find which ones are selected...
        var selectedIds = new Array();
        var index = 0;
        var options = this.getSelect().options;
        for (var i = 0; i < options.length; i++) {
            option = options[i];
            if (option.selected) {
                // canSelect from select list, no functionality
                var canSelect = true;
                
                // if this option can be moved we add it to our array of elements selected elements
                if (canSelect) {
                    selectedIds[index] = i;
                    index++;
                } else {
                    // if we can't move this option, then unselect it
                    option.selected = false;
                }
            }
        }   
        return selectedIds; 	
    },

    getSelect: function() {
    	return gel(this.id);
    },    
    
	// remove selected values from the select list, starting with the last one selected
	removeSelected: function() {
	    var selectBox = this.getSelect();
	    var selectedIds = this.getSelectedIds();
	    for (var i = selectedIds.length - 1; i > -1; i--) {
            selectBox.remove(selectedIds[i]);
	    }

	    // notify the Select Element that its contents have changed
	    if (selectBox["onchange"]) {
		    selectBox.onchange();
	    }
	   
        // Workaround here for a bug in IE:
        // If you have a select element with many values, and you've scrolled to
        // the bottom and move an option from the top-most element you can now see,
        // IE would not refresh the select element, leaving a hole in the list.
        // By forcing the select element disabled and back, it seems to refresh the
        // element properly.
        selectBox.disabled = true;
        selectBox.disabled = false;
	},
	
    // move items in a select box upward
    moveUp: function() {
      	selectBox = this.getSelect();
   		var options = selectBox.options;
    
		// find which ones are selected...
		var selectedIds = this.getSelectedIds();

		// move each selected option up
		var selId;
		for (var i = 0; i < selectedIds.length; i++) {
			selId = selectedIds[i];
			privateMoveUp(options, selId);
			options[selId].selected = false;
			options[selId - 1].selected = true;
		}

		selectBox.focus();

		// invoke if the Slect Element has local function
		if (selectBox["onLocalMoveUp"]) {
			selectBox.onLocalMoveUp();
    	}
    },
    
    // move items in a select box downward
    moveDown: function() {
      	selectBox = this.getSelect();
   		var options = selectBox.options;
    
		// find which ones are selected...
		var selectedIds = this.getSelectedIds();
    
		// move each selected element down
		var selId;
		for (var i = 0; i < selectedIds.length; i++) {
			selId = selectedIds[i];
			privateMoveDown(options, selId);
			options[selId].selected = false;
			options[selId + 1].selected = true;
		}
    
   		selectBox.focus();
    
		// invoke if the Slect Element has local function
		if (selectBox["onLocalMoveDown"]) {
			selectBox.onLocalMoveDown();
    	}
    },

    dblClick: function(e) {
        // Call any user specified dbl click handler
        if (this.userDblClick) {
            this.userDblClick();
        }
    },
    
	getClassName : function() {
		return "SelectList";
	}
}