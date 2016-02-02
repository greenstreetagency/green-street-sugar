// Will send analytics event on form submit if window.ga is available (via anaytics.js)
(function($){

  ContactForm = function($form){

    var self = this;

    this.$form = $form;

    var $inputEmail   = this.$form.find('[name="email"]');
    var $inputMessage = this.$form.find('[name="message"]');
    var $inputUrl     = this.$form.find('[name="url"]');
    var $inputSubmit  = this.$form.find('input[type="submit"]');

    var inputSubmitDefault = $inputSubmit.val(); // What does the button say when we load the page

    var emailRegex = "^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$";

    var messages = {
      sending : 'Sending...',
      success : 'Thank you for your message',
      failure : 'Something went wrong, please try again'
    };

    var MIN_SUBMIT_TIME = 1000; // Make the user wait at least this long before showing success message

    function initialize(){
      // Attach event handlers to the form
      self.$form.on('focus', '[name="email"], [name="message"]', function(){
          $(this).removeClass('error');
      });

      self.$form.on('submit', function(e){
        e.preventDefault();
        self.onSubmit(e);
      });

    };

    /**
     * Validates the email input on the contact form
     * adds error validation if the email doesn't pass the email regex match
     *
     * @return {bool} - Whether or not the email is valid
     */
    this.validateEmail = function() {
      var valid =  ($inputEmail.val().match( emailRegex ) !== null);

      if(!valid) {
        $inputEmail.addClass('error');
      }

      return valid;
    };

    /**
     * Validates the message input on the contact form
     * adds error validation if the message is a blank string
     *
     * @return {bool} - Whether or not the message is valid
     */
    this.validateMessage = function() {
      var msg   = $inputMessage.val();
      var valid = !(!msg || /^\s*$/.test(msg)); // inside parens checks if string is blank

      if(!valid) {
        $inputMessage.addClass('error');
      }

      return valid;
    };

    /**
     * Does all required validation checks on the form.
     *
     * @return {bool} - Whether or not the entire form is valid
     */
    this.validateForm = function(){
      var vEmail   = this.validateEmail();
      var vMessage = this.validateMessage()
      return vEmail && vMessage;
    };

    /**
     * Triggers focus on the first input of the form
     *
     * @return {this}
     */
    this.focus = function(){
      this.$form.find('input').first().focus();
      return this;
    };

    /**
     * Clears the inputs and resets the form
     *
     * @return {this}
     */
    this.reset = function(){
      $inputEmail.val('').removeClass('error');
      $inputMessage.val('').removeClass('error');
      $inputSubmit.val( inputSubmitDefault ).prop('disabled', false);
      return this;
    }

    // EVENT HANDLERS

    /**
     * Handles AJAX submit of the form
     *
     * @param {Event} e - Form submit event
     */
    this.onSubmit = function(e){

      var self = this;

      if( this.validateForm() ){

          var submitTime = Date.now();

          var params = {
            url     : $inputUrl.val(),
            email   : $inputEmail.val(),
            message : $inputMessage.val()
          };

          $.ajax({
              url        : '/contact.php',
              type       : 'POST',
              dataType   : 'json',
              data       : params,
              beforeSend : self.beforeSend
          })
          .done(function(data) {
            var timeoutLength = 0;
            var elapsedTime = Date.now() - submitTime;
            var callback = data['success'] ? self.onSuccess : self.onFailure;

            if(elapsedTime < MIN_SUBMIT_TIME){
              // Set a timeout delay so that the form submit takes the minimum submit time to complete
              timeoutLength = MIN_SUBMIT_TIME - elapsedTime;
            }
            
            return setTimeout(callback.bind(self), timeoutLength);
          })
          .fail( self.onFailure );
      }
    };

    /**
     * Disables form before submitting
     */
    this.beforeSend = function(){
      $inputSubmit.val( messages.sending ).prop('disabled', 'disabled');
      window.ga && ga('send', 'event', 'Contact Form', 'Message Submit');
    };

    /**
     * Resets the form on successful processing
     */
    this.onSuccess = function(){
      var _this = this;

      $inputSubmit.val( messages.success );

      setTimeout(function(){
          // Close the overlay after 1500ms
          _this.$form.parents('.overlay').find('.overlay-close').trigger('click');
          setTimeout(function(){
              // Clear the form 500ms after that
              _this.reset();
          }, 500);
      }, 1500);
    };

    /**
     * Rests parts of the form when the form submit fails
     */
    this.onFailure = function(){
      $inputSubmit.val( messages.failure ).prop('disabled', false);

      setTimeout(function(){
          $inputSubmit.val( inputSubmitDefault );
      }, 3000);
    };

    // END EVENT HANDLERS

    // Kick it off
    initialize();

  };

module.exports = ContactForm;


})(jQuery);