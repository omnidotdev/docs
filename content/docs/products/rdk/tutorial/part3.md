---
title: "Part 3: Using a Database"
description: Serve the tutorial's points of interest from a real SQLite database.
---

Part 3 enhances the app further by retrieving the points of interest from a real database. For simplicity it uses [SQLite](https://sqlite.org), though a production AR app would more likely use a geographically-aware database such as [PostgreSQL](https://postgresql.org) with [PostGIS](https://postgis.org).

## Setting up the project

SQLite support is built into Bun through the `bun:sqlite` module, so there are no extra dependencies to install for this part.

## Populating the database

Use either the `sqlite3` command line tool or a GUI app such as [SQLite Studio](https://sqlitestudio.pl) to add a few points of interest to your database.
 
You can use this SQL:

```sql
CREATE TABLE pointsofinterest(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    type TEXT,
    lat REAL,
    lon REAL
);

INSERT INTO pointsofinterest (name, type, lat, lon) VALUES
 ('Village Cafe', 'cafe', 51.0505, -0.72),
 ("Tom's Cafe", 'cafe', 51.0506, -0.7205),
 ('Park', 'park', 51.0495, -0.72),
 ('The Red Lion', 'bar', 51.05, -0.721),
 ('Village Stores', 'shop', 51.05, -0.719)
```

Here is a modified version of the Elysia server that delivers JSON containing the data from the database:


```typescript
import { Elysia } from 'elysia';
import { staticPlugin } from '@elysiajs/static';
import { Database } from 'bun:sqlite';

const PORT = 3000;
const isProd = process.env.NODE_ENV === 'production';

const db = new Database("pointsofinterest.db");

const app = new Elysia()
    .get('/map', ({ set }) => {
        try {
            return db.query("SELECT * FROM pointsofinterest").all();
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

This uses Bun's built-in `bun:sqlite` API to query all points of interest from the database and return them to the client as JSON. If the query fails, the server responds with a 500 status and an error message.

### Making it more realistic with different "models" for different POI types

So far, every point of interest is a "pushpin" marker. The code can be enhanced to display a different "model" depending on POI type. The components below are mockups of a teacup, a drinking glass, a tree (for a park), and a building (for a shop). They are simple, but serve as a proof of concept.

Alternatively, use pre-built 3D models such as those available at [Sketchfab](https://sketchfab.com). Loading models is out of scope for this tutorial and is left as an exercise for the reader.

#### Drinking glass

```tsx
export default function Glass() {
    return(
        <group scale={4}>
            <mesh position={[0, 1.5, 0]} >
                <cylinderGeometry args={[1, 1, 3]}/>
                <meshStandardMaterial color="#cc6600" transparent opacity={0.5} />
            </mesh>
            <mesh position={[0, 3.25, 0]}>
                <cylinderGeometry args={[1, 1, 0.5]} />
                <meshBasicMaterial color="white" />
            </mesh>
            <mesh position={[1, 2.5, 0]} rotation={[0, 0, -Math.PI*0.5]}>
                <torusGeometry args={[0.5, 0.1, 16, 100, Math.PI*1.2]} />
                <meshStandardMaterial color="gray" transparent opacity={0.2} metalness={0.1} />
            </mesh>
        </group>
    )
}
```

#### Teacup

```tsx
export default function Cup() {
    return(
        <group scale={2}>
            <mesh position={[0, 2.7, 0]} rotation={[0, 0,  Math.PI]}>
                <sphereGeometry args={[3, 32, 16, 0, Math.PI*2, 0, Math.PI /2]} />
                <meshBasicMaterial color="#8080ff" />
            </mesh>
             <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[3 ,3, 0.5]} />
                <meshBasicMaterial color="#4040ff" />
            </mesh>
            <mesh position={[3, 2.2, 0]} rotation={[0, 0, -Math.PI*0.6]}>
                <torusGeometry args={[0.5, 0.1, 16, 100, Math.PI*1.2]} />
                <meshBasicMaterial color="#4040ff" />
            </mesh>
        </group>
    )
}
```

#### Tree

```tsx
export default function Tree() {
    return(
        <group scale={4}>
            <mesh position={[0, 4, 0]}>
            <sphereGeometry args={[2.0]}/>
            <meshBasicMaterial color="green" />
            </mesh>
            <mesh position={[0, 1, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 2]} />
             <meshBasicMaterial color="#aa5500" />
            </mesh>
        </group>
    )
}
```
#### Shop

The `Shop` is more complex because it dynamically generates the windows for each face of the building. It takes the POI `id` as a prop so that each window has a unique `key`.

```tsx
interface ShopProps {
    id: number;
}

export default function Shop({ id }: ShopProps ) {
    return (
        <group scale={4}>
            <mesh position={[0, 0.75, 0]}>
                <boxGeometry args={[1.5, 1.5, 1.5]} />
                <meshStandardMaterial color="#ff6060" />
                { [...Array(12)].map((_, idx) => (
                    <mesh key={`${id}:w${idx}`} position={[idx%2-0.5, Math.floor((idx%6)/2) * 0.4 - 0.4, Math.floor(idx/6)*1.5 -0.75]}>
                        <boxGeometry args={[0.3, 0.3, 0.1]} />
                        <meshStandardMaterial color="cyan" />
                    </mesh>
                ))}
                { [...Array(12)].map((_, idx) => (
                    <mesh key={`${id}:w${idx+12}`} position={[Math.floor(idx/6)*1.5 -0.75, Math.floor((idx%6)/2) *0.4 - 0.4, idx%2-0.5]}>
                        <boxGeometry args={[0.1, 0.3, 0.3]} />
                        <meshStandardMaterial color="cyan" />
                    </mesh>
                ))}
            </mesh>
            <mesh position={[0, 2, 0]} rotation={[0, Math.PI*0.25, 0]} >
                <coneGeometry args={[1, 1, 4]} />
                <meshStandardMaterial color="#803030" />
            </mesh>
             <mesh position={[0, 0.2, 1]}>
                <planeGeometry args={[0.2, 0.4]} />
                <meshStandardMaterial color="yellow" />
             </mesh>
        </group>
    );
}
```

The `App` component is now revised as follows:


```tsx
import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR } from '@omnidotdev/rdk/engine';
import { GeolocationAnchor, GeolocationSession } from '@omnidotdev/rdk/geolocation';
import Tree from './basicModels/tree';
import Cup from './basicModels/cup';
import Glass from './basicModels/glass';
import Shop from './basicModels/shop';
import Marker from './basicModels/marker';
import Poi from './types/poi';

