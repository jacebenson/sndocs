var Class = {
  create: function() {
    return function() {
      this.initialize.apply(this, arguments);
    }
  }
}

/* 
 * Old method left here for compatibility purposes. All future extension should use "extendsObject" method.
 */
Object.extend = function(destination, source) {
  for (var property in source) {
    destination[property] = source[property];
  }
  return destination;
}

Object.extendsObject = function(destination, source) {
  destination = Object.clone(destination.prototype);
  
  for (var property in source) {
    destination[property] = source[property];
  }
  return destination;
}

Object.clone = function(obj) {
  var clone = Class.create();
	
  for (var property in obj) {
    clone[property] = obj[property];
  }
	
  return clone;
}