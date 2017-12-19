function doit() {
    var aj = new GlideAjax("CMSAjax");
    aj.addParam("sysparm_name", "pageLink");
    aj.addParam("sysparm_value", rowSysId);
    aj.getXMLAnswer(doitresponse);
}

function doitresponse(answer) {
    window.open(answer);
}