const plantSelect = document.getElementById('plantSelect');
const video = document.getElementById('cameraVideo');
const plantOverlay = document.getElementById('plantOverlay');
const placeholder = document.getElementById('cameraPlaceholder');
const captureButton = document.getElementById('captureButton');
const downloadLink = document.getElementById('downloadLink');
const canvas = document.getElementById('captureCanvas');

let stream = null;

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
      audio: false
    });
    video.srcObject = stream;
    placeholder.classList.add('hidden');
    plantOverlay.classList.add('visible');
    captureButton.disabled = false;
  } catch (error) {
    placeholder.textContent = 'Camera access was blocked or unavailable. Use this on a phone and allow camera permission.';
    placeholder.classList.remove('hidden');
    captureButton.disabled = true;
  }
}

plantSelect.addEventListener('change', () => {
  if (plantSelect.value === 'plant1') {
    startCamera();
  } else {
    plantOverlay.classList.remove('visible');
    captureButton.disabled = true;
  }
});

captureButton.addEventListener('click', () => {
  if (!video.videoWidth || !video.videoHeight) return;

  const stage = document.getElementById('cameraStage');
  const stageRect = stage.getBoundingClientRect();
  const imgRect = plantOverlay.getBoundingClientRect();

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const scaleX = canvas.width / stageRect.width;
  const scaleY = canvas.height / stageRect.height;
  const overlayX = (imgRect.left - stageRect.left) * scaleX;
  const overlayY = (imgRect.top - stageRect.top) * scaleY;
  const overlayW = imgRect.width * scaleX;
  const overlayH = imgRect.height * scaleY;

  ctx.globalAlpha = 0.6;
  ctx.drawImage(plantOverlay, overlayX, overlayY, overlayW, overlayH);
  ctx.globalAlpha = 1;

  const imageData = canvas.toDataURL('image/png');
  downloadLink.href = imageData;
  downloadLink.classList.remove('hidden');
  downloadLink.click();
});
