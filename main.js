$(document).ready(function() {

    startGame();


    window.AddToHomeScreenInstance = window.AddToHomeScreen({
        appName: 'Countdown to Christmas',
        appNameDisplay: 'standalone',             
        appIconUrl: 'images/icon/apple-icon.png',     
        assetUrl: 'https://cdn.jsdelivr.net/gh/philfung/add-to-homescreen@2.3/dist/assets/img/',
        maxModalDisplayCount: -1                                              
    });

    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    function handleOrientationChange() {
        if (window.matchMedia("(orientation: landscape)").matches && isMobile) {
            $('.landscape').show();
        } else {
            $('.landscape').hide();
        }
    }
    
    // Initial check
    handleOrientationChange();
    
    // Listen for resize events
    window.addEventListener("resize", handleOrientationChange);

    function updateUnlockedDays(day){
        unlockedDays = day;
        $('body').attr('data-unlockedday', unlockedDays);
        document.cookie = `unlockedDays=${unlockedDays}; expires=Fri, 31 Dec 9999 23:59:59 GMT`;

        $.post("updateDays.php", { guid: guid, unlockedDays: unlockedDays })
            .done(function(data) {
                if (data == '0') {
                    alert("Error saving");
                }
            });

    }
      

    $('[data-install]').click(function() {
        window.AddToHomeScreenInstance.show('en');
    });

    window.addEventListener('blur', function() {
        if (bgAudioPlayer) {
            bgAudioPlayer.pause();
        }

        if (soundFxAudioPlayer) {
            soundFxAudioPlayer.pause();
        }

        if (soundAudioPlayer) {
            soundAudioPlayer.pause();
        }


    });

    window.addEventListener('focus', function() {
        if (bgAudioPlayer && bgAudio) {
            bgAudioPlayer.play();
        }

        if (soundFxAudioPlayer && soundFxAudio) {
            if(soundFxAudioPlayer.currentTime !== soundFxAudioPlayer.duration) {
                soundFxAudioPlayer.play();
            }
        }

        if (soundAudioPlayer && soundAudio) {
            if(soundAudioPlayer.currentTime !== soundAudioPlayer.duration) {
                soundAudioPlayer.play();
            }
        }
    });


    $('button[data-page]').click(function() {
        var target = $(this).attr('data-page');
        var scrollNumber = $(this).attr('data-scroll') ?? null;
        if(target.includes('door')) {
            if($(this).attr('data-enabled') == 'true') {
                playSoundFx('open');
            }else{
                return;
            }
        }
        goToPage(target, scrollNumber);
    });
    $('[data-show]').click(function() {
        var target = $(this).attr('data-show').split(",");
        target.forEach(function(item) {
            showElement(item);
        });
    });
    $('[data-toggle]').click(function() {
        var target = $(this).attr('data-toggle').split(",");
        target.forEach(function(item) {
            toggleElement(item);
        });
    });
    $('[data-hide]').click(function() {
        var target = $(this).attr('data-hide').split(",");
        target.forEach(function(item) {
            hideElement(item);
        });
    });
    $('[data-enable]').click(function() {        
        var target = $(this).attr('data-enable').split(",");
        target.forEach(function(item) {
            enableElement(item);
        });
    });
    $('[data-disable]').click(function() {
        var target = $(this).attr('data-disable').split(",");
        target.forEach(function(item) {
            disableElement(item);
        });
    });
    $('[data-run]').click(function(e) {
        var target = $(this).attr('data-run');
        window[target](e);
    });
    $('[data-sound-fx]').click(function() {
        var target = $(this).attr('data-sound-fx');
        var enabled = $(this).attr('data-enabled') ?? 'true';
        if(enabled === 'true') {
            playSoundFx(target ?? null);
        }
    });
    $('[data-play]').click(function() {
        var target = $(this).attr('data-play');
        $('page:visible [data-id="'+target+'"]').get(0).play();
    });
    $('[data-stop]').click(function() {
        var target = $(this).attr('data-stop');
        $('page:visible [data-id="'+target+'"]').get(0).pause();
    });


    let doorCode = null;
    let doorNumber = null;
    $('.door[data-page^="door"]').click(function(event) {
        if($(this).attr('data-enabled') == 'true') return;
        doorNumber = $(this).find('div').text();
        doorCode =  $(this).attr('data-code');

        $('.doorCodeInput').val('');
        $('.doorPadlock').fadeIn();
        bgAudioPlayer.volume = 0.2;
    });

    $('.unlockDoor').click(function(event) {
        let userInput = $('.doorCodeInput').val();
        $('.doorPadlock').fadeOut(function() {  
            if(doorCode == userInput ) {
                playSoundFx('unlock');
                $(`[data-page="door${doorNumber}"]`).attr('data-enabled', 'true');

                updateUnlockedDays(doorNumber);

                showSuccessMessage(doorNumber);
            }else{
                playSoundFx('locked');
            }

            $('.doorCodeInput').val('');
            doorCode = null;
            doorNumber = null;
            bgAudioPlayer.volume = 0.5;
        });

    });


    var dragStartX, dragStartY, initialTop, initialLeft;
    var draggable = null;
    $('[data-drag-x]').on('touchstart', function(event) {
        event.preventDefault();
        if($(this).attr('data-enabled') == 'false') return;
        draggable = this;
        var clientX = event.clientX || event.touches[0].clientX;
        var rect = draggable.getBoundingClientRect();
        dragStartX = clientX;
        initialLeft = rect.left;

        document.addEventListener('mousemove', onMoveX);
        document.addEventListener('touchmove', onMoveX);
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchend', onEnd);
    });

    $('[data-drag]').on('touchstart', function(event) {
        event.preventDefault();
        if($(this).attr('data-enabled') == 'false') return;
        draggable = this;
        var clientX = event.clientX || event.touches[0].clientX;
        var clientY = event.clientY || event.touches[0].clientY;
        var rect = draggable.getBoundingClientRect();
        dragStartX = clientX;
        dragStartY = clientY;
        initialLeft = rect.left;
        initialTop = rect.top;

        document.addEventListener('mousemove', onMove);
        document.addEventListener('touchmove', onMove);
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchend', onEnd);
    });

    function onMove(event) {
        var clientX = event.clientX || event.touches[0].clientX;
        var newLeft = initialLeft + clientX - dragStartX;
        var clientY = event.clientY || event.touches[0].clientY;
        var newTop = initialTop + clientY - dragStartY;
        draggable.style.transform = `translateX(${newLeft}px) translateY(${newTop}px)`;
    }

    function onMoveX(event) {
        var clientX = event.clientX || event.touches[0].clientX;
        var newLeft = initialLeft + clientX - dragStartX;
        draggable.style.transform = `translateX(${newLeft}px)`;
    }
    
    function onEnd() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('mousemove', onMoveX);
        document.removeEventListener('touchmove', onMoveX);
        document.removeEventListener('mouseup', onEnd);
        document.removeEventListener('touchend', onEnd);
    }

    $('#success').click(function() {
        $(this).fadeOut();
    });


});

