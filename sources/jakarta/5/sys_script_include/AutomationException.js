/**
 * A runtime exception that is thrown in the course of a Discovery or Runbook operation.
 * @author Roy Laurie <roy.laurie@service-now.com> RAL
 */
var AutomationException = Class.create();
AutomationException.prototype = Object.extend(new GenericException, {
  type: 'AutomationException'
});