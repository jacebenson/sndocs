/*! RESOURCE: /scripts/functions_user_image.js */
function saveUserImage(tableName, gotourl) {
  var sysparmRecordScope = g_form.getValue("sysparm_record_scope");
  gotourl = gotourl.replace("$sysparm_record_scope", sysparmRecordScope);
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

function validateVideoFile(fileExtensions) {
  var file = getAttachedFile();
  var isValid = validateWithExtensions(file.value, fileExtensions);
  if (!isValid) {
    alert(file.value + " isn't a recognized video format");
    file.clear();
    return false;
  }
  isValid = validateSize(file);
  return isValid;
}

function validateAudioFile(fileExtensions) {
  var file = getAttachedFile();
  var isValid = validateWithExtensions(file.value, fileExtensions);
  if (!isValid) {
    alert(file.value + " isn't a recognized audio format");
    file.clear();
    return false;
  }
  isValid = validateSize(file);
  return isValid;
}

function getAttachedFile() {
  var widget = $("attachFile");
  if (!widget)
    return false;
  return widget;
}

function validateWithExtensions(fileName, fileExtensions) {
  var action = $('sys_action');
  if ('sysverb_cancel' == action.value)
    return true;
  return endsWithVideoExtension(fileName, fileExtensions);
}

function endsWithVideoExtension(fileName, fileExtensions) {
  var extensionArray = fileExtensions.split(",");
  var dot = fileName.lastIndexOf('.') + 1;
  var suffix = fileName.substring(dot);
  suffix = suffix.toLowerCase();
  for (var i = 0; i < extensionArray.length; i++) {
    var element = extensionArray[i];
    if (element == suffix)
      return true;
  }
  return false;
}

function validateImageFile() {
  var action = $('sys_action');
  if ('sysverb_cancel' == action.value)
    return true;
  var file = getAttachedFile();
  var isValid = endsWithImageExtension(file.value);
  if (!isValid) {
    alert(file.value + " isn't a recognized image file format");
    file.clear();
    return false;
  }
  var hasValidSize = validateSize(file);
  return hasValidSize;
}
var VALID_IMAGE_SUFFIX = ["jpg", "jpeg", "png", "bmp", "gif", "ico", "svg"];

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

function getDisplaySize(sizeInBytes) {
  var kilobytes = Math.round(sizeInBytes / 1024);
  if (kilobytes < 1)
    kilobytes = 1;
  var reportSize = kilobytes + "K";
  if (kilobytes > 1024)
    reportSize = Math.round(kilobytes / 1024) + "MB";
  return reportSize;
}

function validateSize(input) {
  var form = $('attach_new_file');
  var maxSize = (form.max_size && form.max_size.value) ? form.max_size.value : 0;
  var file = input.files[0];
  var allowedSize = maxSize * 1048576;
  var warningString = "";
  if (file.size == 0) {
    warningString += "Attachment is empty";
  }
  if (file.size > allowedSize) {
    warningString += file.name + " is " + getDisplaySize(file.size) + ". The maximum file size is " + getDisplaySize(allowedSize) + ".\n";
  }
  if (warningString != "") {
    alert(warningString);
    input.clear();
    return false;
  }
  return true;
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
};