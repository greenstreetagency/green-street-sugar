;(function($){

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */
  
  var DATA_KEY = 'overlay';
  var EVENT_KEY = '.' + DATA_KEY;

  var Event = {
    HIDE: 'hide' + EVENT_KEY,
    HIDDEN: 'hidden' + EVENT_KEY,
    SHOW: 'show' + EVENT_KEY,
    SHOWN: 'shown' + EVENT_KEY,
    FOCUSIN: 'focusin' + EVENT_KEY,
    CLICK_DISMISS: 'click.dismiss' + EVENT_KEY,
    KEYDOWN_DISMISS: 'keydown.dismiss' + EVENT_KEY,
  };

  /**
   * Overlay Constructor
   *
   * @constructor
   * @param {DOM node} element - The overlay element, containing all the proper markup and classnames
   * @param {object} options
   */
  SvOverlay = function (element, options) {
    // this => SvOverlay
    // element => <a href="#contact" data-overlay="#contact-form">contact</a>
    // options => undefined

    this.options        = options;
    this.$body          = $(document.body);
    this.$element       = $(element);
    this.isShown        = !1;

  };

  /**
   * Shows the overlay and adds event listeners
   *
   * @return {self}
   */
  SvOverlay.prototype.show = function(){

    var onComplete = function(){
      this.$element.trigger('focus').trigger(Event.SHOWN);
    }.bind(this); // this overlay

    var e = $.Event(Event.SHOW, { overlay: this, target: self.$element });
    this.$element.trigger(e);

    if (this.isShown) return;

    this.isShown = true;

    this.escape();

    this.$element.on(Event.CLICK_DISMISS, '.overlay-close', $.proxy(this.hide, this))

    this.enforceFocus();

    this.$element.fadeTo(500, 1, 'swing', onComplete); // 'easeOutQuart'

    this.$body.addClass('overlay-open'); // this must go AFTER jquery starts the fadeTo method in order to get nice CSS3 effects on the overlay content

    this.$element.show();

    return this;

  };

  /**
   * Hides the overlay and removes event listeners
   *
   * @param {Event} e
   * @return {this}
   */
  SvOverlay.prototype.hide = function(e){

    var onComplete = function(){
      this.$element.hide().trigger(Event.HIDDEN);
    }.bind(this);

    if (e) e.preventDefault();

    e = $.Event(Event.HIDE);

    this.$element.trigger(e);

    if (!this.isShown) return;

    this.isShown = false;

    this.$body.removeClass('overlay-open');

    this.escape();

    $(document).off('focusin.overlay')

    this.$element.off(Event.CLICK_DISMISS);

    this.$element.fadeTo(500, 0, 'swing', onComplete); // easeInQuart

    return this;

  };

  /**
   * Triggers focus on the overlay allowing us to capture keydown events
   */
   SvOverlay.prototype.enforceFocus = function() {

    $(document)
      .off(Event.FOCUSIN) // guard against infinite focus loop
      .on(Event.FOCUSIN, $.proxy(function (e) {
        if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
          this.$element.trigger('focus')
        }
      }, this));
  },

  /**
   * Attaches / Removes keydown handler on the overlay that checks if the esc key has been pressed
   * - Hides the overlay if it is displayed and 'esc' has been pressed
   */
  SvOverlay.prototype.escape = function() {
    if (this.isShown) {
      this.$element.on(Event.KEYDOWN_DISMISS, $.proxy(function (e) {
        e.which == 27 && this.hide() // esc key
      }, this))
    }
    else {
      this.$element.off(Event.KEYDOWN_DISMISS);
    }
  }

  /**
   * Checks if the content inside the overlay exceeds the window height
   *
   * @return {bool}
   */
  SvOverlay.prototype.hasOverflow = function() {
    return this.$element.find('.overlay-content').height() >= window.innerHeight;
  }

  // MODAL PLUGIN DEFINITION
  // =======================

  function Plugin(_relatedTarget) {
    return this.each(function () {

      var overlay = new SvOverlay(this);

      overlay.show();

    });
  }

  $.fn.svOverlay             = Plugin;
  $.fn.svOverlay.Constructor = SvOverlay;

  // OVERLAY API (no programmatic yet, only clicks)
  // ==============================================
  $(document).on('click', '[data-overlay]', function (e) {
    var $this   = $(this);
    var href    = $this.attr('href');
    var $target = $($this.attr('data-overlay') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))); // strip for ie7

    if ($this.is('a')) e.preventDefault();

    Plugin.call($target, this);

  });

})(jQuery);