import { useRef, useEffect, useState } from "react";
import mapboxGl from "mapbox-gl";
import syncMaps from "@mapbox/mapbox-gl-sync-move";
import "mapbox-gl/dist/mapbox-gl.css";

import FormaldehydeLayer from "../Components/DataSpaceViz/FormaldehydeLayer";
import SulfurDioxide from "../Components/DataSpaceViz/SulfurDioxideLayer";
import OzoneLayer from "../Components/DataSpaceViz/OzoneLayer";
import AerosolIndexLayer from "../Components/DataSpaceViz/AerosolIndexLayer";

// import NitrogenDioxideLayer from "./Components/DataSpaceViz/NitrogenDioxideLayer";
// import CarbonMonoxideLayer from "./Components/DataSpaceViz/CarbonMonoxideLayer";
// import MethanLayer from "./Components/DataSpaceViz/MethanLayer";

import LayerToggle from "./LayerToggle";

export default function SyncMapTracking({
  sentinel5Position,
  onLayerReady,
  sentinelData,
}) {
  const mapRefA = useRef(null);
  const mapRefB = useRef(null);
  const mapRefC = useRef(null);

  const mapContainerRefA = useRef(null);
  const mapContainerRefB = useRef(null);
  const mapContainerRefC = useRef(null);

  // State to track if maps are initialized
  const [mapsInitialized, setMapsInitialized] = useState(false);

  // States to switch between S5-product layers in Map A-C

  const [activeMapLayers, setActiveMapLayers] = useState({
    mapA: null,
    mapC: null,
  });

  const handleToggleMapA = (layerId) => {
    setActiveMapLayers((prev) => ({
      ...prev,
      mapA: prev.mapA === layerId ? null : layerId,
    }));
  };

  const handleToggleMapC = (layerId) => {
    setActiveMapLayers((prev) => ({
      ...prev,
      mapC: prev.mapC === layerId ? null : layerId,
    }));
  };

  // Effect to inform the parent when layers change
  useEffect(() => {
    if (!mapsInitialized) return;

    // Delete all A-layers
    const layerIdsA = [
      "hcho-layer-a",
      "so2-layer-a",
      "o3-layer-a",
      "ai-layer-a",
    ];

    layerIdsA.forEach((id) => {
      if (mapRefA.current.getLayer(id)) {
        mapRefA.current.removeLayer(id);
      }
      const sourceId = id.replace("-layer-", "-source-");
      if (mapRefA.current.getSource(sourceId)) {
        mapRefA.current.removeSource(sourceId);
      }
    });

    // Delete all C-layers
    const layerIdsC = [
      "hcho-layer-c",
      "so2-layer-c",
      "o3-layer-c",
      "ai-layer-c",
    ];

    layerIdsC.forEach((id) => {
      if (mapRefC.current.getLayer(id)) {
        mapRefC.current.removeLayer(id);
      }
      const sourceId = id.replace("-layer-", "-source-");
      if (mapRefC.current.getSource(sourceId)) {
        mapRefC.current.removeSource(sourceId);
      }
    });
  }, [activeMapLayers, mapsInitialized]);

  // !IMPORTANT! For sync map style has to be the same in all 3 Layer projection
  useEffect(() => {
    if (mapsInitialized) return;
    mapboxGl.accessToken =
      "pk.eyJ1IjoiZGV0cm9pdDMxMyIsImEiOiJjbTRqb3ljbTQwZnJxMmlzaTRtMWRzcnhpIn0.akOKBt52fpXDljrtyHo8wg";

    const defaultPosition = [-90.96, -0.47];
    mapRefA.current = new mapboxGl.Map({
      container: mapContainerRefA.current,
      center: defaultPosition,
      style: "mapbox://styles/mapbox/satellite-v9",
      zoom: 4,
      attributionControl: false,
    });

    mapRefB.current = new mapboxGl.Map({
      container: mapContainerRefB.current,
      center: defaultPosition,
      style: "mapbox://styles/mapbox/satellite-v9",
      zoom: 4,
      attributionControl: true,
    });

    mapRefC.current = new mapboxGl.Map({
      container: mapContainerRefC.current,
      center: defaultPosition,
      style: "mapbox://styles/mapbox/satellite-v9",
      zoom: 4,
      attributionControl: false,
    });

    const setupMaps = () => {
      syncMaps(mapRefA.current, mapRefB.current, mapRefC.current);
      mapRefA.current.scrollZoom.disable();
      mapRefA.current.dragPan.disable();

      mapRefC.current.scrollZoom.disable();
      mapRefC.current.dragPan.disable();
      setMapsInitialized(true);

      // Provides the initialised map instances of the parent component.
      // This callback function enables other components (such as FormaldehydeLayer),
      // directly access the map references and add their own layers,
      // without having to create new map instances.
      if (onLayerReady) {
        onLayerReady({
          mapA: mapRefA.current,
          mapB: mapRefB.current,
          mapC: mapRefC.current,
        });
      }
    };

    // Wait for all maps to load
    let mapsLoaded = 0;
    const checkAllMapsLoaded = () => {
      mapsLoaded++;
      if (mapsLoaded === 3) {
        setupMaps();
      }
    };

    mapRefA.current.on("load", checkAllMapsLoaded);
    mapRefB.current.on("load", checkAllMapsLoaded);
    mapRefC.current.on("load", checkAllMapsLoaded);

    return () => {
      if (mapRefA.current) mapRefA.current.remove();
      if (mapRefB.current) mapRefB.current.remove();
      if (mapRefC.current) mapRefC.current.remove();
    };
  }, []);

  // Dynamic Sentinel-5 data
  useEffect(() => {
    if (!mapsInitialized || !mapRefB.current || !sentinel5Position) return;

    // Skip if invalid coordinates
    if (!sentinel5Position.longitude || !sentinel5Position.latitude) {
      console.warn("Invalid position data:", sentinel5Position);
      return;
    }

    try {
      // Clear any existing markers
      const existingMarkers = document.querySelectorAll(".mapboxgl-marker");
      existingMarkers.forEach((marker) => marker.remove());

      // Add new marker
      const marker = new mapboxGl.Marker({
        color: "#FF0000",
      })
        .setLngLat([sentinel5Position.longitude, sentinel5Position.latitude])
        .addTo(mapRefB.current);

      // Center the map on the marker
      /*mapRefB.current.flyTo({
        center: [sentinel5Position.longitude, sentinel5Position.latitude],
        zoom: 5,
        essential: true,
        duration: 1500, // Smooth transition
      });*/
    } catch (error) {
      console.error("Error updating map:", error);
    }
  }, [sentinel5Position, mapsInitialized]);

  return (
    <>
      <div
        className="map-container-wrapper"
        id="container"
        style={{
          display: "flex",
          gap: "20px",
          width: "100%",
          height: "100vh",
        }}
      >
        <div style={{ flex: 1, position: "relative", height: "100%" }}>
          <div
            ref={mapContainerRefA}
            style={{ width: "100%", height: "100%" }}
          />

          <LayerToggle
            isActive={activeMapLayers.mapA}
            setIsActive={(layerId) => handleToggleMapA(layerId)}
            mapId="A"
          />
        </div>

        <div style={{ flex: 1, height: "100%" }}>
          <div
            ref={mapContainerRefB}
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        <div style={{ flex: 1, position: "relative", height: "100%" }}>
          <div
            ref={mapContainerRefC}
            style={{ width: "100%", height: "100%" }}
          />
          <LayerToggle
            isActive={activeMapLayers.mapC}
            setIsActive={(layerId) => handleToggleMapC(layerId)}
            mapId="C"
          />
        </div>
      </div>

      {/* Layer-Rendering*/}

      {/*Render Layer only if mapRefs are available*/}
      {mapsInitialized && sentinelData && (
        <>
          {/*Map A Layer*/}
          {activeMapLayers.mapA === "hcho" && (
            <FormaldehydeLayer
              data={sentinelData.formaldehyde}
              mapRefs={{
                mapA: mapRefA.current,
                mapB: mapRefB.current,
                mapC: mapRefC.current,
              }}
              targetMap="A"
            />
          )}
          {activeMapLayers.mapA === "so2" && (
            <SulfurDioxide
              data={sentinelData.sulfurDioxide}
              mapRefs={{
                mapA: mapRefA.current,
                mapB: mapRefB.current,
                mapC: mapRefC.current,
              }}
              targetMap="A"
            />
          )}
          {activeMapLayers.mapA === "o3" && (
            <OzoneLayer
              data={sentinelData.ozone}
              mapRefs={{
                mapA: mapRefA.current,
                mapB: mapRefB.current,
                mapC: mapRefC.current,
              }}
              targetMap="A"
            />
          )}
          {activeMapLayers.mapA === "ai" && (
            <AerosolIndexLayer
              data={sentinelData.aerosolIndex}
              mapRefs={{
                mapA: mapRefA.current,
                mapB: mapRefB.current,
                mapC: mapRefC.current,
              }}
              targetMap="A"
            />
          )}
          {/*Map C Layer*/}
          {activeMapLayers.mapC === "hcho" && (
            <FormaldehydeLayer
              data={sentinelData.formaldehyde}
              mapRefs={{
                mapA: mapRefA.current,
                mapB: mapRefB.current,
                mapC: mapRefC.current,
              }}
              targetMap="C"
            />
          )}
          {activeMapLayers.mapC === "so2" && (
            <SulfurDioxide
              data={sentinelData.sulfurDioxide}
              mapRefs={{
                mapA: mapRefA.current,
                mapB: mapRefB.current,
                mapC: mapRefC.current,
              }}
              targetMap="C"
            />
          )}
          {activeMapLayers.mapC === "o3" && (
            <OzoneLayer
              data={sentinelData.ozone}
              mapRefs={{
                mapA: mapRefA.current,
                mapB: mapRefB.current,
                mapC: mapRefC.current,
              }}
              targetMap="C"
            />
          )}
          {activeMapLayers.mapC === "ai" && (
            <AerosolIndexLayer
              data={sentinelData.aerosolIndex}
              mapRefs={{
                mapA: mapRefA.current,
                mapB: mapRefB.current,
                mapC: mapRefC.current,
              }}
              targetMap="C"
            />
          )}
        </>
      )}
    </>
  );
}
