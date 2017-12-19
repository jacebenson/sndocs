angular.module("sn.app_common")
	.service("modelUtil", ['SNAPI', 'TIME', '$rootScope', '$http', '$log', function(SNAPI, TIME, $rootScope, $http, $log) {
		var modelUtil = this;
		var DATE_RX = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
		var YMD_RX = /^\d{4}-\d{2}-\d{2}$/;
		var DEFAULT_GLIDE_LIST_SEPARATOR = ", ";
		
		// Mapping of legacy ambiguous time zones to equivalent. Taken from Java mappings
		// See: https://docs.oracle.com/javase/8/docs/api/java/time/ZoneId.html#SHORT_IDS
		var SHORT_IDS = {
			"ACT": "Australia/Darwin",
			"AET": "Australia/Sydney",
			"AGT": "America/Argentina/Buenos_Aires",
			"ART": "Africa/Cairo",
			"AST": "America/Anchorage",
			"BET": "America/Sao_Paulo",
			"BST": "Asia/Dhaka",
			"CAT": "Africa/Harare",
			"CNT": "America/St_Johns",
			"CST": "America/Chicago",
			"CTT": "Asia/Shanghai",
			"EAT": "Africa/Addis_Ababa",
			"ECT": "Europe/Paris",
			"IET": "America/Indiana/Indianapolis",
			"IST": "Asia/Kolkata",
			"JST": "Asia/Tokyo",
			"MIT": "Pacific/Apia",
			"NET": "Asia/Yerevan",
			"NST": "Pacific/Auckland",
			"PLT": "Asia/Karachi",
			"PNT": "America/Phoenix",
			"PRT": "America/Puerto_Rico",
			"PST": "America/Los_Angeles",
			"SST": "Pacific/Guadalcanal",
			"VST": "Asia/Ho_Chi_Minh"
		};
		
		/**
		 * Returns a valid time zone name compensating for ambiguous time zones.
		 * Defaults to UTC if an unsupported value is provided.
		 */
		modelUtil.checkTzName = function(tzName) {
			if (!tzName)
				return;
			// Supported values
			if (moment.tz.zone(tzName) != null)
				return tzName;
			// Ambiguous values
			if (typeof SHORT_IDS[tzName] !== "undefined")
				return SHORT_IDS[tzName];
			// Unknown values
			return "UTC";
		};
		
		var dstOffset = {};
		/**
		 * Get the DST offset for a timezone for a given timestamp.
		 * Takes into account offsets which are not 1 hour, years/locals without DST etc.
		 * 
		 * timestamp: UTC timestamp
		 * tzName: name of the timezone.  Defaults to local zone if not present.
		 */
		 modelUtil.getDSTOffset = function(timestamp, tzName) {
			var year = new Date(timestamp).getFullYear();
			tzName = this.checkTzName(tzName);
			
			var tzKey = (tzName ? tzName : 'local') + "/" + year;
			var jan = new Date(year, 0, 1);
			
			if (dstOffset[tzKey])
				return dstOffset[tzKey];
			
			if (!tzName) {
				for (var i = 1; i < 12; i++) {
					dstOffset[tzKey] = Math.abs(jan.getTimezoneOffset() - (new Date(year,i,1)).getTimezoneOffset());
					if (dstOffset[tzKey] != 0)
						break;
				}
				
				return dstOffset[tzKey];
			}
			
			// Same as above but for a defined timezone.
			var zone = moment.tz.zone(tzName);
			for (var i = 1; i < 12; i++) {
				dstOffset[tzKey] = Math.abs(zone.offset(jan.getTime()) - zone.offset((new Date(year, i, 1)).getTime()));
				if (dstOffset[tzKey] != 0)
					break;
			}
			return dstOffset[tzKey];
		};
		
		/**
		 * Returns the MS difference between the client local time zone offset and the provided time zone offset.
		 * 
		 * timestamp: UTC timestamp
		 * tzName: name of the timezone.  Defaults to local offset if not present.
		 */
		modelUtil.getTzToLocalMSDiff = function(timestamp, tzName) {
			if (!tzName)
				return 0; // No difference if no time zone.
			
			return (moment.tz.zone(this.checkTzName(tzName)).offset(timestamp) * TIME.MINUTE * -1) -
				   ((new Date(timestamp)).getTimezoneOffset() * TIME.MINUTE * -1);
		};
		
		/**
		 * Patch object with values from record watcher/table API format
		 * Adds in 'value_ms' UTC millisecond value for recognised dates
		 */
		modelUtil.patchObject = function(obj, patch) {
			for (var attr in patch) {
				obj[attr] = patch[attr];
				modelUtil.addValueMS(obj[attr]);
			}
		};
		
		/**
		 * Adds a value_ms to a date time field.
		 */
		modelUtil.addValueMS = function(element) {
			function strToMS(strDate) {
				var dtComp = strDate.split(" ");
				var dComp = dtComp[0].split("-"); //y0, m1, d2
				var tComp = dtComp[1].split(":"); //h0, mi1, s2
				return Date.UTC(dComp[0], dComp[1]-1, dComp[2], tComp[0], tComp[1], tComp[2]);
			}
			
			function strYMDToMS(strYMD) {
				var dComp = strYMD.split("-");
				return Date.UTC(dComp[0], dComp[1]-1, dComp[2]);
			}
			
			// If the value matches a date stamp, add a conversion to MS.
			if (typeof element.value === "string") {
				if (element.value.match(DATE_RX))
					element.value_ms = strToMS(element.value);
				else if (element.value.match(YMD_RX))
					element.value_ms = strYMDToMS(element.value);
				else
					return; //If it's not a date
			} else
				return; // If it's not a string
			
			// Create a forced TZ display_value_ms
			if (element.tz_name && element.value_ms) {
				element.display_value_ms = element.value_ms + modelUtil.getTzToLocalMSDiff(element.value_ms, element.tz_name);
				
				// Adjust display value MS for DST if the value and display value span DST changeover
				var dispInDST = moment(element.display_value_ms).isDST();
				var valInDST = moment(element.value_ms).isDST();
				if (dispInDST && !valInDST)
					element.display_value_ms -= (this.getDSTOffset(element.value_ms) * TIME.MINUTE);
				else if (!dispInDST && valInDST)
					element.display_value_ms += (this.getDSTOffset(element.value_ms) * TIME.MINUTE);
			}
			
		};
		
		/**
		 * Add a value_ms to all date time fields in record
		 */
		modelUtil.addValueMSToAll = function(record) {
			for (var attr in record)
				modelUtil.addValueMS(record[attr]);
		};
		
		/**
		 * Adds from now/to now display value as display_value_friendly
		 */
		modelUtil.addFriendlyDisplayValue = function(element) {
			if (!element.value_ms)
				modelUtil.addValueMS(element);
			
			if (element.value_ms) { // Check if we actually have an ms value
				if (element.value_ms > Date.now())
					element.display_value_friendly = moment(element.value_ms).toNow();
				else
					element.display_value_friendly = moment(element.value_ms).fromNow();
			}
		};
		
		/**
		 * Adds a from now/to now display value to all date elements
		 */
		modelUtil.addFriendlyDisplayValueToAll = function(record) {
			for (var attr in record)
				modelUtil.addFriendlyDisplayValue(record[attr]);
		};
		
		/**
		 * Converts a GlideList representation to JS array.
		 */
		modelUtil.glideListToArray = function(element) {
			if(!angular.isArray(element.display_value)) {
				if (element.display_value && typeof element.display_value === "string")
					element.display_value = element.display_value.split(DEFAULT_GLIDE_LIST_SEPARATOR);
				else
					element.display_value = [];
			}

			if(angular.isArray(element.value))
				return;

			if (element.value && typeof element.value === "string")
				element.value = element.value.split(",");
			else
				element.value = [];
		};

		/**
		 * Simple fail function for REST requests
		 */
		modelUtil.failNicely = function(response) {
			$log.info("REST Failure");
			$log.info(response);
			
			if (!(response.data && response.data.error))
				return;

			//If we have any error info try and get any messages
			$http.get(SNAPI.SERVICE.NOTIFICATION).then(function(response) {
				if (response.data.result)
					response.data.result.forEach(function(err){
						$rootScope.$broadcast("$$uiNotification", {type: err.type, message: err.text});
					});
			},
			function(response) {
				$log.info("Notification Failure");
				$log.info(response);
			});
		};
	}]);