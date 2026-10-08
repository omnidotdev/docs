---
title: "Part 2: Connecting to a Server"
description: Extend the app to fetch points of interest from a server API instead of hard-coding them.
---

Part 2 makes the app more useful by connecting to a server and retrieving hard-coded POIs from an API. These are not yet stored in a database; Part 3 adds that.

The server uses [Elysia](https://elysiajs.com), the Omni standard server framework, running on [Bun](https://bun.sh). Bun executes TypeScript directly, so no separate compile step or TypeScript loader is needed. In development, Elysia sits in front of Vite's dev server: a single server on port 3000 serves both the API and, by proxying everything else to Vite, the app itself (with hot module reloading intact).

## Setting up the project

Two dependencies are required: `elysia` itself, and `@elysiajs/static` to serve the built app in production. Add `concurrently` as a dev dependency so a single command can run the Vite dev server and the Elysia server together.

```console
bun add elysia @elysiajs/static
bun add -d concurrently
```

### Adding scripts

Replace your `dev` script so it runs both Vite and the Elysia server (`server.ts`), and add `build` and `start` scripts for production:

```json
"scripts": {
    "dev": "concurrently \"vite\" \"bun --watch server.ts\"",
    "build": "vite build",
    "start": "NODE_ENV=production bun server.ts"
}
```

### Configuring TypeScript

Ensure you add `server.ts` to the list of files to be type-checked:

```json
{
    "files" : [ "server.ts", "src/main.tsx" ]
}
```

### Updating the Vite config

Because the browser now talks to the Elysia server (port 3000), which proxies through to Vite, Vite's hot-module-reload client must connect straight to Vite's own port. Update `vite.config.mjs`:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        // the Elysia server proxies to Vite, but HMR needs a direct WebSocket to
        // Vite itself, so point the HMR client straight at Vite's port
        hmr: { clientPort: 5173 }
    }
});
```

## Coding the server

Here is a simple Elysia server which will deliver JSON containing four hard-coded points of interest in response to the `/map` endpoint: 

```typescript
import { Elysia } from 'elysia';
import { staticPlugin } from '@elysiajs/static';

const PORT = 3000;
const isProd = process.env.NODE_ENV === 'production';

const pois = [
    {
        "id" : 1,
        "name" : "Village Cafe",
        "lat" : 51.0505,
        "lon" : -0.72,
        "type" : "cafe",
    },
    {
        "id" : 2,
        "name" : "Park",
        "lat" : 51.0495,
        "lon" : -0.72,
        "type": "park",
    },
    {
        "id" : 3,
        "name" : "The Red Lion",
        "lat": 51.05,
        "lon": -0.721,
        "type": "bar"
    },
    {
        "id" : 4,
        "name" : "Village Stores",
        "lat": 51.05,
        "lon": -0.719,
        "type": "shop"
    }
];

const app = new Elysia()
    .get('/map', () => pois);

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

The `/map` endpoint returns the POIs, which Elysia serialises to JSON. The server listens on port 3000. In development, any request that is not `/map` is proxied to Vite's dev server, so this single Elysia server delivers both the API and the app; in production the built app is served from `dist` with `@elysiajs/static`.

On the front end, instead of plain boxes, a simple "model" resembling a pushpin marker illustrates the concept. It is a compound of a cone (the marker's base), a sphere (the marker's head), and a smaller black sphere (the "dot").

Save this in a file `marker.tsx` inside a directory `basicModels`. 

The structure should be clear to anyone familiar with three.js. Each React Three Fiber component is equivalent to a three.js object; see the [React Three Fiber docs](https://r3f.docs.pmnd.rs/) for more detail. Note that the `args` prop of a geometry is an array containing the usual arguments to the corresponding three.js `Geometry` object.

```tsx

export default function Marker() {

   const color = "red";
  
   return (
        <group scale={2}>
            <mesh rotation={[Math.PI, 0, 0]} position={[0, 1.5, 0]}>
                <coneGeometry args={[1, 3, 64]} />
                <meshStandardMaterial transparent={true} color={color} opacity={0.7} />
            </mesh>
            <mesh position={[0, 3, 0]}>
                <sphereGeometry args={[1, 32, 16, 0, Math.PI*2, 0, Math.PI]} />
                <meshStandardMaterial transparent={true} color={color} opacity={0.7} />
            </mesh>
             <mesh position={[0, 3, 0]}>
                <sphereGeometry args={[0.5, 32, 16, 0, Math.PI*2, 0, Math.PI*2]} />
                <meshStandardMaterial color="black" />
            </mesh>
        </group>
    );
}
```


We will also need to define the `Poi` type: save this in the `types` directory as `poi.ts`.

```typescript
export default interface Poi {
    id: number;
    lat: number;
    lon: number;
    name: string;
    type: string;
}
```

Now modify your `App` on the client side as follows:

```tsx

import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR } from '@omnidotdev/rdk/engine';
import { GeolocationAnchor, GeolocationSession } from '@omnidotdev/rdk/geolocation';
import Marker from './basicModels/marker';
import Poi from './types/poi'; 

export default function App() {
    const [pois, setPois] = useState([]);

    useEffect(() => {
        fetch('/map')
            .then(response => response.json())
            .then(json => setPois(json))
            .catch(e => { alert("Error fetching POIs"); });
    }, []);

    const renderedPois = pois.map ( (poi : Poi) => 
        <GeolocationAnchor key={poi.id} latitude={poi.lat} longitude={poi.lon}>
            <Marker />
        </GeolocationAnchor>
    );    
        
    return(
        <Canvas gl={{antialias: false, powerPreference: "default"}}>
            <ambientLight intensity={3} />
            <directionalLight position={[0, 1, 0]} intensity={6} />
            <XR>
                <GeolocationSession options={{ fakeLat : 51.05, fakeLon : -0.72}}>
                {renderedPois}
                </GeolocationSession>
            </XR>
        </Canvas>
    );
}
```

This code uses an effect to fetch the POIs from the server when the component first loads: they are then stored in state and rendered.

Note the newly added ambient and directional lights: the marker uses `meshStandardMaterial`, which is affected by lighting.

### Run it!

Again, use:

```console
bun dev
```

You will then be able to access your AR app on `http://localhost:3000`. As the four POIs are north, south, east and west of the initial location, you will need to use a mobile device so you can rotate it round to see the four POIs.  

**Note that if the device picks up a real GPS location, this will override the fake location with the result that the content may disappear after having initially been visible. To avoid this, make sure you turn location off on your mobile device. Or, if you are testing in a location with good GPS signal, use the real GPS from the outset by omitting the `fakeLat` and `fakeLon` options.**

Here is a screenshot on a real device, facing north:

![Screenshot of tutorial Part 2](/img/rdk/tutorial/part2.png)

Now go on to [Part 3](/products/rdk/tutorial/part3).
