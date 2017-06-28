/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

/*global $, require*/

var el;

//Game Container
var GameContainer = __webpack_require__(1);

//Snake Game
var SnakeGame = __webpack_require__(3);

/**
 * Attach ResponsiveSnake Game To Window
 * @type {{game: GameContainer, start: start, bindEvents: bindEvents}}
 */
var ResponsiveSnake = {
  getNew: function(opts) {
    opts = $.extend(opts, {
      inst : new SnakeGame(opts)
    });

    el = Everlive.$;

    // el.subscribeBroadcast('gamestate', function(msg) {
    //   var inst = CircularJSON.parse(msg.data.circStr);
    //   opts.inst = inst;
    //   ResponsiveSnake.game = new GameContainer(opts);
    // });

    this.game = new GameContainer(opts);
    return this.game;
  },

  /**
   * Initialize a new Game
   */
  // game : new GameContainer({
  //   inst : new SnakeGame()
  // }),

  /**
   * Start Game and Bind Window Events
   */
  start : function (options) {
    if (options) {
      ResponsiveSnake.game.inst.setOptions(options);
    }

    ResponsiveSnake.game.start();
    ResponsiveSnake.bindEvents();
  },

  /**
   * Bind Window Events
   */
  bindEvents : function () {
    if (this.game.started) {
      //Pause Game on Window Blur
      $(window)
        .focus(function() {
          if (this.game.started) {
            this.game.play.bind(this.game);
          }
        }.bind(this))
        .blur(function() {
          if (this.game.started) {
            this.game.pause.bind(this.game);
          }
        }.bind(this));
    }
  }
};

//Handle Module Exports
if (typeof module !== 'undefined' && !window) {
  //Export to NODE
  module.exports = ResponsiveSnake;
} else if (typeof window !== 'undefined') {
  //Export To Browser
  window.ResponsiveSnake = ResponsiveSnake;
}


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

/*global module, require, $ */
var el;

var cookie = __webpack_require__(2);

/**
 * Basic Game Object
 * @param options
 * @constructor
 */
var GameContainer = function (options) {
  var self = this;
  this.started = false;
  this.disabled = false;
  this.score = 0;
  this.settings = $.extend({ inst : false }, options);
  this.inst = this.settings.inst;

  if (!this.inst) {
    throw new Error("A Game Instance Must Be Supplied");
  }

  this.ui = {
    canvas : $('#' + options.canvasId),
    scoreboard : $('#score span', '#scoreboard'),
    userScore : $('#hi-score span','#scoreboard'),
    botScore : $('#bot-hi-score span', '#scoreboard')
  };

  this.keys = {
    user : this.inst.name + '_user',
    bot : this.inst.name + '_bot'
  };

this.$canvas = this.inst.$canvas;
  this.updateScoreboard();
  this.bindEvents();
};

/**
 * Initialize The Game Session
 */
GameContainer.prototype.start = function () {
  this.started = true;
  this.inst.start(this.settings);
};

GameContainer.prototype.play = function () {
  this.inst.play(true);
};

/**
 * Bind The Game Events
 */
GameContainer.prototype.bindEvents = function () {
  $(document).on('keydown', this.onKeydown.bind(this));
  $(window).on('resize', this.onResize.bind(this));

  this.inst.onRestart = this.onGameRestart.bind(this);
  this.inst.onScore = this.onGameScore.bind(this);

  this.bindTouchEvents();
};


/**
 * Bind The Touch Events
 */
GameContainer.prototype.bindTouchEvents = function() {
  var self = this,
    queueFunc = this.inst.queueDirection.bind(this.inst);

  this.ui.canvas.on('touchmove', function(e) { e.preventDefault(); });
  this.ui.canvas.on("swipeUp", function() { queueFunc(self.inst.DIRECTIONS.UP); });
  this.ui.canvas.on("swipeDown", function() { queueFunc(self.inst.DIRECTIONS.DOWN); });
  this.ui.canvas.on("swipeLeft", function() { queueFunc(self.inst.DIRECTIONS.LEFT); });
  this.ui.canvas.on("swipeRight", function() { queueFunc(self.inst.DIRECTIONS.RIGHT); });
};

