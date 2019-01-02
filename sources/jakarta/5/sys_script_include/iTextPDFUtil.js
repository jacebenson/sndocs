/**
 * The purpose of this file is to consolidate ALL PDF commands into one place.
 * Any commands that need to interact with the PDF API directly should go here if possible.
 */
var iTextPDFUtil = Class.create();
//iTextPDFUtil.iTextPDF = GeneralFormJava.iTextPDF;
iTextPDFUtil.PdfName = GeneralFormJava.PdfName;
iTextPDFUtil.PDFTable = GeneralFormJava.PDFTable;
iTextPDFUtil.PDFCell = GeneralFormJava.PDFCell;
iTextPDFUtil.PDFPhrase = GeneralFormJava.PDFPhrase;
iTextPDFUtil.Color = GeneralFormJava.Color;
iTextPDFUtil.Border = GeneralFormJava.PdfBorderDictionary;
iTextPDFUtil.Element = GeneralFormJava.Element;
iTextPDFUtil.Rectangle = GeneralFormJava.Rectangle;
iTextPDFUtil.HTMLWorker = GeneralFormJava.HTMLWorker;
iTextPDFUtil.PageSize = GeneralFormJava.PageSize;
iTextPDFUtil.Document = GeneralFormJava.Document;
iTextPDFUtil.ColumnText = GeneralFormJava.ColumnText;
iTextPDFUtil.FontFamily = GeneralFormJava.FontFamily;
iTextPDFUtil.Font = GeneralFormJava.Font;
iTextPDFUtil.BaseFont = GeneralFormJava.BaseFont;
//iTextPDFUtil.BaseColor = GeneralFormJava.BaseColor;
iTextPDFUtil.PdfPageEventHelper = GeneralFormJava.PdfPageEventHelper;
iTextPDFUtil.PdfWriter = GeneralFormJava.PdfWriter;
iTextPDFUtil.Image = GeneralFormJava.Image;
iTextPDFUtil.SvgToPdf = GeneralFormJava.SvgToPdf;

