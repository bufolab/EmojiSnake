'use strict'


const RIGHT_LIMIT = 600
const LEFT_LIMIT = 0;
const UP_LIMIT = 0 ;
const DOWN_LIMIT = 600;

const NUM_APPLES = 1; //for the moment only 1 apple at a time

const WITH_SPRITE = 40;

function Game(ui) {
		this.isGameOver = false;
		this.ui = ui;
		this.apple = this.generateApple();
		this.snake = new Snake(); //the snake

		let dimensions = this.ui.getBoardDimensions();
		this.snake.x = (dimensions.left+dimensions.right)/2;
		this.snake.y = (dimensions.bottom)/2;
}



Game.prototype.generateApple= function() {
	 	return this.ui.createNewPosition();
}

Game.prototype.advanceFrame= function() {

   let dimensions = this.ui.getBoardDimensions();
	//detect collision with walls
	if(this.snake.x > dimensions.right-2*WITH_SPRITE ||
	this.snake.x < dimensions.left+WITH_SPRITE ||
	this.snake.y < dimensions.top+WITH_SPRITE ||
	this.snake.y > dimensions.bottom-2*WITH_SPRITE){
		this.gameover();
	}

	if(!this.isGameOver) {
		//detect collision with apple
		if(Math.abs(this.snake.x - this.apple.x)<WITH_SPRITE && 
			Math.abs(this.snake.y - this.apple.y)<WITH_SPRITE){
				this.snake.grow();
				this.apple = this.generateApple();
		}


		this.snake.move();
	}

	this.ui.draw(this);
}

Game.prototype.gameover= function(){
	this.isGameOver = true;
}


function Snake() {
		this.x = 0;
		this.y = 0;
		this.direction = 0; //0 up, 1 down, 2 left, 3 right
		this.queue = [];
		this.grow(); //at least the head
}

Snake.prototype.grow= function(){
	let x= this.x;
	let y = this.y;
	this.queue.push({x,y});
}

Snake.prototype.move = function(){
		switch(this.direction){
			case 0: this.y-=WITH_SPRITE; break;
			case 1: this.y+=WITH_SPRITE; break;
			case 2: this.x+=WITH_SPRITE; break;
			case 3: this.x-=WITH_SPRITE; break;
		}

		//move the part of the body one step forward. Replace the following body part
		for (let i =  0; i < this.queue.length-1; i++) {
			this.queue[i] =this.queue[i+1];
		}
		let x = this.x;
		let y = this.y;
		this.queue[this.queue.length-1] = {x,y};
	}



/******** Ui part. Try to decouple from game logic*******/
function UI(){
	this.snakeLook =[]
	this.board = this.createBoard();
	this.appleLook = this.createFruit();

	this.createDecorationBorder();
}

function randomize(min,max){
	return Math.floor(min+Math.random() * Math.floor(max))
}	

UI.prototype.getBoardDimensions = function (){
 return {left:this.board.offsetLeft,
 	top:this.board.offsetTop,
 	right:this.board.offsetLeft+this.board.offsetWidth,
 	bottom:this.board.offsetTop+this.board.offsetHeight};
}

UI.prototype.createNewPosition = function (){

 let x = randomize(this.board.offsetLeft+WITH_SPRITE,this.board.offsetWidth-2*WITH_SPRITE);
 let y = randomize(this.board.offsetTop+WITH_SPRITE,this.board.offsetHeight-2*WITH_SPRITE);
 return {x,y};
}


UI.prototype.createFruit = function(){
	let fruit= document.createElement("span");
	fruit.innerHTML = "🍎";
	fruit.style.fontSize = WITH_SPRITE;;
	this.board.appendChild(fruit);
	return fruit;
}
UI.prototype.createBodyPart = function(){
	let body= document.createElement("span");
	body.innerHTML = "🐲";
	body.style.fontSize = WITH_SPRITE;
	this.board.appendChild(body);
	return body;
}

UI.prototype.createBoard = function(){
	let board= document.createElement("div");
	board.style.width = RIGHT_LIMIT;
	board.style.height = DOWN_LIMIT;
	board.style.margin = "auto";
	board.style.background = "#CCC"
	document.body.appendChild(board);
	return board;
}

UI.prototype.createDecorationBorder = function(){
 
  let q = Math.ceil(this.board.offsetWidth/WITH_SPRITE);

  //top border
  for (var i = 0; i <q ; i++) {
  	 this.createRandomDecorator(this.getRandomBorderEmoji(),
  	 												this.board.offsetLeft+i*WITH_SPRITE,
  	 												this.board.style.top);
  }

  //botom border
  for (var i = 0; i <q ; i++) {
  	 this.createRandomDecorator(this.getRandomBorderEmoji(),
  	 												this.board.offsetLeft +i*WITH_SPRITE,
  	 												this.board.offsetHeight -WITH_SPRITE );
  }

    //left border
    //avoid decoration on the edges (it has been covered by the top and bottom)
  for (var i = 1; i <q - 1; i++) {
  	 this.createRandomDecorator(this.getRandomBorderEmoji(),
  	 												this.board.offsetLeft,
  	 												i*WITH_SPRITE );
  }

    //right border
      //avoid decoration on the edges (it has been covered by the top and bottom)
  for (var i = 1; i <q - 1; i++) {
  	 this.createRandomDecorator(this.getRandomBorderEmoji(),
  	 												this.board.offsetLeft +this.board.offsetWidth -WITH_SPRITE,
  	 											    i*WITH_SPRITE );
  }
}

UI.prototype.createRandomDecorator = function (icon,x,y){
	let decoration= document.createElement("span");
	decoration.innerHTML = icon;
	decoration.style.fontSize = WITH_SPRITE;
	decoration.style.position = "absolute";
	decoration.style.left = x;
	decoration.style.top = y;
	this.board.appendChild(decoration);
}

UI.prototype.getRandomBorderEmoji = function (){
	let decorations = ['🌵','🎄' ,'🌲', '🌳' ,'🌴' ,'🌱','🌿'];
	let index = Math.floor(Math.random() * Math.floor(decorations.length-1));
	return  decorations[index];
}

//all html related
UI.prototype.draw = function (gameToDraw){
	if(gameToDraw.isGameOver){
		document.getElementById("gameover").style.display ="block"
	}else{
		document.getElementById("gameover").style.display ="none"
	}

	for (var i =  0; i < gameToDraw.snake.queue.length; i++) {

		//ops new part of the body, snake is gorwing
		if(i >this.snakeLook.length-1 ){
			let newBodyPart = this.createBodyPart();
			this.snakeLook.push(newBodyPart);
		}

		let body = gameToDraw.snake.queue[i];
		var bodyLook = this.snakeLook[i];
		bodyLook.style.position = "absolute";
		bodyLook.style.left = body.x;
		bodyLook.style.top = body.y;
	}


	//draw apple
	this.appleLook.style.position = "absolute";
	this.appleLook.style.left = gameToDraw.apple.x;
	this.appleLook.style.top = gameToDraw.apple.y;

}


//main initialization
var game = new Game(new UI());

//init the keys listeners
document.onkeydown = function(key){
	switch(key.key){
		case "ArrowLeft": game.snake.direction = 3; break;//left
		case "ArrowUp":  game.snake.direction = 0; break;//up
		case "ArrowRight":  game.snake.direction = 2; break;//right
		case "ArrowDown":  game.snake.direction = 1; break;//down
	}
};

//this is what permits the game to move at a framerate
setInterval(function(){game.advanceFrame();}, 100);





