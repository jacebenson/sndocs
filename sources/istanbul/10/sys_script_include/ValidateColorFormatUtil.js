var ValidateColorFormatUtil = Class.create();
ValidateColorFormatUtil.prototype = {
    initialize: function() {
		this.prefix = "^\\s*";
		this.postfix = "\\s*$";
		//0-255
		this.p255 = "\\s*([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\\s*";
		//0-100%
		this.p100 = "\\s*([0-9]|100|[1-9][0-9])%\\s*";
		//0-360
		this.p360 = "\\s*([0-9]|[1-9][0-9]|[1-2][0-9][0-9]|3[0-5][0-9]|360)\\s*";
		//0.0-1.0
		this.p10 = "\\s*(0|0\\.[0-9]+|1|1.0+)\\s*";		
    },

	//hex, eg, #ff000c
	validHexColor : function(str) {
		var pHex = this.prefix  + "#([0-9]|[a-f]|[A-F]){6}" + this.postfix;
		return (new RegExp(pHex,"i").test(str));
	},

	//rgb, eg, rgb(255,0,0) or rgb(100%,0%,0%)
	validRGBColor : function(str) {
		var pRGB = this.prefix + "rgb\\(" + this.p255 + "," + this.p255 + "," + this.p255 + "\\)" + this.postfix;
		var pRGB1 = this.prefix + "rgb\\(" + this.p100 + ","  + this.p100 + "," + this.p100 + "\\)" + this.postfix;
		return (new RegExp(pRGB,"i").test(str)) || (new RegExp(pRGB1,"i").test(str));
	},
	
	//rgba, eg, rgba(255,0,0,0.3) or rgba(100%,0%,0%,0.3)
	validRGBAColor : function(str) {
		var pRGBA = this.prefix + "rgba\\(" + this.p255 + "," + this.p255 + ","  + this.p255 + ","  + this.p10 + "\\)" + this.postfix;
		var pRGBA1 = this.prefix + "rgba\\(" + this.p100 + "," + this.p100 + "," + this.p100 + ","  + this.p10 + "\\)" + this.postfix;
		return (new RegExp(pRGBA,"i").test(str)) || (new RegExp(pRGBA1,"i").test(str));
	},	
	
	//hsl, eg, hsl(120,100%,50%)
	validHslColor : function(str) {
		var pHsl = this.prefix + "hsl\\(" + this.p360 + ","  + this.p100 + "," + this.p100 + "\\)" + this.postfix;
		return (new RegExp(pHsl,"i").test(str));
	},
	
	//hsla, eg, hsla(120,60%,70%,0.3)
	validHslaColor : function(str) {
		var pHsla = this.prefix  + "hsla\\(" + this.p360 + "," + this.p100 + ","  + this.p100 + ","  + this.p10 + "\\)" + this.postfix;
		return (new RegExp(pHsla,"i").test(str));
	},
	
	//list of color names, eg, black
	validColorName : function(str) {
	var colors = "(AliceBlue|AntiqueWhite|Aqua|Aquamarine|Azure|Beige|Bisque|Black|BlanchedAlmond|Blue|BlueViolet|Brown|BurlyWood|CadetBlue|Chartreuse|Chocolate|Coral|CornflowerBlue|Cornsilk|Crimson|Cyan|DarkBlue|DarkCyan|DarkGoldenRod|DarkGray|DarkGreen|DarkKhaki|DarkMagenta|DarkOliveGreen|DarkOrange|DarkOrchid|DarkRed|DarkSalmon|DarkSeaGreen|DarkSlateBlue|DarkSlateGray|DarkTurquoise|DarkViolet|DeepPink|DeepSkyBlue|DimGray|DodgerBlue|FireBrick|FloralWhite|ForestGreen|Fuchsia|Gainsboro|GhostWhite|Gold|GoldenRod|Gray|Green|GreenYellow|HoneyDew|HotPink|IndianRed |Indigo |Ivory|Khaki|Lavender|LavenderBlush|LawnGreen|LemonChiffon|LightBlue|LightCoral|LightCyan|LightGoldenRodYellow|LightGray|LightGreen|LightPink|LightSalmon|LightSeaGreen|LightSkyBlue|LightSlateGray|LightSteelBlue|LightYellow|Lime|LimeGreen|Linen|Magenta|Maroon|MediumAquaMarine|MediumBlue|MediumOrchid|MediumPurple|MediumSeaGreen|MediumSlateBlue|MediumSpringGreen|MediumTurquoise|MediumVioletRed|MidnightBlue|MintCream|MistyRose|Moccasin|NavajoWhite|Navy|OldLace|Olive|OliveDrab|Orange|OrangeRed|Orchid|PaleGoldenRod|PaleGreen|PaleTurquoise|PaleVioletRed|PapayaWhip|PeachPuff|Peru|Pink|Plum|PowderBlue|Purple|Red|RosyBrown|RoyalBlue|SaddleBrown|Salmon|SandyBrown|SeaGreen|SeaShell|Sienna|Silver|SkyBlue|SlateBlue|SlateGray|Snow|SpringGreen|SteelBlue|Tan|Teal|Thistle|Tomato|Turquoise|Violet|Wheat|White|WhiteSmoke|Yellow|YellowGreen)" ;
		var colorName = this.prefix  + colors + this.postfix;
        return (new RegExp(colorName,"i").test(str));
    },
	
    type: 'ValidateColorFormatUtil'
}