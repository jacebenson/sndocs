gs.include("PrototypeServer");

var WorkflowIcons = Class.create();

WorkflowIcons.prototype = {
	
	initialize : function(ref) {
		this.au = new ArrayUtil();
		this.elementName = ref;
		this.element = eval(ref);
		
		this.finishers = {
			'rejected' : true,
			'complete' : true,
			'request_cancelled' : true
		};
		
		this.visited = this.getPreviousValues();
	},

	getVisited: function() {
		return this.visited;
	},
	
	process : function(c) {
		var choices = c.clone();

		if (choices.getSize() < 1)
			return;
		
		for (var i = 0; i < choices.getSize(); i++) {
			var c = choices.getChoice(i);
			this.processChoice(c, i, choices.getSelectedIndex());

			if (c.selected && this.isFinisher(c.value)) {
				for (var l = choices.getSize() - 1; l > i; l--) 
					choices.removeChoice(l);
				
				i = choices.getSize();
			}
		}
		return choices;
	},

	getElement : function() {
		return this.element;
	},

	hasBeenUsed : function(c) {
		return this.au.indexOf(this.visited, c.value + '') != -1;
	},

	isOverdue : function() {
		var gr = this.getElement().getGlideRecord();
		var end = gr.getElement("planned_end_date");

		if (end == null)
			return false;

		var now = new GlideDateTime();
		var nowValue = now.getNumericValue();
		var endValue = end.dateNumericValue();

		if (endValue > 0 && endValue < nowValue) {
			var wf = new String(this.getElement());
			if (!wf.startsWith("complete") && !wf.startsWith("reject"))
				return true;
		}
		return false;
	},

	isFinisher : function(x) {
		return this.finishers[x];
	},

	updateVisited : function(newValue) {
		var gr = this.getElement().getGlideRecord();
		var fieldName = this.getElement().getName();
		var audited = GlideAuditor.getFieldValuesUsed(gr, fieldName);
		
		// Lets ensure that this is really a stage we have hit 
		// before just adding it to our visited list
		if (audited.indexOf(newValue) == -1)
			return;
		
		this.visited.push(newValue);	    
		var s1 = new StageStatus(this.grStatus.getValue("stage_status"));
		s1.setVisited(this.visited);
		this.grStatus.setValue("stage_status", s1.toString1());
		this.grStatus.update();
	},

	updateValue : function(newValue) {
		var ss = new StageStatus(this.grStatus.getValue("stage_status"));
		ss.setValue(newValue);
		this.grStatus.setValue("stage_status", ss.toString1());
		this.grStatus.update();
	},

	getPreviousValues : function() {
		var gr = this.getElement().getGlideRecord();
		var fieldName = this.getElement().getName();

		var grStatus = GlideRecord("stage_state");
		grStatus.addQuery("table", gr.getTableName());
		grStatus.addQuery("id",    gr.getUniqueValue());
		grStatus.query();
		this.grStatus = grStatus;

		if (grStatus.next())
			return readCurrentState(grStatus);

		var status = createStageState(gr, fieldName, grStatus);
		
		return status.getVisited();


		function readCurrentState(grS) {
			var json = grS.getValue("stage_status");
			var status = new StageStatus(json);
			return status.getVisited();
		}

		function createStageState(gr, fieldName, grStatus) {
			var s = new StageStatus();
			var currentValue = gr.getValue(fieldName);
			s.setValue(currentValue);
			s.setVisited(computeVisitedFromAudit(gr, fieldName, currentValue));

			grStatus.initialize();
			grStatus.setValue("table", gr.getTableName());
			grStatus.setValue("id",    gr.getUniqueValue());
			grStatus.setValue("stage_status", s.toString1());
			grStatus.insert();
			return s;
		}
		
		function computeVisitedFromAudit(gr, fieldName, currentValue) {
			var values = [];
			var gaAudit = new GlideAggregate("sys_audit");
			gaAudit.addQuery("tablename",   gr.getTableName());
			gaAudit.addQuery("fieldname",   fieldName);
			gaAudit.addQuery("documentkey", gr.getUniqueValue());
			gaAudit.addQuery("sys_created_on", ">=", gr.getValue("sys_created_on"));
			gaAudit.addAggregate("COUNT");
			gaAudit.groupBy("newvalue");
			gaAudit.query();

			while (gaAudit.next()) {
				addValue("newvalue");
				addValue("oldvalue");
			}
			
			return values;


			function addValue(name) {
				var v = gaAudit.getValue(name)+'';
				
				if (this._visitedArrayContains(v))
					return;
				
				if (v && v != currentValue)
				   values.push(v);
			}
		}		
	},

	processChoice : function(choice, index, selectedIndex) {
	
		// If we already have an image specified for this choice, use it
		//
		if (choice.image)
			return;
	
		var newValue = choice.value + '';
		
		// If 
		//   a) we have a new non-empty value, and, 
		//   b) it is not currently in the visted list, and,
		//   c) choice passed to us is before the selected (current) choice
		//
		if (newValue && !this._visitedArrayContains(newValue) &&  index < selectedIndex)
			this.updateVisited(newValue);
		
		var selected = (index == selectedIndex);

		// everything after the selected item is 'pending'
		//
		if (index > selectedIndex) {
			choice.image = "icon-empty-circle";
			this._appendStateText(choice, gs.getMessage("Pending - has not started"));
			return;
		}

		var stateText = "";
		if (selected) {
			this.updateValue(choice.value);
			choice.image = "icon-arrow-right color-accent";
			stateText = "In progress";

			if (choice.value == 'rejected') {
				choice.image = "icon-cross-circle color-negative";
				stateText = "";
			} else {
				if (this.isOverdue()) {
					choice.image = "icon-alert color-negative";
					stateText = "Overdue";
				} else {
					if (choice.value == 'complete') {
						choice.image = "icon-check-circle color-positive";
						stateText = "Completed";
					} else if (choice.value == 'on hold') {
						choice.image = "icon-clear color-warning";
						stateText = "On hold";
					}
				}
			}
		} else {
			if (this.hasBeenUsed(choice)) {
				choice.image = "icon-check-circle color-positive";
				stateText = "Completed";
			} else {
				choice.image = "icon-step-over";
				stateText = "Skipped";
			}
		}

		if (stateText)
			this._appendStateText(choice, gs.getMessage(stateText));
		

	},

	_visitedArrayContains : function (newValue) {
		return this.au.indexOf(this.visited, newValue) != -1;
	},
	
	_appendStateText : function(choice, text) {
		if (text)
			choice.setParameter("title", choice.label);
		choice.label = text;
	},

	type : "WorkflowIcons"
};