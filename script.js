// script.js

const img = new Image(); // used to load image from <input> and draw to canvas
const canvas = document.getElementById("user-image");
const ctx = canvas.getContext("2d");
const reset = document.querySelector('[type="reset"]');
const readText = document.querySelector('[type="button"]');
const submit = document.querySelector('[type="submit"]');

const voiceSelect = document.querySelector("#voice-selection");
var synth = window.speechSynthesis;
var voices = synth.getVoices();
const volumeLevel = document.querySelector("input[type=range]");
const volumeIcon = document.querySelector("#volume-group img");

// console.log("at start ",synth.getVoices())

function populateVoiceList() {
  voiceSelect.disabled = false;
  voiceSelect.remove(0);

  // console.log(voices[0]);

  voices = synth.getVoices();
  // console.log(voices[0]);
  for (var i = 0; i < voices.length; i++) {
    var option = document.createElement("option");
    option.textContent = voices[i].name + " (" + voices[i].lang + ")";

    if (voices[i].default) {
      option.textContent += " -- DEFAULT";
    }

    option.setAttribute("data-lang", voices[i].lang);
    option.setAttribute("data-name", voices[i].name);

    voiceSelect.appendChild(option);
  }
}
synth.addEventListener("voiceschanged", () => {
  voices = synth.getVoices();
  // console.log('voice changes', voices);
  populateVoiceList();
});
voices = synth.getVoices();
populateVoiceList();
// console.log("at start 2",voices);

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener("load", () => {
  // TODO

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const dims = getDimmensions(
    canvas.width,
    canvas.height,
    img.width,
    img.height
  );

  ctx.drawImage(img, dims.startX, dims.startY, dims.width, dims.height);

  submit.disabled = false;

  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected
});
const uploadImage = document.getElementById("image-input");
uploadImage.addEventListener("change", function () {
  img.src = URL.createObjectURL(uploadImage.files[0]);
  img.alt = uploadImage.files[0];
});

submit.addEventListener("click", () => {
  const topText = document.getElementById("text-top");

  const bottomText = document.getElementById("text-bottom");
  ctx.font = "bold 35px Arial Rounded MT Bold";
  ctx.strokeStyle = "black";
  ctx.lineWidth = 5;
  ctx.fillStyle = "white";
  ctx.textAlign = "center";

  ctx.strokeText(topText.value, canvas.width / 2, 35);
  ctx.fillText(topText.value, canvas.width / 2, 35);
  ctx.strokeText(bottomText.value, canvas.width / 2, canvas.height - 8);
  ctx.fillText(bottomText.value, canvas.width / 2, canvas.height - 8);

  submit.disabled = true;
  reset.disabled = false;
  readText.disabled = false;
  populateVoiceList();
});

reset.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  submit.disabled = false;
  reset.disabled = true;
  readText.disabled = true;
});

readText.addEventListener("click", () => {
  const utterance = new SpeechSynthesisUtterance(
    document.getElementById("text-top").value +
      document.getElementById("text-bottom").value
  );
  const selectedOption = voiceSelect.selectedOptions[0].getAttribute(
    "data-name"
  );
  for (var i = 0; i < voices.length; i++) {
    if (voices[i].name === selectedOption) {
      utterance.voice = voices[i];
    }
  }
  utterance.volume = volumeLevel.value / 100;
  console.log("tried to speak");

  synth.cancel();
  synth.speak(utterance);
  console.log(utterance.voice, utterance.volume);
});

volumeLevel.addEventListener("change", () => {
  var vol;
  if (volumeLevel.value >= 67) {
    vol = 3;
  } else if (volumeLevel.value >= 34) {
    vol = 2;
  } else if (volumeLevel.value > 1) {
    vol = 1;
  } else {
    vol = 0;
  }
  volumeIcon.src = `icons/volume-level-${vol}.svg`;

  console.log("vol changed to ", volumeLevel.value);
});

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { width: width, height: height, startX: startX, startY: startY };
}
