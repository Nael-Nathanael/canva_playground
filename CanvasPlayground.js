// let canvas = document.getElementById("theCanvas");
// let context = canvas.getContext("2d");

// let x = 0;

// let stream = canvas.captureStream(30);

// window.requestAnimationFrame(draw);

// document.getElementById("buttonSave").addEventListener("click", () => {
//   console.log("MASUK SINI DULU");
//   const recording = record(canvas, 10000);
//   // play it on another video element
//   var video$ = document.createElement("video");
//   document.body.appendChild(video$);
//   recording.then((url) => video$.setAttribute("src", url));

//   // download it
//   var link$ = document.createElement("a");
//   link$.setAttribute("download", "recordingVideo");
//   recording.then((url) => {
//     link$.setAttribute("href", url);
//     link$.click();
//   });
// });

// function record(canvas, time) {
//   var recordedChunks = [];
//   return new Promise(function (res, rej) {
//     mediaRecorder = new MediaRecorder(stream, {
//       mimeType: "video/webm; codecs=vp9",
//     });

//     //ondataavailable will fire in interval of `time || 4000 ms`
//     mediaRecorder.start(time || 4000);

//     mediaRecorder.ondataavailable = function (event) {
//       recordedChunks.push(event.data);
//       console.log("HMMMM");
//       // after stop `dataavilable` event run one more time
//       if (mediaRecorder.state === "recording") {
//         console.log("KOK STOP?");
//         mediaRecorder.stop();
//       }
//     };

//     mediaRecorder.onstop = function (event) {
//       on_media_recorder_stop(recordedChunks);
//     };

//     setInterval(() => {
//       mediaRecorder.stop();
//     }, time);
//   });
// }

// function on_media_recorder_stop(chunks) {
//   console.log("ON MEDIA RECORDER STOP");
//   var blob = new Blob(chunks, { type: "video/webm" });
//   const recording_url = URL.createObjectURL(blob);

//   const a = document.createElement("a");
//   a.href = recording_url;
//   a.download = "video.webm";
//   document.body.appendChild(a);
//   a.click();
//   setTimeout(() => {
//     URL.revokeObjectURL(recording_url);
//     document.body.removeChild(a);
//   }, 0);
// }

// function draw() {
//   context.save();
//   context.clearRect(0, 0, 500, 375);

//   if (x <= 200) {
//     x++;
//   } else {
//     x = 0;
//   }

//   canvas.width = window.innerWidth;
//   canvas.height = window.innerHeight;

//   let img1 = loadImage(
//     "https://kenangan.s3-ap-southeast-1.amazonaws.com/1671697405773-s.png"
//   );
//   let img2 = loadImage(
//     "https://kenangan.s3-ap-southeast-1.amazonaws.com/1671697405626-s.png"
//   );

//   context.translate(x, 0);
//   context.drawImage(img1, 350, 350);
//   context.restore();

//   context.save();
//   context.drawImage(img2, 100, 100);
//   context.restore();

//   window.requestAnimationFrame(draw);
// }

// function createText(
//   text,
//   font,
//   color = "black",
//   align = "center",
//   dx = 100,
//   dy = 100
// ) {
//   context.font = font;
//   context.fillStyle = color;
//   context.textAlign = align;
//   context.fillText(text, dx, dy);
// }

// function loadImage(src, onload) {
//   let img = new Image();
//   img.crossOrigin = 'anonymous';
//   img.onload = onload;
//   img.src = src;
//   return img;
// }

// function on_media_recorder_stop(chunks) {
//   var blob = new Blob(chunks, { type: "video/webm" });
//   const recording_url = URL.createObjectURL(blob);

//   const a = document.createElement("a");
//   a.href = recording_url;
//   a.download = "video.webm";
//   document.body.appendChild(a);
//   a.click();
//   setTimeout(() => {
//     URL.revokeObjectURL(recording_url);
//     document.body.removeChild(a);
//   }, 0);
// }

/////////////////////////////////////////////////////////////
let currentFrame = 0;
const theCanvas = document.getElementById("theCanvas");
const context = theCanvas.getContext("2d");
const recordBtn = document.querySelector("button");

const scenes = [...video_data.timeline.scenes];

