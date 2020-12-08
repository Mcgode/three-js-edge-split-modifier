# three.js edge split modifier

**This library has been deprecated.**
It was added to [three.js examples](https://threejs.org/examples/#webgl_modifier_edgesplit), 
and will only be maintained there.

This package is a geometry modifier for three.js

This modifier takes a geometry as input, and outputs an indexed BufferGeometry
with faces split at sharp edges.

## Example

We take a flat shaded model:
![Flat shading](./screenshots/flatShading.png?raw=true)

Using the classic smooth shading doesn't give us the type of result we expect
(the sharp edges are smoothed, while they shouldn't):
![Smooth shading](./screenshots/smoothShading.png?raw=true)

Using the edge split modifier, we split the faces sharp edges to achieve a 
better smooth shading:
![Edge split + smooth shading](./screenshots/edgeSplitSmooth.png?raw=true) 

## Browser dependencies

If you want to use this package in a browser, you will need to import three.js
along its BufferGeometryUtils example JS file. 
