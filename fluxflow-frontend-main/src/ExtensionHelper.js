import * as d3 from "d3";
import versor from 'versor'
const findNearestCity = (
    mousePosition,
    width,
    height,
    {
        projection,
        citiesJson,
    }
) => {
    const quadtree = d3
        .quadtree()
        .extent([
            [-1, -1],
            [width + 1, height + 1],
        ])
        .x((d) => {
            return d.geometry.coordinates[0]
        })
        .y((d) => {
            return d.geometry.coordinates[1]
        })
        .addAll(citiesJson.features);

    let searchResult = search(projection, quadtree, mousePosition);
    // console.log("Neighbours", searchResult[0])
    // console.log("Mouse longitude", searchResult[1])
    // console.log("Mouse latitude", searchResult[2])
    let resultIdx = getNearestNeighbour(searchResult)
    return searchResult[0][resultIdx];
};

function getNearestNeighbour(searchResult) {
    let [neighbours, long, lat, idx, idealDist] = [searchResult[0], searchResult[1], searchResult[2], 0, 1000000000]
    neighbours.forEach((neighbour, index) => {
        var radlat1 = Math.PI * lat / 180;
        var radlat2 = Math.PI * neighbour.geometry.coordinates[1] / 180;
        var theta = long - neighbour.geometry.coordinates[0];
        var radtheta = Math.PI * theta / 180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        // console.log("Distance between mouse and " + neighbour.properties.name + "Latitude " +  + "Longitude" + "is " + dist)
        if (dist < idealDist) {
            idealDist = dist
            idx = index
        }
    });

    return idx;
}

// Quadtree search for faster city search
const search = (projection, quadtree, mousePosition) => {
    let mLongitude = projection.invert([mousePosition[0], mousePosition[1]])[0]
    let mLatitude = projection.invert([mousePosition[0], mousePosition[1]])[1]

    const [xMin, xMax, yMin, yMax] = [
        projection.invert([mousePosition[0], mousePosition[1]])[0] - 0.5,
        projection.invert([mousePosition[0], mousePosition[1]])[0] + 0.5,
        projection.invert([mousePosition[0], mousePosition[1]])[1] - 0.5,
        projection.invert([mousePosition[0], mousePosition[1]])[1] + 0.5,
    ];

    const results = [];
    quadtree.visit((node, x1, y1, x2, y2) => {
        if (!node.length) {
            do {
                let d = node.data;
                if (
                    d.geometry.coordinates[0] >= xMin &&
                    d.geometry.coordinates[0] < xMax &&
                    d.geometry.coordinates[1] >= yMin &&
                    d.geometry.coordinates[1] < yMax
                ) {
                    results.push(d);
                }
            } while ((node = node.next));
        }
        return x1 >= xMax || y1 >= yMax || x2 < xMin || y2 < yMin;
    });

    return [results, mLongitude, mLatitude];
};

// Dragging the globe
const drag = (projection) => {
    let v0, q0, r0;

    const dragstarted = (event) => {
        v0 = versor.cartesian(projection.invert([event.x, event.y]));
        q0 = versor((r0 = projection.rotate()));
    };

    const dragged = (event) => {
        const v1 = versor.cartesian(projection.rotate(r0).invert([event.x, event.y]));
        const q1 = versor.multiply(q0, versor.delta(v0, v1));
        projection.rotate(versor.rotation(q1));
    };

    return d3.drag().on('start', dragstarted).on('drag', dragged);
};

export {
    findNearestCity,
    drag
};
