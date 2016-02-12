(function($, undefined){

  var _   = require('underscore');

  var StockistsSection = function(){

    var $doc = $(document);
    var scrollNamespace = 'scroll.stockists';
    var paused = false;

    this.$el = $('#stockists');
    this.$header = $('header');
    this.$nav = this.$header.find('nav');

    this.onScroll = function(){
      if(paused) return;
      
      var s = $doc.scrollTop();
      var t = this.$el.offset()['top'];
      var h = this.$header.outerHeight();

      var diff = t-s-h;

      // HEADS UP! If we add more sections below the stockists, we'll need to add logic to check if we've scrolled past the stockists section

      if(diff < 0) {
        this.$nav.addClass('inverted');
      } else {
        this.$nav.removeClass('inverted');
      }

      return this;
    }

    this.attachScrollHandler = function(){
      $doc.on(scrollNamespace, this.onScroll.bind(this));
      return this;
    };

    this.removeScrollHandler = function(){
      $doc.off(scrollNamespace);
      return this;
    };

    this.pause = function(){
      paused = true;
      return this;
    }

    this.unpause = function(){
      paused = false;
      this.onScroll();
      return this;
    }

    var initialize = function(){
      this.attachScrollHandler();
    };

    this.init = _.once(initialize);

    return this;

  };

  module.exports = new StockistsSection();

})(jQuery);