const plantSelect = document.getElementById('plantSelect');
const video = document.getElementById('cameraVideo');
const plantOverlay = document.getElementById('plantOverlay');
const placeholder = document.getElementById('cameraPlaceholder');
const captureButton = document.getElementById('captureButton');
const downloadLink = document.getElementById('downloadLink');
const canvas = document.getElementById('captureCanvas');
const sizeSlider = document.getElementById('sizeSlider');
const smallerButton = document.getElementById('smallerButton');
const largerButton = document.getElementById('largerButton');
const stage = document.getElementById('cameraStage');

let stream = null;
let plantScale = 70; // screen-height percentage basis. Plant1 real height is 70 cm.
let plantX = 50; // percent from left
let plantY = 92; // percent from top; represents the pot/floor contact point
let isDragging = false;
let activePointerId = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let pinchStartDistance = 0;
let pinchStartScale = 70;
const activePointers = new Map();

function applyPlantTransform() {
  plantOverlay.style.left = `${plantX}%`;
  plantOverlay.style.top = `${plantY}%`;
  plantOverlay.style.height = `${plantScale}%`;
  plantOverlay.style.transform = 'translate(-50%, -100%)';
  sizeSlider.value = plantScale;
}

function enableARControls(enabled) {
  captureButton.disabled = !enabled;
  sizeSlider.disabled = !enabled;
  smallerButton.disabled = !enabled;
  largerButton.disabled = !enabled;
}

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
      audio: false
    });
    video.srcObject = stream;
    placeholder.classList.add('hidden');
    plantOverlay.classList.add('visible');
    applyPlantTransform();
    enableARControls(true);
  } catch (error) {
    placeholder.textContent = 'Camera access was blocked or unavailable. Use this on a phone and allow camera permission.';
    placeholder.classList.remove('hidden');
    enableARControls(false);
  }
}

plantSelect.addEventListener('change', () => {
  if (plantSelect.value === 'plant1') {
    startCamera();
  } else {
    plantOverlay.classList.remove('visible');
    enableARControls(false);
  }
});

sizeSlider.addEventListener('input', () => {
  plantScale = Number(sizeSlider.value);
  applyPlantTransform();
});

smallerButton.addEventListener('click', () => {
  plantScale = Math.max(30, plantScale - 8);
  applyPlantTransform();
});

largerButton.addEventListener('click', () => {
  plantScale = Math.min(130, plantScale + 8);
  applyPlantTransform();
});

function stagePointToPercent(clientX, clientY) {
  const rect = stage.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * 100,
    y: ((clientY - rect.top) / rect.height) * 100
  };
}

function distanceBetweenPointers() {
  const points = Array.from(activePointers.values());
  if (points.length < 2) return 0;
  const dx = points[0].clientX - points[1].clientX;
  const dy = points[0].clientY - points[1].clientY;
  return Math.hypot(dx, dy);
}

plantOverlay.addEventListener('pointerdown', (event) => {
  event.preventDefault();
  plantOverlay.setPointerCapture(event.pointerId);
  activePointers.set(event.pointerId, event);

  if (activePointers.size === 1) {
    isDragging = true;
    activePointerId = event.pointerId;
    const point = stagePointToPercent(event.clientX, event.clientY);
    dragOffsetX = plantX - point.x;
    dragOffsetY = plantY - point.y;
  }

  if (activePointers.size === 2) {
    isDragging = false;
    pinchStartDistance = distanceBetweenPointers();
    pinchStartScale = plantScale;
  }
});

plantOverlay.addEventListener('pointermove', (event) => {
  if (!activePointers.has(event.pointerId)) return;
  activePointers.set(event.pointerId, event);

  if (activePointers.size === 2 && pinchStartDistance > 0) {
    const newDistance = distanceBetweenPointers();
    plantScale = Math.max(30, Math.min(130, pinchStartScale * (newDistance / pinchStartDistance)));
    applyPlantTransform();
    return;
  }

  if (isDragging && event.pointerId === activePointerId) {
    const point = stagePointToPercent(event.clientX, event.clientY);
    plantX = Math.max(5, Math.min(95, point.x + dragOffsetX));
    plantY = Math.max(25, Math.min(100, point.y + dragOffsetY));
    applyPlantTransform();
  }
});

function clearPointer(event) {
  activePointers.delete(event.pointerId);
  if (event.pointerId === activePointerId) {
    isDragging = false;
    activePointerId = null;
  }
  if (activePointers.size < 2) {
    pinchStartDistance = 0;
  }
}

plantOverlay.addEventListener('pointerup', clearPointer);
plantOverlay.addEventListener('pointercancel', clearPointer);

captureButton.addEventListener('click', () => {
  if (!video.videoWidth || !video.videoHeight) return;

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
