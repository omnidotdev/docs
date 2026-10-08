---
title: "Part 1: Hello World"
description: Set up an RDK project and render your first location-based AR object, a red cube at a fixed latitude and longitude.
---

Part 1 covers the basics of an RDK app by building a minimal location-based augmented reality scene: a red cube positioned at a specific latitude and longitude. The tutorial uses TypeScript, with Vite as the development server and bundler. It assumes a basic knowledge of TypeScript and React, as well as [three.js](https://threejs.org), including familiarity with meshes, geometries, and materials.

## Setting up the project

Start by creating a project with the required dependencies. Use an IDE such as VS Code, or the command line. Install the dependencies with `bun`:

```console
bun add @omnidotdev/rdk @react-three/fiber locar react react-dom three
```

```console
bun add -d @vitejs/plugin-react vite @types/react @types/react-dom @types/three typescript
```

### Adding scripts

Add a `dev` script to your `package.json`:

```json
"scripts": {
    "dev" : "vite dev",
}
```

### Configuring TypeScript

Certain TypeScript configuration settings need to be used to successfully compile and run an RDK project. Use a setup such as the following for your `tsconfig.json`:

```json
{
    "compilerOptions": {
        "noEmit" : true,
        "strict" : true,
        "target" : "esnext",
        "moduleResolution" : "bundler",
        "module" : "preserve",
        "skipLibCheck" : true,
        "jsx" : "preserve"
    },
    "files" : [ "src/main.tsx" ]
}
```

Also create a `vite.config.mjs` enabling the Vite React plugin:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()]
});
```

The project is now ready for development.

## Building the Hello World app

Start with an HTML template for the app to render into:

```html
<!DOCTYPE html>
<html>
<head>
<script type='module' src='src/main.tsx'></script>
<title>RDK Hello World</title>
<style type='text/css'>
html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
}

#root {
   width: 100%;
   height: 100%
}
</style>
</head>
<body>
<div id='root'></div>
</body>
</html>
```

Next, in the `src` directory, add the standard React startup code to create a root node and render JSX into it (save as `main.tsx`):

```tsx
import { createRoot } from 'react-dom/client';
import App from './components/App';

const root = createRoot(
    document.getElementById("root")!
);
root.render(<App />);
```

Now the `App` component itself, which uses RDK. Save it as `App.tsx` inside the `components` subdirectory within `src`:

```tsx
import { Canvas } from '@react-three/fiber';
import { XR } from '@omnidotdev/rdk/engine';
import { GeolocationAnchor, GeolocationSession } from '@omnidotdev/rdk/geolocation';

export default function App() {
    return(
        <Canvas gl={{antialias: false, powerPreference: "default"}}>
            <XR>
                <GeolocationSession options={{ fakeLat : 51.05, fakeLon : -0.72 }}>
                    <GeolocationAnchor latitude={51.0505} longitude={-0.72}>
                        <mesh>
                            <boxGeometry args={[10, 10, 10]} />
                            <meshBasicMaterial color="red" />
                        </mesh>
                    </GeolocationAnchor>
                </GeolocationSession>
            </XR>
        </Canvas>
    );
}
```

Much of this code comes from [React Three Fiber](https://r3f.docs.pmnd.rs), a library that provides a React interface to three.js, letting you represent 3D objects as React components. `Canvas`, `mesh`, `boxGeometry`, and `meshBasicMaterial` are all from React Three Fiber.

The RDK-specific components are `XR`, `GeolocationSession`, and `GeolocationAnchor`. `XR` represents an extended reality session; RDK can also perform other types of augmented reality, such as marker-based. Inside the `XR` session, a `GeolocationSession` enables location-based AR. Because testing often happens indoors, the example supplies a *fake* latitude and longitude. If the `fakeLat` and `fakeLon` options are omitted, RDK attempts to obtain the device's real GPS location.

Inside the `GeolocationSession` sits a `GeolocationAnchor`. A `GeolocationAnchor` represents a single point in the world, such as a point of interest, positioned by its latitude and longitude.

The `GeolocationAnchor` contains whatever mesh, or group of meshes, renders the point of interest. This example uses a React Three Fiber `mesh` containing a box geometry and a red basic material. (Basic materials are unaffected by lighting; a real app would typically add lights and use a `meshStandardMaterial` instead, covered later.) The result is a red box 0.0005 degrees north of the current position.

### Run it!

Vite serves the app in development. Run it with:

```console
bun dev
```

You will then be able to access your AR Hello World app on `http://localhost:5173`. You should see a red box in front of you. On a desktop or laptop this will be static in the middle of the screen, but on a mobile device it should only be visible if you point the device north.

Here is a screenshot on a real device, facing north:

![Screenshot of Hello World RDK app](/img/rdk/tutorial/part1.png)

Now go on to [Part 2](/products/rdk/tutorial/part2).
