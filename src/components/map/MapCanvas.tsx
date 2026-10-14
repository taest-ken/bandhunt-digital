"use client";

import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { MUMBAI_BOUNDS, TOUR_NODES } from "@/lib/config/tourSchedule";
import { TourPhase } from "@/types/hitmap";
import { Plus, Minus } from "lucide-react";

interface MapCanvasProps {
  initialCenter: [number, number]; // [lng, lat]
  resetCoord?: [number, number];
  currentLevelIndex?: number;
  completedLevels?: number[];
  onSelectPastNode?: (levelIndex: number) => void;
  velocity: { vx: number; vy: number }; // from joystick
  onCenterChange: (center: [number, number], levelIndex?: number) => void;
  isLockedIn: boolean;
  lockedCoordinates?: [number, number];
  activePhase: TourPhase;
  meetupCoordinates?: [number, number];
}

// Real Geographic Highway Waypoints across India (NH 48)
const DELHI_ROUTE_COORDS: [number, number][] = [
  [72.8777, 19.0760], // Mumbai
  [72.9106, 20.3893], // Vapi
  [72.8311, 21.1702], // Surat
  [72.9959, 21.7051], // Bharuch
  [73.1812, 22.3072], // Vadodara
  [72.5714, 23.0225], // Ahmedabad
  [72.9616, 23.5979], // Himatnagar
  [73.7125, 24.5854], // Udaipur
  [74.6399, 26.4499], // Ajmer
  [75.7873, 26.9124], // Jaipur
  [76.2008, 27.7027], // Kotputli
  [77.0266, 28.4595], // Gurugram
  [77.2090, 28.6139], // New Delhi
];

const BANGALORE_ROUTE_COORDS: [number, number][] = [
  [72.8777, 19.0760], // Mumbai
  [73.1090, 18.9894], // Navi Mumbai
  [73.4072, 18.7557], // Lonavala
  [73.8567, 18.5204], // Pune
  [73.9856, 18.1362], // Shirwal
  [73.9903, 17.6805], // Satara
  [74.1844, 17.2885], // Karad
  [74.2433, 16.7050], // Kolhapur
  [74.3809, 16.4022], // Nipani
  [74.4977, 15.8497], // Belagavi
  [75.0078, 15.4589], // Dharwad
  [75.1240, 15.3647], // Hubballi
  [75.4028, 14.7954], // Haveri
  [75.6267, 14.6198], // Ranibennur
  [75.9218, 14.4644], // Davanagere
  [76.4008, 14.2251], // Chitradurga
  [76.9022, 13.7431], // Sira
  [77.1000, 13.3400], // Tumakuru
  [77.3879, 13.0970], // Nelamangala
  [77.5946, 12.9716], // Bangalore (BLR)
];

