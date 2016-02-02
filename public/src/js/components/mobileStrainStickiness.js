(function($, undefined){

  var _   = require('underscore');
  var AF  = require('request-frame');
  var rAF = AF('request');
  var cAF = AF('cancel');
  var clamp = require('./math/clamp');

  var MobileStrainStickiness = function(){

    var $doc = $(document);
    var $infos = $('.strain-mobile-infos');
    var $imageList = $('.strain-mobile-image-list');
    var $shadow = $('.strain-mobile-infos-shadow');
    var scrollNamespace = 'scroll.sticky.mobile';
    var ratio = 0;
    var paused = false;

    this.setElementsOpacity = function(o){
      rAF(function(){
        $imageList.css('opacity', o);
        $shadow.css('opacity', 1-o);
      });
    }

    this.getScrollProgress = function(){
      var height = $imageList.height();
      var scrollTop = $doc.scrollTop();
      var diff = $infos.offset()['top'] - scrollTop;
      
      progress = 1 - (diff / height);
      progress = clamp(progress, 0, 1);

      return progress;
    };

    this.getFadeAmount = function(progress){
      return 1 - Math.pow(progress, 3);
    };

    this.attachScrollHandler = function(){
      $doc.on(scrollNamespace, function(e){
        
        if(paused) return;
        
        var p = this.getScrollProgress();
        var o = this.getFadeAmount(p);

        this.setElementsOpacity(o)

      }.bind(this));
    };

    this.removeScrollHandler = function(){
      $doc.off(scrollNamespace);
    };

    this.onStickyStart = function(){
      console.log('on sticky start');
      this.attachScrollHandler();
    };

    this.onStickyEnd = function(){
      console.log('on sticky end');
      this.removeScrollHandler();
    };

    this.pause = function(){
      console.log('pause');
      paused = true;
      return this;
    }

    this.unpause = function(){
      console.log('unpause');
      paused = false;
      return this;
    }

    var initialize = function(){
      console.log('init\'ing mobile strain stickiness');
      
      $('.strain-mobile-image-list').on('sticky-start', this.onStickyStart.bind(this))
      .on('sticky-end', this.onStickyEnd.bind(this))
      .sticky();

      var p = this.getScrollProgress();
      var o = this.getFadeAmount(p);

      this.setElementsOpacity(o)
    };

    this.init = _.once(initialize);

    return this;

  };

  module.exports = new MobileStrainStickiness();

})(jQuery);