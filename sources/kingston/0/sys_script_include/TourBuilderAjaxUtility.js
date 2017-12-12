var TourBuilderAjaxUtility = Class.create();

TourBuilderAjaxUtility.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
	_tbr : new TourBuilderRecorder(),
	_tbu : new TourBuilderUtility(),
	_tbd : new TourBuilderDetails(),
	
	createTour : function(){
		var tourName = this.getParameter('tourName');
		var tourURL = this.getParameter('startURL');
		var tourRoles = this.getParameter('roles');
		
		var resultObj = this._tbr.createTour(tourName,tourURL,tourRoles);
		
		result = this.newItem("result");
		result.setAttribute("status", resultObj.status);
		result.setAttribute("message", resultObj.message);
		result.setAttribute("tourID", resultObj.tourID);
	},
	
	saveStep: function(){
		var stepObj = new global.JSON().decode(this.getParameter('sysparm_step_json'));
		var stepSysId = this._tbr.saveStep(stepObj);
		return stepSysId;
	},
	
	saveElement : function() {
		var elementObj = new global.JSON().decode(this.getParameter('sysparm_step_json'));
		var resultObj = this._tbr.saveElement(elementObj);
		return new global.JSON().encode(resultObj);
	},
	
	getSteps : function () {
		var args ={};
			var result = [];
			
			args.tour_id =  this.getParameter("sysparm_tour_id");
			result = this._tbd.getTourDetails(args);
			var toursteps =  new global.JSON().encode(result);
			return toursteps;
		},
		
		getActionSysid : function () {
			var elementObj = new global.JSON().decode(this.getParameter('sysparm_step_json'));
			var result = this._tbu.getActionSysid(elementObj);
			return result;
		},
		
		updateStepProperties : function(){
			
			var stepObj = new global.JSON().decode(this.getParameter('sysparm_step_json'));
			var stepSysId = this._tbr.updateStep(stepObj);
			return stepSysId;
		},
		
		deleteStep : function(){
			var tourId = this.getParameter('sysparm_tour_id');
			var stepNo = this.getParameter('sysparm_step_no');
			this._tbr.deleteStep(tourId,stepNo);
		},
		
		swapSteps : function() {
			
			var tourId = this.getParameter('sysparm_tour_id');
			var sourceStepNo = parseInt(this.getParameter('sysparm_source_step_no'));
			var destStepNo = parseInt(this.getParameter('sysparm_dest_step_no'));
			this._tbr.swapSteps(tourId,sourceStepNo,destStepNo);
		},
		
		getHelpForCurrentPage: function(page) {
			var help = {
				tours:[]
			};
			var gr  = new GlideRecord('sys_embedded_tour_guide');
			gr.addQuery('context', page);
			gr.query();
			while(gr.next()){
				help.tours.push({
					name:gr.name.toString(),
					tourId:gr.sys_id.toString()
				});
			}
			return help;
		},
		
		canUserEditTour: function(){
			var tourId = this.getParameter('sysparm_tour_id');
			var resultObj = this._tbu.canUserEditTour(tourId);
			
			var result = this.newItem("result");
			result.setAttribute("status", resultObj.status);
			result.setAttribute("message", resultObj.message);
		},
		
		type: 'TourBuilderAjaxUtility'
	});