let unlockedDays = 1;
let guid = null;
let bgAudio = null;
let bgAudioPlayer = null;
let soundAudio =  null; 
let soundAudioPlayer = null;
let soundFxAudio =  null; 
let soundFxAudioPlayer = null;
let globalInterval = null;
let globalTimeout = null;

function goToPage(page, scrollNumber) {
    $('page:visible').fadeOut();
    const curPage = $('page[id="' + page + '"]');
    const curBackground = $(curPage).data('bg-audio');
    const curBgVolume = $(curPage).data('bg-volume');
    const curSound = $(curPage).data('sound');
    const curFunction = $(curPage).data('enter-func');
    if(globalInterval) clearInterval(globalInterval);
    if(globalTimeout) clearTimeout(globalTimeout);
    playSound(curSound ?? null);
    playBackground(curBackground ?? null, curBgVolume ?? 0.5);
    
    $('.doorPadlock').fadeOut();
    $(curPage).fadeIn();

    if(scrollNumber){
        scrollTo(page, scrollNumber);
    }

    if(curFunction) {
        window[curFunction]();
    }

}

function showSuccessMessage(doorNumber){
    $('#success .day').html(doorNumber-1);
    $('#success').fadeIn();
    setTimeout(function() {
        $('#success').fadeOut();
    }, 5000);
}

