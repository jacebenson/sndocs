var FlowScreen = Class.create();
FlowScreen.prototype = {
    initialize: function(screen) {
		
		var record;
		
		if (typeof screen === 'string') {
			
			var gr = new GlideRecord('x_pisn_guii_screen');
			
			if (!gr.get(screen)) {
				return false;
			}
			
			record = gr;
			
		} else if (typeof screen === 'object') {
			
			record = screen;
			
		} else {
			
			return false;
			
		}
		
		Object.defineProperty(this, '_gr', { value: record, enumerable: false });
		
		this.sys_id = this.getSysID();
		this.name = this.getName();
		this.id = this.getID();
		this.type = this.getType();
		
		if (this.type == 'widget') {
			this.widget = this.getWidget();
			this.options = this.getOptions();
		}
		
		if (this.type == 'form') {
			this.table = this.getTable();
			this.loadScript = this.getLoadScript();
		}
		
    },
	
	/**
	 * Get the SysID of the screen
	 *
	 * @returns {string} The SysID of the current session
	 */
	getSysID: function () {
		return this._gr.getUniqueValue();
	},
	
	getID: function () {
		return this._gr.getValue('id');
	},
	
	getName: function () {
		return this._gr.getValue('name');
	},
	
	getType: function () {
		return this._gr.getValue('type');
	},
	
	getWidget: function () {
		return this._gr.getValue('widget');
	},
	
	getOptions: function () {
		return JSON.parse(this._gr.getValue('options'));
	},
	
	getTable: function () {
		return this._gr.getValue('table');
	},
	
	getLoadScript: function () {
		return this._gr.getValue('load_script');
	},
	
	getDefaultNext: function () {
		
		if (this._defaultNext) {
			return this._defaultNext;
		}
		
		if (this._gr.default_next.nil()) {
			return false;
		}
		
		var nextSysID = this._gr.getValue('default_next');
		
		Object.defineProperty(this, '_defaultNext', { value: new FlowScreen(nextSysID), enumerable: false });
		
		return this._defaultNext;
	},
	
	
	evalTransitions: function (responses) {
		
		if (responses.length > 0) {
			
			var gr = new GlideRecord('x_pisn_guii_transition');
			gr.addQuery('from', this.getSysID());
			gr.orderByDesc('order');
			gr.query();
			
			if (gr.getRowCount() === 0) {
				
				// If there's no transitions, get the default next
				return this.getDefaultNext();
			}
			
			// loop through the transitions and (given we've ordered the GR by
			// the 'order'field) return the first one which evaluates to true
			while (gr.next()) {
				
				var trsn = new FlowTransition(gr);
				
				if (trsn.evaluate(responses)) {
					
					return trsn.getNextScreen();
				}
			}
		}
		
		return this.getDefaultNext();
	},

    type: 'FlowScreen'
};