var FlowSession = Class.create();

FlowSession.prototype = {
    
    /**
     * Creates a new Flow session for the current user, or if one exists
     * that's "In Progress", loads that instead.
     *
     * @constructor
     * @param {string|null} flowSysID  the SysID of the flow to create
	 * @param {string|null} sessionSysID  the SysID of the session to load
     * @returns {undefined}
     */
    initialize: function (flowSysID, sessionSysID) {
		
		// check if the flow exists
		
		var flowGr = new GlideRecord('x_pisn_guii_flow');
		
		if (!flowGr.get(flowSysID)) {
			throw 'FlowInvalid';
		}
        
        this.userID = gs.getUserID();
        
        var gr = new GlideRecord('x_pisn_guii_session');
        gr.addQuery('user', this.userID);
        gr.addQuery('flow', flowSysID);
        gr.addQuery('state', 'in_progress');
        gr.setLimit(1);
        gr.query();
        
        // Check if the user already has an active session for that flow
        if (gr.getRowCount() == 0) {
            
            // If not, create one
            gr = new GlideRecord('x_pisn_guii_session');
            gr.initialize();
            gr.user = this.userID;
            gr.flow = flowSysID;
            gr.state = 'in_progress';
            gr.insert();
            
        } else {
            
            // If yes, get the record
            gr.next();
        }
		
		Object.defineProperty(this, '_gr', { value: gr, enumerable: false });
        
        this.getCurrentResponse();
    },
    
    
    
    /**
     * Get the SysID of the current session
     *
     * @returns {string} The SysID of the current session
     */
    getID: function () {
        
        return this._gr.getUniqueValue();
    },
    
    getNumber: function () {
        
        return this._gr.getDisplayValue();
    },
    
    
    /**
     * Get the Flow object for the current session
     *
     * @returns {Flow}
     */
    getFlow: function (flowSysID) {
        
        // Check if we already have the flow on this session
        if (typeof this._flow == 'undefined') {
			
			var flow = new Flow(this._gr.getValue('flow'));
            
			Object.defineProperty(this, '_flow', { value: flow, enumerable: false });
        }
        
        return this._flow;
    },
    
    
    /**
     * Get the FlowScreen for the current screen
     *
     * @returns {FlowScreen}
     */
    getCurrentScreen: function () {
        
        var updateNeeded = false;
        
        if (typeof this._screen !== 'undefined') {
            
            if (this._screen.getID() !== this._gr.getValue('screen')) {
                
                updateNeeded = true;
            }
            
        } else if (typeof this._screen == 'undefined' || updateNeeded) {
			
			var screen = new FlowScreen(this._gr.getValue('screen'));
			
			Object.defineProperty(this, '_screen', { value: screen, enumerable: false });

        }
                
        return this._screen;
    },
    
    
    
    
    /**
     * Moves the session onto the next screen
     *
     * @returns {boolean} whether the screen move was successful
     */
    progress: function () {
        
        // set the current response as completed
        this._response.setComplete();
        
		// get all completed responses
        var responses = this.getResponses();
        
		// evaluate all the transitions for the current screen
        var next = this._screen.evalTransitions(responses);
        
		// if there's a next screen, update the session's GlideRecord with the new screen
        if (next) {
            this._gr.screen = next.getSysID();
            this._gr.update();
        }
        
		// create a response record for the new screen
        this.getCurrentResponse();
        
		// return the FlowScreen object for the new screen
        return next;
    },
    
    
    
    
    
    /**
     * Get the response record for the current "In Progress" screen in this session
     *
     * @returns {GlideRecord}
     */
    getCurrentResponse: function () {
        
        var updateNeeded = false;
        
        // check if we already have a current response
        if (typeof this._response !== 'undefined') {
            
            // check if it's screen matches the current screen
            if (this._response.getScreenID() !== this.getCurrentScreen().getID()) {
                
                // it doesn't so we need to update the current response
                updateNeeded = true;
            }
            
        } else if (typeof this._response == 'undefined' || updateNeeded) {
            
            // either we don't have a response, or it needs updating, so lets do that
            var gr = new GlideRecord('x_pisn_guii_response');
            gr.addQuery('session', this._gr.getUniqueValue());
			gr.addQuery('screen', this.getCurrentScreen().getSysID());
            gr.setLimit(1);
            gr.query();

            if (!gr.next()) {
                gr = new GlideRecord('x_pisn_guii_response');
                gr.initialize();
                gr.session = this._gr.getUniqueValue();
                gr.state = 'in_progress';
                gr.insert();
            }
			
			Object.defineProperty(this, '_response', { value: new FlowResponse(gr), enumerable: false });
            
        }
        
        return this._response;
    },
	
    
    /**
     * Get all response records for the current session
     *
     * @returns {Array:<GlideRecord>}
     */
    getResponses: function () {
        
        var responses = {};
        
        var gr = new GlideRecord('x_pisn_guii_response');
        gr.addQuery('session', this._gr.getUniqueValue());
        gr.addQuery('state', 'completed');
        gr.query();
        
        while (gr.next()) {
            var screen = gr.screen.getRefRecord();
            responses[screen.getValue('id')] = new FlowResponse(gr);
        }
		
		Object.defineProperty(responses, 'length', { value: gr.getRowCount(), enumerable: false });
        
        return responses;
    },
    

    type: 'FlowSession'
};