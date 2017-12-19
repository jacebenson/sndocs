var DesiredVsActual = Class.create();
DesiredVsActual.prototype = {
	initialize: function() {
		this.desiredAttribute = 'desired_state';
		this.actualAttribute = 'actual_state';
		this.desiredSuffix = '_desired';
		this.desiredLabel = gs.getMessage(' (Desired)');
		this.columnLength = 30;
	},
	
	// Check whether Desired UI Action needs to be visible or not
	isAddDesiredUIVisible : function(current) {
		if(gs.nil(current.element) || gs.nil(current.name) || (!new SNC.CMDBUtil().isCMDB(current.name))) {
			return false;
		}
		
		var desiredElement = this.getDesiredElementFromActual(current.element);
		var desiredQueryStr = 'name='+ current.name + '^element=' + desiredElement;
		var bNoAttrPresent = (gs.nil(current.attributes) || ((current.attributes.indexOf(this.desiredAttribute) == -1) &&
		(current.attributes.indexOf(this.actualAttribute) == -1)));
		var gr = new GlideRecord('sys_dictionary');
		gr.addEncodedQuery(desiredQueryStr);
		gr.setLimit(1);
		gr.query();
		
		return ((!gr.hasNext()) && bNoAttrPresent);
	},
	
	// Check whether Actual UI Action needs to be visible or not
	isRemoveDesiredUIVisible : function(current) {
		var actualElement = this.getElementFromAttributes(current.attributes, false);
		if(gs.nil(actualElement) || gs.nil(current.element) || gs.nil(current.name) || (!new SNC.CMDBUtil().isCMDB(current.name))) {
			return false;
		}
		
		var actualQueryStr = 'name='+ current.name + '^element=' + actualElement;
		var gr = new GlideRecord('sys_dictionary');
		gr.addEncodedQuery(actualQueryStr);
		gr.setLimit(1);
		gr.query();
		
		return (gr.hasNext());
	},
	
	// Add Desired State
	addDesiredState : function(current) {
		if(gs.nil(current.name)) {
			gs.addInfoMessage('Could not add desired state - table name field was empty');
		}
		else if(gs.nil(current.element)) {
			gs.addInfoMessage('Could not add desired state - column name field was empty');
		}
		else {
			var desiredElement = this.getDesiredElementFromActual(current.element);
			var desiredLabel = current.column_label + this.desiredLabel;
			var desiredAttributeStr = this.desiredAttribute + '=' + desiredElement;
			var actualAttributeStr = this.actualAttribute + '=' + current.element;
			
			//Create a cloned desired element from actual element, but with distinct element, label and attributes
			var actualQueryStr = 'name='+ current.name + '^element=' + current.element;
			var actualChoice;
			var gr = new GlideRecord('sys_dictionary');
			gr.addEncodedQuery(actualQueryStr);
			gr.query();
			if(gr.next()){
				actualChoice = gr.getValue('choice');
				gr.setValue('element', desiredElement);
				gr.setValue('column_label', desiredLabel);
				gr.setValue('attributes', actualAttributeStr);
				gr.insert();
				
				// Clone desired element choices from actual element choices if present
				if(!gs.nil(actualChoice)){
					var grCh = new GlideRecord('sys_choice');
					grCh.addEncodedQuery(actualQueryStr);
					grCh.query();
					while(grCh.next()){
						grCh.setValue('element', desiredElement);
						grCh.insert();
					}
				}
			}
			
			//Add Desired Dictionary Attribute to actual element
			if(gs.nil(current.attributes)){
				current.attributes = desiredAttributeStr;
			}
			else {
				current.attributes = current.attributes + ',' + desiredAttributeStr;
			}
			current.update();
			gs.addInfoMessage('Desired state added');
		}
	},
	
	// Remove Desired State
	removeDesiredState : function(current) {
		if(gs.nil(current.name)) {
			gs.addInfoMessage('Could not remove desired state - table name field was empty');
		}
		else if(gs.nil(current.element)) {
			gs.addInfoMessage('Could not remove desired state - column name field was empty');
		}
		else {
			// Remove Desired Dictionary Attribute from actual element
			var actualElement = this.getElementFromAttributes(current.attributes, false);
			var actualQueryStr = 'name='+ current.name + '^element=' + actualElement;
			var gr = new GlideRecord('sys_dictionary');
			gr.addEncodedQuery(actualQueryStr);
			gr.query();
			if(gr.next()){
				var currAttrs = gr.getValue('attributes');
				if(!gs.nil(currAttrs)){
					currAttrs = this.filterOutAttributes(currAttrs, true);
					gr.setValue('attributes', currAttrs);
					gr.update();
				}
			}
			
			// Delete Desired Choices (if present)
			var desiredQueryStr = 'name='+ current.name + '^element=' + current.element;
			var grCh = new GlideRecord('sys_choice');
			grCh.addEncodedQuery(desiredQueryStr);
			grCh.query();
			while(grCh.next()){
				grCh.deleteRecord();
			}
			
			// Delete Desired Element
			current.deleteRecord();
			gs.addInfoMessage('Desired state removed');
		}
	},
	
	// Get Element from Dictionary Attributes for Desired or Actual
	getElementFromAttributes : function(attributes, isDesired) {
		if(!gs.nil(attributes)){
			var attributeArr = attributes.split(',');
			var chkAttrStr = (isDesired) ? this.desiredAttribute : this.actualAttribute;
			for (var i=0; i < attributeArr.length; i++) {
				var attribute = (attributeArr[i]).trim(); //trim spaces if present
				var elementArray = attribute.split('=');
				if((elementArray.length == 2) && (elementArray[0].indexOf(chkAttrStr) != -1)){
					return elementArray[1].trim(); //trim spaces if present
				}
			}
		}
		return null;
	},
	
	// Filter out Dictionary Attributes for Desired or Actual
	filterOutAttributes : function(attributes, isDesired) {
		var attrNewStr = '';
		if(!gs.nil(attributes)){
			var attrNewArr = [];
			var attrOldArr = attributes.split(',');
			var chkAttrStr = (isDesired) ? this.desiredAttribute : this.actualAttribute;
			for (var i=0; i < attrOldArr.length; i++) {
				if(attrOldArr[i].indexOf(chkAttrStr) == -1){
					attrNewArr.push(attrOldArr[i].trim()); //trim spaces if present
				}
			}
			attrNewStr = attrNewArr.join(',');
		}
		return attrNewStr;
	},
	
	// Get DesiredElement from Actual Element
	getDesiredElementFromActual : function(actualElement) {
		var desiredElement = actualElement + this.desiredSuffix;
		var userPrefix = GlideDBUtil.getUserFieldPrefix();
		if(desiredElement.indexOf(userPrefix) != 0){
			desiredElement = userPrefix + desiredElement;
		}
		
		// Limit column name to be within column name max length
		if(desiredElement.length > this.columnLength) {
			desiredElement = desiredElement.substring(0, this.columnLength);
		}
		return desiredElement;
	},
	
	type: 'DesiredVsActual'
};