/**
 * Resume/Play Game
 */
GameContainer.prototype.play = function () {
  this.started = true;
  this.inst.play();
};

/**
 * Pause Current Game
 */
GameContainer.prototype.pause = function () {
  this.started = false;
  this.inst.pause();
};

/**
 * Display Canvas and Start Game
 */
GameContainer.prototype.enableGame = function () {
  this.disabled = false;
  this.$canvas.show();
  this.play();
};

/**
 * Hide Canvas and Pause Game
 */
GameContainer.prototype.disableGame = function () {
  this.disabled = true;
  this.$canvas.hide();
  this.pause();
};

/**
 * Persist Current Game Session to Cookie
 * @param score
 */
GameContainer.prototype.saveGame = function (score) {
  var hiScore = cookie.read(this.keys.user) || 0;
  if (this.inst.bot && this.inst.bot.enabled) {
    var botScore = cookie.read(this.keys.bot) || 0;
    if (botScore && score < botScore) {
      score = botScore;
    }
    cookie.create(this.keys.bot, score);
  } else if (!hiScore || (hiScore && score > hiScore)) {
    cookie.create(this.keys.user, score);
  }
};

/**
 * Update Current Scoreboard With New Score
 * @param score
 */
GameContainer.prototype.updateScoreboard = function (score) {
  this.updateScore(score || 0);

  this.ui.userScore.text(cookie.read(this.keys.user) || 0);

  if (this.inst.bot) {
    this.ui.botScore.text(cookie.read(this.keys.bot) || 0);
  }
};

/**
 * Update Actual Score and Flash In
 * @param score
 */
GameContainer.prototype.updateScore = function (score) {
  var scoreboard = this.ui.scoreboard;
    scoreboard.text(score).addClass('flash');
  setTimeout(function () {
    scoreboard.removeClass('flash');
  }, 1000)
};

/**
 * On Game Score
 * @param score
 */
GameContainer.prototype.onGameScore = function (score) {
  this.updateScore(score);
};

/**
 * Restart Current Game
 * @param score
 */
GameContainer.prototype.onGameRestart = function (score) {
  this.saveGame(score);
  this.updateScoreboard();
};

/**
 * Toggle Game Session
 */
GameContainer.prototype.toggleGame = function () {
  if (this.disabled) {
    this.enableGame();
  } else {
    this.disableGame();
  }
};

/**
 * Handle Window Resize
 */
GameContainer.prototype.onResize = function () {
  if (typeof this.inst.onResize === 'function') {
    this.inst.onResize(window.innerHeight, window.innerWidth);
  }
};

/**
 * Handle KeyDown Events
 * @param event
 */
GameContainer.prototype.onKeydown = function (event) {
  if (this.settings.userId !== window.currentUserId) {
    return;
  }
  switch (event.keyCode) {
    case 38 :
      this.inst.queueDirection(this.inst.DIRECTIONS.UP);
      break;
    case 40 :
      this.inst.queueDirection(this.inst.DIRECTIONS.DOWN);
      break;
    case 37 :
      this.inst.queueDirection(this.inst.DIRECTIONS.LEFT);
      break;
    case 39 :
      this.inst.queueDirection(this.inst.DIRECTIONS.RIGHT);
      break;
    case 187: //+
      this.inst.increaseFPS(1);
      break;
    case 189: //-
      this.inst.decreaseFPS(1);
      break;
    case 66 :
      if (this.inst.bot) {
        this.inst.bot.enable();
      }
      break;
    case 82 : //r
      this.inst.restart();
      break;
    case 79 : //o
      this.toggleGame();
      break;
    case 32 : //space
      if (!this.disabled) {
        if (this.started) {
          this.pause();
        } else {
          this.play();
        }
      }
      break;
  }
};