function scrollTo(page, scrollNumber) {
    let mainElement = document.querySelector('main');
    let roomElement = document.querySelector('page[id="' + page + '"] .rooms');
    roomElement.scrollLeft = 0; 
    roomElement.scrollBy({ left: mainElement.offsetWidth * scrollNumber });
}

function playBackground(newBgAudio, bgVolume) {
    if(unlockedDays>=24){
        newBgAudio = 'bg-peril';
    }
    if(newBgAudio && newBgAudio !== bgAudio) {
        bgAudio = newBgAudio;
        if(bgAudioPlayer) {
            bgAudioPlayer.pause();
        }

        bgAudioPlayer = new Audio('audio/' + bgAudio + '.mp3');
        bgAudioPlayer.play();
        bgAudioPlayer.loop = true;
    }

    if(newBgAudio === null) {
        bgAudio = null;
        if(bgAudioPlayer) bgAudioPlayer.pause();
    }else{
        bgAudioPlayer.volume = bgVolume ?? 0.5;
    }
}

function playSound(newSoundAudio) {
    if(newSoundAudio) {
        soundAudio = newSoundAudio;
        if(soundAudioPlayer) {
            soundAudioPlayer.pause();
        }   
        soundAudioPlayer = new Audio('audio/' + soundAudio + '.mp3');
        setTimeout(function() {    
            soundAudioPlayer.play();
        }, 1500);
    }

    if(newSoundAudio === null) {
        soundAudio = null;
        if(soundAudioPlayer) soundAudioPlayer.pause();
    }
}


function playSoundFx(newSoundFxAudio) {
    if(newSoundFxAudio) {
        soundFxAudio = newSoundFxAudio;
        if(soundFxAudioPlayer) {
            soundFxAudioPlayer.pause();
        }   
        soundFxAudioPlayer = new Audio('audio/' + soundFxAudio + '.mp3');
        soundFxAudioPlayer.play();
    }

    if(newSoundFxAudio === null) {
        soundFxAudio = null;
        if(soundAudioFxPlayer) soundAudioFxPlayer.pause();
    }
}


function startGame(){

    const currentDate = new Date();
    const targetDate = new Date('2024-12-01');

    if (window.matchMedia('(display-mode: standalone)').matches) {

        if (currentDate >= targetDate) {
            goToPage('warning');
        } else {
            goToPage('wait');
        }
    } else {
        goToPage('homescreen');
    }


    $('.door').attr('data-enabled', 'false');

    $.getJSON("https://api.ipify.org?format=jsonp&callback=?",
      function(json) {

        let lastThreeNumbers = '000';
        let ipParts = json.ip.split('.');
        if(ipParts.length == 4){
            lastThreeNumbers = ipParts[1].charAt(0) + ipParts[2].charAt(0) + ipParts[3].charAt(0);
        }
        $('.room13 button').attr('data-code', lastThreeNumbers);
        $('.room13answer').html(lastThreeNumbers);
      }
    );


    unlockedDays = parseInt(getCookie('unlockedDays')) || 1;
    guid = getCookie('guid') || '';

    if (!guid) {
        window.location.href = 'https://countdowntochristmas.app';
    }

    $('body').attr('data-unlockedday', unlockedDays);

    for(let i=0; i<unlockedDays; i++){
        $(`[data-page="door${i+1}"]`).attr('data-enabled', 'true');
    }
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function showElement(element) {
    $('page:visible [data-id="' + element + '"]').fadeIn();
}

function hideElement(element) {
    $('page:visible [data-id="' + element + '"]').fadeOut();
}

function toggleElement(element) {
    $('page:visible [data-id="' + element + '"]').fadeToggle();
}

function enableElement(element) {
    $('page:visible [data-id="' + element + '"]').attr('data-enabled', 'true');
}

function disableElement(element) {
    $('page:visible [data-id="' + element + '"]').attr('data-enabled', 'false');
}

let blurTime;
function windowFocus() {
    window.addEventListener("focus", function(event) {
        const focusTime = new Date();
        const elapsedSeconds = (focusTime - blurTime) / 1000;
        if (elapsedSeconds >= 10 && $('#door3:visible').length > 0) {
            hideElement('paper-button');
            enableElement('present-button');
            playSoundFx('sparkle');
        }
    }, false);

    window.addEventListener("blur", function(event) {
        blurTime = new Date();
        hideElement('note');
    }, false);
}

function day2(){
      requestGyroscopeAccess('waterCycle');
}

var hasGyro = false;
var waterElement = document.querySelector('#door2 .water');
async function waterCycle(event) {
    if(hasGyro==false) {
        $('#door2 .water').removeClass('a-rotating');
        hasGyro = true;
    }
    var alpha = event.alpha; // rotation around z-axis (-180 to 180)

    document.getElementById('waterElement').style.transform = `rotateZ(${alpha}deg)`;
}

function requestGyroscopeAccess(functionToCall) {
    hasGyro = false;
    if (window.DeviceOrientationEvent) {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        window.addEventListener('deviceorientation', (event) => { 
                            window[functionToCall](event);
                        });
                    }
                })
                .catch();
        } else {
            window.addEventListener('deviceorientation', (event) => { 
                window[functionToCall](event);
            });
        }
    }
}

