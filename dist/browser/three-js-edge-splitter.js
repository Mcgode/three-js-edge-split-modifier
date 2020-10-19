(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('three')) :
    typeof define === 'function' && define.amd ? define(['exports', 'three'], factory) :
    (factory((global.THREEEdgeSplitter = {}),global.THREE));
}(this, (function (exports,three) { 'use strict';

    function EdgeSplitModifier()
    {
        let A = new three.Vector3();
        let B = new three.Vector3();
        let C = new three.Vector3();
        let D = new three.Vector3();


        this._MapPoints = function ( positions )
        {

            for (let i = 0; i < positions.length; i += 3) {

                let key = `${positions[i]},${positions[i+1]},${positions[i+2]}`;

                if ( !this._pointMap.has(key) )
                    this._pointMap.set(key, []);

                this._pointMap.get(key).push(i / 3);

            }

        };


        this._ComputeFaceAreas = function ( positions )
        {

            this._areas = new Float32Array(positions.length / 9);

            for (let i = 0; i < positions.length; i+= 9) {

                A.set(positions[i], positions[i+1], positions[i+2]);
                B.set(positions[i+3], positions[i+4], positions[i+5]);
                C.set(positions[i+6], positions[i+7], positions[i+8]);

                B.sub(A);
                C.sub(A);

                this._areas[i / 9] = B.cross( C ).length() / 2;

            }

        };

        this._EdgeSplitToGroups = function( indexes, cutOff, firstIndex )
        {

            A.set( this._normals[3 * firstIndex], this._normals[3 * firstIndex + 1], this._normals[3 * firstIndex + 2] )
                .normalize();

            let result = {
                splitGroup: [],
                currentGroup: []
            };

            for (let j of indexes) {

                B.set( this._normals[3 * j], this._normals[3 * j + 1], this._normals[3 * j + 2] )
                    .normalize();

                if ( B.dot(A) < cutOff )
                    result.splitGroup.push(j);

                else
                    result.currentGroup.push(j);

            }

            return result
        };

        this._EdgeSplit = function ( indexes, cutOff )
        {
            let groupResults = [];
            for (let index of indexes)
                groupResults.push(this._EdgeSplitToGroups(indexes, cutOff, index));

            let result = groupResults[0];
            for (let groupResult of groupResults)
                if ( groupResult.currentGroup.length > result.currentGroup.length )
                    result = groupResult;

            C.set(0, 0, 0);
            for ( let index of result.currentGroup ) {

                B.set( this._normals[3 * index], this._normals[3 * index + 1], this._normals[3 * index + 2] );
                C.addScaledVector( B, this._areas[Math.floor( index / 3 )] );

            }

            C.normalize();
            for ( let index of result.currentGroup ) {

                this._normals[3 * index] = C.x;
                this._normals[3 * index + 1] = C.y;
                this._normals[3 * index + 2] = C.z;

            }

            if ( result.splitGroup.length )
                this._EdgeSplit( result.splitGroup, cutOff );

        };


        this.modify = function ( geometry, cutOffAngle )
        {

            this._pointMap = new Map();

            if ( !geometry.isBufferGeometry ) {

                geometry = new three.BufferGeometry().fromGeometry( geometry );

            }


            let positions = geometry.getAttribute( "position" ).array;
            this._MapPoints( positions );
            this._ComputeFaceAreas( positions );


            this._normals = geometry.getAttribute( "normal" ).array;
            if ( new three.Vector3(this._normals[0], this._normals[1], this._normals[2]).length() === 0 )
                geometry.computeVertexNormals();
            this._normals = geometry.getAttribute( "normal" ).array;


            for ( let [_, vertexIndexes] of this._pointMap )
                this._EdgeSplit( vertexIndexes, Math.cos(cutOffAngle) - 0.001 );

            geometry.setAttribute("normal", new three.BufferAttribute(this._normals, 3, true));

           return geometry

        };
    }


    THREE.EdgeSplitModifier = EdgeSplitModifier;

    exports.EdgeSplitModifier = EdgeSplitModifier;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
