(function($, _, undefined){

  var MobileStrainSlider = function(){

    var $imageList = $('.strain-mobile-image-list');
    var $strainInfos = $('.strain-mobile-infos');
    var $strainInfo = $('.strain-mobile-info');
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

    var initialize = function(){
      var _this = this;
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
      });
    };

    this.init = _.once(initialize);

  }

  module.exports = new MobileStrainSlider();

})(jQuery, require('underscore'));