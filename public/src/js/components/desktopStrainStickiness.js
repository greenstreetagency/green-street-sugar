(function($, undefined){

  var _   = require('underscore');
  var AF  = require('request-frame');
  var rAF = AF('request');
  var cAF = AF('cancel');
  var clamp = require('./math/clamp');

  var DesktopStrainStickiness = function(){
    var _this = this;
    var scrollNameSpace = 'scroll.sticky.desktop';
    var $win = $(window);
    var $doc = $(document);
    var $strains = $('.strain');
    var paused = false;

    this.setElementTranslation = function(o, $el){

      // THIS IS JUST AN IDEA!  Scale the content to get smaller
      // Need to find the appropriate easing function though

      var $img = $el.find('.strain-image');
      var $content = $el.find('.section-strain-info');
      var a = o * Math.pow((-o+2), 1.3);
      var amt = clamp(a, 0, 1);

      rAF(function(){
        
        // console.log('setting translate to ', amt);

        $img.css({
          '-webkit-transform' : 'scale('+ amt +')',
              '-ms-transform' : 'scale('+ amt +')',
               '-o-transform' : 'scale('+ amt +')',
                  'transform' : 'scale('+ amt +')'
        });
        $content.css({
          '-webkit-transform' : 'scale('+ amt +')',
              '-ms-transform' : 'scale('+ amt +')',
               '-o-transform' : 'scale('+ amt +')',
                  'transform' : 'scale('+ amt +')'
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

      var p = _this.getSectionScrollProgress($el);
      var o = _this.getFadeAmount(p);
      var s = _this.getNextSectionShadow($el);
      
      _this.setElementTranslation(o, $el);
      _this.setElementOpacity(o, $el, s);
    }

    this.initStrainSection = function($el){
      var index = $strains.index($el);
      var scrollSpace = scrollNameSpace + '.' + index;

      $el.css('z-index', index + 10); // 10 is arbitrary

      $el.on('sticky-start', function() { 
        $doc.on(scrollSpace, _this.onSectionScroll.bind(_this, $el, index));
      }).on('sticky-end', function() {
        $doc.off(scrollSpace);
      }).sticky();

    };

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
        $(el).sticky('update');
      });
    };

    var initialize = function(){

      $strains.each(function(i, el) {
        
        var $el = $(el);

        this.initStrainSection($el);
        this.onSectionScroll($el);

      }.bind(this));
      
      $win.resize(_.debounce(_this.resizeHandler, 100));

    };

    this.init = _.once(initialize);

  }

  module.exports = new DesktopStrainStickiness();

})(jQuery);