iTextPDFUtil.STATICS = {
	// CSS maps to com.itextpdf.text.Rectangle	
	COLOR: {		
		black: iTextPDFUtil.Color.BLACK,
		blue: iTextPDFUtil.Color.BLUE,
		cyan: iTextPDFUtil.Color.CYAN,
		darkgrey: iTextPDFUtil.Color.DARK_GRAY,	
		gray: iTextPDFUtil.Color.GRAY,
		green: iTextPDFUtil.Color.GREEN,
		lightgrey: iTextPDFUtil.Color.LIGHT_GRAY,
		magenta: iTextPDFUtil.Color.MAGENTA,
		orange: iTextPDFUtil.Color.ORANGE,
		pink: iTextPDFUtil.Color.PINK,
		red: iTextPDFUtil.Color.RED,	
		white: iTextPDFUtil.Color.WHITE,
		yellow: iTextPDFUtil.Color.YELLOW//,
		//lightblue : iTextPDFUtil.Color(0x99CCFF)
	},	
	STYLE: {			
		'border-color': ['setBorderColor', 'COLOR'],
		'border-width': ['setBorder', 'PX'],		
		'border-style': ['', 'BORDER'],
		'background-color': ['setBackgroundColor', 'COLOR'],
		//'height': ['', 'PX'],
	},
	PX:{
		'0px': 0.0,
		'1px': 1.0,
		'2px': 2.0,
		'3px': 3.0,
	},
	
	ALIGN:{
		//top:'',
		//bottom:''
	    left   : iTextPDFUtil.Element.ALIGN_LEFT,
	    center : iTextPDFUtil.Element.ALIGN_CENTER,
	    right  : iTextPDFUtil.Element.ALIGN_RIGHT
	},
	BORDER: {
		solid: iTextPDFUtil.Border.STYLE_SOLID,			
		dashed: iTextPDFUtil.Border.STYLE_DASHED,
		inset: iTextPDFUtil.Border.STYLE_INSET,
		//iTextPDFUtil.Border.STYLE_UNDERLINE
		//iTextPDFUtil.Border.STYLE_BEVELED,
		
		NO_BORDER                : 0,
	    RIGHT_BORDER             : 1,
	    LEFT_BORDER              : 2,
	    TOP_BORDER               : 3,
	    BOTTOM_BORDER            : 4,
	    RIGHT_LEFT_BORDER        : 5,
	    RIGHT_TOP_BORDER         : 6,
	    RIGHT_BOTTOM_BORDER      : 7,
	    LEFT_TOP_BORDER          : 8,
	    LEFT_BOTTOM_BORDER       : 9,
	    TOP_BOTTOM_BORDER        : 10,
	    LEFT_TOP_RIGHT_BORDER    : 11,
	    LEFT_BOTTOM_RIGHT_BORDER : 12,
	    TOP_RIGHT_BOTTOM_BORDER  : 13,
	    TOP_LEFT_BOTTOM_BORDER   : 14,
	    FOUR_SIDES_BORDER        : 15,
	},
	
	WIDTH: {},	
	
	HTMLWORKER : {
		SUPPORTED_TAGS : [ 'html', 'table', 'tbody', 'h5', 'sub', 'h6', 'p', 'tr',
				'th', 'font', 'h2', 'td', 'i', 'div', 'a', 'ul', 'u',
				'h4', 'body', 's', 'pre', 'sup', 'h1', 'b', 'em',
				'strong', 'strike', 'br', 'li', 'h3', 'span', 'ol' ]
		
		// Supposed to be supported but not working...
		//'hr', ==> because the WYSIWYG is rendering <hr>. Need to replace with <hr />
		
		// 'img', ==> The WYSIWYG creates relative paths which the PDF cannot see
		// and it breaks the PDF render. Until the PDF is parsing smaller blocks
		// of HTML i can not catch these exceptions to skip them yet.
		// When adding the page break feature the parsing will happen in small blocks
		// then i can put "img" back.  If you does not put absolute path it will be skipped
	}
};
/**
 * USAGE EXAMPLE:
 * 
 * <pre>
 * var pdfUtil = new iTextPDFUtil();
 * var font = pdfUtil.getFont();
 * var capFont = pdfUtil.getCaptionFont();
 * var bFont = pdfUtil.getBoldFont();
 * </pre>
 * 
 */
iTextPDFUtil.prototype = {
			
	initialize: function(){
		//this.iTextPDF = iTextPDFUtil.iTextPDF;
	},
	
	/**
	 * Base font for all text in the table
	 * 
	 * @returns
	 */
	getFont: function(si, st, cr, fm){
		//return ITextPDFUtil.Font(ITextPDFUtil.BaseFonts.helvetica, 8, ITextPDFUtil.BaseWeights.italic, {r: 0, g: 0, b: 255});
		var family = new iTextPDFUtil.FontFamily().HELVETICA;
		
		var size = 10;
		
		var style = iTextPDFUtil.Font.NORMAL;
		
		
		
	    // var color = new iTextPDFUtil.BaseColor(0, 0, 0);   //leon
		var color = (new iTextPDFUtil.Color(0x000000)); 
		
		if (si) {
			size = si;
		}
		
		if (st) {
			style = st;
		}
		
		if (cr) {
			color = cr;
		}
		
		if (fm) {
			family = fm;
		}
		
		return new iTextPDFUtil.Font(family, size, style, color);
		//return ITextPDFUtil.Font(ITextPDFUtil.BaseFonts.helvetica, 8, ITextPDFUtil.BaseWeights.italic, ITextPDFUtil.BaseColor(0,0,0));
	},
	
	getCaptionFont: function(){
		return this.getFont(12);
	},
	
	getBoldFont: function(){
		var boldStyle = iTextPDFUtil.Font.BOLD;
		return this.getFont(null, boldStyle);
	},
	
	type: 'iTextPDFUtil'
};

/**
 * 
 * <pre>
 * var styles = 'border-color:blue;color:red;width:100%';
 * var s = new iTextPDFUtil.Styles(styles);
 * while(s.next()){	
 *		var style = new iTextPDFUtil.Style(s.get());	
 * 		gs.print(style.getCommand()+' = '+style.getValue());
 * 		if(style.getPDFCommand())
 * 			gs.print(style.getPDFCommand()+' = '+style.getPDFValue());
 * }
 * </pre>
 * 
 * @param styles "border-color:blue;color:red;width:100%;"
 */
