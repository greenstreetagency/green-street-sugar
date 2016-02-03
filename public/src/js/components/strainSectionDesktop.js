(function($, undefined){

  var _   = require('underscore');
  var AF  = require('request-frame');
  var rAF = AF('request');
  var cAF = AF('cancel');
  var clamp = require('./math/clamp');

  var StrainSectionDesktop = function(){

    var _this = this;
    
    var $win = $(window);
    var $doc = $(document);
    var $strains = $('.strain');

    var scrollNameSpace = 'scroll.sticky.desktop';
    var paused = false;

    this.setElementTransform = function(amount, $el){

      var $img = $el.find('.strain-image');
      var $content = $el.find('.section-strain-info');

      rAF(function(){
        
        $img.css({
          '-webkit-transform' : 'scale('+ amount +')',
              '-ms-transform' : 'scale('+ amount +')',
               '-o-transform' : 'scale('+ amount +')',
                  'transform' : 'scale('+ amount +')'
        });

        $content.css({
          '-webkit-transform' : 'scale('+ amount +')',
              '-ms-transform' : 'scale('+ amount +')',
               '-o-transform' : 'scale('+ amount +')',
                  'transform' : 'scale('+ amount +')'
        });

      });

    };

    this.setElementOpacity = function(o, $el, $shadow){
      rAF(function(){
        $el.css('opacity', o);
        $shadow && $shadow.css('opacity', 1-o);
      });
    };

    /**
     * Returns a number whose value represents how far into the section the document has been scrolled.
     *
     * 0 means it hasn't been scrolled to the top
     * 1 means it has been scrolled past the top of the screen completely
     *
     * @param {$(element)} - $('.strain')
     * @return {float} - 0.0 - 1.0
     */
    this.getSectionScrollProgress = function($section){
      var $wrapper = $section.parent('.sticky-wrapper');
      var wrapperTop = $wrapper.offset()['top'];
      var wrapperHeight = $wrapper.height();
      var scrollTop = $doc.scrollTop();
      var diff = (wrapperTop + wrapperHeight) - scrollTop;
      var progress = 1 - (diff / wrapperHeight);
      
      return clamp(progress, 0, 1);
    };

    this.getScaleAmount = function(progress){
      return 1 - Math.pow(progress, 4);
    };

    this.getFadeAmount = function(progress){
      return 1 - Math.pow(progress, 2.2);
    };

    this.getNextSectionShadow = function($el){
      var $shadow;
      var index = $strains.index($el);

      if($strains.eq(index+1).length){
        $shadow = $strains.eq(index+1).find('.strain-desktop-shadow'); //get the shadow from the next section
      } else {
        console.log('get shadow from the section after strains');
      }

      return $shadow;
    };

    this.onSectionScroll = function($el){
      if(paused) return;

      var p = this.getSectionScrollProgress($el);
      var o = this.getFadeAmount(p);
      var a = this.getScaleAmount(p);
      var s = this.getNextSectionShadow($el);
      
      this.setElementOpacity(o, $el, s);
      this.setElementTransform(a, $el);
    }

    this.pause = function(){
      paused = true;
      return this;
    }

    this.unpause = function(){
      paused = false;
      return this;
    }

    this.resizeHandler = function(){
      $strains.each(function(i, el) {
        var $el = $(el);
        $el.sticky('update');
        _this.onSectionScroll($el);
      });
    };

    this.initStrainSection = function($el){
      var index = $strains.index($el);
      var scrollSpace = scrollNameSpace + '.' + index;

      $el.css('z-index', index + 10); // 10 is arbitrary

      $el.on('sticky-start', function() { 
        $doc.on(scrollSpace, _this.onSectionScroll.bind(_this, $el, index));
      }).on('sticky-end', function() {
        $doc.off(scrollSpace);
      }).sticky();

      this.onSectionScroll($el);

    };

    var initialize = function(){

      $strains.each(function(i, el) {
        this.initStrainSection($(el));
      }.bind(this));
      
      $win.resize(_.debounce(_this.resizeHandler.bind(_this), 100));

    };

    this.init = _.once(initialize);

  }

  module.exports = new StrainSectionDesktop();

})(jQuery);