(function($, undefined){

  var _   = require('underscore');
  var AF  = require('request-frame');
  var rAF = AF('request');
  var cAF = AF('cancel');
  var clamp = require('./math/clamp');

  var StrainSectionMobile = function(){

    var _this = this;

    var $doc = $(document);
    var $strainInfos = $('.strain-mobile-infos');
    var $strainInfo = $('.strain-mobile-info');
    var $imageList = $('.strain-mobile-image-list');
    var $shadow = $('.strain-mobile-infos-shadow');

    var scrollNamespace = 'scroll.sticky.mobile';
    var ratio = 0;
    var paused = false;
    var slickOpts = {
      slidesToShow: 1,
      swipeToSlide: true,
      mobileFirst: true,
      arrows: false,
      centerMode: true,
      centerPadding: '80px'
    };

    this.setBgColor = function(){
      var slick = $imageList.slick('getSlick');
      var color = slick.$slides.eq(slick.getCurrent()).data('color');
      $strainInfos.css('background-color', color);
    };

    this.setElementsTransform = function(amount){
      var $images = $imageList.find('img');

      rAF(function(){
        $images.css({
          '-webkit-transform' : 'scale('+ amount +')',
              '-ms-transform' : 'scale('+ amount +')',
               '-o-transform' : 'scale('+ amount +')',
                  'transform' : 'scale('+ amount +')'
        });
      });
    };

    this.setElementsOpacity = function(o){
      rAF(function(){
        $imageList.css('opacity', o);
        $shadow.css('opacity', 1-o);
      });
    };

    this.getScrollProgress = function(){
      var height = $imageList.height();
      var scrollTop = $doc.scrollTop();
      var diff = $strainInfos.offset()['top'] - scrollTop;
      
      progress = 1 - (diff / height);
      progress = clamp(progress, 0, 1);

      return progress;
    };

    this.getScaleAmount = function(progress){
      return 1 - Math.pow(progress, 3);
    };

    this.getFadeAmount = function(progress){
      return 1 - Math.pow(progress, 3);
    };

    this.onScroll = function(){
      if(paused) return;
      
      var p = this.getScrollProgress();
      var o = this.getFadeAmount(p);
      var a = this.getScaleAmount(p);

      this.setElementsOpacity(o);
      this.setElementsTransform(a);

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

    this.onStickyStart = function(){
      this.attachScrollHandler();
    };

    this.onStickyEnd = function(){
      this.removeScrollHandler();
    };

    this.pause = function(){
      paused = true;
      return this;
    }

    this.unpause = function(){
      paused = false;
      return this;
    }

    var initialize = function(){
    
      $imageList.on('init', function(e, slick){
        console.log('init mobile strain slider');
        // This is so bad wtf
        setTimeout(_this.setBgColor, 200);
      });

      $imageList.slick(slickOpts)
      .on('afterChange', function(e, slick, currentSlide){
        $strainInfo.removeClass('current');
        $strainInfo.eq(currentSlide).addClass('current');
        _this.setBgColor();
      })
      .on('sticky-start', this.onStickyStart.bind(this))
      .on('sticky-end',   this.onStickyEnd.bind(this))
      .sticky();

      return this;
    };

    this.init = _.once(initialize);

    return this;

  };

  module.exports = new StrainSectionMobile();

})(jQuery);