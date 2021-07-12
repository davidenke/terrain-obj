# terrain-obj

Convert elevation data (typically SRTM elevation data, HGT files) to Wavefront OBJ 3D models

![mt-blanc](https://cloud.githubusercontent.com/assets/1246614/10525619/f78cffb4-7385-11e5-8846-d63ac3bfe1ea.jpg)

## Usage

For now the params have to be in the following order:\
`terrain-obj <heights.type> <target.type> <from lat> <from lng> <to lat> <to lng>`

Example for HGT to Wavefront objects:\
`terrain-obj ~/N51E013.hgt ~/N51E013.obj 51.073 13.605 51.076 13.613`

Example for HGT to PNG images:\
`terrain-obj ~/N51E013.hgt ~/N51E013.png 51.073 13.605 51.076 13.613`

Example for XYZ to PNG images:\
`terrain-obj ~/334025658.xyz ~/334025658.png`
