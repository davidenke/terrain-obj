#!/usr/bin/node

const proj4 = require('proj4'),
  hgt2obj = require('./index'),
  [, , path, lat1, lng1, lat2, lng2, def = proj4.WGS84] = process.argv,
  components = [lat1, lng1, lat2, lng2].map(a => parseFloat(a)),
  proj = proj4(def, proj4.WGS84),
  sw = [components[1], components[0]],
  ne = [components[3], components[2]],
  bounds = [proj.inverse(sw), proj.inverse(ne)];

hgt2obj(process.stdout, proj, bounds, path);
