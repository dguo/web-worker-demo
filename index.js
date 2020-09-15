import * as iq from "image-q";

function padTime(number) {
  return number < 10 ? "0" + number : number;
}

function getTime() {
  const now = new Date();
  return (
    padTime(now.getHours()) +
    ":" +
    padTime(now.getMinutes()) +
    ":" +
    padTime(now.getSeconds()) +
    "." +
    now.getMilliseconds()
  );
}

setInterval(function () {
  document.getElementById("time").innerText = getTime();
}, 50);

function setPalette(points) {
  points.forEach(function (point, index) {
    document.getElementById("color-" + index).style.backgroundColor =
      "rgb(" + point.r + "," + point.g + "," + point.b + ")";
  });

  document.getElementById("loader-wrapper").style.display = "none";
  document.getElementById("colors-wrapper").style.display = "block";
}

let worker;
if (window.Worker) {
  worker = new Worker("./worker.js");
  worker.onmessage = function (message) {
    setPalette(message.data.points);
  };
} else {
  // TODO: show error message
}

document
  .getElementById("image-url-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const url = event.target.elements.url.value;
    const image = document.getElementById("image");
    image.onload = function () {
      document.getElementById("image-link").href = url;

      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0);
      const imageData = context.getImageData(
        0,
        0,
        image.naturalWidth,
        image.naturalHeight
      );

      if (worker && event.target.elements.worker.checked) {
        worker.postMessage({ imageData });
        return;
      }

      const pointContainer = iq.utils.PointContainer.fromImageData(imageData);
      const palette = iq.buildPaletteSync([pointContainer], { colors: 4 });
      const points = palette._pointArray;
      setPalette(points);
    };

    // TODO: handle image error

    document.getElementById("loader-wrapper").style.display = "block";
    document.getElementById("colors-wrapper").style.display = "none";

    image.src = url;
  });
