/*! RESOURCE: /scripts/concourse/messagesStackService.js */
function MessagesStack() {
  this.push = function push(directiveName) {
    var markerNode = document.querySelector("div[id=messages_stack_visible] ~ *:not([messages-stack-member])");
    if (!markerNode) {
      console.error("The position to insert after messages_stack_visible was not found");
      return;
    }
    var direct = document.getElementsByTagName(directiveName);
    if (!direct || !direct.length || direct.length !== 1) {
      console.error("Directive <" + directiveName + "> to insert was not determined (was not found or more than one is present on page");
      return;
    }
    markerNode.parentNode.insertBefore(direct[0], markerNode);
  };
  this.pop = function pop(directiveName) {
    var hiddenContainer = document.getElementById("messages_stack_hidden");
    if (!hiddenContainer) {
      console.error("Position to insert after messages_stack_hidden was not found");
      return;
    }
    var direct = document.getElementsByTagName(directiveName);
    if (!direct || !direct.length || direct.length !== 1) {
      console.error("Directive <" + directiveName + "> to insert was not determined (was not found or more than one is present on page");
      return;
    }
    hiddenContainer.parentNode.appendChild(direct[0]);
  };
}
angular
  .module('sn.concourse')
  .service('MessagesStack', MessagesStack);;