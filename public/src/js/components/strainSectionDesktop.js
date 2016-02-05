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
    var strainCount = $strains.length;
    var revealedCount = 0; // How many strain images have been revealed

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

    /**
     * Returns a number to use for transforming elements with css scale based on scroll progress
     *
     * @param {float} progress - 0.0 - 1
     * @return {float} - 0.0 - 1.0
     */
    this.getScaleAmount = function(progress){
      return +(1 - Math.pow(progress, 4)).toFixed(2);
    };

    /**
     * Returns a number to use for adjusting opacity of elements based on scroll progress
     *
     * @param {float} progress - 0.0 - 1
     * @return {float} - 0.0 - 1.0
     */
    this.getFadeAmount = function(progress){
      return +(1 - Math.pow(progress, 2.2)).toFixed(2);
    };

    /**
     * Returns a number to use for adjusting opacity of elements based on scroll progress
     *
     * @param {$element} $el
     * @return {$element or null}
     */
    this.getNextSectionShadow = function($el){
      var $shadow;
      var i = $strains.index($el);

      if($strains.eq(i+1).length){
        $shadow = $strains.eq(i+1).find('.strain-desktop-shadow'); //get the shadow from the next section
      } else {
        // console.log('get shadow from the section after strains');
      }

      return $shadow;
    };

    this.onScroll = function(){
      // if(paused) return;
    };

    /**
     * A scroll handler for revealing the images on the page
     * Handler is removed after all images have ben revealed
     *
     */
    this.onScrollStrainReveal = function(){
      if(paused) return;

      var scrollTop = $win.scrollTop();
      var winheight = $win.height();

      $strains.each(function(i, el){
        
        var $el = $(el);

        // Check if we've scrolled at least halfway down the strain section
        if((scrollTop + winheight - ($el.height() / 2)) > $el.offset()['top']){
          var $img = $el.find('.strain-image img');
          if($img.hasClass('offstage')){

            $img.removeClass('offstage');
            revealedCount++;
            
            if(revealedCount == strainCount){
              // Remove the scroll handler once all the strain images have been revealed
              $doc.off('scroll.strainReveal');
            }

          }
        }

      });
    };

    this.onStrainScroll = function($el){
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
    };

    this.unpause = function(){
      paused = false;
      return this;
    };

    this.onResize = function(){
      $strains.each(function(i, el){
        var $el = $(el);
        $el.sticky('update');
        _this.onStrainScroll($el);
      });
    };

    this.initStrainSection = function($el){
      var i = $strains.index($el);
      var scrollSpace = scrollNameSpace + '.' + i;

      $el.css('z-index', i + 10); // 10 is arbitrary

      $el.on('sticky-start', function() { 
        $doc.on(scrollSpace, _this.onStrainScroll.bind(_this, $el, i));
      }).on('sticky-end', function() {
        $doc.off(scrollSpace);
      }).sticky();

      $el.find('.strain-image img').addClass('offstage');

      this.onStrainScroll($el);

    };

    var initialize = function(){

      $strains.each(function(i, el) {
        this.initStrainSection($(el));
      }.bind(this));
      
      $win.on('resize', _.debounce(_this.onResize.bind(_this), 100));

      // This scroll handler uses a special namespace because we remove it after all strain images have been revealed
      $doc.on('scroll.strainReveal', _.throttle(_this.onScrollStrainReveal.bind(_this), 50));

    };

    this.init = _.once(initialize);

  }

  module.exports = new StrainSectionDesktop();

})(jQuery);