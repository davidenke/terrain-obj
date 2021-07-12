#!/usr/bin/node

import {createWriteStream} from 'fs';
import {extname} from 'path';
import {Bounds, Coords} from 'node-hgt';
import * as proj4 from 'proj4';

import {hgt2obj} from './hgt2obj';
import {hgt2png} from './hgt2png';

const [, , source, target, lat1, lng1, lat2, lng2, def = proj4.WGS84] = process.argv;
const components = [lat1, lng1, lat2, lng2].map(a => parseFloat(a));
const project = proj4(def, proj4.WGS84);
const sw = [components[1], components[0]];
const ne = [components[3], components[2]];
const bounds: Bounds = [project.inverse(sw) as Coords, project.inverse(ne) as Coords];

// write new object
const stream = createWriteStream(target);

switch (extname(target)) {
  case '.obj':
    hgt2obj(stream, project, bounds, source);
    break;
  case '.png':
    hgt2png(stream, project, bounds, source);
    break;
}