module.exports = GameContainer;

/***/ }),
/* 2 */
/***/ (function(module, exports) {

/*global module*/

module.exports = {

  /**
   * Create a new cookie
   * @param name
   * @param value
   * @param days
   */
  create : function (name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    //'secure', subdomain '.'?
    document.cookie = name + "=" + value + "; " + expires;
  },

  /**
   * Read an existing cookie
   * @param name
   * @returns {*}
   */
  read : function (name) {
    name = name + "=";
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i].trim();
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length, cookie.length);
      }
    }
    return false;
  },

  /**
   * Remove an existing cookie
   * @param name
   */
  remove : function(name) {
    this.create(name,"",-1);
  }
};

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

/*global requestAnimationFrame, module, require, $ */
var el;

var colorMap = ['#E74C3C', '#3498DB', '#27AE60', '#7D3C98', '#F1C40F', '#273746'];

var Piece = __webpack_require__(4),
 Food = __webpack_require__(5),
 Bot = __webpack_require__(6),
 Particle = __webpack_require__(7);

/**
 * Snake Game
 * @param options
 * @constructor
 */
var Snake = function(options) {
  var self = this;
  this.options = options || {};

  this.score = 0;
  this.started = false;
  this.fps = 15;
  this.gravity = 1;
  this.particles = [];
  this.particleCount = 150;

  this.throttledDraw = _.throttle(Snake.prototype.throttledDraw, 1000 / 12);

  this.$canvas = $('#' + (options.canvasId || ''));
  this.$canvas.css({ 'background-color': 'transparent' });
  this.canvas = this.$canvas[0];
  this.context = this.canvas.getContext('2d');
  el = Everlive.$;

  if (this.$canvas.data('full-screen')) {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  this.animationTimeout = null;

  this.pieces = [];
  this.food = [];

  this.currentFoodColor = null;

  this.settings = $.extend({
    snakePixels    : 14,
    snakeSize      : 3,
    foodColor      : null,
    headColor      : 'rgba(0,0,0,0)',
    bot            : false,
    timeout        : 1000,
    explosion      : true
  }, options);

  this.topic = 'gamestate';
  if (this.settings.roomName) {
    this.topic += '.' + this.settings.roomName;
  }

  this.DIRECTIONS = {
    UP   : 0,
    DOWN : 2,
    LEFT  : 1,
    RIGHT : 3
  };

  //Bot Support
  this.bot = new Bot({directions : this.DIRECTIONS, enabled : this.settings.bot});

  this.direction = this.DIRECTIONS.RIGHT;
  this.directionQueue = [];
};


/**
 * Set Options For Current Snake
 * @param options
 * @returns {*}
 */
Snake.prototype.setOptions = function(options) {
  $.extend(this.settings, options);
  if (this.settings.bot === true) {
    this.bot.enable();
  }
};

/**
 * Reset Game Session Variables
 */
Snake.prototype.reset = function() {
  this.started = false;
  this.score = 0;
  this.directionQueue = [];
  this.direction = this.DIRECTIONS.RIGHT;
  this.pieces = [];
  this.food = [];
  this.particles = [];
  this.gravity = 1;
  this.fps = 15;

  if (this.animationTimeout) {
    clearTimeout(this.animationTimeout);
  }
};

/**
 * Restart Game
 */
Snake.prototype.restart = function () {
  if (typeof this.onRestart === 'function') {
    this.onRestart(this.score);
  }
  this.reset();
  this.start();
};

/**
 * Resume/Play Game
 */
Snake.prototype.play = function(skipSate) {
  if (!skipSate) {
    this.started = true;
  }
  if (typeof this.animationLoop === 'function') {
    this.animationLoop();
  }
};

/**
 * Pause Current Game
 */
Snake.prototype.pause = function() {
  this.started = false;
};

/**
 * Lose Current Game
 */
Snake.prototype.lose = function() {
  this.pause();
  setTimeout(this.restart.bind(this), this.settings.timeout);
};

/**
 * Add Direction To The Direction Queue
 * @param direction
 */
Snake.prototype.queueDirection = function(direction) {
  if (this.bot.enabled === true) this.bot.disable();
  //Don't Allow The Same Moves To Stack Up
  if (this.started && this.directionQueue[this.directionQueue.length - 1] !== direction) {
    this.directionQueue.push(direction);
  }
};

/**
 * Handle Window Resize
 * @param height
 * @param width
 */
Snake.prototype.onResize = function(height, width) {
  this.canvas.width = width;
  this.canvas.height = height;
};

/**
 * Create Snake
 */
Snake.prototype.create = function(gamestate) {
  var self = this;
  if (gamestate) {
    self.pieces.splice(0, self.pieces.length);
    gamestate.pieces.forEach(function(pieceData) {
      pieceData.color = colorMap[self.options.userId];
      self.pieces.push(new Piece(pieceData));
    });
  } else {
    var offset = Math.round((Math.random() * 20));
    for (var x = 0; x < this.settings.snakeSize; x++) {
      this.pieces.push(new Piece({
        x : 0,
        y : 20 + offset,
        width : this.settings.snakePixels
      }));
    }
  }
};

/**
 * Create a piece of food
 */
Snake.prototype.createFood = function(gamestate) {
  if (gamestate) {
    var self = this;
    self.food.splice(0, self.food.length);
    gamestate.food.forEach(function(fd) {
      fd.color = colorMap[self.options.userId];
      self.food.push(new Food(fd));
    });
    return;
  }
  
  this.food.push(new Food({
    x : Math.round(Math.random() * (this.canvas.width - this.settings.snakePixels) / this.settings.snakePixels),
    y : Math.round(Math.random() * (this.canvas.height - this.settings.snakePixels) / this.settings.snakePixels),
    width : this.settings.snakePixels,
    color : this.getFoodColor(),
    border : '#000'
  }));
};

/**
 * Get Current Food Color
 * @returns {*}
 */
Snake.prototype.getFoodColor = function() {
  if (this.settings.foodColor) {
    return this.settings.foodColor;
  }

  this.currentFoodColor = 'rgb(' +
    parseInt(Math.random() * 255) + ',' +
    parseInt(Math.random() * 255) + ',' +
    parseInt(Math.random() * 255) + ')';

  return this.currentFoodColor;
};

/**
 * Get Snake Direction
 * @returns {*}
 */
Snake.prototype.getDirection = function () {
  var direction;
  while (typeof direction === 'undefined' || (this.direction - direction + 4) % 4 === 2) {
    if (this.directionQueue.length > 0) {
      //Shift through the Queue
      direction = this.directionQueue.shift();
    }
    else {
      direction = this.direction;
    }
  }
  return direction;
};

/**
 * Check if Coordinates Cause Collision
 * @param x
 * @param y
 * @returns {boolean}
 */
Snake.prototype.isWallCollision = function(x,y) {
  var isTopCollision = y === -1,
    isRightCollision = x >= this.canvas.width / this.settings.snakePixels,
    isBottomCollision = y >= this.canvas.height / this.settings.snakePixels,
    isLeftCollision = x === -1;

  return isTopCollision || isRightCollision  || isBottomCollision || isLeftCollision;
};

/**
 * Check If "Safe" Collision
 * @param x
 * @param y
 * @returns {boolean}
 */
Snake.prototype.isSelfCollision = function(x,y) {
  for (var i = 0; i < this.pieces.length; i++) {
    if (this.pieces[i].x == x && this.pieces[i].y == y) {
      return true;
    }
  }
  return false;
};

/**
 * Check if Food Collision
 * @param x
 * @param y
 * @returns {boolean}
 */
Snake.prototype.isFoodCollision = function(x,y) {
  var found = false;
  this.food.forEach(function(food) {
    if ((x == food.x && y == food.y)) {
      found = true;
    }
  });
  return found;
};

/**
 * Remove Piece Of Food
 * @param x
 * @param y
 */
Snake.prototype.removeFood = function(x,y) {
  var self = this;
  this.food.forEach(function(food,ix) {
    if ((x == food.x && y == food.y)) {
      self.food.splice(ix);
    }
  });
};

/**
 * Create Particle Explosion
 * @param x
 * @param y
 */
Snake.prototype.createExplosion = function(x,y) {
  for (var i = 0; i < this.particleCount; i++) {
    var particle = new Particle({
      x : x * this.settings.snakePixels,
      y : y * this.settings.snakePixels,
      color : this.settings.foodColor ? this.settings.foodColor : this.currentFoodColor,
      decay : true
    });
    this.particles.push(particle);
  }
};

/**
 * Score a point and call onScore
 */
Snake.prototype.scorePoint = function() {
  this.score++;
  if (this.onScore && typeof this.onScore === 'function') {
    this.onScore(this.score);
  }
};


/**
 * Increase Snake FPS draw loop
 */
Snake.prototype.increaseFPS = function(amount) {
  this.fps += amount;
};

/**
 * Decrease Snake FPS draw loop
 */
Snake.prototype.decreaseFPS = function(amount) {
  if (this.fps - amount > 0) {
    this.fps -= amount;
  }
};

/**
 * Snake Draw Loop
 */
Snake.prototype.drawLoop = function() {
  var self = this;

  //Clear Canvas Context Before Redraw
  this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

  if (!this.pieces.length) {
    return;
  }

  var headX = this.pieces[0].x;
  var headY = this.pieces[0].y;

  //reset direction
  this.direction = this.getDirection();

  if (this.bot && this.bot.enabled === true) {
    this.direction = this.bot.getNextMove(this.pieces, this.food[0], {x : headX, y : headY}, this.direction, this.DIRECTIONS);
  }

  switch(this.direction) {
    case this.DIRECTIONS.LEFT:
      headX--;
      break;
    case this.DIRECTIONS.RIGHT:
      headX++;
      break;
    case this.DIRECTIONS.UP:
      headY--;
      break;
    case this.DIRECTIONS.DOWN:
      headY++;
      break;
  }

  if (this.isWallCollision(headX, headY) || this.isSelfCollision(headX, headY)) {
    this.lose();
  }

  if (this.started) {
    var headShift = null;
    var food = this.isFoodCollision(headX, headY);

    if (food) {
      this.scorePoint();
      //Increase Frames Per Second
      if (this.score % 2) {
        this.fps += 0.5;
      }

      if (this.settings.explosion) {
        this.createExplosion(headX, headY, [food.color,food.border]);
      }

      this.removeFood(headX, headY);
      this.createFood();

      //create new snake head
      headShift = new Piece({
        x : headX,
        y : headY,
        width : this.settings.snakePixels
      });

    } else {
      //Pop head tail to become new  head
      headShift = this.pieces.pop();
      headShift.updatePosition(headX, headY);
    }
    //move snakeTail to snakeHead
    this.pieces.unshift(headShift);
  }

  //Draw Snake
  this.pieces.forEach(function(piece,ix) {
    piece.draw(self.context, ix === 0 ? self.settings.headColor : null);
  });

  //Draw Food
  this.food.forEach(function(food) {
    food.draw(self.context);
  });
};

Snake.prototype.throttledDraw = function() {
  if (this.options.userId !== window.currentUserId && window.currentUserId !== -1) {
    return;
  }
  
  var self = this;
  var foodClone = self.food.map(function(f) {
    return { x: f.x, y: f.y };
  });
  var dataToSend = {
    userId: self.options.userId,
    gamestate: {
      pieces: self.pieces.map(function(p) {
        return {
          x: p.x,
          y: p.y
        };
      }),
      food: foodClone
    }
  };
  el.broadcast(this.topic, dataToSend);
};

/**
 * Snake Animation Loop
 */
Snake.prototype.animationLoop = function() {
  if (this.started) {
    var self = this;
    // if (this.animationTimeout) {
    //   clearTimeout(this.animationTimeout);
    // }
    //Ensure FPS
    // this.animationTimeout = setTimeout(function() {
      self.drawLoop.call(self);
      self.particleLoop.call(self);
      // window.requestAnimationFrame(self.animationLoop.bind(self));
      self.throttledDraw.call(self);

    // }, 1000 / this.fps);
  }
};

/**
 * Start Snake Game
 */
Snake.prototype.start = function() {
  var self = this;
  
  this.started = true;
  this.create();
  this.createFood();
  this.play();
};

/**
 * Snake Particle Loop
 */
Snake.prototype.particleLoop = function() {
  if (this.particles) {
    var self = this;
    var particles = [];

    this.particles.forEach(function(particle) {
      //Apply Some Gravity
      particle.velocity.y += self.gravity;

      particle.x += particle.velocity.x;
      particle.y += particle.velocity.y;

      particle.draw(self.context);

      if (particle.y < self.canvas.height * 1.1) {
        particles.push(particle);
      }
    });
    this.particles = particles;
  }
};


module.exports = Snake;

/***/ }),
/* 4 */
/***/ (function(module, exports) {

/**
 * Piece Class
 * Creating a simple 2d object
 * with an inner color and a border
 */
function Piece(options) {
  this.options = options || {};
  this.width = this.options.width ? this.options.width : 14;
  this.x = this.options.x ? this.options.x : 0;
  this.y = this.options.y ? this.options.y : 0;
  this.color = this.options.color || '#FFF';
  this.border = this.options.border || '#000';
}

/**
 * Basic Position Updater
 * @param x
 * @param y
 */
Piece.prototype.updatePosition = function (x, y) {
  this.x = x;
  this.y = y;
};

/**
 * Draw Piece To Canvas
 * @param context
 * @param updateColor
 */
Piece.prototype.draw = function (context, updateColor) {
  if (typeof updateColor === 'string') {
    context.fillStyle = updateColor;
  } else {
    context.fillStyle = this.color;
  }
  context.strokeStyle = this.border;
  context.fillRect(this.x * this.width, this.y * this.width, this.width, this.width);
  context.strokeRect(this.x * this.width, this.y * this.width, this.width, this.width);
};

module.exports = Piece;

/***/ }),
/* 5 */
/***/ (function(module, exports) {

/**
 * Food Class
 * Creating a simple 2d object
 * with an inner color and a border
 */
function Food(options) {
  this.options = options || {};
  this.width = this.options.width ? this.options.width : 14;
  this.x = this.options.x ? this.options.x : 0;
  this.y = this.options.y ? this.options.y : 0;

  this.border = this.options.border ? this.options.border : false;
  this.color = this.options.color ? this.options.color : "#FFF";
}

/**
 * Draw Food Onto the Canvas
 * @param context
 */
Food.prototype.draw = function (context) {
  context.fillStyle = this.color;

  if (this.border) {
    context.strokeStyle = this.border;
  }

  context.fillRect(this.x * this.width, this.y * this.width, this.width, this.width);
  context.strokeRect(this.x * this.width, this.y * this.width, this.width, this.width);
};

module.exports = Food;

/***/ }),
/* 6 */
/***/ (function(module, exports) {

/**global $*/

/**
 * Dumb Automated Bot
 * Used For 2d Plane
 * @param options
 * @constructor
 */
function Bot(options) {
  this.options = $.extend({
    enabled    : false,
    //perpendicular checking
    directions : {
      UP    : 0,
      DOWN  : 2,
      LEFT  : 1,
      RIGHT : 3
    }
  }, options);

  this.enabled = this.options.enabled;
}

/**
 * Enable Bot
 */
Bot.prototype.enable = function () {
  this.enabled = true;
};

/**
 * Disable Bot
 */
Bot.prototype.disable = function () {
  this.enabled = false;
};

/**
 * Get The Next Move Based on the Current "attractor"
 * and the current position of the snake
 * @param obj
 * @param attractor
 * @param objPos
 * @param currentDir
 * @param directions
 * @returns {*}
 */
Bot.prototype.getNextMove = function (obj, attractor, objPos, currentDir, directions) {
  var tries = 0,
    head = {
      x : obj[0].x,
      y : obj[0].y
    };

  var direction = this.getPrelimDirection(head, attractor, directions);
  //test preliminary move
  while (!this.isMoveSafe(obj, head, currentDir, direction, directions) && tries++ <= 4) {
    direction = (direction + 1) % 4; //0-3
  }
  return direction;
};

/**
 * Get the Preliminary Direction if in bounds
 * @param obj
 * @param attractor
 * @param directions
 * @returns {*}
 */
Bot.prototype.getPrelimDirection = function (obj, attractor, directions) {
  //is object closer to x
  if (Math.abs(obj.x - attractor.x) > Math.abs(obj.y - attractor.y)) {
    //if object is above the attractor
    return obj.x > attractor.x ? directions.LEFT : directions.RIGHT;
  }
  //if object is below attractor or object is at top of screen
  return obj.y < attractor.y || obj.y === 0 ? directions.DOWN : directions.UP;
};


/**
 * Test The Current Move Before Issuing It
 * @param snake
 * @param head
 * @param currentDirection
 * @param newDirection
 * @param directions
 * @returns {boolean}
 */
Bot.prototype.isMoveSafe = function (snake, head, currentDirection, newDirection, directions) {
  //Make Sure you are only able to go perpendicular direction
  if (Math.abs(currentDirection - newDirection) === 2) return false;

  switch (newDirection) {
    case directions.UP :
      head.y--;
      break;
    case directions.DOWN :
      head.y++;
      break;
    case directions.RIGHT :
      head.x++;
      break;
    case directions.LEFT :
    default:
      head.x--;
  }

  var isSafe = true;
  snake.forEach(function (piece) {
    if (piece.x === head.x && piece.y === head.y) {
      isSafe = false;
    }
  });
  return isSafe;
};


module.exports = Bot;

/***/ }),
/* 7 */
/***/ (function(module, exports) {

/**
 * Particle Class
 * @param options
 * @constructor
 */
function Particle(options) {
  this.options = options || {};
  this.x = this.options.x;
  this.y = this.options.y;

  this.decay = (this.options.hasOwnProperty('decay') && this.options.decay);
  this.life = 100;

  this.velocity = {
    x : -5 + Math.random() * 10,
    y : -8 + Math.random() * 10
  };

  this.radius = parseInt(Math.random() * 5);

  this.color = this.options.color ? this.options.color : this.getBW();
  this.border = this.options.border ?  this.options.border : null;
}

/**
 * Get Black Or White Color With Decay
 * @returns {string}
 */
Particle.prototype.getBW = function() {
  var rand = ((!(Math.random()+ 0.5 | 0) === true) ? 255 : 0);
  return 'rgb(' +
    parseInt(rand) + ',' +
    parseInt(rand) + ',' +
    parseInt(rand) + ',' + (this.decay ?  this.life / 100 : "1") + ')';
};

/**
 * Particle Draw Onto Canvas
 * @param context
 */
Particle.prototype.draw = function (context) {
  //decay
  if (this.decay) {
    this.life = ~~(this.life *.96);
    this.radius = (this.radius *.96);
  }

  context.fillStyle = this.color;

  if (this.border) {
    context.strokeStyle = this.border;
  }

  context.beginPath();

  context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);

  context.fill();
  context.closePath();
};

module.exports = Particle;

/***/ })
/******/ ]);
//# sourceMappingURL=output.js.map