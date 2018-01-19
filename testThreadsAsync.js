const spawn = require('threads').spawn;

const thread = spawn(function ([a, b]) {
  // Remember that this function will be run in another execution context.
  return new Promise(resolve => {
    setTimeout(() => resolve(a + b), 1000)
  })
});

thread
  .send([ 9, 12 ])
  // The handlers come here: (none of them is mandatory)
  .on('message', function(response) {
    console.log('9 + 12 = ', response);
    thread.kill();
  });