function isDisconnected() {
    globalInterval = setInterval(function() {
        console.log(navigator.onLine);
        if (!navigator.onLine) {
            enableElement('powerbox');
        } else {
            disableElement('powerbox');
        }
    }, 3000); 
}

let javascriptNode = null;
let micStream = null;
let timeoutId;

function door4() {
    if ($('#door4 .clock').hasClass('a-code') || $('#door4 .clock').hasClass('a-rotating')) { 
        return; 
    }

    const startAudioProcessing = (stream) => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);
        micStream = stream;
        
        bgAudioPlayer.pause();
        bgAudio = null;
        soundAudioPlayer.pause();
        soundAudio = null;

        analyser.smoothingTimeConstant = 0.8;
        analyser.fftSize = 1024;

        microphone.connect(analyser);
        analyser.connect(javascriptNode);
        javascriptNode.connect(audioContext.destination);

        const startTimer = () => {

            $('#door4 .clock').stop().addClass('a-rotating');
            timeoutId = setTimeout(() => {
                $('#door4 .clock').removeClass('a-rotating').addClass('a-code');
                stream.getTracks().forEach(track => track.stop());
                javascriptNode.disconnect();
            }, 10000); // 10 seconds
        };

        startTimer();
        

        javascriptNode.onaudioprocess = function() {
            const array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            let values = 0;

            const length = array.length;
            for (let i = 0; i < length; i++) {
                values += (array[i]);
            }

            const average = values / length;
            console.log(Math.round(average));
            if (average > 5) {
                console.log('Noise detected!');  
                const clockElement = document.querySelector('#door4 .clock');
                clockElement.classList.remove('a-rotating');
                void clockElement.offsetWidth; // force a reflow
                clockElement.classList.add('a-rotating');
                clearTimeout(timeoutId);
                startTimer();
            }
        }
    };

    if (micStream) {
        micStream.getTracks().forEach(track => track.enabled = true);
        startAudioProcessing(micStream);
    } else {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                startAudioProcessing(stream);
            })
            .catch(err => {
                console.error('Error accessing microphone:', err);
            });
    }
}

function endMic(){
    if(micStream){
        micStream.getTracks().forEach(track => track.stop());
        micStream = null;
    }
    if(javascriptNode){
        javascriptNode.disconnect();
    }

    if(timeoutId){
        clearTimeout(timeoutId);
        const clockElement = document.querySelector('#door4 .clock');
        clockElement.classList.remove('a-rotating');
        void clockElement.offsetWidth; // force a reflow
    }


    bgAudioPlayer.play();
}

function door6(){
    setTimeout(function() {
        startFog();
    }, 2000);
}

