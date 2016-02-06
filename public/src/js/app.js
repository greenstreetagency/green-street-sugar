(function(window, $, Modernizr, WOW, undefined){
  
  var _   = require('underscore');
  var AF  = require('request-frame');
  var rAF = AF('request');
  var cAF = AF('cancel');

  require('./components/svOverlay');

  var smoothScroll = require('smooth-scroll'); // https://github.com/cferdinandi/smooth-scroll

  // Component Classes
  var ContactForm             = require('./components/contactForm');
  var StrainSectionDesktop    = require('./components/strainSectionDesktop');
  var StrainSectionMobile     = require('./components/strainSectionMobile');

  // Cached Elements
  var $win       = $(window);
  var $doc       = $(document);
  var $body      = $(document.body);

  // Misc. Variables
  var contactForm; // Instance of ContactForm.  Set in `initialize`
  var bp = { // Update these if they change in _variables.scss
    xs : 480,
    sm : 768,
    md : 992,
    lg : 1200
  };

  var homeSection = {
    $el: $('.home-logo'),
    $sideTexts: $('.side-text, .mobile-secondary'),
    animateIn: function(){
      this.$el.removeClass('hidden');
      setTimeout(function(){
        this.$el.addClass('with-border');
        this.$sideTexts.removeClass('hidden');
      }.bind(this), 800);
    }
  };

  function initialize() {
    
    contactForm = new ContactForm( $('form#contact') );

    smoothScroll.init({
      speed: 800,
      easing: 'easeOutCubic',
      updateURL: false
    });

    StrainSectionDesktop.init();
    StrainSectionMobile.init();

    attachHandlers();

    new WOW({
      boxClass : 'gs-animate',
      offset   : 200, 
    }).init();

    setTimeout(function(){
      homeSection.animateIn();
    }, 1000);

    $win.trigger('resize');
  }

  function attachHandlers() {
    $doc.scroll(scrollHandler);
    $win.resize(_.debounce(resizeHandler, 100));

    $('#overlay-contact').on('shown.overlay', function(){
      contactForm.focus();
    })
    .on('hidden.overlay', function(){
      contactForm.reset();
    });

  }
  
  function scrollHandler(e) {
    // rAF(function(){});
  }

  function resizeHandler(e) {
    // console.log('calling resizeHandler ' + Date.now());
    breakpointCheck();
  }

  function breakpointCheck() {
    // Pause the strain scroll stuff while not visible
    if(window.innerWidth >= bp.sm){
      StrainSectionDesktop.unpause();
      StrainSectionMobile.pause();
    } else {
      StrainSectionDesktop.pause();
      StrainSectionMobile.unpause();
    }
  }

  // DOM Ready
  $( initialize )

})(window, jQuery, Modernizr, WOW);
