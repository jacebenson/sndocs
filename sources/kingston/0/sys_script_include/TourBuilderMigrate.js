var TourBuilderMigrate = Class.create();
TourBuilderMigrate.prototype = {

    initialize: function() {},

    _fromTable: {
        'GUIDE': 'tour_builder_guide',
        'STEP': 'tour_builder_step',
        'ELEMENT': 'tour_builder_element'
    },

    _toTable: {
        'GUIDE': 'sys_embedded_tour_guide',
        'STEP': 'sys_embedded_tour_step',
        'ELEMENT': 'sys_embedded_tour_element'
    },



    _mig: new TourBuilderMigrateUtility(),
    _ul: new TourBuilderUtility(),

    initiateCopy: function(tourId) {

        var tourSysid = this._ul.getTourObject(tourId).sys_id;
        var embeddedHelpSysid = this._ul.getTourObject(tourId).embedded_help_sys_id;
        var query_params_guide = [];
        var query_params_step = [];
        var query_params_element = [];
        var update_params = [];
        var copyGuideObject = {};
        var copyStepObject = {};
        var copyElementObject = {};
        var grElement;
        var tourElementsysid;
        var tourStepsysid;
        var updateColumn = {};
        var returnStatus = {};

        var isValidTour = this.validateExport(tourSysid);


        copyGuideObject.fromTable = this._fromTable.GUIDE;
        copyGuideObject.toTable = this._toTable.GUIDE;
        copyGuideObject.embeddedHelpSysid = embeddedHelpSysid;

        //delete steps if they already exist for a tour
        if (embeddedHelpSysid)
            this.deleteExportedData(embeddedHelpSysid);



        query_params_guide.push({
            column: "sys_id",
            value: tourId
        });

        copyGuideObject.query_params = query_params_guide;
        if (isValidTour.code) {

            var tourGuidesysid = this._mig.copyData(copyGuideObject);

            if (tourGuidesysid) {
                //check and set embed tour to inactive
                this.setEmbeddedTourinactive(tourSysid, tourGuidesysid);
                //find number of steps in the tour
                var gr = new GlideRecord(this._fromTable.STEP);
                gr.addQuery('tour_id', tourSysid);
                gr.query();
                gr.orderBy('step_no');
                while (gr.next()) {

                    copyElementObject.fromTable = this._fromTable.ELEMENT;
                    query_params_element.push({
                        column: "sys_id",
                        value: gr.target_ref
                    });

                    copyElementObject.query_params = query_params_element;
                    copyElementObject.toTable = this._toTable.ELEMENT;



                    tourElementsysid = this._mig.copyData(copyElementObject);
                    query_params_step.push({
                        column: "step_no",
                        value: gr.step_no,},
										   
						{column: "tour_id",
                        value: tourSysid
						 });

                    copyStepObject.fromTable = this._fromTable.STEP;
                    copyStepObject.query_params = query_params_step;
                    copyStepObject.toTable = this._toTable.STEP;

                    tourStepsysid = this._mig.copyData(copyStepObject);

                    //update step table with correct reference columns of element & guide

                    updateColumn.tableName = this._toTable.STEP;
                    updateColumn.sysId = tourStepsysid;

                    update_params.push({
                        column: "target_ref",
                        value: tourElementsysid
                    }, {
                        column: "action_target_ref",
                        value: tourElementsysid
                    }, {
                        column: "order",
                        value: gr.step_no
                    }, {
                        column: "guide",
                        value: tourGuidesysid
                    });

                    updateColumn.update_params = update_params;

                    this._mig._updateRecord(updateColumn);


                }

                returnStatus.code = true;
                returnStatus.message = gs.getMessage("Export to embedded help  successful.");

            } else {
                returnStatus.code = false;
                returnStatus.message = gs.getMessage("Export to embedded help failed.");
            }

            return returnStatus;

        } else {
            returnStatus.code = false;
            returnStatus.message = isValidateTour.message;
        }

        return returnStatus;

    },

    setEmbeddedTourinactive: function(tourSysid, tourGuidesysid) {
        var startUrl;
        var n;
        var updateColumn = {};
        var update_params = [];
        var gr = new GlideRecord(this._fromTable.GUIDE);
        gr.addQuery('sys_id', tourSysid);
        gr.query();
        while (gr.next()) {
            startUrl = gr.start_url;
            n = startUrl.indexOf('.');
            startUrl = startUrl.substring(0, n != -1 ? n : startUrl.length);
            var grEmbed = new GlideRecord(this._toTable.GUIDE);
            grEmbed.addQuery('context', startUrl);
            grEmbed.addQuery('sys_id', '!=', tourGuidesysid);
            grEmbed.query();
            while (grEmbed.next()) {
                grEmbed.active = false;
                grEmbed.update();
            }
            gr.embedded_help_reference = tourGuidesysid;
            gr.update();
        }

        updateColumn.tableName = this._toTable.GUIDE;
        updateColumn.sysId = tourGuidesysid;
        update_params.push({
            column: "context",
            value: startUrl
        });

        updateColumn.update_params = update_params;

        this._mig._updateRecord(updateColumn);

    },

    validateExport: function(tourSysid) {
        var returnStatus = {};
        returnStatus.code = true;
        //All the validations to be introduced here

        /*var grStep = new GlideRecord(this._fromTable.STEP);
        grStep.addQuery('tour_id', tourSysid);
		grStep.addNotNullQuery('x_path');
        grStep.query();
        while (grStep.next()) {
		returnStatus.code=false;
			returnStatus.message = gs.getMessage("Export to embedded help failed as one of the step target has xpath");
			return returnStatus;
		}*/

        return returnStatus;
    },

    deleteExportedData: function(tourSysid) {

        var step = new GlideRecord(this._toTable.STEP);
        step.addQuery('guide', tourSysid);
        step.query();
        while (step.next()) {
            var element = new GlideRecord(this._toTable.ELEMENT);
            element.addQuery('sys_id', step.target_ref);
            element.query();

            while (element.next()) {
                element.deleteRecord();
            }

            step.deleteRecord();
        }

    },

    type: 'TourBuilderMigrate'
};