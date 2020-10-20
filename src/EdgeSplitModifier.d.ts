import {BufferGeometry, Geometry} from "three";


type EdgeSplitIndexes = {

	original: number,
	indexes: Array<number>

}


type EdgeSplitGroups = {

	/** The group of vertices belonging to the group defined by the normal of a given index */
	currentGroup: Array<number>;

	/** The rest of the group */
	splitGroup: Array<number>;

}


export class EdgeSplitModifier
{

	private _positions: Float32Array;

	private _normals: Float32Array;

	private _indexes: Uint32Array;

	private _pointToIndexMap: Array<Array<number>>;

	private _splitIndexes: Array<EdgeSplitIndexes>;


	private _ComputeNormals(): void;


	private _MapPositionsToIndexes(): void;


	private _EdgeSplitToGroups( indexes: Array<number>, cutOff:number, firstIndex: number ): EdgeSplitGroups;


	private _EdgeSplit( indexes: Array<number>, cutOff: number ): void;


	modify( geometry: Geometry, cutOffPoint: number ): BufferGeometry;

}
