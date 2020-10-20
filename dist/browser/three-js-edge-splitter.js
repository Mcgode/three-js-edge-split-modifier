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


        this._MapPoints = function () {

            for ( let i = 0; i < this._positions.length; i += 3 ) {

                let key = `${this._positions[i]},${this._positions[i+1]},${this._positions[i+2]}`;

                if ( !this._pointMap.has( key ) )
                    this._pointMap.set( key, [] );

                this._pointMap.get( key ).push( i / 3 );

            }

        };


        this._ComputeNormals = function ()
        {

            this._normals = new Float32Array(this._indexes.length * 3);

            for (let i = 0; i < this._indexes.length; i+= 3) {

                let index = this._indexes[i];
                A.set(
                    this._positions[3*index],
                    this._positions[3*index + 1],
                    this._positions[3*index + 2]);

                index = this._indexes[i+1];
                B.set(
                    this._positions[3*index],
                    this._positions[3*index + 1],
                    this._positions[3*index + 2]);

                index = this._indexes[i+2];
                C.set(
                    this._positions[3*index],
                    this._positions[3*index + 1],
                    this._positions[3*index + 2]);

                C.sub(B);
                A.sub(B);

                let normal = C.cross(A).normalize();

                if (normal.length() === 0)
                    console.log("Error computing normal");

                for (let j = 0; j < 3; j++) {
                    this._normals[3*(i+j)] = normal.x;
                    this._normals[3*(i+j)+1] = normal.y;
                    this._normals[3*(i+j)+2] = normal.z;
                }

            }

        };


        this._MapPositionsToIndexes = function ()
        {

            this._pointToIndexMap = Array(this._positions.length / 3);

            for (let i = 0; i < this._indexes.length; i++) {

                let index = this._indexes[i];

                if (this._pointToIndexMap[index] == null)
                    this._pointToIndexMap[index] = [];

                this._pointToIndexMap[index].push(i);

            }

        };


        this._EdgeSplitToGroups = function( indexes, cutOff, firstIndex )
        {

            A.set( this._normals[3 * firstIndex], this._normals[3 * firstIndex + 1], this._normals[3 * firstIndex + 2] )
                .normalize();

            let result = {
                splitGroup: [],
                currentGroup: [firstIndex]
            };

            for (let j of indexes) {

                if (j !== firstIndex) {

                    B.set( this._normals[3 * j], this._normals[3 * j + 1], this._normals[3 * j + 2] )
                        .normalize();

                    if ( B.dot(A) < cutOff )
                        result.splitGroup.push(j);

                    else
                        result.currentGroup.push(j);

                }

            }

            return result
        };


        this._EdgeSplit = function ( indexes, cutOff, original = null )
        {

            if ( indexes.length === 0 )
                return;

            let groupResults = [];
            for (let index of indexes)
                groupResults.push(this._EdgeSplitToGroups(indexes, cutOff, index));

            let result = groupResults[0];
            for (let groupResult of groupResults)
                if ( groupResult.currentGroup.length > result.currentGroup.length )
                    result = groupResult;

            if ( original != null )
                this._splitIndexes.push({
                    original: original,
                    indexes: result.currentGroup
                });

            if ( result.splitGroup.length )
                this._EdgeSplit( result.splitGroup, cutOff, original || result.currentGroup[0] );

        };


        this.modify = function ( geometry, cutOffAngle )
        {

            this._pointMap = new Map();

            if ( !geometry.isBufferGeometry ) {

                geometry = new three.BufferGeometry().fromGeometry( geometry );

            }


            if ( geometry.index == null )
                geometry = three.BufferGeometryUtils.mergeVertices( geometry );
            // return geometry


            this._indexes = geometry.index.array;
            this._positions = geometry.getAttribute( "position" ).array;

            this._ComputeNormals();


            this._MapPositionsToIndexes();


            this._splitIndexes = [];

            for ( let vertexIndexes of this._pointToIndexMap )
                this._EdgeSplit( vertexIndexes, Math.cos(cutOffAngle) - 0.001 );


            let newPositions = new Float32Array( this._positions.length + 3 * this._splitIndexes.length );
            newPositions.set(this._positions);
            let offset = this._positions.length;

            // let newNormals = new Float32Array( this._positions.length + 3 * this._splitIndexes.length )
            //
            // for ( let i = 0; i < this._pointToIndexMap.length; i++ ) {
            //     let index = this._pointToIndexMap[i][0]
            //     newNormals[3*i]   = this._normals[3*index]
            //     newNormals[3*i+1] = this._normals[3*index+1]
            //     newNormals[3*i+2] = this._normals[3*index+2]
            // }

            let indexes = new Uint32Array( this._indexes.length );
            indexes.set( this._indexes );

            for ( let i = 0; i < this._splitIndexes.length; i++) {

                let split = this._splitIndexes[i];
                let index = this._indexes[split.original];

                newPositions[offset + 3*i]   = this._positions[3*index];   //+ this._normals[3 * index];
                newPositions[offset + 3*i+1] = this._positions[3*index+1]; //+ this._normals[3 * index + 1];
                newPositions[offset + 3*i+2] = this._positions[3*index+2]; //+ this._normals[3 * index + 2];

                // newNormals[offset + 3*i]   = this._normals[3*split.original]   //+ this._normals[3 * index];
                // newNormals[offset + 3*i+1] = this._normals[3*split.original+1] //+ this._normals[3 * index + 1];
                // newNormals[offset + 3*i+2] = this._normals[3*split.original+2] //+ this._normals[3 * index + 2];

                for ( let j of split.indexes )
                    indexes[j] = offset / 3 + i;

            }

            // newPositions.fill(0)

            geometry = new three.BufferGeometry();
            geometry.setAttribute('position', new three.BufferAttribute(newPositions, 3, true));
            // geometry.setAttribute('normal', new BufferAttribute(newNormals, 3))
            geometry.setIndex(new three.BufferAttribute(indexes, 1));

            return geometry

        };
    }


    THREE.EdgeSplitModifier = EdgeSplitModifier;

    exports.EdgeSplitModifier = EdgeSplitModifier;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
