var ConnectionTest = Class.create();

// companion script to ui_select_list macro
ConnectionTest.prototype = {
        LARGE_IMG: { src: "images/speed_test_large.gifx", size: "171648" },

	initialize: function() {
	    this.runs = 6;
            this.attempts = 0;
            this.results = [];
	},

        setRuns: function(runs) {
            this.runs = runs;
        },

        run: function() {
            var image = this.LARGE_IMG;

            for(var i = 0; i < this.runs; i++) {
                var imgUrl = image.src + "?r=" + Math.random();
                var testImage = new Image();
                var startTime = (new Date()).getTime();
                var imageSize = image.size;
                testImage.onload = this.addRunResult.bind(this, startTime, imageSize);
                testImage.src = imgUrl;
                testImage.alt = "Test Connection";
            }
        },

        addRunResult: function(startTime, size) {
            var endTime = (new Date()).getTime();
            var runTime = endTime - startTime;
            this.results.push({ time: runTime, size: size });

            this.attempts++;

            if (this.attempts == this.runs)
                this.complete();
        },

        setComplete: function(func) {
            this.oncomplete = func.bind(this);
        },

        complete: function() {
            if (this.oncomplete)
                this.oncomplete();
        },

        getResults: function() {
            return this.results;
        },

	type: "ConnectionTest"
}