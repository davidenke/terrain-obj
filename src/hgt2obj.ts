import {readFileSync, WriteStream} from 'fs';
import {resolve} from 'path';
import {Bounds, Coords, Hgt} from 'node-hgt';
import {Converter} from 'proj4';
import {crossProduct, vectorAdd, vectorSub} from './vector.utils';

const NEIGHBOUR_TRIS: Bounds[] = [
  [
    [1, 0],
    [1, 1],
  ],
  [
    [0, 1],
    [-1, 1],
  ],
  [
    [-1, 0],
    [-1, -1],
  ],
  [
    [0, -1],
    [1, -1],
  ],
];

export function hgt2obj(stream: WriteStream, proj: Converter, bounds: [Coords, Coords], elevationPath: string) {
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

  stream.write(readFileSync(resolve(__dirname, '../prolog.txt')));
  stream.write('# Bounds: ' + JSON.stringify(llbounds) + '\n');
  stream.write('# Projected bounds: ' + JSON.stringify(bounds) + '\n');
  stream.write('# ' + rows + ' rows, ' + cols + ' cols\n');
  stream.write('# ' + (rows * cols) + ' vertices\n\n\n');

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

  let vertex = 0;
  const vertices = new Array(rows * cols);
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const c = proj.inverse(lls[vertex]);
      const latLng: Coords = [lls[vertex][1], lls[vertex][0]];
      vertices[vertex] = [c[1], hgt.getElevation(latLng), c[0]];
      vertex++;
    }
  }

  vertex = 0;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const ns = NEIGHBOUR_TRIS
        .filter(tri => {
          const r1 = i + tri[0][0];
          const c1 = j + tri[0][1];
          const r2 = i + tri[1][0];
          const c2 = j + tri[1][1];
          return r1 >= 0 && r1 < rows && c1 >= 0 && c1 < cols &&
            r2 >= 0 && r2 < rows && c2 >= 0 && c2 < cols;
        })
        .map(tri => {
          const v1 = vertex + tri[0][0] * cols + tri[0][1];
          const v2 = vertex + tri[1][0] * cols + tri[1][1];
          const vec1 = vectorSub(vertices[v1], vertices[vertex]);
          const vec2 = vectorSub(vertices[v2], vertices[vertex]);

          return crossProduct(vec1, vec2);
        });
      const avgNs = ns.reduce(vectorAdd);
      stream.write('v ' + vertices[vertex].join(' ') + '\n');
      stream.write('vn ' + avgNs.join(' ') + '\n');
      vertex++;
    }
  }

  for (let i = 0; i < rows - 1; i++) {
    for (let j = 0; j < cols - 1; j++) {
      vertex = i * cols + j + 1;
      stream.write('f ' + vertex + ' ' + (vertex + cols) + ' ' + (vertex + cols + 1) + '\n');
      stream.write('f ' + vertex + ' ' + (vertex + cols + 1) + ' ' + (vertex + 1) + '\n');
    }
  }

  stream.end();
}