function startFog(){
    bgAudioPlayer.pause();
    bgAudio = null;
    soundAudioPlayer.pause();
    soundAudio = null;

    let fogOpacity = 0;
    const fogElement = document.querySelector('#door6 .fog');
    navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);
        micStream = stream;

        analyser.smoothingTimeConstant = 0.8;
        analyser.fftSize = 1024;

        microphone.connect(analyser);
        analyser.connect(javascriptNode);
        javascriptNode.connect(audioContext.destination);


        javascriptNode.onaudioprocess = function() {
            const array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            let values = 0;

            const length = array.length;
            for (let i = 0; i < length; i++) {
                values += (array[i]);
            }

            const average = values / length;
            
            if (average > 25) {
                fogOpacity = fogOpacity >= 0.98 ? 1 : fogOpacity + 0.02;
            }else if (average > 20) {
                fogOpacity = fogOpacity >= 0.98 ? 1 : fogOpacity + 0.01;
            }else{
                fogOpacity = fogOpacity <= 0.01 ? 0 : fogOpacity - 0.01 ;
            }

            fogElement.style.opacity = fogOpacity;
        }
    })
    .catch(err => {
        console.log('The following error occurred: ' + err.name)
    });
}



function stopMic(){
    if(micStream){
        micStream.getTracks().forEach(track => track.stop());
    }
    if(javascriptNode){
        javascriptNode.disconnect();
    }
}

//DOOR 7 MOVIES
function makeFullscreen() {
    let videoElement = $('page:visible video').get(0);
    if (videoElement.requestFullscreen) {
        videoElement.requestFullscreen();
    } else if (videoElement.mozRequestFullScreen) { // Firefox
        videoElement.mozRequestFullScreen();
    } else if (videoElement.webkitRequestFullscreen) { // Chrome, Safari and Opera
        videoElement.webkitRequestFullscreen();
    } else if (videoElement.msRequestFullscreen) { // IE/Edge
        videoElement.msRequestFullscreen();
    } else if (videoElement.webkitEnterFullScreen) { // iOS
        videoElement.webkitEnterFullScreen();
    }
};

function requestCameraAccess() {
    return navigator.mediaDevices.getUserMedia({ 
        audio: false, 
        video: { facingMode: { ideal: "environment" } } 
    });
}

function measureBrightness(stream) {
    const glowElement = document.querySelector('#door5 .glow');
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });


            video.addEventListener('play', function () {
                // Measure brightness more frequently, e.g., every 100ms
                const interval = 100;
                videoInterval = setInterval(() => {
                    // Downsample to smaller region for faster brightness calculation
                    const sampleWidth = 50;
                    const sampleHeight = 50;

                    ctx.drawImage(video, 0, 0, sampleWidth, sampleHeight);
                    const imageData = ctx.getImageData(0, 0, sampleWidth, sampleHeight).data;
                    let brightness = 0;

                    for (let i = 0; i < imageData.length; i += 4) {
                        // Calculate brightness with weighted RGB channels
                        brightness += (0.3 * imageData[i] + 0.5 * imageData[i + 1] + 0.2 * imageData[i + 2]);
                    }

                    // Normalize brightness value
                    brightness /= (imageData.length / 4);
                    brightness = brightness / 255;

                    if (brightness > 0.4) {
                        let currentPlant = document.querySelector('#door5 [data-enabled="true"]');

                        if (!currentPlant) return;

                        let currentScale = parseFloat(getComputedStyle(currentPlant).getPropertyValue('--scale'));

                        if (currentScale >= 1) {
                            currentPlant.setAttribute('data-enabled', 'false');
                        } else {
                            // Increment scale with brightness factor
                            currentScale += 0.025 * brightness;
                            currentPlant.style.setProperty('--scale', currentScale);
                        }

                        glowElement.style.opacity = brightness + 0.25;
                    }else{

                        glowElement.style.opacity = brightness;
                    }
                    // Update glow element's opacity based on brightness

                    resolve(brightness);
                }, interval);

                video.addEventListener('ended', () => clearInterval(videoInterval));
            });

        video.addEventListener('error', (err) => {
            clearInterval(videoInterval);
            reject(err);
        });
    });
}


let videoStream;
let videoInterval;
function door5(){
    requestCameraAccess()
    .then(measureBrightness)
    .then(brightness => console.log(brightness))
    .catch(error => console.error(error));
}

function endCamera(){
    if(videoStream){
        videoStream.getTracks().forEach(track => track.stop());
    }
    if(videoInterval){
        clearInterval(videoInterval);
    }
}

function door9(){
    scrollTo('door9', 1);
}


