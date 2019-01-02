// populate the 'data' variable
var gr = $sp.getRecord();
data.table = gr.getTableName();
data.sys_id = gr.getUniqueValue();

if (input && input.barcode && gr.comments.canWrite()) {
  gr.comments = "scanned: " + input.barcode;
  gr.update();
}