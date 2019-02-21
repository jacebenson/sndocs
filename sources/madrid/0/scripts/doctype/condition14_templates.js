/*! RESOURCE: /scripts/doctype/condition14_templates.js */
function addTextArea(td, dValue, associatedField) {
  if (!useTextareas)
    return addTextInput(td, dValue, null, associatedField);
  var input = cel("textarea");
  td.fieldType = "textarea";
  if (dValue)
    input.value = dValue;
  var gMessage = new GwtMessage();
  var defaultLabel = gMessage.getMessage('Input value');
  if (associatedField)
    input.setAttribute('aria-label', gMessage.getMessage('Input value for field: {0}', associatedField));
  else
    input.setAttribute('aria-label', defaultLabel);
  input.className = "filerTableInput form-control";
  input.title = defaultLabel;
  input.wrap = "soft";
  input.rows = 5;
  input.style.width = "80%";
  input.maxlength = 80;
  td.setAttribute('data-value', associatedField);
  td.appendChild(input);
  return input;
};