/*global $, require*/

var el;

//Game Container
var GameContainer = require('./GameContainer');

//Snake Game
var SnakeGame = require('./SnakeGame');

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
