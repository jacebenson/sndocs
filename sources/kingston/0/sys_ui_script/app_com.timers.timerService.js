angular.module("sn.app_common.timers")
	.service("timerService", ['$interval', '$window', function($interval, $window) {
		var timerService = this;
		var timerInstance = {};
		
		/**
		 * A Timer
		 */
		function TimerModel(timerName, precision) {
			/* The precision of the timer.  Default to 1 second.
			 * Safest interval for browsers which limit interval/timeout when page is not in focus.
			 */
			precision = precision && !isNaN(precision) ? precision : 1000;
			var lastUpdate;  // Last timer update in MS used for setting timer updates.  Compensates for browser power saving.
			var interval;
			this.elapsed = 0;  //Elapsed in ms
			this.duration = 0; //Duration in ms
			this.running = false;
			this.rootApply = false; // If $apply should be called on the root scope.  Default false.
				
			if (timerName)
				this.name = timerName;

			function updateElapsed() {
				var now = Date.now();
				this.elapsed = this.elapsed + (now - this.lastUpdate);
				this.lastUpdate = now;
			}
				
			/* Basic timer functions */
			this.start = function() {
				if (this.running)
					return;
				this.running = true;
				this.lastUpdate = Date.now();
				interval = $interval(updateElapsed.bind(this), precision, this.rootApply);
			};
				
			this.stop = function() {
				if (!this.running)
					return;
				this.running = false;
				$interval.cancel(interval);
			};
				
			this.reset = function() {
				var isRunning = this.running;
				if (isRunning)
					this.stop();
				this.elapsed = 0;
				if (isRunning)
					this.start();
			};
				
			/**
			 * Returns the remaining time in MS
			 * Will return 0 if duration is 0 or hasn't been set
			 */
			this.remainingTime = function() {
				if (this.duration <= 0)
					return 0;

				return this.duration - this.elapsed;
			};
				
			/**
			 * Returns the elapsed percentage
			 * Will return 0 if duration is 0 or hasn't been set
			 */
			this.percentElapsed = function() {
				if (this.duration > 0)
					return $window.Math.round(((this.duration - this.remainingTime())/this.duration) * 10000)/100;
					
				return 0;
			};
		}
			
		/**
		 * Gets a named timer instance.  Will return the same timer model for a given name
		 */
		timerService.getTimer = function(timerName, precision) {
			if (!timerName)
				return new TimerModel();

			if (timerInstance[timerName])
				return timerInstance[timerName];
				
			timerInstance[timerName] = new TimerModel(timerName, precision);
			return timerInstance[timerName];
		};
			
		/**
		 * Clears the named timer
		 */
		timerService.clearTimer = function(timerName) {
			// Get rid of the timeout if it's running.
			if (timerInstance[timerName].running)
				timerInstance[timerName].stop();
				
			delete timerInstance[timerName];
		};
			
		/**
		 * Clears all timers
		 */
		timerService.clearAllTimers = function() {
			for (var tn in timerInstance)
				this.clearTimer(tn);
		};
	}]);