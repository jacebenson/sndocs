// data variable provided by caller
data.tape = [];
if (input) {
  data.tape = input.tape;
  data.answer = calc();
  data.tape.unshift({n0: input.n0, n1: input.n1, op: input.op, answer: data.answer});
	$sp.log("calc with input as follows... ");
	$sp.log(input);
	$sp.log("tape array...");
	$sp.log(data.tape);
} else {
	$sp.log("calc initializing ");
  data.n0 = 0;
  data.n1 = 0;
}

function calc() {
  var n0 = parseInt(input.n0);
  var n1 = parseInt(input.n1);
  if (input.op == '-')
    return n0 - n1;
  
  return n0 + n1;
}