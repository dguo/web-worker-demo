import * as iq from "image-q";

onmessage = function (e) {
  const pointContainer = iq.utils.PointContainer.fromImageData(
    e.data.imageData
  );
  const palette = iq.buildPaletteSync([pointContainer], { colors: 4 });
  postMessage({ points: palette._pointArray });
};
