import {BufferGeometry, Geometry} from "three";

export class EdgeSplitModifier
{

	private _pointMap: Map<String, Array<number>>;

	private _areas: Float32Array;


	private _MapPoints( positions: ArrayLike<number> ): void;


	private _ComputeFaceAreas( positions: ArrayLike<number> ): void;


	private _EdgeSplit( indexes: Array<number>, cutOff: number ): void;


	modify( geometry: Geometry, cutOffPoint: number ): BufferGeometry;

}
