---
title: "Part 4: Rendering Roads and Paths"
description: Render lines such as roads and paths with RDK's GeoLine component.
---

Part 4 enhances the app to render lines (such as roads and paths) with RDK's `GeoLine` component.


## Populating the database

First, import some sample ways (roads or paths) into the SQLite database. Two tables are created: `ways` (storing the ways themselves) and `way_points` (storing the individual points of each way).

```sql
CREATE TABLE ways (id INTEGER PRIMARY KEY AUTOINCREMENT, type STRING);
CREATE TABLE way_points(id INTEGER PRIMARY KEY AUTOINCREMENT, wayid INTEGER, lat REAL, lon REAL, FOREIGN KEY(wayid) REFERENCES ways(id));
INSERT INTO ways (type) VALUES ('road'),('path'),('road');
INSERT INTO way_points(wayid, lat, lon) VALUES (1, 51.05, -0.72), (1, 51.0505, -0.72), (1, 51.051, -0.721); 
INSERT INTO way_points(wayid, lat, lon) VALUES (2, 51.05, -0.72), (2, 51.0495, -0.72);
INSERT INTO way_points(wayid, lat, lon) VALUES (3, 51.05, -0.719), (3, 51.05, -0.72), (3, 51.05, -0.721);

```

## Enhancing the server

The server now needs to serve ways as well as points. Some logic in the `/map` endpoint assembles an array of ways from the individual way points stored in the `way_points` table before returning the JSON to the client.

```typescript
import { Elysia } from 'elysia';
import { staticPlugin } from '@elysiajs/static';
import { Database } from 'bun:sqlite';
import type Way from './types/way';
import type JsonWayPoint from './types/jsonWayPoint';

const PORT = 3000;
const isProd = process.env.NODE_ENV === 'production';

const db = new Database("pointsofinterest.db");

const app = new Elysia()
    .get('/map', ({ set }) => {
        try {
            const pois = db.query("SELECT * FROM pointsofinterest").all();
            const wayPoints = db.query("SELECT w.id, w.type, wp.lat, wp.lon FROM ways w INNER JOIN way_points wp ON w.id = wp.wayid ORDER BY w.id, wp.id").all() as JsonWayPoint[];
            const ways = new Array<Way>();
            wayPoints.forEach((wayPt, index) => {
                if (index === 0 || wayPoints[index].id !== wayPoints[index - 1].id) {
                    ways.push({ id: wayPt.id, type: wayPt.type, coordinates: [[wayPt.lon, wayPt.lat, 0]] });
                } else {
                    ways[ways.length - 1].coordinates.push([wayPt.lon, wayPt.lat, 0]);
                }
            });
            return { pois, ways };
        } catch (e) {
            set.status = 500;
            return { error: "Error querying database" };
        }
    });

if (isProd) {
    // in production, serve the built app (bun run build) from dist
    app.use(staticPlugin({ assets: 'dist', prefix: '/', indexHTML: true }));
} else {
    // in development, forward everything except the API to the Vite dev server
    app.all('/*', ({ request }) => {
        const url = new URL(request.url);
        return fetch(new Request(`http://localhost:5173${url.pathname}${url.search}`, request));
    });
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

This needs two types, `Way` (to represent a way as stored by the app) and `JsonWayPoint` (to represent a row in the `way_points` table). Save these in appropriate files in the `types` directory.

```typescript
export default interface Way {
    id: number;
    type: string;
    coordinates: [number, number, number?][];
}
```

```typescript
export default interface JsonWayPoint {
    id: number;
    lat: number;
    lon: number;
    type: string;
}
```

## The front end

The app is growing larger, so the rendering is separated out into a new `GeoDataRenderer` component.

First the `App` component:

