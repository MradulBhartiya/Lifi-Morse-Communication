import { MORSE_CODE } from "./morse.js";

/* -------------------------------------------
   UNIVERSAL TORCH + CAMERA HANDLER (ANDROID)
   -------------------------------------------
*/

let _stream = null;
let _track = null;
let _running = false;

// Hidden video element → keeps camera session alive
const videoEl = document.createElement("video");
videoEl.setAttribute("playsinline", "");
videoEl.style.position = "fixed";
videoEl.style.width = "1px";
videoEl.style.height = "1px";
videoEl.style.left = "-9999px";
document.body.appendChild(videoEl);

function wait(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

/* -------------------------------------------
   STEP 1: Enumerate Cameras and pick the REAR 
   (handles multi-camera phones: Redmi, Poco, Realme)
   -------------------------------------------
*/
async function getRearCameraDevice() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const cams = devices.filter((d) => d.kind === "videoinput");

  // Try to find camera with words "back" or "rear"
  let rear = cams.find((c) =>
    c.label.toLowerCase().includes("back") ||
    c.label.toLowerCase().includes("rear") ||
    c.label.toLowerCase().includes("environment")
  );

  // If no label available (Chrome hides labels before permission), pick last camera
  if (!rear) {
    rear = cams[cams.length - 1];
  }

  return rear;
}

/* -------------------------------------------
   STEP 2: Start the correct camera stream
   -------------------------------------------
*/
async function startCamera() {
  if (_stream) return _stream;

  let rear = await getRearCameraDevice();

  try {
    _stream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: rear ? { exact: rear.deviceId } : undefined,
        width: { ideal: 640 },
        height: { ideal: 480 }
      }
    });
  } catch (e1) {
    console.warn("Rear deviceId failed, trying facingMode fallback", e1);

    try {
      _stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" }
        }
      });
    } catch (e2) {
      console.error("Both camera methods failed:", e2);
      throw e2;
    }
  }

  videoEl.srcObject = _stream;
  await videoEl.play().catch(() => {});

  _track = _stream.getVideoTracks()[0];
  return _stream;
}

/* -------------------------------------------
   STEP 3: Universal TORCH setter
   with fallback for OverconstrainedError
   -------------------------------------------
*/
async function setTorch(on) {
  if (!_track) throw new Error("Camera not started");

  // FIRST TRY → advanced torch constraint
  try {
    await _track.applyConstraints({ advanced: [{ torch: on }] });
    return;
  } catch (e) {
    console.warn("Advanced torch failed:", e);
  }

  // FALLBACK → some phones accept direct torch
  try {
    await _track.applyConstraints({ torch: on });
    return;
  } catch (e2) {
    console.error("Torch not supported:", e2);
    throw e2;
  }
}

/* -------------------------------------------
   STEP 4: Stop camera fully
   -------------------------------------------
*/
export function stopTransmission() {
  _running = false;

  if (_stream) {
    _stream.getTracks().forEach((t) => t.stop());
    _stream = null;
    _track = null;
  }

  try {
    videoEl.pause();
    videoEl.srcObject = null;
  } catch (_) {}
}

/* -------------------------------------------
   STEP 5: Convert text → Morse sequence
   -------------------------------------------
*/
function textToMorseSequence(text) {
  const seq = [];
  const up = text.toUpperCase();

  for (const ch of up) {
    if (MORSE_CODE[ch] !== undefined) {
      seq.push(MORSE_CODE[ch]);
    }
  }
  return seq;
}

/* -------------------------------------------
   STEP 6: Main Transmit Function
   -------------------------------------------
*/
export async function sendTextAsMorse(text, unit = 180, onUpdate = () => {}) {
  if (!text.trim()) return;

  _running = true;

  await startCamera(); // make sure camera is active

  const DOT = unit;
  const DASH = unit * 3;
  const GAP = unit;
  const LETTER_GAP = unit * 3;
  const WORD_GAP = unit * 7;

  const seq = textToMorseSequence(text);
  onUpdate({ state: "started", length: seq.length });

  try {
    for (let i = 0; i < seq.length && _running; i++) {
      const pattern = seq[i];

      // Word gap
      if (pattern === "/") {
        await wait(WORD_GAP);
        continue;
      }

      // Transmit dots & dashes
      for (let j = 0; j < pattern.length && _running; j++) {
        if (pattern[j] === ".") {
          await setTorch(true);
          await wait(DOT);
          await setTorch(false);
          await wait(GAP);
        } else if (pattern[j] === "-") {
          await setTorch(true);
          await wait(DASH);
          await setTorch(false);
          await wait(GAP);
        }
      }

      await wait(LETTER_GAP - GAP);
      onUpdate({ state: "progress", index: i + 1 });
    }
  } catch (err) {
    onUpdate({ state: "error", error: err });
    throw err;
  }

  onUpdate({ state: "done" });
  stopTransmission();
}

/* -------------------------------------------
   STEP 7: UI Binding
   -------------------------------------------
*/
export function initUi() {
  const txBtn = document.getElementById("transmit");
  const stopBtn = document.getElementById("stop");
  const msgEl = document.getElementById("msg");
  const unitEl = document.getElementById("unit");
  const indicator = document.getElementById("flash-indicator");
  const pre = document.getElementById("preview");

  // Live preview of Morse
  msgEl.addEventListener("input", () => {
    const m = textToMorseSequence(msgEl.value);
    pre.textContent = m.length ? m.join("   ") : "(empty)";
  });

  txBtn.onclick = async () => {
    const txt = msgEl.value.trim();
    const unit = Number(unitEl.value) || 180;

    if (!txt) return;

    indicator.style.display = "block";

    try {
      await sendTextAsMorse(txt, unit, (info) => {
        if (info.state === "error") {
          alert("Camera / Torch error: " + info.error);
          indicator.style.display = "none";
        }
        if (info.state === "done") {
          indicator.style.display = "none";
        }
      });
    } catch (e) {
      indicator.style.display = "none";
    }
  };

  stopBtn.onclick = () => {
    stopTransmission();
    indicator.style.display = "none";
  };

  // initial preview
  pre.textContent = "(empty)";
}
