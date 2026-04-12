import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { Map as MapIcon, Maximize2, X } from "lucide-react";
import { mapService } from "../../services/map.service";

// ─── Data fetching ────────────────────────────────────────────────────────────

function useMapConfig(enabled) {
  return useQuery({
    queryKey: ["mapConfig"],
    queryFn:  () => mapService.getConfig().then((r) => r.data),
    enabled,
    staleTime: Infinity, // API key never changes mid-session
    retry: false,
  });
}

function useGeocode(address, enabled) {
  return useQuery({
    queryKey: ["geocode", address],
    queryFn:  () => mapService.geocode(address).then((r) => r.data),
    enabled:  !!address && enabled,
    staleTime: Infinity, // addresses are stable
    retry: false,
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function midpoint(a, b) {
  if (!a && !b) return { lat: 43.7022, lng: -72.2896 };
  if (!b) return a;
  if (!a) return b;
  return { lat: (a.lat + b.lat) / 2, lng: (a.lng + b.lng) / 2 };
}

function autoZoom(a, b) {
  if (!a || !b) return 13;
  const d = Math.hypot(a.lat - b.lat, a.lng - b.lng);
  if (d < 0.03) return 15;
  if (d < 0.15) return 13;
  if (d < 0.6)  return 11;
  return 9;
}

// ─── Custom map pin ───────────────────────────────────────────────────────────

function Pin({ color, label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", pointerEvents: "none" }}>
      <div style={{
        width: 30, height: 30, borderRadius: "50% 50% 50% 0",
        transform: "rotate(-45deg)",
        backgroundColor: color,
        border: "3px solid white",
        boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{
          transform: "rotate(45deg)",
          color: "white", fontSize: 11, fontWeight: 800,
          fontFamily: "Nunito, sans-serif",
        }}>
          {label}
        </span>
      </div>
    </div>
  );
}

// ─── Map content (shared between inline + fullscreen) ─────────────────────────

function MapCanvas({ apiKey, fromCoords, toCoords, mapId = "yugo-route-map" }) {
  const center = midpoint(fromCoords, toCoords);
  const zoom   = autoZoom(fromCoords, toCoords);

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        style={{ width: "100%", height: "100%" }}
        defaultCenter={center}
        defaultZoom={zoom}
        mapId={mapId}
        disableDefaultUI
        zoomControl
        gestureHandling="greedy"
      >
        {fromCoords && (
          <AdvancedMarker position={fromCoords}>
            <Pin color="#7966fc" label="A" />
          </AdvancedMarker>
        )}
        {toCoords && (
          <AdvancedMarker position={toCoords}>
            <Pin color="#fa6bae" label="B" />
          </AdvancedMarker>
        )}
      </Map>
    </APIProvider>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function RouteMap({
  fromLocation,
  toLocation,
  fromLabel = "From",
  toLabel   = "To",
}) {
  const [isOpen,       setIsOpen]       = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { data: config,     isError: configErr  } = useMapConfig(isOpen);
  const { data: fromCoords, isLoading: loadingA  } = useGeocode(fromLocation, isOpen);
  const { data: toCoords,   isLoading: loadingB  } = useGeocode(toLocation,   isOpen);

  const isLoading = isOpen && (loadingA || loadingB || !config);

  return (
    <>
      {/* ── Route indicator row ──────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>

        {/* Dot-line-dot */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 3, paddingBottom: 3, flexShrink: 0 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "var(--color-primary)", flexShrink: 0 }} />
          <div style={{ flex: 1, width: 2, background: "linear-gradient(to bottom, var(--color-primary), var(--color-secondary))", borderRadius: 1, margin: "3px 0", minHeight: 28 }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "var(--color-secondary)", flexShrink: 0 }} />
        </div>

        {/* Location labels */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 6, minHeight: 48 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--color-muted)", fontWeight: 500, marginBottom: 1 }}>{fromLabel}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)", lineHeight: 1.3 }}>{fromLocation}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--color-muted)", fontWeight: 500, marginBottom: 1 }}>{toLabel}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)", lineHeight: 1.3 }}>{toLocation}</div>
          </div>
        </div>

        {/* View button */}
        <button
          onClick={(e) => { e.stopPropagation(); setIsOpen((v) => !v); }}
          style={{
            alignSelf: "center", flexShrink: 0,
            display: "flex", alignItems: "center", gap: 4,
            padding: "4px 10px", borderRadius: 999,
            border:           `1.5px solid ${isOpen ? "var(--color-primary)" : "var(--color-border)"}`,
            backgroundColor:  isOpen ? "var(--color-primary)" : "transparent",
            color:            isOpen ? "white" : "var(--color-muted)",
            fontSize: 11, fontWeight: 600, cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          <MapIcon size={11} />
          {isOpen ? "Hide" : "View"}
        </button>
      </div>

      {/* ── Collapsible inline map ───────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 200, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ overflow: "hidden", marginTop: 10 }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div style={{ height: 200, borderRadius: 10, overflow: "hidden", position: "relative", backgroundColor: "var(--color-background)" }}>

              {/* Loading state */}
              {isLoading && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 12, color: "var(--color-muted)" }}>Loading map…</span>
                </div>
              )}

              {/* Error state */}
              {configErr && !isLoading && (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 12, color: "var(--color-muted)" }}>Map unavailable</span>
                </div>
              )}

              {/* Map */}
              {config && !configErr && (
                <MapCanvas
                  apiKey={config.apiKey}
                  fromCoords={fromCoords}
                  toCoords={toCoords}
                />
              )}

              {/* Fullscreen button */}
              {config && !isLoading && (
                <button
                  onClick={(e) => { e.stopPropagation(); setIsOpen(false); setIsFullscreen(true); }}
                  style={{
                    position: "absolute", top: 8, right: 8, zIndex: 10,
                    width: 30, height: 30, borderRadius: 8,
                    backgroundColor: "white", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  }}
                >
                  <Maximize2 size={13} color="#374151" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Fullscreen overlay (portalled to body so native events never ── */}
      {/* ── reach OfferCard's Framer Motion listeners)               ── */}
      {createPortal(
        <AnimatePresence>
          {isFullscreen && config && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "fixed",
                top: 0, bottom: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: "100%",
                maxWidth: 390,
                zIndex: 1000,
                backgroundColor: "#000",
              }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <MapCanvas
                apiKey={config.apiKey}
                fromCoords={fromCoords}
                toCoords={toCoords}
                mapId="yugo-route-map-full"
              />

              {/* Close button */}
              <button
                onClick={(e) => { e.stopPropagation(); setIsFullscreen(false); }}
                style={{
                  position: "absolute", top: 16, right: 16, zIndex: 10,
                  width: 40, height: 40, borderRadius: 10,
                  backgroundColor: "white", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
                }}
              >
                <X size={18} color="#374151" />
              </button>

              {/* Location summary card */}
              <div style={{
                position: "absolute", bottom: 32, left: 16, right: 16, zIndex: 10,
                backgroundColor: "white", borderRadius: 16, padding: "14px 18px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                display: "flex", gap: 12, alignItems: "center",
              }}>
                {/* A pin */}
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  backgroundColor: "#7966fc",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ color: "white", fontSize: 11, fontWeight: 800 }}>A</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: "#8b859e", fontWeight: 500 }}>{fromLabel}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1625", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fromLocation}</div>
                </div>

                <div style={{ width: 1, height: 32, backgroundColor: "#ece9f0", flexShrink: 0 }} />

                {/* B pin */}
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  backgroundColor: "#fa6bae",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ color: "white", fontSize: 11, fontWeight: 800 }}>B</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: "#8b859e", fontWeight: 500 }}>{toLabel}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1625", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{toLocation}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
