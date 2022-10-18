const player = document.getElementById('user');
const video = document.getElementById('video');
const audio = document.getElementById('audio');


$(document).ready(function(){
  video.play();
  video.loop = true;
  $('[href^="#"]').click(function(){
    changePage($(this).attr('href'));
  });
  // $('.js-enterFullScreen').click(function(){
  //   enterFullScreen();
  // });

  
  (async () => {
    let volumeCallback = null;
    let volumeInterval = null;
    
    // Initialize
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true
        }
      });
      const audioContext = new AudioContext();
      const audioSource = audioContext.createMediaStreamSource(audioStream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyser.minDecibels = -127;
      analyser.maxDecibels = 0;
      analyser.smoothingTimeConstant = 0.4;
      audioSource.connect(analyser);
      const volumes = new Uint8Array(analyser.frequencyBinCount);
      volumeCallback = () => {
        analyser.getByteFrequencyData(volumes);
        let volumeSum = 0;
        for(const volume of volumes)
          volumeSum += volume;
        const averageVolume = volumeSum / volumes.length;
        // Value range: 127 = analyser.maxDecibels - analyser.minDecibels;
        console.log(averageVolume * 100 / 127);
        //volumeVisualizer.style.setProperty('--volume', (averageVolume * 100 / 127) + '%');
      };
    } catch(e) {
      console.error('Failed to initialize volume visualizer, simulating instead...', e);
    }
    // Use
    $('.js-enterFullScreen').click(function(){
      // Updating every 100ms (should be same as CSS transition speed)
      if(volumeCallback !== null && volumeInterval === null)
        volumeInterval = setInterval(volumeCallback, 100);
      
      enterFullScreen();
    });
    // stopButton.addEventListener('click', () => {
    //   if(volumeInterval !== null) {
    //     clearInterval(volumeInterval);
    //     volumeInterval = null;
    //   }
    // });
  })();

});

function changePage(pageID){
  $('.pages section').removeClass('visible');
  $('.pages ' + pageID).addClass('visible');
  window.navigator.vibrate([300, 100, 200, 50, 300]);
}


function enterFullScreen() {
  audio.play();
  changePage('#home');
}

function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}


