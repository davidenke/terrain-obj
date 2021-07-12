#!/usr/bin/node

import {createWriteStream} from 'fs';
import {Bounds, Coords} from 'node-hgt';
import * as proj4 from 'proj4';

import {hgt2obj} from './hgt2obj';
import {hgt2png} from './hgt2png';


// 51.07332619675687, 13.605298302404575
// 51.07670861178793, 13.613126863128166
// npm start obj ~/Downloads/N51E013.hgt ~/Downloads/N51E013.obj 51.073 13.605 51.076 13.613
// npm start png ~/Downloads/N51E013.hgt ~/Downloads/N51E013.obj 51.073 13.605 51.076 13.613
const [, , type, source, target, lat1, lng1, lat2, lng2, def = proj4.WGS84] = process.argv;
const components = [lat1, lng1, lat2, lng2].map(a => parseFloat(a));
const project = proj4(def, proj4.WGS84);
const sw = [components[1], components[0]];
const ne = [components[3], components[2]];
const bounds: Bounds = [project.inverse(sw) as Coords, project.inverse(ne) as Coords];

// write new object
const stream = createWriteStream(target);

switch (type) {
  case 'obj':
    hgt2obj(stream, project, bounds, source);
    break;
  case 'png':
    hgt2png(stream, project, bounds, source);
    break;
}