function handleVisibilityChange() {
    if (document.hidden) {
        // The page is hidden, clear the timer
        clearTimeout(globalTimeout);
        disableElement('ice');
    } else {
        // The page is visible, start the timer
        enableElement('ice');
        globalTimeout = setTimeout(function() {
            enableElement('pallet');
            disableElement('effects');
        }, 175000);
    }
}

function door10() {
    // Listen for visibility change events
    document.addEventListener('visibilitychange', handleVisibilityChange);
    enableElement('ice');
    // Start the timer
    globalTimeout = setTimeout(function() {
        enableElement('pallet');
        disableElement('effects');
    }, 115000);
}

function addKey(e){
    var keyPressed = e.target.innerText;

    if(keyPressed == ''){
        $('#door11 .screen').empty();
        return;
    }

    $('#door11 .screen').append(keyPressed);
}

function printPage(){
    if($('#door11 .screen').text() != 'spirit') return;
    window.print();
}


function door12(){
 
    let recordPlayerAudio = new Audio('audio/12-record.mp3');
    let radioAudio = new Audio('audio/12-radio.mp3');
    let cdPlayerAudio = new Audio('audio/12-cdplayer.mp3');
    let allPlayerAudio = new Audio('audio/12-all.mp3');

    let playRadio = false;
    let playRecord = false;
    let playCd = false;

    $('#door12 .touchend').on('touchend', function() {
        radioAudio.currentTime = 0;
        recordPlayerAudio.currentTime = 0;
        cdPlayerAudio.currentTime = 0;

        if(playRadio && playRecord && playCd) {
            allPlayerAudio.play();
        }else{
            if(playRadio) {
                radioAudio.play();
            }
            if(playRecord) {
                recordPlayerAudio.play();
            }
            if(playCd) {
                cdPlayerAudio.play();
            }
        }
    
        playCd = false;
        playRadio = false;
        playRecord = false;
    });

    $('#door12 .recordplayer').on('touchstart', function() {
        playRecord = true;
    });

    $('#door12 .radio').on('touchstart', function() {
        playRadio = true;
    });

    $('#door12 .cdplayer').on('touchstart', function() {
        playCd = true;
    });
}

function door13(){
    $('.record').click(function(e){
        let rotation = parseInt(this.style.getPropertyValue('--rotate')) || 0;

        if(rotation == '220'){
            return;
        } 

        this.style.setProperty('--rotate', (rotation + 90) + 'deg');  

        if(rotation + 90 == '220'){
            if(!$('.record').hasClass('fallen')){
                playSoundFx('open');
                $(this).addClass('fallen'); 
            }
        }
    });
}


function measureDarkness(stream) {
    const glowElement = document.querySelector('#door16 .lightsout');
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();

        videoStream = stream;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        video.addEventListener('play', function() {
            videoInterval = setInterval(() => {
                ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                let brightness = 0;

                for (let i = 0; i < imageData.length; i += 4) {
                    brightness += (0.3 * imageData[i] + 0.5 * imageData[i + 1] + 0.2 * imageData[i + 2]);
                }

                brightness /= (imageData.length / 4);
                brightness = brightness / 255;; // Normalize to -1 to 1
                console.log(brightness);
                if(brightness < 0.10) {
                    glowElement.style.opacity = 1 - (brightness * 10);
                }else{
                    glowElement.style.opacity = 0;
                }
                resolve(brightness);
            }, 250); // Measure brightness every 1 second

            video.addEventListener('ended', () => clearInterval(interval));
        });
    }); 
}


function door15() {
    let clothesElements = document.querySelectorAll('.clothes');
let rail = document.querySelector('.rail');

clothesElements.forEach((clothes) => {
    let shiftX;

    function startDrag(event) {
        event.preventDefault();
        let clientX = event.touches ? event.touches[0].clientX : event.clientX;
        shiftX = clientX - clothes.getBoundingClientRect().left;
        document.addEventListener('mousemove', moveDrag);
        document.addEventListener('touchmove', moveDrag);
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchend', stopDrag);
    }

    function moveDrag(event) {
        let clientX = event.touches ? event.touches[0].clientX : event.clientX;
        let newLeft = clientX - shiftX - rail.getBoundingClientRect().left;

        // The pointer is outside of .rail => lock the new position within the bounds
        if (newLeft < 0) newLeft = 0;
        let rightEdge = rail.offsetWidth - clothes.offsetWidth;
        if (newLeft > rightEdge) newLeft = rightEdge;

        clothes.style.left = newLeft + 'px';
    }

    function stopDrag() {
        document.removeEventListener('mousemove', moveDrag);
        document.removeEventListener('touchmove', moveDrag);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchend', stopDrag);
    }

    clothes.addEventListener('mousedown', startDrag);
    clothes.addEventListener('touchstart', startDrag);
    clothes.ondragstart = function() {
        return false;
    };
});
}

