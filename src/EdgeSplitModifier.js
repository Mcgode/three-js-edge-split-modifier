import {BufferAttribute, BufferGeometry, Vector3} from "three";


function EdgeSplitModifier()
{
    let A = new Vector3();
    let B = new Vector3();
    let C = new Vector3();
    let D = new Vector3();


    this._MapPoints = function ( positions )
    {

        for (let i = 0; i < positions.length; i += 3) {

            let key = `${positions[i]},${positions[i+1]},${positions[i+2]}`

            if ( !this._pointMap.has(key) )
                this._pointMap.set(key, [])

            this._pointMap.get(key).push(i / 3)

        }

    }


    this._ComputeFaceAreas = function ( positions )
    {

        this._areas = new Float32Array(positions.length / 9)

        for (let i = 0; i < positions.length; i+= 9) {

            A.set(positions[i], positions[i+1], positions[i+2]);
            B.set(positions[i+3], positions[i+4], positions[i+5]);
            C.set(positions[i+6], positions[i+7], positions[i+8]);

            B.sub(A);
            C.sub(A);

            this._areas[i / 9] = B.cross( C ).length() / 2

        }

    }

    this._EdgeSplit = function ( indexes, cutOff )
    {

        let firstIndex = indexes[0]
        A.set( this._normals[3 * firstIndex], this._normals[3 * firstIndex + 1], this._normals[3 * firstIndex + 2] )
            .normalize()

        let currentGroup = [firstIndex]
        let splitGroup = []

        C.copy(A).multiplyScalar(this._areas[Math.floor(firstIndex / 3)])

        for (let i = 1; i < indexes.length; i++) {

            let j = indexes[i]
            B.set( this._normals[3 * j], this._normals[3 * j + 1], this._normals[3 * j + 2] )
                .normalize()

            if ( B.dot(A) < cutOff )
                splitGroup.push(j)

            else {

                currentGroup.push(j)
                C.addScaledVector(B, this._areas[Math.floor(j / 3)])

            }

        }

        C.normalize()
        for ( let index of currentGroup ) {

            this._normals[3 * index] = C.x;
            this._normals[3 * index + 1] = C.y;
            this._normals[3 * index + 2] = C.z;

        }

        if ( splitGroup.length )
            this._EdgeSplit( splitGroup, cutOff )

    }


    this.modify = function ( geometry, cutOffAngle )
    {

        this._pointMap = new Map();

        if ( !geometry.isBufferGeometry ) {

            geometry = new BufferGeometry().fromGeometry( geometry );

        }


        let positions = geometry.getAttribute( "position" ).array;
        this._MapPoints( positions );
        this._ComputeFaceAreas( positions );


        this._normals = geometry.getAttribute( "normal" ).array;
        if ( new Vector3(this._normals[0], this._normals[1], this._normals[2]).length() === 0 )
            geometry.computeVertexNormals()
        this._normals = geometry.getAttribute( "normal" ).array;


        for ( let [_, vertexIndexes] of this._pointMap )
            this._EdgeSplit( vertexIndexes, Math.cos(cutOffAngle) )

        geometry.setAttribute("normal", new BufferAttribute(this._normals, 3, true))

       return geometry

    }
}


export { EdgeSplitModifier }


THREE.EdgeSplitModifier = EdgeSplitModifier