export const MapCanvas: React.FC<MapCanvasProps> = ({
  initialCenter,
  resetCoord,
  currentLevelIndex = 0,
  completedLevels = [],
  onSelectPastNode,
  velocity,
  onCenterChange,
  isLockedIn,
  lockedCoordinates,
  activePhase,
  meetupCoordinates = [72.8358, 18.9320],
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const pastLevelMarkersRef = useRef<maplibregl.Marker[]>([]);
  const phase2MarkerRef = useRef<maplibregl.Marker | null>(null);
  const phase3MarkersRef = useRef<maplibregl.Marker[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const throttleTimerRef = useRef<number>(0);
  const currentPhaseRef = useRef<TourPhase>(activePhase);
  const onCenterChangeRef = useRef(onCenterChange);
  const currentLevelIndexRef = useRef(currentLevelIndex);

  // Keep refs always up to date with latest props
  useEffect(() => {
    onCenterChangeRef.current = onCenterChange;
    currentLevelIndexRef.current = currentLevelIndex;
  });

  // Camera repositioning when resetCoord changes (e.g. Next Level or Hunt Again)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !resetCoord) return;
    map.flyTo({
      center: resetCoord,
      zoom: 14.5,
      speed: 1.8,
      curve: 1.42,
      essential: true,
    });
  }, [resetCoord]);

  // Apply Blueprint Map Styles:
  // - Plain area / Landmass: Bright Electric Blue (#1A56DB / #0052FF)
  // - Sea / Water: Dark Denim Blue (#08123B)
  // - Roads: Crisp Pure White (#FFFFFF)
  // - Buildings: Darker Denim Blue (#0E296D)
  const applyCustomMapColors = (map: maplibregl.Map) => {
    try {
      const style = map.getStyle();
      if (!style || !style.layers) return;

      style.layers.forEach((layer) => {
        // 1. Sea / Oceans / Waterways -> Dark Denim Blue
        if (layer.id.includes("water") || layer.id.includes("ocean") || layer.id.includes("sea")) {
          if (layer.type === "fill") {
            map.setPaintProperty(layer.id, "fill-color", "#08123B");
            map.setPaintProperty(layer.id, "fill-opacity", 1.0);
          } else if (layer.type === "line") {
            map.setPaintProperty(layer.id, "line-color", "#08123B");
          }
        }
        // 2. Base Land / Canvas background -> Bright Electric Blue
        else if (layer.id === "background") {
          map.setPaintProperty(layer.id, "background-color", "#1A56DB");
        }
        // 3. Land polygons, parks, districts, islands -> Bright Electric Blue (No white borders)
        else if (
          layer.id.includes("land") ||
          layer.id.includes("park") ||
          layer.id.includes("residential") ||
          layer.id.includes("commercial") ||
          layer.id.includes("industrial") ||
          layer.id.includes("wood") ||
          layer.id.includes("cemetery")
        ) {
          if (layer.type === "fill") {
            map.setPaintProperty(layer.id, "fill-color", "#1A56DB");
            map.setPaintProperty(layer.id, "fill-outline-color", "#1A56DB");
            map.setPaintProperty(layer.id, "fill-opacity", 1.0);
          }
        }
        // 4. Buildings & Built structures -> Darker Denim Blue / Slate (Remove white outlines completely)
        else if (layer.id.includes("building") || layer.id.includes("structure")) {
          // Hide building-top to eliminate 3D extrusion offset and white outlines
          if (layer.id === "building-top") {
            try {
              map.setLayoutProperty(layer.id, "visibility", "none");
            } catch {}
          }
          if (layer.type === "fill") {
            map.setPaintProperty(layer.id, "fill-color", "#0E296D");
            map.setPaintProperty(layer.id, "fill-outline-color", "#0E296D");
            map.setPaintProperty(layer.id, "fill-opacity", 1.0);
            try {
              map.setPaintProperty(layer.id, "fill-translate", [0, 0]);
            } catch {}
          } else if (layer.type === "line") {
            try {
              map.setLayoutProperty(layer.id, "visibility", "none");
            } catch {}
          }
        }
        // 5. Roads, Highways, Tunnels, Bridges -> Crisp Pure White
        else if (
          layer.id.includes("road") ||
          layer.id.includes("bridge") ||
          layer.id.includes("tunnel") ||
          layer.id.includes("highway") ||
          layer.id.includes("street") ||
          layer.id.includes("railway")
        ) {
          if (layer.type === "line") {
            map.setPaintProperty(layer.id, "line-color", "#FFFFFF");
            map.setPaintProperty(layer.id, "line-opacity", 0.95);
          }
        }
        // 6. Text Labels -> Clean White with Dark Halo for readability
        else if (layer.type === "symbol") {
          try {
            map.setPaintProperty(layer.id, "text-color", "#FFFFFF");
            map.setPaintProperty(layer.id, "text-halo-color", "#08123B");
            map.setPaintProperty(layer.id, "text-halo-width", 1.5);
          } catch {}
        }
      });
    } catch (e) {
      console.warn("Style paint update error:", e);
    }
  };

  // Helper to tear down Phase 3 routes & markers
  const removePhase3Routes = (map: maplibregl.Map) => {
    phase3MarkersRef.current.forEach((m) => m.remove());
    phase3MarkersRef.current = [];

    const layers = [
      "p3-route-delhi-line",
      "p3-route-delhi-casing",
      "p3-route-blr-line",
      "p3-route-blr-casing",
    ];
    layers.forEach((id) => {
      if (map.getLayer(id)) map.removeLayer(id);
    });

    const sources = ["p3-route-delhi", "p3-route-blr"];
    sources.forEach((id) => {
      if (map.getSource(id)) map.removeSource(id);
    });
  };

  // Helper to establish Phase 3 routes & markers
  const setupPhase3Routes = (map: maplibregl.Map) => {
    removePhase3Routes(map);

    try {
      // 1. Mumbai -> Delhi Route (Neon Lime with Dark Casing)
      if (!map.getSource("p3-route-delhi")) {
        map.addSource("p3-route-delhi", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: DELHI_ROUTE_COORDS,
            },
          },
        });
      }

      if (!map.getLayer("p3-route-delhi-casing")) {
        map.addLayer({
          id: "p3-route-delhi-casing",
          type: "line",
          source: "p3-route-delhi",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "#1C1C1C",
            "line-width": 6,
            "line-opacity": 0.95,
          },
        });
      }

      if (!map.getLayer("p3-route-delhi-line")) {
        map.addLayer({
          id: "p3-route-delhi-line",
          type: "line",
          source: "p3-route-delhi",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "#CFFF04", // High-voltage Neon Lime
            "line-width": 3.5,
            "line-dasharray": [3, 2],
          },
        });
      }

      // 2. Mumbai -> Bangalore Route (Electric Cyan with Dark Casing)
      if (!map.getSource("p3-route-blr")) {
        map.addSource("p3-route-blr", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: BANGALORE_ROUTE_COORDS,
            },
          },
        });
      }

      if (!map.getLayer("p3-route-blr-casing")) {
        map.addLayer({
          id: "p3-route-blr-casing",
          type: "line",
          source: "p3-route-blr",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "#1C1C1C",
            "line-width": 6,
            "line-opacity": 0.95,
          },
        });
      }

      if (!map.getLayer("p3-route-blr-line")) {
        map.addLayer({
          id: "p3-route-blr-line",
          type: "line",
          source: "p3-route-blr",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "#00F0FF", // Electric Cyan (distinct from Delhi)
            "line-width": 3.5,
            "line-dasharray": [3, 2],
          },
        });
      }

      // 3. Geographically Locked Markers
      // A. Mumbai Origin Pin
      const mumbaiEl = document.createElement("div");
      mumbaiEl.className = "flex flex-col items-center pointer-events-none select-none -translate-y-1/2";
      mumbaiEl.innerHTML = `
        <div class="relative flex items-center justify-center">
          <span class="animate-ping absolute inline-flex h-9 w-9 rounded-full bg-[#FF2E9A] opacity-75"></span>
          <span class="relative inline-flex rounded-full h-6 w-6 bg-[#FF2E9A] border-2 border-[#1C1C1C] items-center justify-center shadow-[2px_2px_0px_#1C1C1C]">
            <span class="w-2 h-2 rounded-full bg-white"></span>
          </span>
        </div>
        <div class="mt-1 px-2.5 py-0.5 bg-white text-[#1C1C1C] border-2 border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C] rounded-lg font-black text-[10px] whitespace-nowrap tracking-wider uppercase">
          📍 MUMBAI (CHAPTER COMPLETED) ✓
        </div>
      `;
      const m1 = new maplibregl.Marker({ element: mumbaiEl, anchor: "center" })
        .setLngLat([72.8777, 19.0760])
        .addTo(map);

      // B. New Delhi - Possible Next Pitstop Pin & Doodle
      const delhiEl = document.createElement("div");
      delhiEl.className = "flex flex-col items-center pointer-events-none select-none -translate-y-1/2 relative group";
      delhiEl.innerHTML = `
        <!-- Hand-drawn chalk doodle badge above pin -->
        <div class="flex items-center gap-1 mb-1">
          <span class="text-[9px] font-mono font-black text-[#1C1C1C] bg-[#CFFF04] border-[1.5px] border-[#1C1C1C] px-2 py-0.5 rounded-md shadow-[1.5px_1.5px_0px_#1C1C1C] -rotate-2 uppercase tracking-wide">
            ⚡ POSSIBLE NEXT PITSTOP
          </span>
        </div>

        <!-- Glowing interactive beacon with star -->
        <div class="relative flex items-center justify-center">
          <span class="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-[#CFFF04] opacity-75"></span>
          <span class="relative inline-flex rounded-full h-7 w-7 bg-[#CFFF04] border-2 border-[#1C1C1C] items-center justify-center text-xs font-black shadow-[2px_2px_0px_#1C1C1C]">
            ★
          </span>
        </div>

        <!-- Reworked Title Badge -->
        <div class="mt-1 px-3 py-1 bg-white text-[#1C1C1C] border-[2.5px] border-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C] rounded-xl font-black text-xs whitespace-nowrap tracking-wide uppercase flex items-center gap-1.5 -rotate-1">
          <span class="w-2.5 h-2.5 rounded-full bg-[#CFFF04] border border-[#1C1C1C] animate-pulse"></span>
          <span>POSSIBLE NEXT PITSTOP: DELHI</span>
        </div>
      `;
      const m2 = new maplibregl.Marker({ element: delhiEl, anchor: "center" })
        .setLngLat([77.2090, 28.6139])
        .addTo(map);

      // C. Bangalore - Possible Next Pitstop Pin & Doodle
      const blrEl = document.createElement("div");
      blrEl.className = "flex flex-col items-center pointer-events-none select-none -translate-y-1/2 relative group";
      blrEl.innerHTML = `
        <!-- Hand-drawn chalk doodle badge above pin -->
        <div class="flex items-center gap-1 mb-1">
          <span class="text-[9px] font-mono font-black text-[#1C1C1C] bg-[#00F0FF] border-[1.5px] border-[#1C1C1C] px-2 py-0.5 rounded-md shadow-[1.5px_1.5px_0px_#1C1C1C] rotate-2 uppercase tracking-wide">
            ⚡ POSSIBLE NEXT PITSTOP
          </span>
        </div>

        <!-- Glowing interactive beacon with lightning bolt -->
        <div class="relative flex items-center justify-center">
          <span class="animate-ping absolute inline-flex h-10 w-10 rounded-full bg-[#00F0FF] opacity-75"></span>
          <span class="relative inline-flex rounded-full h-7 w-7 bg-[#00F0FF] border-2 border-[#1C1C1C] items-center justify-center text-xs font-black shadow-[2px_2px_0px_#1C1C1C]">
            ⚡
          </span>
        </div>

        <!-- Reworked Title Badge -->
        <div class="mt-1 px-3 py-1 bg-white text-[#1C1C1C] border-[2.5px] border-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C] rounded-xl font-black text-xs whitespace-nowrap tracking-wide uppercase flex items-center gap-1.5 rotate-1">
          <span class="w-2.5 h-2.5 rounded-full bg-[#00F0FF] border border-[#1C1C1C] animate-pulse"></span>
          <span>POSSIBLE NEXT PITSTOP: BANGALORE</span>
        </div>
      `;
      const m3 = new maplibregl.Marker({ element: blrEl, anchor: "center" })
        .setLngLat([77.5946, 12.9716])
        .addTo(map);

      phase3MarkersRef.current = [m1, m2, m3];
    } catch (err) {
      console.warn("Phase 3 routes setup error:", err);
    }
  };

  // Helper to frame Phase 3 India routes comfortably on the left-center
  const fitPhase3Camera = (map: maplibregl.Map) => {
    const p3Bounds = new maplibregl.LngLatBounds(
      [71.0, 11.8], // SW: south of Bangalore (12.97), west of Mumbai (72.88)
      [78.8, 29.8]  // NE: north of Delhi (28.61), east of BLR/Delhi
    );
    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;
    map.fitBounds(p3Bounds, {
      padding: {
        left: isDesktop ? 60 : 20,
        right: isDesktop ? 480 : 20,
        top: 60,
        bottom: 60,
      },
      duration: 1200,
      essential: true,
    });
  };

  // Initialize MapLibre GL
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const brightStyle = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: brightStyle,
      center: initialCenter,
      zoom: 14.5,
      minZoom: 4.0,
      maxZoom: 18.5,
      maxBounds: activePhase === "PHASE_3_WAITING" ? undefined : MUMBAI_BOUNDS,
      pitch: 0,
      attributionControl: false,
      dragRotate: false,
      touchPitch: false,
    });

    // Panning is handled via handheld detector in Phase 1
    map.dragPan.disable();
    map.keyboard.disable();

    // Zooming is only enabled in Phase 1
    if (activePhase === "PHASE_1_HUNT") {
      map.scrollZoom.enable();
      map.touchZoomRotate.enable();
      map.touchZoomRotate.disableRotation();
      map.doubleClickZoom.enable();
    } else {
      map.scrollZoom.disable();
      map.touchZoomRotate.disable();
      map.doubleClickZoom.disable();
    }

    mapRef.current = map;

    map.on("load", () => {
      applyCustomMapColors(map);
      if (activePhase === "PHASE_3_WAITING") {
        setupPhase3Routes(map);
        fitPhase3Camera(map);
      }
    });

    map.on("styledata", () => {
      applyCustomMapColors(map);
      if (activePhase === "PHASE_3_WAITING") {
        setupPhase3Routes(map);
        fitPhase3Camera(map);
      }
    });

    const reportCenter = () => {
      if (!map) return;
      const center = map.getCenter();
      onCenterChangeRef.current([center.lng, center.lat], currentLevelIndexRef.current);
    };

    map.on("move", () => {
      const now = performance.now();
      if (now - throttleTimerRef.current > 80) {
        throttleTimerRef.current = now;
        reportCenter();
      }
    });

    return () => {
      if (map) {
        removePhase3Routes(map);
        map.remove();
      }
      mapRef.current = null;
    };
  }, []); // Only mount once!

  // Phase-Based Camera Transitions & Control Toggle (Disables zoom & pan controls in Ph2 & Ph3)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (currentPhaseRef.current !== activePhase) {
      currentPhaseRef.current = activePhase;

      if (activePhase === "PHASE_2_LIVE") {
        removePhase3Routes(map);

        // Disable all manual user zoom controls in Phase 2
        map.scrollZoom.disable();
        map.touchZoomRotate.disable();
        map.doubleClickZoom.disable();
        map.dragPan.disable();

        map.setMaxBounds(MUMBAI_BOUNDS);
        map.flyTo({
          center: meetupCoordinates,
          zoom: 14.8,
          speed: 1.0,
          essential: true,
        });
      } else if (activePhase === "PHASE_3_WAITING") {
        // Disable all manual user zoom controls in Phase 3
        map.scrollZoom.disable();
        map.touchZoomRotate.disable();
        map.doubleClickZoom.disable();
        map.dragPan.disable();

        map.setMaxBounds(null as any);
        setupPhase3Routes(map);
        fitPhase3Camera(map);
      } else if (activePhase === "PHASE_1_HUNT") {
        removePhase3Routes(map);

        // Enable manual zoom controls only in Phase 1
        map.scrollZoom.enable();
        map.touchZoomRotate.enable();
        map.touchZoomRotate.disableRotation();
        map.doubleClickZoom.enable();
        map.dragPan.disable();

        map.setMaxBounds(MUMBAI_BOUNDS);
        map.easeTo({
          center: initialCenter,
          duration: 600,
        });
      }
    }
  }, [activePhase, meetupCoordinates, initialCenter]);

  // Continuous Velocity Panning Loop (Phase 1, driven by Handheld Detector drag)
  useEffect(() => {
    if (activePhase !== "PHASE_1_HUNT") return;

    const panLoop = (time: number) => {
      const dt = Math.min(0.05, (time - lastTimeRef.current) / 1000);
      lastTimeRef.current = time;

      if (mapRef.current && (velocity.vx !== 0 || velocity.vy !== 0)) {
        mapRef.current.panBy([velocity.vx * dt, velocity.vy * dt], {
          duration: 0,
          animate: false,
        });
      }

      animFrameRef.current = requestAnimationFrame(panLoop);
    };

    lastTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(panLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [velocity, activePhase]);

  // Dynamic Verification Pin on target coordinates when locked in
  useEffect(() => {
    if (!mapRef.current) return;

    if (isLockedIn && lockedCoordinates) {
      if (!markerRef.current) {
        const el = document.createElement("div");
        el.className = "flex items-center justify-center pointer-events-none";
        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-20 w-20 rounded-full bg-[#FF0040] opacity-75"></span>
            <span class="relative inline-flex rounded-full h-12 w-12 bg-[#FFE600] border-[3px] border-[#1C1C1C] items-center justify-center text-base font-black shadow-[3px_3px_0px_#1C1C1C]">
              ★
            </span>
          </div>
        `;

        markerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat(lockedCoordinates)
          .addTo(mapRef.current);
      } else {
        markerRef.current.setLngLat(lockedCoordinates);
      }
    } else {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    }
  }, [isLockedIn, lockedCoordinates]);

  // Permanent Pink Map Markers for previously completed levels in Phase 1
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing past level markers
    pastLevelMarkersRef.current.forEach((m) => m.remove());
    pastLevelMarkersRef.current = [];

    if (activePhase !== "PHASE_1_HUNT") return;

    const markers: maplibregl.Marker[] = [];
    completedLevels.forEach((levelNum) => {
      const nodeIndex = levelNum - 1;
      const node = TOUR_NODES[nodeIndex];
      if (!node) return;

      const el = document.createElement("div");
      el.className = "cursor-pointer group flex flex-col items-center select-none pointer-events-auto";
      el.innerHTML = `
        <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none mb-1 px-2.5 py-1 bg-[#1C1C1C] text-white text-[10px] font-sans font-black uppercase rounded-lg border border-[#FF2E9A] shadow-md whitespace-nowrap -translate-y-1">
          Band was previously seen near ${node.locationName}
        </div>
        <div class="relative flex items-center justify-center">
          <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-[#FF2E9A] opacity-40"></span>
          <div class="relative w-9 h-9 rounded-2xl bg-[#FF2E9A] border-2 border-[#1C1C1C] shadow-[2.5px_2.5px_0px_#1C1C1C] flex items-center justify-center text-white font-black text-xs hover:scale-110 active:scale-95 transition-transform">
            <span>#${levelNum}</span>
          </div>
        </div>
      `;

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectPastNode?.(nodeIndex);
      });

      const m = new maplibregl.Marker({ element: el })
        .setLngLat(node.coordinates)
        .addTo(map);

      markers.push(m);
    });

    pastLevelMarkersRef.current = markers;
  }, [completedLevels, activePhase, onSelectPastNode]);

  // Phase 2 Ground Zero Marker at Asiatic Society Library Steps
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (activePhase === "PHASE_2_LIVE") {
      if (!phase2MarkerRef.current) {
        const el = document.createElement("div");
        el.className = "flex flex-col items-center pointer-events-none select-none";
        el.innerHTML = `
          <div class="flex items-center gap-1 mb-1">
            <span class="text-[9px] font-mono font-black text-white bg-[#FF0040] border-[1.5px] border-[#1C1C1C] px-2.5 py-0.5 rounded-md shadow-[2px_2px_0px_#1C1C1C] uppercase tracking-wide animate-pulse">
              🚨 OFFLINE DROP GROUND ZERO
            </span>
          </div>
          <div class="relative flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-16 w-16 rounded-full bg-[#FF0040] opacity-60"></span>
            <span class="relative inline-flex rounded-2xl h-10 w-10 bg-[#FF0040] border-2 border-[#1C1C1C] items-center justify-center text-lg text-white font-black shadow-[3px_3px_0px_#1C1C1C]">
              🏛️
            </span>
          </div>
          <div class="mt-1 px-3 py-1 bg-white text-[#1C1C1C] border-2 border-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C] rounded-xl font-black text-xs whitespace-nowrap uppercase">
            ASIATIC SOCIETY LIBRARY STEPS (FORT)
          </div>
        `;

        phase2MarkerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat(meetupCoordinates)
          .addTo(map);
      } else {
        phase2MarkerRef.current.setLngLat(meetupCoordinates);
      }
    } else {
      if (phase2MarkerRef.current) {
        phase2MarkerRef.current.remove();
        phase2MarkerRef.current = null;
      }
    }
  }, [activePhase, meetupCoordinates]);

  // Reliable Zoom In / Zoom Out Handlers
  const handleZoomIn = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (mapRef.current) {
      mapRef.current.zoomTo(mapRef.current.getZoom() + 1, { duration: 250 });
    }
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (mapRef.current) {
      mapRef.current.zoomTo(mapRef.current.getZoom() - 1, { duration: 250 });
    }
  };

  return (
    <div className="relative w-full h-full bg-[#08123B]">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Blueprint Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none blueprint-grid opacity-30" />

      {/* Zoom In / Zoom Out Controls: ONLY Rendered in Phase 1 (Removed from Ph2 & Ph3) */}
      {activePhase === "PHASE_1_HUNT" && (
        <div className="fixed right-4 bottom-24 sm:bottom-20 z-30 flex flex-col gap-2 pointer-events-auto">
          <button
            onClick={handleZoomIn}
            title="Zoom In (+)"
            className="w-11 h-11 rounded-2xl bg-white border-2 border-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C] text-[#1C1C1C] font-black flex items-center justify-center hover:bg-[#CFFF04] active:scale-90 transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out (-)"
            className="w-11 h-11 rounded-2xl bg-white border-2 border-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C] text-[#1C1C1C] font-black flex items-center justify-center hover:bg-[#CFFF04] active:scale-90 transition-all cursor-pointer"
          >
            <Minus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      )}
    </div>
  );
};