const scene = scenes[0];
const duration = scene.duration;
const backgroundFill = scene.background.color;
const fps = 60;
const canvas_redraw_frequency = 1000 / fps;

const components = [];
const existing_elems = {};

context.fillStyle = backgroundFill;

let recording = false;
let recordedChunks;

init();

recordBtn.addEventListener("click", () => {
  recordBtn.textContent = "Recording";
  const stream = theCanvas.captureStream(fps);
  mediaRecorder = new MediaRecorder(stream, {
    mimeType: "video/webm;codecs=vp9",
    ignoreMutedMedia: true,
  });
  recordedChunks = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };
  mediaRecorder.start();

  setInterval(() => {
    recordBtn.textContent = "Processing";
    mediaRecorder.stop();
    setTimeout(() => {
      const blob = new Blob(recordedChunks, {
        type: "video/webm",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "recording.webm";
      a.click();
      URL.revokeObjectURL(url);
    }, 0);
    recordBtn.textContent = "Record";
  }, 5000 + 1000);
});

// document.getElementById("buttonSave").addEventListener("click", () => {
//   const recording = record(duration);
//   var link$ = document.createElement("a");
//   link$.setAttribute("download", "recordingVideo");
//   recording.then((url) => {
//     link$.setAttribute("href", url);
//     link$.click();
//   });
// });

async function init() {
  for (const component of scene.components) {
    component.start = component.start ? component.start : 0;
    component.end = component.end ? component.end : scene.duration;

    const animation = {};
    if (component.animation) {
      animation["start"] = component.start;
      animation["end"] = component.start + 0.25;
      animation["opacity"] = {
        start: 0,
        end: 1,
      };
    }

    if (component.animation === "rise_animation") {
      animation["y"] = {
        start: component.y + 50,
        end: component.y,
      };
      component.y = component.y + 50;
    } else if (component.animation === "pan_animation") {
      animation["x"] = {
        start: component.x - 50,
        end: component.x,
      };
      component.x = component.x - 50;
    } else if (component.animation === "fade_animation") {
    }

    if (!component.animation) {
      component.opacity = 1;
    }

    component.start = component.start ? component.start : 0;
    component.end = component.end ? component.end : scene.duration;

    // first, just handle 'visual_asset' type
    if (component.type === "visual_asset") {
      const focused_asset = video_data.assets.filter(
        (e) => e.id === component.asset_id
      )[0];
      let src = focused_asset.files[focused_asset.files.length - 1].url;

      const datum = {
        x: component.x,
        y: component.y,
        opacity: component.opacity,
        angle: component.angle,
        height: component.height,
        width: component.width,
        src: src,
        type: component.type,
        animation: animation,
        id: component.id,
        start: component.start,
        end: component.end,
      };
      components.push(datum);
    } else if (component.type === "text") {
      const datum = {
        x: component.x,
        y: component.y,
        text: component.text,
        opacity: component.opacity,
        angle: component.angle,
        height: component.height,
        width: component.width,
        type: component.type,
        animation: animation,
        id: component.id,
        start: component.start,
        end: component.end,
        style: component.style,
      };
      components.push(datum);
    }
  }
}

// function record(time) {
//   let stream = theCanvas.captureStream(fps);

//   var recordedChunks = [];
//   return new Promise(function (res, rej) {
//     mediaRecorder = new MediaRecorder(stream, {
//       mimeType: "video/webm; codecs=vp9",
//     });

//     mediaRecorder.ondataavailable = function (event) {
//       recordedChunks.push(event.data);
//     };

//     mediaRecorder.onstop = function (event) {
//       on_media_recorder_stop(recordedChunks);
//     };

//     setInterval(() => {
//       mediaRecorder.stop();
//     }, time);

//     mediaRecorder.start(time || 4000);
//   });
// }

// function on_media_recorder_stop(chunks) {
//   var blob = new Blob(chunks, { type: "video/webm" });
//   const recording_url = URL.createObjectURL(blob);

//   const a = document.createElement("a");
//   a.href = recording_url;
//   a.download = "video.webm";
//   document.body.appendChild(a);
//   a.click();
//   setTimeout(() => {
//     URL.revokeObjectURL(recording_url);
//     document.body.removeChild(a);
//   }, 0);
// }

function redraw() {
  if (currentFrame >= 300) return;
  context.clearRect(0, 0, theCanvas.width, theCanvas.height);
  currentFrame += 1;
  for (const component of components) {
    draw_component(component);
  }
}

function render_text(component) {
  context.font = component.style["font-size"] + "px " + "Arial";
  context.fillStyle = component.style.color;

  //   context.fillText(component.text, component.x, component.y);
  let wrappedText = wrapText(
    component.text,
    component.x,
    component.y,
    component.width,
    140
  );

  wrappedText.forEach(function (item) {
    context.fillText(item[0], item[1], item[2]);
  });
}

function render_img(component) {
  if (component.animation !== {}) {
    const startFrame = component.animation.start * fps;
    const endFrame = component.animation.end * fps;
    if (currentFrame >= startFrame && currentFrame <= endFrame) {
      const percentage =
        (currentFrame - component.animation.start * fps) /
        (component.animation.end * fps - component.animation.start * fps);
      if (component.animation.opacity) {
        const delta =
          component.animation.opacity.end - component.animation.opacity.start;
        component.opacity =
          component.animation.opacity.start + percentage * delta;
      }
      if (component.animation.x) {
        const delta = component.animation.x.end - component.animation.x.start;
        component.x = component.animation.x.start + percentage * delta;
      }
      if (component.animation.y) {
        const delta = component.animation.y.end - component.animation.y.start;
        component.y = component.animation.y.start + percentage * delta;
      }
    } else if (currentFrame <= component.animation.start * fps) {
      // do nothing
    } else if (currentFrame >= component.animation.start * fps) {
      if (component.animation.opacity) {
        component.opacity = component.animation.opacity.end;
      }
      if (component.animation.x) {
        component.x = component.animation.x.end;
      }
      if (component.animation.y) {
        component.y = component.animation.y.end;
      }
    }
  }

  if (existing_elems[component.id]) {
    const img = existing_elems[component.id];
    img.width = component.width;
    img.height = component.height;
    img.style.rotate = component.angle;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    const tempCtx = tempCanvas.getContext("2d");

    tempCtx.globalAlpha = Math.floor(component.opacity * 1000) / 1000;
    tempCtx.drawImage(img, 0, 0, component.width, component.height);

    context.drawImage(
      tempCanvas,
      component.x,
      component.y,
      component.width,
      component.height
    );
  } else {
    const img = document.createElement("img");
    // img.crossOrigin = "*";
    img.onload = function () {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      const tempCtx = tempCanvas.getContext("2d");

      tempCtx.globalAlpha = Math.floor(component.opacity * 1000) / 1000;
      tempCtx.drawImage(img, 0, 0, component.width, component.height);

      context.drawImage(
        tempCanvas,
        component.x,
        component.y,
        component.width,
        component.height
      );
    };
    img.src = component.src;
    img.width = component.width;
    img.height = component.height;
    img.style.rotate = component.angle;
    existing_elems[component.id] = img;
  }
}

function draw_component(component) {
  if (component.type === "visual_asset") {
    render_img(component);
  } else if (component.type === "text") {
    render_text(component);
  }
}

document.onreadystatechange = function () {
  if (document.readyState === "interactive") {
    setInterval(redraw, canvas_redraw_frequency);
  }
};

function wrapText(text, x, y, maxWidth, lineHeight) {
  let words = text.split(" ");
  let line = "";
  let testLine = "";
  let lineArray = [];

  for (var n = 0; n < words.length; n++) {
    testLine += `${words[n]} `;
    let metrics = context.measureText(testLine);
    let testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      lineArray.push([line, x, y]);
      y += lineHeight;
      line = `${words[n]} `;
      testLine = `${words[n]} `;
    } else {
      line += `${words[n]} `;
    }
    if (n === words.length - 1) {
      lineArray.push([line, x, y]);
    }
  }
  return lineArray;
}

// function requestImage(imageUrl, callback) {
//   var req = new XMLHttpRequest();

//   req.onload = function () {
//     var img = new Image();

//     img.onload = function () {
//       URL.revokeObjectURL(this.src);
//       callback(img);
//     };
//     img.src = URL.createObjectURL(req.response);
//   };
//   req.open("get", imageUrl, true);
//   req.responseType = "blob";
//   req.send();
// }
