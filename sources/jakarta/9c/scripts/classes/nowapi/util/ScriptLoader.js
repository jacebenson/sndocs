/*! RESOURCE: /scripts/classes/nowapi/util/ScriptLoader.js */
window.nowapi.ScriptLoader = {
  getScripts: function(scripts, callback) {
    if (!(scripts instanceof Array))
      scripts = [scripts];
    for (var i = 0; i < scripts.length; i++)
      $LAB.queueScript(scripts[i]);
    $LAB.queueWait(callback);
    $LAB.runQueue();
  }
};;