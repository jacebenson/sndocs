var RecommendationEvaluator = Class.create();
RecommendationEvaluator.prototype = {
    initialize: function() {
		this.scaleFactor = sn_bm_common.CommonConstants.RECO_SCALE_FACTOR;
    },

    runLastMonth: function() {
        var dates = new sn_bm_common.Utils().getMonthsAgoDates(1);
        this.run(dates.start);
    },

    run: function(start_date) {
        // Delete existing evaluations
        this.deleteEvaluations(start_date);

        // Query the recommendation table
        var gr = new GlideRecord('sn_bm_client_recommendation');
        gr.addActiveQuery();
        gr.orderBy('number');
        gr.query();

        var mgr = new RecommendationManager();

        // For each recommendation
        while (gr.next()) {

            // Ensure that it is not rejected
            if (!mgr.shouldEvaluate(gr.getUniqueValue()))
                continue;

            // Evaluate the recommendation
            var result = this.evaluate(gr, start_date);

            // Insert the evaluation record
            this.saveEvaluation(gr.getUniqueValue(), start_date, result);
        }
    },

    evaluate: function(gr, start_date) {
        var result = {base: false, script: false, historical: true, score: 0};

        var type            =  gr.getValue('type');
        var threshold       =  parseFloat(gr.getValue('threshold_value'));
        var direction       =  gr.getValue('direction');

        // Check type of the recommendation
        if (type == 'usage') {

            // If plugin ID is provided, check if plugin is activated
            var pluginActive = this.checkPlugin(gr.getValue('plugin_id'));

            // If table is provided and plugin is active or null; query for the specified condition
            var tableResult = (pluginActive != false) && this.checkTable(gr.getValue('table'),
                                                    gr.query_conditions.toString(),
                                                    threshold, direction);

            result.score = (pluginActive == false) ? this.scaleFactor : tableResult.score;
            result.base  = (pluginActive == false) || tableResult.evaluation;

        } else if (type == 'indicator_value') {

            // Find the indicator value
            var indicatorResult = this.checkIndicator(gr.getValue('indicator'), threshold, direction, start_date);
            result.score = indicatorResult.score;
            result.base  = indicatorResult.evaluation;

        } else if (type == 'none') {

            // 'None' => Always true
			if (gr.getDisplayValue('advanced') == 'false') {
				result.base  = true;
				result.score = this.scaleFactor;
			} else
				result.base  = false;
        }

        // Add script evaluation
        if (gr.getDisplayValue('advanced') == 'true') {
            var scriptResult = new GlideScopedEvaluator().evaluateScript(gr, 'script');
            result.script = scriptResult && scriptResult.evaluation;
            result.score += isNaN(scriptResult.score) ? 0 : scriptResult.score;
        }

        // Add historical check
        if (gr.getDisplayValue('historical') == 'true') {
            var age = new GlideDuration();
            age.setValue(gr.getValue('age'));
            result.historical = this.checkHistorical(gr.getUniqueValue(), age.getDayPart());
        }

        return result;
    },

    checkPlugin: function(pluginId) {
        return gs.nil(pluginId) ? true : new GlidePluginManager().isActive(pluginId);
    },

    getTableCount: function(table, query) {
        if(gs.nil(table))
            return null;

        // Check if table is valid
        var gr = new GlideAggregate(table);
        if (!gr.isValid())
            return null;

        // Perform the query
        gr.addEncodedQuery(query);
        gr.addAggregate('COUNT');
        gr.query();

        // Compare the count against the threshold
        if (gr.next())
            return gr.getAggregate('COUNT');

        return 0;
    },

    checkTable: function(table, query, threshold, direction) {
        var result = {evaluation: false, score: 0};

        // Check if table is valid
        var gr = new GlideAggregate(table);
        if (!gr.isValid())
            return result;

        // Perform the query
        gr.addEncodedQuery(query);
        gr.addAggregate('COUNT');
        gr.query();

        // Compare the count against the threshold
        if (gr.next())
            return this.compare(parseFloat(gr.getAggregate('COUNT')), threshold, direction);

        return result;
    },

    getIndicatorValue: function(indicator, start_date) {

        var gr = new GlideRecord('sn_bm_client_score');
        gr.addQuery('start_date', start_date);
        gr.addQuery('indicator', indicator);
        gr.addQuery('global', false);
        gr.query();

        // Return the mean value
        if (gr.next())
            return parseFloat(gr.mean_value);
        return 0;
    },

    checkIndicator: function(indicator, threshold, direction, start_date) {

        var gr = new GlideRecord('sn_bm_client_score');
        gr.addQuery('start_date', start_date);
        gr.addQuery('indicator', indicator);
        gr.addQuery('global', false);
        gr.query();

        // Compare the value against the threshold
        if (gr.next())
            return this.compare(parseFloat(gr.mean_value), threshold, direction);

        return {evaluation: false, score: 0};
    },

    checkHistorical: function(recommendationID, daysAgo) {
        var monthsAgo = (!gs.nil(daysAgo) && !isNaN(daysAgo) && daysAgo >= 0 && daysAgo < Infinity) ? parseInt(parseInt(daysAgo) / 30) : 0;
        var query = 'dateONLast ' + (1 + monthsAgo) + ' months@javascript:gs.monthsAgoStart(' + (1 + monthsAgo) + ')@javascript:gs.monthsAgoStart(2)';

        var gr = new GlideAggregate('sn_bm_client_recommendation_eval');
        gr.addQuery('recommendation', recommendationID);
        gr.addEncodedQuery(query);
        gr.addAggregate('COUNT');
        gr.groupBy('evaluation');
        gr.query();

        var evalTrue  = 0;
        var evalFalse = 0;
        while (gr.next()) {
            if (gr.getDisplayValue('evaluation') == 'true')
                evalTrue = gr.getAggregate('COUNT');
            else
                evalFalse = gr.getAggregate('COUNT');
        }

        return (evalFalse == 0) && (evalTrue >= monthsAgo);
    },

    saveEvaluation: function(recommendationID, start_date, result) {
        var gr = new GlideRecord('sn_bm_client_recommendation_eval');
        gr.recommendation = recommendationID;
        gr.date = start_date;
        gr.score = result.score;
        gr.result = (result.base || result.script) && result.historical;
        gr.evaluation = result.base && result.script;
        gr.insert();
    },

    deleteEvaluations: function(start_date) {
        var gr = new GlideRecord('sn_bm_client_recommendation_eval');
        gr.addQuery('date', start_date);
        gr.deleteMultiple();
    },

    // Compares given value against threshold and returns a boolean
    // with the comparison result and also a *magnitude* or score
    // that represents how big the difference is between the two.
    compare: function(value, threshold, direction) {
        var result = {
            evaluation: direction == 'equal' ? value == threshold : direction == 'min' ? value < threshold : value > threshold,
            score: this.scaleFactor * Math.abs(value - threshold) / threshold
        };

        if (!result.score || isNaN(result.score) || result.score === Infinity)
            result.score = 1;
        return result;
    },

    type: 'RecommendationEvaluator'
};