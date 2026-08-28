"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { SITE } from "@/data/site";
import styles from "./StoreMap.module.css";

// Leaflet builds this element itself, so the styling lives in the CSS module
// under `.marker` rather than being passed as inline HTML.
const markerIcon = L.divIcon({
  className: styles.marker,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export function MapCanvas() {
  const position: [number, number] = [SITE.location.lat, SITE.location.lng];

  return (
    <MapContainer
      center={position}
      zoom={15}
      scrollWheelZoom={false}
      className={styles.map}
    >
      {/* Plain OpenStreetMap tiles — no API key needed. CARTO's dark basemap
          now requires a key and stamps "API KEY REQUIRED" across every tile.
          These tiles are light, so `.map` inverts the tile pane to dark. */}
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={19}
      />
      <Marker position={position} icon={markerIcon}>
        <Popup>
          <div className={styles.popup}>
            <p className={styles.popupTitle}>{SITE.name}</p>
            <p>{SITE.address}</p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
