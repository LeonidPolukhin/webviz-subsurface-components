import workerpool from "workerpool";
import earcut from "earcut";

export function makeFullMesh(e) {
    const get3DPoint = (points, index) => {
        return points.slice(index * 3, (index + 1) * 3);
    };

    const substractPoints = (a, b) => {
        return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    };

    const crossProduct = (a, b) => {
        return [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0],
        ];
    };

    const dotProduct = (a, b) => {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    };

    const normalize = (a) => {
        const len = Math.sqrt(dotProduct(a, a));
        return [a[0] / len, a[1] / len, a[2] / len];
    };

    /**
     * Projects a 3D point to the coordinate system of the plane formed by two 3D orthogonal unit vectors u and v.
     * @param u the first vector
     * @param v the second vector
     * @param p the point to be projected as [x, y, z] triplet.
     * @returns projected point as [x, y] triplet.
     */
    const projectPoint = (u, v, p) => {
        const a = dotProduct(p, u);
        const b = dotProduct(p, v);
        return [a, b];
    };

    /**
     * Projects a polygon on the plane passing throught its points.
     * Assumes the polygon to be flat, i.e. all the points lie on the same plane.
     * @param points Polygon to be projected.
     * @returns Projected polygon in the 2D coordinate system of the plane.
     */
    const projectPolygon = (points) => {
        const p0 = get3DPoint(points, 0);
        const p1 = get3DPoint(points, 1);
        const p2 = get3DPoint(points, 2);
        const v1 = substractPoints(p1, p0);
        const v2 = substractPoints(p2, p0);
        const normal = normalize(crossProduct(v1, v2));
        const u = normalize(v1);
        const v = normalize(crossProduct(normal, u));
        const res = [];
        const count = points.length / 3;
        for (let i = 0; i < count; ++i) {
            const p = get3DPoint(points, i);
            const fp = projectPoint(u, v, p);
            res.push(...fp);
        }
        return res;
    };

    const averageNormal = (points, triangles) => {
        const res = [0, 0, 0];

        for (let i = 0; i < triangles.length; i += 3) {
            const p0 = get3DPoint(points, triangles[i]);
            const p1 = get3DPoint(points, triangles[i + 1]);
            const p2 = get3DPoint(points, triangles[i + 2]);

            const v1 = substractPoints(p1, p0);
            const v2 = substractPoints(p2, p0);
            const normal = crossProduct(v1, v2);
            res[0] += normal[0];
            res[1] += normal[1];
            res[2] += normal[2];
        }
        return normalize(res);
    };

    /**
     * Computes number of WebGL primitives needed to represent a grid mesh.
     * @param polys Array describing face polygons in the format [N0, I00, I01, I02.., N1, I10, I12...] where
     * Ni - number of vertices in the i-th polygon. Iij - index of j-th vertex of i-th polygon.
     * @returns Object contaning the number of triangles and 2-point line segments.
     */
    const getPrimitiveCounts = (polys) => {
        let triangles = 0;
        let lineSegments = 0;
        let i = 0;
        while (i < polys.length) {
            // polys[i] = N - number of vertices in the current polygon.
            // To represent the polygon N-2 triangles and N line segments are required.
            triangles += polys[i] - 2;
            lineSegments += polys[i];
            i += polys[i] + 1;
        }
        return { triangles, lineSegments };
    };

    /**
     * Creates arrays for WebGL data.
     * @param counts Numbers of WebGL primitives.
     * @returns Arrays of the length enough to contain WebGL data for the given number of primitives, null otherwise.
     */
    const tryCreateArrays = (counts) => {
        try {
            const trianglePoints = new Float32Array(counts.triangles * 9); // 3 points * 3 coordinates per point per 1 triangle
            const triangleNormals = new Float32Array(counts.triangles * 9); // 3 points * 3 coordinates per point per 1 triangle
            const properties = new Float32Array(counts.triangles * 3); // 3 points per 1 triangle
            const lineIndices = new Uint32Array(counts.lineSegments * 2); // 2 point indices per segment
            return {
                trianglePoints,
                triangleNormals,
                properties,
                lineIndices,
            };
        } catch (error) {
            console.log(error);
            return null;
        }
    };

    /**
     * Creates arrays for WebGL data.
     * @param counts Number of WebGL primitives.
     * @returns Arrays of the length enough to contain WebGL data for the given number of triangles and line segments.
     * If fails, reduces the number of primitives by 10% and tries again. Null is returned if zero count of primitives reached.
     * Counts returned contain the actual number of primitives the arrays are created for.
     */
    const createMeshArrays = (counts) => {
        const currentCounts = {
            ...counts,
        };
        let res = null;
        do {
            res = tryCreateArrays(currentCounts);
            if (res === null) {
                console.warn(
                    `Traingles count is reduced from ${currentCounts.triangles} to ${currentCounts.triangles - counts.triangles * 0.1}`
                );
                currentCounts.triangles -= Math.floor(counts.triangles * 0.1);
                currentCounts.lineSegments -= Math.floor(
                    counts.lineSegments * 0.1
                );
            }
        } while (res === null && currentCounts.triangles > 0);
        console.log("Resulting primitives counts: ", currentCounts);
        return {
            arrays: res,
            counts: currentCounts,
        };
    };
    // Keep
    const t0 = performance.now();

    const params = e.data;

    const polys = params.polys;
    const properties = params.properties;

    let propertyValueRangeMin = +99999999;
    let propertyValueRangeMax = -99999999;

    let pn = 0;
    let i = 0;

    const counts = getPrimitiveCounts(polys);
    const meshArrays = createMeshArrays(counts);

    if (!meshArrays?.arrays) {
        return null;
    }

    let arraysIndex = 0;
    let propertyIndex = 0;
    let linesIndex = 0;

    try {
        while (
            i < polys.length &&
            arraysIndex < meshArrays.arrays.trianglePoints.length - 3
        ) {
            const n = polys[i];
            const propertyValue = properties[pn++];

            if (propertyValue !== null) {
                // For some reason propertyValue happens to be null.
                propertyValueRangeMin =
                    propertyValue < propertyValueRangeMin
                        ? propertyValue
                        : propertyValueRangeMin;
                propertyValueRangeMax =
                    propertyValue > propertyValueRangeMax
                        ? propertyValue
                        : propertyValueRangeMax;
            }

            // Lines.
            for (let j = i + 1; j < i + n; ++j) {
                meshArrays.arrays.lineIndices[linesIndex] = polys[j];
                meshArrays.arrays.lineIndices[linesIndex + 1] = polys[j + 1];
                linesIndex += 2;
            }
            meshArrays.arrays.lineIndices[linesIndex] = polys[i + 1];
            meshArrays.arrays.lineIndices[linesIndex + 1] = polys[i + n];
            linesIndex += 2;

            const polygon = [];

            for (let p = 1; p <= n; ++p) {
                const i0 = polys[i + p];
                const point = [
                    params.points[i0 * 3],
                    params.points[i0 * 3 + 1],
                    params.points[i0 * 3 + 2],
                ];
                polygon.push(...point);
            }
            // As the triangulation algorythm works in 2D space
            // the polygon should be projected on the plane passing through its points.
            const flatPoly = projectPolygon(polygon);
            const triangles = earcut(flatPoly);

            const normal = averageNormal(polygon, triangles);

            for (const t of triangles) {
                const point = get3DPoint(polygon, t);

                meshArrays.arrays.trianglePoints[arraysIndex] = point[0];
                meshArrays.arrays.trianglePoints[arraysIndex + 1] = point[1];
                meshArrays.arrays.trianglePoints[arraysIndex + 2] = point[2];

                meshArrays.arrays.triangleNormals[arraysIndex] = normal[0];
                meshArrays.arrays.triangleNormals[arraysIndex + 1] = normal[1];
                meshArrays.arrays.triangleNormals[arraysIndex + 2] = normal[2];

                meshArrays.arrays.properties[propertyIndex] = propertyValue;

                arraysIndex += 3;
                propertyIndex += 1;
            }
            i = i + n + 1;
        }

        console.log("Number of polygons: ", pn);
        console.log("Number of triangles: ", meshArrays.counts.triangles);

        const t1 = performance.now();
        //Keep this.
        console.log(`Task makeMesh took ${(t1 - t0) * 0.001}  seconds.`);
        const data = {
            trianglePoints: meshArrays.arrays.trianglePoints,
            triangleNormals: meshArrays.arrays.triangleNormals,
            properties: meshArrays.arrays.properties,
            points: params.points,
            lineIndices: meshArrays.arrays.lineIndices,
            propertyValueRange: [propertyValueRangeMin, propertyValueRangeMax],
        };
        return new workerpool.Transfer(data, [
            data.trianglePoints.buffer,
            data.triangleNormals.buffer,
            data.properties.buffer,
            data.points.buffer,
            data.lineIndices.buffer,
        ]);
    } catch (error) {
        console.log("Grid3d webworker failed with error: ", error);
        return null;
    }
}

workerpool.worker({
    makeFullMesh: makeFullMesh,
});
