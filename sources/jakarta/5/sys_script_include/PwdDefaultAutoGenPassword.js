var PwdDefaultAutoGenPassword = Class.create();
PwdDefaultAutoGenPassword.prototype = {
	category: 'password_reset.extension.password_generator',    // DO NOT REMOVE THIS LINE!
	
	initialize: function() {
	},
	
	/*
 	 * Returns an auto-generated string password
 	 *
 	 * @param params.credentialStoreId The sys-id of the calling password-reset process (table: pwd_process)
 	 * @return An auto-generated string password.
 	 */
	process: function(params) {
		return this.generatePassword(params.credentialStoreId);
	},
	
	/*
 	 * function generatePassword
 	 *
 	 * returns a string with a randomaly generated password
 	 */
	generatePassword: function(processId) {
		// Randomly select a word from the list:
		var wordIdx = GlideSecureRandomUtil.getSecureRandomIntBound(this._words.length);
		var selectedWord = this._words[wordIdx];
		
		// Randomly uppercase one of the characters:
		var charIdx = GlideSecureRandomUtil.getSecureRandomIntBound(selectedWord.length);
		var pwd = "";
		for (var i = 0; i < selectedWord.length; i++) {
			if (i == charIdx) {
				pwd += selectedWord.charAt(i).toUpperCase();
			} else {
				pwd += selectedWord.charAt(i);
			}
		}
		
		// Add random 4 digits (with no 3-digit repeats and not 3-digit sequences)
		var digitsStr = "";
		var prevDigit = -2;
		var incrDigit = false;
		var decrDigit = false;
		var sameDigit = false;
		for (i = 0; i < 4; i++) {
			var digit;
			do {
				digit = GlideSecureRandomUtil.getSecureRandomIntBound(10);
			} while ((sameDigit && (digit == prevDigit)) ||
					 (incrDigit && (digit == prevDigit + 1)) ||
					 (decrDigit && (digit == prevDigit - 1)));
			
			sameDigit = (digit == prevDigit);
			incrDigit = (digit == prevDigit + 1);
			decrDigit = (digit == prevDigit - 1);
		
			digitsStr += digit;
			prevDigit = digit;
		}
		pwd += digitsStr;
		
		// Add a random special charecter:
		var specialCaracters = "!@#$%&*?+-=";
			pwd += specialCaracters.charAt(GlideSecureRandomUtil.getSecureRandomIntBound(specialCaracters.length));
			
			return pwd;
		},

		// List of 500 words to use for randomally generating a password:
		_words: [
		"ability", "absence", "academy", "account", "accused", "achieve", "acquire", "address", "advance", "adverse",
		"advised", "adviser", "against", "airline", "airport", "alcohol", "alleged", "already", "analyst", "ancient",
		"another", "anxiety", "anxious", "anybody", "applied", "arrange", "arrival", "article", "assault", "assumed",
		"assured", "attempt", "attract", "auction", "average", "backing", "balance", "banking", "barrier", "battery",
		"bearing", "beating", "because", "bedroom", "believe", "beneath", "benefit", "besides", "between", "billion",
		"binding", "brother", "brought", "burning", "cabinet", "caliber", "calling", "capable", "capital", "captain",
		"caption", "capture", "careful", "carrier", "caution", "ceiling", "central", "centric", "century", "certain",
		"chamber", "channel", "chapter", "charity", "charlie", "charter", "checked", "chicken", "chronic", "circuit",
		"classes", "classic", "climate", "closing", "closure", "clothes", "collect", "college", "combine", "comfort",
		"command", "comment", "compact", "company", "compare", "compete", "complex", "concept", "concern", "concert",
		"conduct", "confirm", "connect", "consent", "consist", "contact", "contain", "content", "contest", "context",
		"control", "convert", "correct", "council", "counsel", "counter", "country", "crucial", "crystal", "culture",
		"current", "cutting", "dealing", "decided", "decline", "default", "defence", "deficit", "deliver", "density",
		"deposit", "desktop", "despite", "destroy", "develop", "devoted", "diamond", "digital", "discuss", "disease",
		"display", "dispute", "distant", "diverse", "divided", "drawing", "driving", "dynamic", "eastern", "economy",
		"edition", "elderly", "element", "engaged", "enhance", "essence", "evening", "evident", "exactly", "examine",
		"example", "excited", "exclude", "exhibit", "expense", "explain", "explore", "express", "extreme", "factory",
		"faculty", "failing", "failure", "fashion", "feature", "federal", "feeling", "fiction", "fifteen", "filling",
		"finance", "finding", "fishing", "fitness", "foreign", "forever", "formula", "fortune", "forward", "founder",
		"freedom", "further", "gallery", "gateway", "general", "genetic", "genuine", "gigabit", "greater", "hanging",
		"heading", "healthy", "hearing", "heavily", "helpful", "helping", "herself", "highway", "himself", "history",
		"holding", "holiday", "housing", "however", "hundred", "husband", "illegal", "illness", "imagine", "imaging",
		"improve", "include", "initial", "inquiry", "insight", "install", "instant", "instead", "intense", "interim",
		"involve", "jointly", "journal", "journey", "justice", "justify", "keeping", "killing", "kingdom", "kitchen",
		"knowing", "landing", "largely", "lasting", "leading", "learned", "leisure", "liberal", "liberty", "library",
		"license", "limited", "listing", "logical", "loyalty", "machine", "manager", "married", "massive", "maximum",
		"meaning", "measure", "medical", "meeting", "mention", "message", "million", "mineral", "minimal", "minimum",
		"missing", "mission", "mistake", "mixture", "monitor", "monthly", "morning", "musical", "mystery", "natural",
		"neither", "nervous", "network", "neutral", "notable", "nothing", "nowhere", "nuclear", "nursing", "obvious",
		"offense", "officer", "ongoing", "opening", "operate", "opinion", "optical", "organic", "outcome", "outdoor",
		"outlook", "outside", "overall", "pacific", "package", "painted", "parking", "partial", "partner", "passage",
		"passing", "passion", "passive", "patient", "pattern", "payable", "payment", "penalty", "pending", "pension",
		"percent", "perfect", "perform", "perhaps", "phoenix", "picking", "picture", "pioneer", "plastic", "pointed",
		"popular", "portion", "poverty", "precise", "predict", "premier", "premium", "prepare", "present", "prevent",
		"primary", "printer", "privacy", "private", "problem", "proceed", "process", "produce", "product", "profile",
		"program", "project", "promise", "promote", "protect", "protein", "protest", "provide", "publish", "purpose",
		"pushing", "qualify", "quality", "quarter", "radical", "railway", "readily", "Reading", "reality", "realize",
		"receipt", "receive", "recover", "reflect", "regular", "related", "release", "remains", "removal", "removed",
		"replace", "request", "require", "reserve", "resolve", "respect", "respond", "restore", "retired", "revenue",
		"reverse", "rollout", "routine", "running", "satisfy", "science", "section", "segment", "serious", "service",
		"serving", "session", "setting", "seventh", "several", "shortly", "showing", "silence", "silicon", "similar",
		"sitting", "sixteen", "skilled", "smoking", "society", "somehow", "someone", "speaker", "special", "species",
		"sponsor", "station", "storage", "strange", "stretch", "student", "studied", "subject", "succeed", "success",
		"suggest", "summary", "support", "suppose", "supreme", "surface", "surgery", "surplus", "survive", "suspect",
		"sustain", "teacher", "telecom", "telling", "tension", "theatre", "therapy", "thereby", "thought", "through",
		"tonight", "totally", "touched", "towards", "traffic", "trouble", "turning", "typical", "uniform", "unknown",
		"unusual", "upgrade", "upscale", "utility", "variety", "various", "vehicle", "venture", "version", "veteran",
		"victory", "viewing", "village", "violent", "virtual", "visible", "waiting", "walking", "wanting", "warning",
		"warrant", "wearing", "weather", "webcast", "website", "wedding", "weekend", "welcome", "welfare", "western",
		"whereas", "whereby", "whether", "willing", "winning", "without", "witness", "working", "writing", "written"
		],
		
		type: 'PwdDefaultAutoGenPassword'
	};