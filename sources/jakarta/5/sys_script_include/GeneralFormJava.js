/**
*
* All JAVA Classes used by the application are defined here.
*
*/
var GeneralFormJava = Class.create();

/**
* PDF API Suite
*/

//GeneralFormJava.iTextPDF = SNC.itextpdf;
GeneralFormJava.PdfName = SNC.PdfNameWrapper;
GeneralFormJava.PDFTable = SNC.PdfPTableWrapper;
GeneralFormJava.PDFCell = SNC.PdfPCellWrapper;
GeneralFormJava.PDFPhrase = SNC.PhraseWrapper;
GeneralFormJava.Color = SNC.BaseColorWrapper;
GeneralFormJava.PdfBorderDictionary = SNC.PdfBorderDictionaryWrapper;
GeneralFormJava.Element = SNC.ElementWrapper;
GeneralFormJava.Rectangle = SNC.RectangleWrapper;
GeneralFormJava.HTMLWorker = SNC.HTMLWorkerWrapper;
GeneralFormJava.PageSize = SNC.PageSizeWrapper;
GeneralFormJava.Document = SNC.DocumentWrapper;
GeneralFormJava.ColumnText = SNC.ColumnTextWrapper;
GeneralFormJava.FontFamily = SNC.FontFamilyWrapper;
GeneralFormJava.Font = SNC.FontWrapper;
GeneralFormJava.BaseFont = SNC.BaseFontWrapper;
GeneralFormJava.BaseColor = SNC.BaseColorWrapper;
GeneralFormJava.PdfPageEventHelper = SNC.PdfPageEventHelperWrapper;
GeneralFormJava.PdfWriter = SNC.PdfWriterWrapper;
GeneralFormJava.Image = SNC.ImageWrapper;
GeneralFormJava.PdfParser = SNC.PdfParserWrapper;
GeneralFormJava.SvgToPdf = SNC.SvgToPdf;

GeneralFormJava.ByteArrayOutputStream = Packages.java.io.ByteArrayOutputStream;
GeneralFormJava.StringReader = Packages.java.io.StringReader;
GeneralFormJava.ByteArrayInputStream = Packages.java.io.ByteArrayInputStream;

GeneralFormJava.SysAttachment = GlideSysAttachment;
GeneralFormJava.Relationship = GlideRelationship;
GeneralFormJava.GlideXMLUtil = GlideXMLUtil;
GeneralFormJava.GlideStringUtil = GlideStringUtil;


GeneralFormJava.prototype = {
    initialize: function() {
    },

    type: 'GeneralFormJava'
};