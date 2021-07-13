import {WriteStream} from 'fs';
import {Coords, Hgt} from 'node-hgt';
import {Converter} from 'proj4';
import {PNG} from 'pngjs';

export function hgt2png(stream: WriteStream, proj: Converter, bounds: [Coords, Coords], elevationPath: string) {
  const llbounds = bounds.map(ll => proj.forward(ll));
  const sw = llbounds.reduce((sw, ll) => {
    return ll.map((c, i) => Math.round(Math.min(sw[i], c) * 3600) / 3600) as Coords;
  });
  const ne = llbounds.reduce((ne, ll) => {
    return ll.map((c, i) => Math.round(Math.max(ne[i], c) * 3600) / 3600) as Coords;
  });
  const step = 1 / 3600;
  const rows = Math.floor((ne[1] - sw[1]) / step + 1);
  const cols = Math.floor((ne[0] - sw[0]) / step + 1);

  let lat = sw[1];
  let lls;
  let lng;

  if (rows > 0 && cols > 0) {
    lls = new Array(rows * cols);
  } else {
    throw new Error('Invalid bounds: ' + JSON.stringify(bounds) + ' (unprojected: ' + JSON.stringify(llbounds) + ')');
  }

  let i = 0;
  for (let row = 0; row < rows; row++) {
    lng = sw[0];
    for (let col = 0; col < cols; col++) {
      lls[i++] = [lng, lat];
      lng += step;
    }

    lat += step;
  }

  const hgt = new Hgt(elevationPath, [sw[1], sw[0]]);
  const png = new PNG({
    height: rows,
    width: cols,
  });
  const lightest = 0;
  const darkest = 255;
  const deltaColor = darkest - lightest;

  let index = 0;
  const length = rows * cols;
  const idxs = new Array(length);
  const heights = new Array(length);
  let min: number | undefined = undefined;
  let max: number | undefined = undefined;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const idx = index << 2;
      const latLng: Coords = [lls[index][1], lls[index][0]];
      const height = hgt.getElevation(latLng);
      if (min === undefined || height < min) min = height;
      if (max === undefined || height > max) max = height;
      idxs[index] = idx;
      heights[index] = height;
      index++;
    }
  }
  const deltaHeights = max! - min!;

  for (let [index, idx] of idxs.entries()) {
    const color = lightest + heights[index] / deltaHeights * deltaColor;
    png.data[idx] = color;
    png.data[idx + 1] = color;
    png.data[idx + 2] = color;
    png.data[idx + 3] = 255;
  }

  png.pack().pipe(stream);
}
