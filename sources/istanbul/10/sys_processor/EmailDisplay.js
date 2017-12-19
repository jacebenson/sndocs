var EMAIL_VERSION_HEADER_NAME = "X-ServiceNow-SysEmail-Version:";
var TEXT_HTML = "text/html; charset=utf-8";
var STYLE = "<style> body {"+ gs.getProperty("glide.ui.activity.style.email") + "}</style>";
var TOP_HTML = '<base target="_blank"/>' + STYLE;

	
var SecurityUtil = new GlideSecurityUtils();
process();

function process() {
  var email_id = g_request.getParameter("email_id");
  var emailRecord = new GlideRecord("sys_email");
  if (emailRecord.get(email_id)) {
    showEmail(emailRecord);
  } else
    g_processor.writeOutput("No such email");
}

function showEmail(emailRecord) {
  if (getParentRecord(emailRecord)) {
    if (getEmailVersion(emailRecord) == 2)
      writeBody(emailRecord);
    else
      writeBodyLegacy(emailRecord);   
  }
}

function writeBody(emailRecord) {
	if (!JSUtil.nil(emailRecord.body))
    g_processor.writeOutput(TEXT_HTML,TOP_HTML + SecurityUtil.escapeScript(emailRecord.body))
  else if (!JSUtil.nil(emailRecord.body_text))
    g_processor.writeOutput("text/plain", emailRecord.body_text);
}

function writeBodyLegacy(emailRecord) {
   var content_type = emailRecord.content_type.replace(/(\r+)(\n+)|(\n+)(\r+)|(\n+)|(\r+)/g, " ");
    if (content_type.startsWith("multipart")) {
      var unfoldedHeader = emailRecord.headers.replace(/\r\n\s/g, "");
      var multipleContentTypes = unfoldedHeader.match(/MultipartContentTypes.*/i);
      if (multipleContentTypes && multipleContentTypes.toString().toUpperCase().indexOf("TEXT/HTML") == -1)
        content_type = "text/plain";
	  else {
        content_type = TEXT_HTML;
		}
    }
	var body = SecurityUtil.escapeScript(emailRecord.body);
	if(content_type == TEXT_HTML)
		body = TOP_HTML + body;
	
    g_processor.writeOutput(content_type, body);
}

function getParentRecord(emailRecord) {
  var table = emailRecord.target_table;
  if (table) {
    var emailParentRecord = new GlideRecord(table);
    if (emailParentRecord.get(emailRecord.instance)){
      if (emailParentRecord.canRead())
        return emailParentRecord;
      else
        g_processor.writeOutput("No access");
    } else
      g_processor.writeOutput("No such parent record");
  } else
    g_processor.writeOutput(TEXT_HTML, SecurityUtil.escapeScript(emailRecord.body));
}

function getEmailVersion(emailRecord) {
  var emailVersionHeaderLine = emailRecord.headers.match(/X-ServiceNow-SysEmail-Version.*/i) + "";
  if (JSUtil.nil(emailVersionHeaderLine))
    return 1;

  var version = emailVersionHeaderLine.substring(EMAIL_VERSION_HEADER_NAME.length).trim();
  return version.valueOf();
}