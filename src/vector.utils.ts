import {Vector} from './types';

export function crossProduct(u: Vector, v: Vector): Vector {
  const cp = [
      u[1] * v[2] - u[2] * v[1],
      u[2] * v[0] - u[0] * v[2],
      u[0] * v[1] - u[1] * v[0],
    ],
    l = Math.sqrt(cp[0] * cp[0] + cp[1] * cp[1] + cp[2] * cp[2]);

  return [
    cp[0] / l,
    cp[1] / l,
    cp[2] / l,
  ];
}

export function vectorAdd(u: Vector, v: Vector): Vector {
  return [
    u[0] + v[0],
    u[1] + v[1],
    u[2] + v[2],
  ];
}

export function vectorSub(u: Vector, v: Vector): Vector {
  return [
    u[0] - v[0],
    u[1] - v[1],
    u[2] - v[2],
  ];
}