function door16(){
    requestCameraAccess()
    .then(measureDarkness)
    .then(brightness => console.log(brightness))
    .catch(error => console.error(error));
}

function door17(){
    document.addEventListener('copy', (event) => {
        event.preventDefault();
        const pagelink = `The first number you need is 7`;
        navigator.clipboard.writeText(pagelink)
        .then(() => console.log('Copied to clipboard'))
        .catch(err => alert('The first number you need is 7'));
    });
}

function door14(){
    // JavaScript
    let sky = document.querySelector('#door14 .sky');
    let startDistance = 0;
    let step = 0;

    sky.addEventListener('touchstart', function(event) {
        if (event.touches.length === 2) {
            event.preventDefault();
            startDistance = getDistance(event.touches[0], event.touches[1]);
        }
    }, false);

    sky.addEventListener('touchmove', function(event) {
        if (event.touches.length === 2) {
            event.preventDefault();
            let endDistance = getDistance(event.touches[0], event.touches[1]);
            step += (endDistance - startDistance) * 0.01;
            step = Math.min(Math.max(step, 0), 6);
            sky.style.setProperty('--step', step);
            startDistance = endDistance;
        }
    }, false);

    function getDistance(touch1, touch2) {
        let xDiff = touch2.clientX - touch1.clientX;
        let yDiff = touch2.clientY - touch1.clientY;
        return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    }
}

function door20(){
    let kisses = [false, false];
    let kissSound = new Audio('audio/20-kiss.mp3');
    let flySound = new Audio('audio/20-fly.mp3');
    $('body').addClass('lockscreen');
    $('#door20 .kiss > div').on('touchstart', function() {
        kisses[$(this).index()] = true;
        if(kisses[0] == true && kisses[1] == true) {
           kissSound.play();
        }
    });

    $('#door20 .kiss > div').on('touchend', function() {
        if(kisses[0] == true && kisses[1] == true) {
            flySound.play();
            kisses = [];
            $('#door20 .kiss').hide();
            $('#door20 .robin').hide();
            enableElement('shootingstars');
         }else{
            let index = $(this).index();
            kisses[index] = false;
         }
    });
}

function removeScreenLock(){
    $('body').removeClass('lockscreen');
}

function resetWrapping(){
    $('.rollScroll').each(function() {
        $(this).scrollTop($(this)[0].scrollHeight);
    });
}

function door21(){
    resetWrapping();
    let rollSound = new Audio('audio/21-roll.mp3');
    $('.rollScroll').on('scroll', function() {
        rollSound.play();
    });
}


let drinkOrder = [];
function door22(){
    
}

function toggleDisco(){
    let currentTime = new Date();
    let hours = (currentTime.getHours() % 12 || 12).toString();
    let minutes = currentTime.getMinutes().toString();
    let fail = new Audio('audio/22-fail.mp3');
    let discoMusic = new Audio('audio/22-disco.mp3');

    if(hours.includes('5') || minutes.includes('5')){
        enableElement('discoball');
        enableElement('discolights');
        discoMusic.play();

        setTimeout(function() {
            disableElement('discoball');
            disableElement('discolights');
            discoMusic.pause();
        }, 6000);
    }else{
        disableElement('discoball');
        disableElement('discolights');
        fail.play();
    }
}

