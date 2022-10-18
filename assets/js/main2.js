


$(document).ready(function(){
  
const video = document.getElementById('video');
$('[href^="#"]').click(function(){
  changePage($(this).attr('href'));
  $(this).addClass('clicked');
});
$('[data-timer').click(function(){
  myStopFunction();
  startTimer($(this).attr('data-timer'));
});
  $('.js-enterFullScreen').click(function(){
    video.play();
    $(this).hide();
  });
  $('.js-exitFullScreen').click(function(){
    exitFullScreen();
  });
});

function changePage(pageID){
  $('.pages section').removeClass('visible');
  $('.pages ' + pageID).addClass('visible');
}
var timerz;

function startTimer(duration) {
  duration= duration*60;
  var timer = duration, minutes, seconds;
  timerz = setInterval(function () {
      minutes = parseInt(timer / 60, 10);
      seconds = parseInt(timer % 60, 10);

      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;

      $('.time').html(minutes + ":" + seconds);

      if (--timer < 0) {
          timer = duration;
      }
  }, 1000);
}


function myStopFunction() {
  clearInterval(timerz);
}