```tsx
import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR } from '@omnidotdev/rdk/engine';
import { GeolocationSession } from '@omnidotdev/rdk/geolocation';
import GeoDataRenderer from './GeoDataRenderer';
import type Way from '../types/way';

export default function App() {
    const [pois, setPois] = useState([]);
    const [ways, setWays] = useState<Way[]>([]);

    useEffect(() => {
        fetch('/map')
            .then(response => response.json())
            .then(json => {
                setPois(json.pois);
                setWays(json.ways);
            });
    }, []);



    return(
        <Canvas gl={{antialias: false, powerPreference: "default"}}>
            <ambientLight intensity={3} />
            <directionalLight position={[0, 1, 0]} intensity={6} />
            <XR>
                <GeolocationSession options={{fakeLat: 51.0502, fakeLon: -0.7202}}>
                    <GeoDataRenderer pois={pois} ways={ways} />
                </GeolocationSession>
            </XR>
        </Canvas>
    );
}
```

`App` is now simpler. It contains two state variables for `pois` and `ways`, and the effect that fetches the data from the server on startup sets those two state variables to the POI and way data returned from the server, respectively.

The JSX now just sets up the basic RDK template with most of the work done in `GeoDataRenderer`. The POIs and ways are passed into this component as props.

### GeoDataRenderer

Here is the `GeoDataRenderer` component, which actually renders the data.

```tsx

import { GeolocationAnchor, GeoLine } from "@omnidotdev/rdk/geolocation";
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import Tree  from './basicModels/tree';
import Glass from './basicModels/glass';
import Cup from './basicModels/cup';
import Shop from './basicModels/shop';
import Marker from './basicModels/marker';
import type Poi from '../types/poi';
import type Way from '../types/way';

interface GeoDataRendererProps {
    pois: Poi[];
    ways: Way[];
}

export default function GeoDataRenderer({ pois, ways } : GeoDataRendererProps) {

     const { camera } = useThree();

     useEffect(() => {
        camera.position.setY(10)
     }, []);

     const renderedPois = pois.map ( (poi) =>  {

        let poiComponent = <></>;

        switch(poi.type) {
            case "park":
                poiComponent = <Tree />;
                break;
            case "bar":
                poiComponent = <Glass />;
                break;
            case "shop":
                poiComponent = <Shop id={poi.id} />;
                break;
            case "cafe":
                poiComponent = <Cup />;
                break;
            default:
                poiComponent = <Marker />;
        }


        return(
            <GeolocationAnchor key={`p${poi.id}`} latitude={poi.lat} longitude={poi.lon}>
            {poiComponent}
            </GeolocationAnchor>
        );
    });

    const renderedWays = ways.map ((way) => {
        return(
            <GeoLine coordinates={way.coordinates} key={`w${way.id}`} color='yellow' lineWidth={way.type == 'path' ? 2 : 5} />
        )
    });

    return <>{renderedPois}{renderedWays}</>;
}
```

Much of the logic manages the POIs, as before. The new code renders the ways. RDK's `GeoLine` component makes this straightforward: map each `Way` to a `GeoLine`, passing the way's `coordinates` along with a `color` and `lineWidth`. This example sets the color to yellow. The line width (in Spherical Mercator units, approximately metres but dependent on latitude) is wider (5) for roads and narrower (2) for paths.

**Note that if you use different colors for different `GeoLine`s, you might currently get flickering Z-fighting artefacts at the points at which they join. You can avoid this by ensuring the lines do not overlap.**

Also note this code:

```tsx
const { camera } = useThree();

useEffect(() => {
    camera.position.setY(10)
 }, []);
```

This elevates the camera so it looks down on the ways, making the scene clearer. A real outdoor app would elevate by around 2 metres; this example uses 10 metres to make the ways easier to see when testing indoors. Inside a React Three Fiber `Canvas` component, underlying three.js objects (such as the camera) are available via the `useThree()` hook.


Here is a screenshot on a real device, facing north (a pushpin is used for the POI to improve the look of the screenshot).

![Screenshot of tutorial Part 4](/img/rdk/tutorial/part4.png)
