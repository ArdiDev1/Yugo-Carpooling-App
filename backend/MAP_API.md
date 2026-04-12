# Map API — Frontend Integration Guide

Everything the frontend needs to render the Yugo map with driver, passenger, and pickup-request pins.

Source: [app/services/map.py](app/services/map.py)

---

## Data shapes

### `Pin`

The core object the frontend consumes. Every pin on the map — whether a driver's current location, a passenger's location, or a pickup request — is rendered from this shape.

```ts
type Pin = {
  id: string;          // stable id, e.g. "driver-usr_001" or "passenger-usr_004"
  role: "driver" | "passenger";
  label: string;       // display name above the marker (falls back to "Driver"/"Passenger")
  address: string | null;  // human-readable address (null if only coords are known)
  lat: number;
  lng: number;
  color: string;       // hex string, already matched to the role
};
```

**Color convention** (set by backend, don't hardcode on frontend):
- `driver` → `#1E88E5` (blue)
- `passenger` → `#E53935` (red)

### `MapConfig`

Returned by the map bootstrap endpoint. Use it to initialize the Google Maps instance — never read the API key from the frontend env.

```ts
type MapConfig = {
  apiKey: string;
  center: { lat: number; lng: number };
  zoom: number;  // default 14
};
```

### `Coordinates`

Returned by the forward geocoding helper.

```ts
type Coordinates = {
  lat: number;
  lng: number;
};
```

---

## Backend helpers (what the route layer uses)

The frontend calls HTTP endpoints, not these functions directly. But knowing what's available explains what endpoints can return.

| Helper | Input | Output | Notes |
|---|---|---|---|
| `get_map_config(lat, lng, zoom)` | coordinates + optional zoom | `MapConfig` | Bootstrap the map |
| `create_driver_pin(driver_id, lat, lng, name?, address?)` | driver id + coords | `Pin` (role=driver) | For driver locations |
| `create_passenger_pin(passenger_id, lat, lng, name?, address?)` | passenger id + coords | `Pin` (role=passenger) | For passenger locations AND pickup requests |
| `create_pin(user_id, role, lat, lng, label?, address?)` | generic | `Pin` | Underlying builder |
| `geocode_address(address)` | human address string | `Coordinates` or `null` | Forward geocoding (Google Maps API) |
| `reverse_geocode(lat, lng)` | coordinates | formatted address or `null` | Reverse geocoding |

`geocode_address` and `reverse_geocode` are `async` — they hit Google Maps, so caller code awaits them.

---

## Endpoints (expected shape for the frontend)

> These are the endpoints the backend will expose on top of the helpers above. Some may still be in progress — confirm with backend before integrating.

### `GET /api/v1/map/config`

Returns `MapConfig` for bootstrapping the map instance.

**Query params:**
- `lat` (float, required) — initial center latitude
- `lng` (float, required) — initial center longitude
- `zoom` (int, optional, default `14`)

**Response 200:**
```json
{
  "apiKey": "AIza...",
  "center": { "lat": 42.3398, "lng": -71.0892 },
  "zoom": 14
}
```

### `GET /api/v1/map/pins/requests`

Returns all active pickup-request pins (open `RideRequest` posts). One pin per request, positioned at the passenger's pickup location.

**Response 200:**
```json
[
  {
    "id": "passenger-usr_seed_004",
    "role": "passenger",
    "label": "Sofia Martinez",
    "address": "Boston University, Boston, MA",
    "lat": 42.3505,
    "lng": -71.1054,
    "color": "#E53935"
  },
  {
    "id": "passenger-usr_seed_005",
    "role": "passenger",
    "label": "James O'Brien",
    "address": "Harvard University, Cambridge, MA",
    "lat": 42.3770,
    "lng": -71.1167,
    "color": "#E53935"
  }
]
```

### `GET /api/v1/map/pins/drivers`

Returns driver pins for drivers that are currently online / offering rides.

**Response 200:** — same shape as above, `role: "driver"`, `color: "#1E88E5"`.

### `POST /api/v1/map/geocode`

Helper for converting a typed address into lat/lng (e.g. when a user enters a pickup location in a form and the UI wants to preview it on the map before submitting).

**Request body:**
```json
{ "address": "MIT, Cambridge, MA" }
```

**Response 200:**
```json
{ "lat": 42.3601, "lng": -71.0942 }
```

**Response 404:** address could not be geocoded.

---

## React + Vite usage

### 1. Bootstrap the map

```jsx
import { useEffect, useState } from "react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

function YugoMap() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    fetch("/api/v1/map/config?lat=42.3398&lng=-71.0892")
      .then((r) => r.json())
      .then(setConfig);
  }, []);

  if (!config) return <div>Loading map…</div>;

  return (
    <APIProvider apiKey={config.apiKey}>
      <Map
        style={{ width: "100%", height: "100vh" }}
        defaultCenter={config.center}
        defaultZoom={config.zoom}
      >
        {/* pins go here */}
      </Map>
    </APIProvider>
  );
}
```

### 2. Render pickup-request pins

```jsx
const [pins, setPins] = useState([]);

useEffect(() => {
  fetch("/api/v1/map/pins/requests")
    .then((r) => r.json())
    .then(setPins);
}, []);

// inside <Map>:
{pins.map((pin) => (
  <Marker
    key={pin.id}
    position={{ lat: pin.lat, lng: pin.lng }}
    label={{ text: pin.label, color: "white" }}
    icon={{
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: pin.color,
      fillOpacity: 1,
      strokeWeight: 1,
      scale: 10,
    }}
    onClick={() => openRequestDetails(pin.id)}
  />
))}
```

### 3. Address → coordinates when a user types a pickup location

```jsx
async function previewPickup(address) {
  const res = await fetch("/api/v1/map/geocode", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address }),
  });
  if (!res.ok) return null;
  return await res.json(); // { lat, lng }
}
```

Use the returned `{lat, lng}` to drop a preview marker before the user submits the ride request.

---

## Rules for frontend

1. **Never hardcode the Google Maps API key.** Read it from `GET /api/v1/map/config`. Key rotation stays server-side.
2. **Don't geocode on the frontend.** All address→coord conversion goes through the backend endpoints — that way we control quota and cache results.
3. **Pin colors come from the backend.** Don't override `pin.color` with your own values; if the design needs a different palette, change `PIN_COLORS` in [app/services/map.py](app/services/map.py) so drivers + passengers match everywhere.
4. **Pin IDs are stable.** Use `pin.id` as the React `key`; it already encodes role + user id (`driver-usr_001`, `passenger-usr_004`).
5. **Expect `address: null`** for pins built only from coordinates (e.g. real-time driver GPS). Only show the address if it exists.
6. **Pagination / filtering** — if pickup-request pins grow past a few hundred, the backend will add query params like `?limit=`, `?bbox=` (bounding box), `?school=`. Until then, the endpoint returns all open requests.

---

## Known gaps / TODOs

- The endpoints listed above (`/map/config`, `/map/pins/requests`, `/map/pins/drivers`, `/map/geocode`) are **not yet wired into FastAPI routes** — only the helper functions in [map.py](app/services/map.py) exist. Confirm with backend before integrating.
- `RideRequest` documents don't currently store `lat`/`lng` — only a `from_location` string. Backend needs to either:
  - (a) geocode on-demand when listing pins (slower, burns quota), or
  - (b) geocode once at request creation and cache lat/lng on the ride document (faster, recommended).
- Real-time driver location (live GPS tracking) is not implemented — drivers only appear as pins based on their stored profile location. Add WebSocket updates later if needed.
