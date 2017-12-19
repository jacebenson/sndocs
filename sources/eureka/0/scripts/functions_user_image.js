function saveUserImage(tableName, gotourl) {
  var form = document.forms[tableName + '.do'];
  var viewwidget = form['sysparm_view'];
  if (viewwidget)
    gotourl += '&sysparm_view=' + viewwidget.value;
  form.sys_action.value = 'sysverb_check_save';
  addInput(form, 'HIDDEN', 'sysparm_goto_url', gotourl);
  var okToSubmit = true;
  if (typeof form.onsubmit == "function")
    okToSubmit = form.onsubmit();
  if (okToSubmit)
    form.submit();
  return false;
}

function validateVideoFileName(fileExtensions) {
  var action = $('sys_action');
  if ('sysverb_cancel' == action.value)
    return true;
  var widget = $("attachFile");
  if (!widget)
    return false;
  var filename = widget.value;
  var isvalid = endsWithVideoExtension(filename, fileExtensions);
  if (!isvalid) {
    alert(filename + " isn't a recognized video format");
  }
  return isvalid;
}

function endsWithVideoExtension(filename, fileExtensions) {
  var extensionArray = fileExtensions.split(",");
  var dot = filename.lastIndexOf('.') + 1;
  var suffix = filename.substring(dot);
  suffix = suffix.toLowerCase();
  for (var i = 0; i < extensionArray.length; i++) {
    var element = extensionArray[i];
    if (element == suffix)
      return true;
  }
  return false;
}

function validateImageFileName() {
  var action = $('sys_action');
  if ('sysverb_cancel' == action.value)
    return true;
  var widget = $("attachFile");
  if (!widget)
    return false;
  var filename = widget.value;
  var isvalid = endsWithImageExtension(filename);
  if (!isvalid) {
    alert(filename + " isn't a recognized image file format");
  }
  return isvalid;
}
var VALID_IMAGE_SUFFIX = ["jpg", "jpeg", "png", "bmp", "gif", "ico"];

function endsWithImageExtension(filename) {
  var dot = filename.lastIndexOf('.') + 1;
  var suffix = filename.substring(dot);
  suffix = suffix.toLowerCase();
  for (var i = 0; i < VALID_IMAGE_SUFFIX.length; i++) {
    var element = VALID_IMAGE_SUFFIX[i];
    element = element.toLowerCase();
    if (element == suffix)
      return true;
  }
  return false;
}

function deleteUserImage(image_id, replacement) {
  var ajax = new GlideAjax("AttachmentAjax");
  ajax.addParam("sysparm_value", image_id);
  ajax.addParam("sysparm_type", "delete");
  ajax.getXML(doNothing);
  var image = $(image_id);
  if (image) {
    image.src = "images/s.gif";
    image.alt = "";
  }
  var delspan = $(image_id + "_delete");
  if (delspan)
    delspan.innerHTML = '';
  var addanchor = $(image_id + "_update");
  if (addanchor)
    addanchor.innerHTML = "";
  var imagespan = $(image_id + "_image");
  if (imagespan)
    imagespan.style.visibiity = "hidden";
  var noimagespan = $(image_id + "_noimage");
  if (noimagespan)
    noimagespan.style.visibility = "";
  return false;
}