import {readFileSync, WriteStream} from 'fs';
import {resolve} from 'path';
import {Bounds, Coords, Hgt} from 'node-hgt';
import {Converter} from 'proj4';
import {crossProduct, vectorAdd, vectorSub} from './vector.utils';

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

  // stream.write(readFileSync(resolve(__dirname, '../prolog.txt')));
  // stream.write('# Bounds: ' + JSON.stringify(llbounds) + '\n');
  // stream.write('# Projected bounds: ' + JSON.stringify(bounds) + '\n');
  // stream.write('# ' + rows + ' rows, ' + cols + ' cols\n');
  // stream.write('# ' + (rows * cols) + ' vertices\n\n\n');

  let i = 0;
  for (let row = 0; row < rows; row++) {
    lng = sw[0];
    for (let col = 0; col < cols; col++) {
      lls[i++] = [lng, lat];
      lng += step;
    }

    lat += step;
  }

  console.log(rows, cols)
  console.log(llbounds);
  console.log(lls);

  stream.end();
}
