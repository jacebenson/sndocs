/*! RESOURCE: /scripts/ScriptLoader.js */
var ScriptLoader = {
  getScripts: function(scripts, callback) {
    if (!(scripts instanceof Array))
      scripts = [scripts];
    for (var i = 0; i < scripts.length; i++)
      $LAB.queueScript(scripts[i]);
    $LAB.queueWait(callback);
    $LAB.runQueue();
  }
};;