iTextPDFUtil.Styles = function(styles){
	this._index = 0;
	this._styles = null;
	
	if(styles){
		this._styles = styles.split(';');
	}
	
	this.next = function(){
		if(!this._styles || this._index >= this._styles.length){
			return false;
		}
		this._index += 1;
		return true;
	};
	
	this.get = function(){
		return this._styles[this._index-1];
	};
	
	this.type = 'iTextPDFUtil.Styles';
};

/**
 * 
 * <pre>
 * var s = 'border-color:blue';
 * var x = new iTextPDFUtil.Style(s);
 * gs.print(x.getCommand());
 * gs.print(x.getValue());
 * </pre>
 * 
 * @param style "border-color:blue"
 */
iTextPDFUtil.Style = function(style){	
	this._command = null;
	this._value = null;	
	this._pdfCommand = null;
	this._pdfValue = null;
	
	if(style){
		var s = style.split(':');
		this._command = s[0]+'';
		var styleValue = s[1]+'';
		this._value = styleValue.replaceAll(' ','');
		
		var pdfStyle = iTextPDFUtil.STATICS.STYLE[this._command];	
		
		if(pdfStyle){
			this._pdfCommand = pdfStyle[0];		
			this._pdfValue = iTextPDFUtil.STATICS[pdfStyle[1]][this._value];
		}
	}
	
	this.getCommand = function(){
		return this._command;
	};
	
	this.getValue = function(){
		return this._value;
	};
	
	this.getPDFCommand = function(){
		return this._pdfCommand;
	};
	
	this.getPDFValue = function(){
		return this._pdfValue;
	};
	
	this.type = 'iTextPDFUtil.Style';
};

/**
 * This essentially needs to function as or be replaced by a CSS parser because
 * really thats all we need to do here is return the cssText string that can
 * be applied to a HTMLElement.
 * 
 * Applying the exact same look & feel to the PDF using the cssText is handled
 * by iTextPDFUtil.addStyle method.
 * 
 * @param elementId
 * @param css
 * @returns {String}
 */
//This is used to set styles in-line / style-tag on HTML Element to add to PDF
iTextPDFUtil.getInLineStyle = function(elementId, css){
	var style = '';
	if(css){
		var styles = css[elementId];		
		for(var name in styles){
			if(styles.hasOwnProperty(name)){
				style += name+': '+styles[name]+';';
			}
		}
	}
	return style;
};

/**
 * This will apply style to a PDF Cell.
 * 
 * <pre>
 * var css_object = {
 * 		my_element_name: {
 * 			'border-color':'blue', 'height': '25px'
 * 		}
 * };
 * var style = iTextPDFUtil.getInLineStyle('my_element_name', css_object);
 * var cell = new iTextPDFUtil.PDFCell(new iTextPDFUtil.PDFPhrase('My Cell'));
 * iTextPDFUtil.addStyle(style, cell);
 * </pre>
 * 
 * @param style
 * @param pdfCell
 */
iTextPDFUtil.addStyle = function(styles , pdfCell){
	var debug = new GeneralDebug('iTextPDFUtil.addStyle');
	
	debug.log('styles = '+styles);		
	
	var stls = new iTextPDFUtil.Styles(styles);

	while(stls.next()){
		
		var s = new iTextPDFUtil.Style(stls.get());
		
		var styleCommand = s.getCommand();
		var styleValue = s.getValue();
		var pdfCommand = s.getPDFCommand();
		var pdfValue = s.getPDFValue();
		
		debug.log('Command = '+styleCommand);		
		debug.log('Value = '+styleValue);
		debug.log('PDF Command = '+pdfCommand);
		debug.log('PDF Value = '+pdfValue);
				
		if(pdfCell && pdfCommand && pdfValue){
			
			pdfCell[pdfCommand](pdfValue);
		}
	}
	
	debug.write();
};