export default function App() {
    const [pois, setPois] = useState<Poi[]>([]);
   
    useEffect(() => {
        fetch('/map')
            .then(response => response.json())
            .then(json => setPois(json));
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
            <GeolocationAnchor key={poi.id} latitude={poi.lat} longitude={poi.lon}>
            {poiComponent}
            </GeolocationAnchor>
        );
    });    
        
    return(
        <Canvas gl={{antialias: false, powerPreference: "default"}}>
            <ambientLight intensity={3} />
            <directionalLight position={[0, 1, 0]} intensity={6} />
            <XR>
                <GeolocationSession options={{fakeLat: 51.0502, fakeLon: -0.7202}}>
                {renderedPois}
                </GeolocationSession>
            </XR>
        </Canvas>
    );
}
```

The logic now creates the appropriate component depending on the `type` property from the JSON. 

Try it out. The POIs now load from the database, each represented by a model specific to its type.

Here is a screenshot on a real device, facing north:

![Screenshot of tutorial Part 3](/img/rdk/tutorial/part3.png)

### For you to try

Try adding a query string (read it from Elysia's `query` context property) to your API endpoint, specifying a `bbox` (bounding box). This should take a comma-separated list of the west, south, east and north bounds of a geographical box. Modify the database query to find only points of interest within the bounding box.

Once you have finished go on to [Part 4](/products/rdk/tutorial/part4).
