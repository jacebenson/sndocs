function breakout(scope, elm) {

	elm = elm.contents();
	var canvas = $(elm).find('canvas')[0];

	var ctx = canvas.getContext("2d");
	var ballRadius = 10;
	var width = canvas.width;
	var height = canvas.height;
	var x = width/2;
	var y = height-30;
	var dx = 2;
	var dy = -2;
	var paddleHeight = 10;
	var paddleWidth = 75;
	var paddleX = (canvas.width-paddleWidth)/2;
	var rightPressed = false;
	var leftPressed = false;
	var brickRowCount = 15;
	var brickColumnCount = 7;
	var brickPadding = 2;
	var brickOffsetLeft = 10;
	var brickOffsetTop = 30;
	var brickWidth = (((width + brickPadding)-(brickOffsetLeft * 2)) / brickRowCount) - brickPadding;
	var brickHeight = 10;
	var score = 0;
	var lives = 3;
	var gameover = false;
	var maxPoints = 0;
	var color = "#428bca";
	var color2 = "#D1222B";
	var touchX,touchY;

	var bricks = [];
	for (var c=0; c<brickColumnCount; c++) {
		bricks[c] = [];
		for (var r=0; r<brickRowCount; r++) {
			bricks[c][r] = { x: 0, y: 0, status: 1 };
		}
	}

	// Spells out 404
	var letterMap = [];
	letterMap[0]=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14];
	letterMap[1]=[0,14];
	letterMap[2]=[0,2,4,6,7,8,10,12,14];
	letterMap[3]=[0,2,3,4,6,8,10,11,12,14];
	letterMap[4]=[0,4,6,7,8,12,14];
	letterMap[5]=[0,14];
	letterMap[6]=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14];

	document.addEventListener("keydown", keyDownHandler, false);
	document.addEventListener("keyup", keyUpHandler, false);
	document.addEventListener("mousemove", mouseMoveHandler, false);

	// React to touch events on the canvas
	canvas.addEventListener('touchstart', canvasTouchStart, false);
	canvas.addEventListener('touchmove', canvasTouchMove, false);

	function keyDownHandler(e) {
		if(e.keyCode == 39)
			rightPressed = true;
		else if(e.keyCode == 37)
			leftPressed = true;
	}
	function keyUpHandler(e) {
		if(e.keyCode == 39)
			rightPressed = false;
		else if(e.keyCode == 37)
			leftPressed = false;
	}
	function mouseMoveHandler(e) {
		var rect = canvas.getBoundingClientRect();
		var relativeX = e.clientX - rect.left;
		if(relativeX > 0 && relativeX < canvas.width) {
			paddleX = relativeX - paddleWidth/2;
		}
	}

	function canvasTouchStart() {
		getTouchPos();
		paddleX = touchX;
		event.preventDefault();
	}

	function canvasTouchMove(e) { 
		getTouchPos(e);
		paddleX = touchX;
		event.preventDefault();
	}

	function getTouchPos(e) {
		if (!e)
			var e = event;

		if(e.touches) {
			if (e.touches.length == 1) { // Only deal with one finger
				var touch = e.touches[0]; // Get the information for finger #1
				touchX=touch.pageX-touch.target.offsetLeft;
				touchY=touch.pageY-touch.target.offsetTop;
			}
		}
	}

	function collisionDetection() {
		for(c=0; c<brickColumnCount; c++) {
			for(r=0; r<brickRowCount; r++) {
				var b = bricks[c][r];
				if(b.status == 1) {
					if(x > b.x && x < b.x+brickWidth && y > b.y && y < b.y+brickHeight) {
						dy = -dy;
						b.status = 0;
						score++;
						if(score == maxPoints) {
							gameover = true;
							drawMessage("You Win");
						}
					}
				}
			}
		}
	}

	function drawBall() {
		ctx.beginPath();
		ctx.arc(x, y, ballRadius, 0, Math.PI*2);
		ctx.fillStyle = color2;
		ctx.fill();
		ctx.closePath();
	}

	function drawPaddle() {		
		ctx.beginPath();
		ctx.rect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight);
		ctx.fillStyle = color;
		ctx.fill();
		ctx.closePath();
	}

	function drawBricks() {
		maxPoints = 0;
		for(c=0; c<brickColumnCount; c++) {
			for(r=0; r<brickRowCount; r++) {

				if (!isMapped(c,r))
					continue;

				maxPoints++;

				if(bricks[c][r].status == 1) {
					var brickX = (r*(brickWidth+brickPadding))+brickOffsetLeft;
					var brickY = (c*(brickHeight+brickPadding))+brickOffsetTop;
					bricks[c][r].x = brickX;
					bricks[c][r].y = brickY;

					ctx.beginPath();
					ctx.rect(brickX, brickY, brickWidth, brickHeight);
					ctx.fillStyle = color;
					ctx.fill();
					ctx.closePath();

				}
			}
		}
	}

	function isMapped(c,r) {
		if (letterMap[c])
			return (letterMap[c].indexOf(r) > -1);
		return false;
	}

	function drawScore() {
		ctx.font = "16px Arial";
		ctx.fillStyle = color;
		ctx.fillText("Score: "+score, 8, 20);
	}

	function drawLives() {
		ctx.font = "16px Arial";
		ctx.fillStyle = color
		ctx.fillText("Lives: "+lives, canvas.width-65, 20);
	}

	function drawMessage(text) {

		var loc = (canvas.width)/2;
		ctx.textAlign="center"; 
		ctx.font = "24px Arial";
		ctx.fillStyle = color2;
		ctx.fillText(text, loc, 150);
	}

	function draw() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawBricks();
		drawBall();
		drawPaddle();
		drawScore();
		drawLives();
		collisionDetection();

		if (x + dx > canvas.width-ballRadius || x + dx < ballRadius)
			dx = -dx;

		if (y + dy < ballRadius)
			dy = -dy;
		else if(y + dy > canvas.height-ballRadius) {
			if(x > paddleX && x < paddleX + paddleWidth)
				dy = -dy;
			else {
				lives--;
				if(!lives) {
					gameover = true;
					drawMessage("Game Over");
				}
				else {
					x = canvas.width/2;
					y = canvas.height-30;
					dx = 3;
					dy = -3;
					paddleX = (canvas.width-paddleWidth)/2;
				}
			}
		}

		if(rightPressed && paddleX < canvas.width-paddleWidth)
			paddleX += 7;
		else if(leftPressed && paddleX > 0)
			paddleX -= 7;

		x += dx;
		y += dy;
		if (gameover==false)
			requestAnimationFrame(draw);
	}

	draw();
}