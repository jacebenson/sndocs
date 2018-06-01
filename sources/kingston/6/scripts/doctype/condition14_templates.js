/*! RESOURCE: /scripts/doctype/condition14_templates.js */
function addTextArea(td, dValue) {
  if (!useTextareas)
    return addTextInput(td, dValue);
  var input = cel("textarea");
  td.fieldType = "textarea";
  if (dValue)
    input.value = dValue;
  input.className = "filerTableInput form-control";
  input.title = 'input value';
  input.wrap = "soft";
  input.rows = 5;
  input.style.width = "80%";
  input.maxlength = 80;
  td.appendChild(input);
  return input;
};