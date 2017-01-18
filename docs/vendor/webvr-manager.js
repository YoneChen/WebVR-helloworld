/*
 * Copyright 2015 Boris Smus. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */



/**
 * Helper for getting in and out of VR mode.
 * Here we assume VR mode == full screen mode.
 *
 * 1. Detects whether or not VR mode is possible by feature detecting for
 * WebVR (or polyfill).
 *
 * 2. If WebVR is available, provides means of entering VR mode:
 * - Double click
 * - Double tap
 * - Click "Enter VR" button
 *
 * 3. Provides best practices while in VR mode.
 * - Full screen
 * - Wake lock
 * - Orientation lock (mobile only)
 */
(function() {

function WebVRManager(renderer, effect, params) {
  this.params = params || {};

  // Set option to hide the button.
  this.hideButton = this.params.hideButton || false;

  // Save the THREE.js renderer and effect for later.
  this.renderer = renderer;
  this.effect = effect;

  // Create the button regardless.
  this.vrButton = this.createVRButton();

  // Check if the browser is compatible with WebVR.
  this.getHMD().then(function(hmd) {
    // Activate either VR or Immersive mode.
    if (hmd) {
      this.activateVR();
    } else {
      this.activateImmersive();
    }
    // Set the right mode.
    this.defaultMode = hmd ? Modes.COMPATIBLE : Modes.INCOMPATIBLE;
    this.setMode(this.defaultMode);
  }.bind(this));

  this.os = this.getOS();
  this.logo = this.base64('image/png', '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');
  this.logoDisabled = this.base64('image/png', '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');
}

var Modes = {
  // Incompatible with WebVR.
  INCOMPATIBLE: 1,
  // Compatible with WebVR.
  COMPATIBLE: 2,
  // In virtual reality via WebVR.
  VR: 3,
};

/**
 * Promise returns true if there is at least one HMD device available.
 */
WebVRManager.prototype.getHMD = function() {
  return new Promise(function(resolve, reject) {
    navigator.getVRDevices().then(function(devices) {
      // Promise succeeds, but check if there are any devices actually.
      for (var i = 0; i < devices.length; i++) {
        if (devices[i] instanceof HMDVRDevice) {
          resolve(devices[i]);
          break;
        }
      }
      resolve(null);
    }, function() {
      // No devices are found.
      resolve(null);
    });
  });
};

WebVRManager.prototype.isVRMode = function() {
  return this.mode == Modes.VR;
};

WebVRManager.prototype.render = function(scene, camera) {
  if (this.isVRMode()) {
    this.effect.render(scene, camera);
  } else {
    this.renderer.render(scene, camera);
  }
};

WebVRManager.prototype.createVRButton = function() {
  var button = document.createElement('img');
  var s = button.style;
  s.position = 'absolute';
  s.bottom = '5px';
  s.left = 0;
  s.right = 0;
  s.marginLeft = 'auto';
  s.marginRight = 'auto';
  s.width = '64px'
  s.height = '64px';
  s.backgroundSize = 'cover';
  s.backgroundColor = 'transparent';
  s.border = 0;
  s.userSelect = 'none';
  s.webkitUserSelect = 'none';
  s.MozUserSelect = 'none';
  // Prevent button from being dragged.
  button.draggable = false;
  button.addEventListener('dragstart', function(e) {
    e.preventDefault();
  });
  if (!this.hideButton) document.body.appendChild(button);
  return button;
};

WebVRManager.prototype.setMode = function(mode) {
  this.mode = mode;
  switch (mode) {
    case Modes.INCOMPATIBLE:
      this.vrButton.src = this.logo;
      this.vrButton.title = 'Open in immersive mode';
      break;
    case Modes.COMPATIBLE:
      this.vrButton.src = this.logo;
      this.vrButton.title = 'Open in VR mode';
      break;
    case Modes.VR:
      this.vrButton.src = this.logoDisabled;
      this.vrButton.title = 'Leave VR mode';
      break;
  }

  // Hack for Safari Mac/iOS to force relayout (svg-specific issue)
  // http://goo.gl/hjgR6r
  this.vrButton.style.display = 'inline-block';
  this.vrButton.offsetHeight;
  this.vrButton.style.display = 'block';
};

/**
 * Sets the contrast on the button (percent in [0, 1]).
 */
WebVRManager.prototype.setContrast = function(percent) {
  var value = Math.floor(percent * 100);
  this.vrButton.style.webkitFilter = 'contrast(' + value + '%)';
  this.vrButton.style.filter = 'contrast(' + value + '%)';
};

WebVRManager.prototype.base64 = function(format, base64) {
  var out = 'data:' + format + ';base64,' + base64;
  return out;
};

/**
 * Makes it possible to go into VR mode.
 */
WebVRManager.prototype.activateVR = function() {
  // Make it possible to enter VR via double click.
  window.addEventListener('dblclick', this.enterVR.bind(this));
  // Or via double tap.
  window.addEventListener('touchend', this.onTouchEnd.bind(this));
  // Or via clicking on the VR button.
  this.vrButton.addEventListener('mousedown', this.onButtonClick.bind(this));
  this.vrButton.addEventListener('touchstart', this.onButtonClick.bind(this));
  // Or by hitting the 'f' key.
  window.addEventListener('keydown', this.onKeyDown.bind(this));

  // Whenever we enter fullscreen, this is tantamount to entering VR mode.
  document.addEventListener('webkitfullscreenchange',
      this.onFullscreenChange.bind(this));
  document.addEventListener('mozfullscreenchange',
      this.onFullscreenChange.bind(this));

  // Create the necessary elements for wake lock to work.
  this.setupWakeLock();
};

WebVRManager.prototype.activateImmersive = function() {
  // Next time a user does anything with their mouse, we trigger immersive mode.
  this.vrButton.addEventListener('click', this.enterImmersive.bind(this));
};

WebVRManager.prototype.enterImmersive = function() {
  this.requestPointerLock();
  this.requestFullscreen();
};

WebVRManager.prototype.setupWakeLock = function() {
  // Create a small video element.
  this.wakeLockVideo = document.createElement('video');

  // Loop the video.
  this.wakeLockVideo.addEventListener('ended', function(ev) {
    this.wakeLockVideo.play();
  }.bind(this));

  // Turn on wake lock as soon as the screen is tapped.
  triggerWakeLock = function() {
    this.requestWakeLock();
  }.bind(this);
  window.addEventListener('touchstart', triggerWakeLock, false);
};

WebVRManager.prototype.onTouchEnd = function(e) {
  // TODO: Implement better double tap that takes distance into account.
  // https://github.com/mckamey/doubleTap.js/blob/master/doubleTap.js

  var now = new Date();
  if (now - this.lastTouchTime < 300) {
    this.enterVR();
  }
  this.lastTouchTime = now;
};

WebVRManager.prototype.onButtonClick = function(e) {
  e.stopPropagation();
  e.preventDefault();
  this.toggleVRMode();
};

WebVRManager.prototype.onKeyDown = function(e) {
  if (e.keyCode == 70) { // 'f'
    this.toggleVRMode();
  }
};

WebVRManager.prototype.toggleVRMode = function() {
  if (!this.isVRMode()) {
    // Enter VR mode.
    this.enterVR();
  } else {
    this.exitVR();
  }
};

WebVRManager.prototype.onFullscreenChange = function(e) {
  // If we leave full-screen, also exit VR mode.
  if (document.webkitFullscreenElement === null ||
      document.mozFullScreenElement === null) {
    this.exitVR();
  }
};

/**
 * Add cross-browser functionality to keep a mobile device from
 * auto-locking.
 */
WebVRManager.prototype.requestWakeLock = function() {
  this.releaseWakeLock();
  if (this.os == 'iOS') {
    // If the wake lock timer is already running, stop.
    if (this.wakeLockTimer) {
      return;
    }
    this.wakeLockTimer = setInterval(function() {
      window.location = window.location;
      setTimeout(window.stop, 0);
    }, 30000);
  } else if (this.os == 'Android') {
    // If the video is already playing, do nothing.
    if (this.wakeLockVideo.paused === false) {
      return;
    }
    // See videos_src/no-sleep.webm.
    this.wakeLockVideo.src = this.base64('video/webm', 'GkXfowEAAAAAAAAfQoaBAUL3gQFC8oEEQvOBCEKChHdlYm1Ch4ECQoWBAhhTgGcBAAAAAAACWxFNm3RALE27i1OrhBVJqWZTrIHfTbuMU6uEFlSua1OsggEuTbuMU6uEHFO7a1OsggI+7AEAAAAAAACkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVSalmAQAAAAAAAEMq17GDD0JATYCMTGF2ZjU2LjQuMTAxV0GMTGF2ZjU2LjQuMTAxc6SQ20Yv/Elws73A/+KfEjM11ESJiEBkwAAAAAAAFlSuawEAAAAAAABHrgEAAAAAAAA+14EBc8WBAZyBACK1nIN1bmSGhVZfVlA4g4EBI+ODhAT3kNXgAQAAAAAAABKwgRC6gRBTwIEBVLCBEFS6gRAfQ7Z1AQAAAAAAALHngQCgAQAAAAAAAFyho4EAAIAQAgCdASoQABAAAEcIhYWIhYSIAgIADA1gAP7/q1CAdaEBAAAAAAAALaYBAAAAAAAAJO6BAaWfEAIAnQEqEAAQAABHCIWFiIWEiAICAAwNYAD+/7r/QKABAAAAAAAAQKGVgQBTALEBAAEQEAAYABhYL/QACAAAdaEBAAAAAAAAH6YBAAAAAAAAFu6BAaWRsQEAARAQABgAGFgv9AAIAAAcU7trAQAAAAAAABG7j7OBALeK94EB8YIBgfCBAw==');
    this.wakeLockVideo.play();
  }

}

/**
 * Turn off cross-browser functionality to keep a mobile device from
 * auto-locking.
 */
WebVRManager.prototype.releaseWakeLock = function() {
  if (this.os == 'iOS') {
    if (this.wakeLockTimer) {
      clearInterval(this.wakeLockTimer);
      this.wakeLockTimer = null;
    }
  } else if (this.os == 'Android') {
    this.wakeLockVideo.pause();
    this.wakeLockVideo.src = '';
  }
};

WebVRManager.prototype.requestPointerLock = function() {
  var canvas = this.renderer.domElement;
  canvas.requestPointerLock = canvas.requestPointerLock ||
      canvas.mozRequestPointerLock ||
      canvas.webkitRequestPointerLock;

  if (canvas.requestPointerLock) {
    canvas.requestPointerLock();
  }
};

WebVRManager.prototype.releasePointerLock = function() {
  document.exitPointerLock = document.exitPointerLock ||
      document.mozExitPointerLock ||
      document.webkitExitPointerLock;

  document.exitPointerLock();
};

WebVRManager.prototype.requestOrientationLock = function() {
  if (screen.orientation) {
    screen.orientation.lock('landscape');
  }
};

WebVRManager.prototype.releaseOrientationLock = function() {
  if (screen.orientation) {
    screen.orientation.unlock();
  }
};

WebVRManager.prototype.requestFullscreen = function() {
  var canvas = this.renderer.domElement;
  if (canvas.mozRequestFullScreen) {
    canvas.mozRequestFullScreen();
  } else if (canvas.webkitRequestFullscreen) {
    canvas.webkitRequestFullscreen();
  }
};

WebVRManager.prototype.releaseFullscreen = function() {
};

WebVRManager.prototype.getOS = function(osName) {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;
  if (userAgent.match(/iPhone/i) || userAgent.match(/iPod/i)) {
    return 'iOS';
  } else if (userAgent.match(/Android/i)) {
    return 'Android';
  }
  return 'unknown';
};

WebVRManager.prototype.enterVR = function() {
  console.log('Entering VR.');
  // Enter fullscreen mode (note: this doesn't work in iOS).
  this.effect.setFullScreen(true);
  // Lock down orientation, pointer, etc.
  this.requestOrientationLock();
  // Set style on button.
  this.setMode(Modes.VR);
};

WebVRManager.prototype.exitVR = function() {
  console.log('Exiting VR.');
  // Leave fullscreen mode (note: this doesn't work in iOS).
  this.effect.setFullScreen(false);
  // Release orientation, wake, pointer lock.
  this.releaseOrientationLock();
  this.releaseWakeLock();
  // Also, work around a problem in VREffect and resize the window.
  this.effect.setSize(window.innerWidth, window.innerHeight);

  // Go back to the default mode.
  this.setMode(this.defaultMode);
};

// Expose the WebVRManager class globally.
window.WebVRManager = WebVRManager;

})();