let drinks = [];
let isPouring = false;
function bottle(color){
    if(drinks.length == 3) return;
    if(isPouring) return;
    isPouring = true;
    let pourSound = new Audio('audio/22-pour.mp3');
    let fail = new Audio('audio/22-fail.mp3');
    let requiredColors = [];
    drinkOrder.push(color);

    enableElement(color);
    pourSound.play();


    setTimeout(function() {
        disableElement(color);
        if(drinkOrder.length > 3) {
            
            $('page:visible .drink').removeClass('flawed');
            $('page:visible .shaker').removeClass('pouring pour1 pour2 pour3');
            if(drinks.length == 0){
             requiredColors = ['green', 'green', 'yellow', 'blue'];
            }else if(drinks.length == 1 ){
                requiredColors = ['red', 'blue', 'red', 'yellow'];
            }else if(drinks.length == 2 ){
                requiredColors = ['red', 'blue', 'green', 'yellow'];
            }

            if (drinkOrder.every(color => requiredColors.includes(color)) && requiredColors.every(color => drinkOrder.includes(color))  ) {
                $('page:visible .shaker').addClass('pouring pour' + (drinks.length+1));
                $('page:visible .drink.drink' + (drinks.length+1)).addClass('poured');
                pourSound.currentTime = 0;
                pourSound.play();
                drinks.push(true);
            }else{
                $('page:visible .shaker').addClass('pouring pour' + (drinks.length+1));
                $('page:visible .drink.drink' + (drinks.length+1)).addClass('flawed');
                fail.play();
            }
            drinkOrder = [];

            setTimeout(function() {
                $('page:visible .shaker').removeClass('pouring pour1 pour2 pour3');
                isPouring = false;
            }, 2000);
        }else{  
            isPouring = false;
        }
    }, 2000);

}





function door23(){
    let dumbells = document.querySelectorAll('#door23 .dumbell');
    let isDragging = false;
    let startY, startTop, weight, stopDrag, lastTouch;
    let dragAmount = 0;
    $('body').addClass('lockscreen');

    dumbells.forEach(dumbell => {
        console.log(dumbell);
        dumbell.addEventListener('touchstart', function(event) {
            startY = event.touches[0].clientY;
            isDragging = true;
            let curWeight = dumbell.getAttribute('data-weight');
            if(curWeight !== weight){
                startTop = dumbell.offsetTop;
                lastTouch = 0;
                dragAmount = 0;
                weight = dumbell.getAttribute('data-weight');
            }
            
            if(stopDrag){
                clearTimeout(stopDrag);
            }
        });

        dumbell.addEventListener('touchmove', function(event) {
            if (isDragging) { 
                stopDrag && clearTimeout(stopDrag);
                let deltaY = event.touches[0].clientY - startY; 
                deltaY = Math.min(Math.max(deltaY, -startTop), 0) / (weight);

                if(deltaY < 0 && lastTouch > deltaY) {
                    dragAmount += deltaY;
                }

                lastTouch = deltaY;

                dumbell.style.transform = `translateY(${dragAmount}px)`;
            }
        });

        dumbell.addEventListener('touchend', function() {
            stopDrag = setTimeout(function() {
                isDragging = false;
                dragAmount = 0
                weight = 0;
                lastTouch = 0;
                dumbell.style.transition = 'transform 0.5s'; 
                dumbell.style.transform = 'translateY(0)';
                setTimeout(function() {
                    dumbell.style.transition = '';
                    let audio = new Audio('audio/23-thud.mp3');
                    audio.play();
                }, 500); 
            }, 300); 
        });
    });
}

function sharePage() {
    if (navigator.share) {
        navigator.share({
            title: 'Look to the sky outside...',
            text: '...then follow the FOOTPRINTS up!',
            url: 'https://app.countdowntochristmas.app/location.html',
        })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing', error));
    }   
}

function pickIce() {
    if($('#door25 .icedoor').attr('data-enabled')=='false') return;
    let icedoor = document.querySelector('#door25 .icedoor');
    let scale = icedoor.dataset.scale ?? 1;
    scale -= 0.005;
    icedoor.dataset.scale = scale;
    icedoor.style.transform = `scale(${scale})`;

    let audio = new Audio('audio/25-icechip.mp3');
    audio.play();

    if(scale <= 0.5) {
        $('#door25 .icedoor').fadeOut();
        bgAudioPlayer.pause();
        $('#door25 .finalvideo').fadeIn();
        $('#door25 .finalvideo').get(0).play();
    }
}