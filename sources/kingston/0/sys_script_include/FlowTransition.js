var FlowTransition = Class.create();
FlowTransition.prototype = {
    initialize: function(transition) {
		
		var record;
		
		if (typeof transition === 'string') {
			
			var gr = new GlideRecord('x_pisn_guii_transition');
			
			if (!gr.get(transition)) {
				return false;
			}
			
			record = gr;
			
		} else if (typeof transition === 'object') {
			
			record = transition;
			
		} else {
			
			return false;
			
		}
		
		this._gr = record;
		
    },
	
	getOrder: function () {
		return parseInt(this._gr.getValue('order'));
	},
	
	getNextScreen: function () {
		return new FlowScreen(this._gr.getValue('to'));
	},
	
	evaluate: function (responses) {
		var evaluator = new GlideScopedEvaluator();
		evaluator.putVariable('responses', responses);
		return evaluator.evaluateScript(this._gr, 'script');
	},

    type: 'FlowTransition'
};