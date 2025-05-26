import { useRef, useEffect, useState, use } from "react";
import mapboxGl from "mapbox-gl";
import syncMaps from "@mapbox/mapbox-gl-sync-move";
import "mapbox-gl/dist/mapbox-gl.css";

import FormaldehydeLayer from "../Components/DataSpaceViz/FormaldehydeLayer";
import SulfurDioxide from "../Components/DataSpaceViz/SulfurDioxideLayer";
import OzoneLayer from "../Components/DataSpaceViz/OzoneLayer";
import AerosolIndexLayer from "../Components/DataSpaceViz/AerosolIndexLayer";

// import NitrogenDioxideLayer from "../Components/DataSpaceViz/NitrogenDioxideLayer";
// import CarbonMonoxideLayer from "../Components/DataSpaceViz/CarbonMonoxideLayer";
// import MethanLayer from "../Components/DataSpaceViz/MethanLayer";

import LayerToggle from "./LayerToggle";
import ControlPanel from "./ControlPanel";

export default function SyncMapTracking({
  sentinel5Position, // Live coordinates
  onLayerReady, // Callback for map instances to share with app.jsx
  sentinelData, // S5-data for visual layers
}) {
  // Refs(DOM anchor) for Mabpox-maps
  const mapContainerRefA = useRef(null);
  const mapContainerRefB = useRef(null);
  const mapContainerRefC = useRef(null);
  // Refs to initialised Mapbox map instances
  const mapRefA = useRef(null);
  const mapRefB = useRef(null);
  const mapRefC = useRef(null);

  // State to track if maps are initialized attempting to interact with these (def. coding)
  const [mapsInitialized, setMapsInitialized] = useState(false);

  // States to switch between S5-product layers in Map A-C
  // Stores which data layer is active on which map
  const [activeMapLayers, setActiveMapLayers] = useState({
    mapA: null,
    mapC: null,
  });

  // States for click-based reverse geocoding feature
  const [clickedCoordinates, setClickedCoordinates] = useState(null);
  const [clickedLocation, setClickedLocation] = useState("");
  const [geocodingData, setGeocodingData] = useState(null);

  const activeLayerA = activeMapLayers.mapA;
  const activeLayerC = activeMapLayers.mapC;
  console.log(
    "Current active product Layer-A:",
    activeLayerA,
    "Current active product Layer-C:",
    activeLayerC
  );

  // Function enable switching between data layers by
  // checking whether a layer is already active and activating or deactivating it accordingly
  const handleToggleMapA = (layerId) => {
    console.log("Toggle Map-A called with layer-Id:", layerId);
    setActiveMapLayers((prev) => {
      const newState = {
        ...prev,
        mapA: prev.mapA === layerId ? null : layerId,
      };

      console.log("New state after toggle:", newState);
      return newState;
    });
  };

  const handleToggleMapC = (layerId) => {
    console.log("Toggle Map-C called with layer-Id:", layerId);
    setActiveMapLayers((prev) => {
      const newState = {
        ...prev,
        mapC: prev.mapC === layerId ? null : layerId,
      };

      console.log("New state after toggle:", newState);
      return newState;
    });
  };

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

  // Sentinel-5 Satellite postion data
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

  // Rendering map layer-data once and save it
  useEffect(() => {
    // Sobald einer der folgenden Bedingungen zurifft, wird die funktion sofort beendet
    if (!mapsInitialized || !mapRefA.current || !mapRefB.current) return;
    // Create all layers with visible prop on
    // Map A

    // Funktion parameters sind in map und mapId
    createAllLayersForMap(mapRefA.current, "a");
    createAllLayersForMap(mapRefC.current, "c");

    // Function for creating all layers for map
    function createAllLayersForMap(map, mapId) {
      createLayer("HCHO", map, mapId);
      createLayer("SO2", map, mapId);
      createLayer("O3", map, mapId);
      createLayer("AI", map, mapId);
    }

    // Assist function for creating a single layer
    function createLayer(layerType, map, mapId) {
      let layerId = `${layerType}-layer-${mapId}`;
      let sourceId = `${layerType}-source-${mapId}`;

      if (!map.getSource(sourceId)) {
        try {
          console.log(`Source ${sourceId} added successfully`);
          map.addSource(sourceId, {
            type: "raster",
            tiles: [
              `https://geoservice.dlr.de/eoc/atmosphere/wms?SERVICE=WMS&REQUEST=GetMap&LAYERS=S5P_TROPOMI_L3_P1D_${layerType}_v2&FORMAT=image/png&TRANSPARENT=TRUE&WIDTH=256&HEIGHT=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&VERSION=1.3.0`,
            ],
            tileSize: 256,
          });
        } catch (error) {
          console.error(`Error adding source ${sourceId}:`, error);
        }
      }

      // Create layer if not exist
      if (!map.getLayer(layerId)) {
        map.addLayer({
          id: layerId,
          type: "raster",
          source: sourceId,
          layout: {
            visibility: "none",
          },
          paint: {
            "raster-opacity": 0.7,
          },
        });
        console.log(`Layer ${layerId} added successfully`);
      }
    }
  }, [mapsInitialized]); // runs once when map mounted

  // Visibility control for Map-A
  useEffect(() => {
    if (!mapsInitialized || !mapRefA.current) {
      return;
    }

    const allLayerIds = [
      "HCHO-layer-a",
      "SO2-layer-a",
      "O3-layer-a",
      "AI-layer-a",
    ];

    // Set all layers default of invisible
    allLayerIds.forEach((layerId) => {
      if (mapRefA.current.getLayer(layerId)) {
        mapRefA.current.setLayoutProperty(layerId, "visibility", "none");
      }
    });
    if (activeLayerA) {
      const activeLayerId = `${activeLayerA}-layer-a`;
      if (mapRefA.current.getLayer(activeLayerId)) {
        mapRefA.current.setLayoutProperty(
          activeLayerId,
          "visibility",
          "visible"
        );
      } else {
        console.error("Active layer", activeLayerId, "not found on map");
      }
    }
  }, [activeLayerA, mapsInitialized]);

  // Visibility control for Map-C
  useEffect(() => {
    if (!mapsInitialized || !mapRefC.current) {
      return;
    }

    const allLayerIds = [
      "HCHO-layer-c",
      "SO2-layer-c",
      "O3-layer-c",
      "AI-layer-c",
    ];

    // Set all layers default of invisible
    allLayerIds.forEach((layerId) => {
      if (mapRefC.current.getLayer(layerId)) {
        mapRefC.current.setLayoutProperty(layerId, "visibility", "none");
      }
    });
    if (activeLayerC) {
      const activeLayerId = `${activeLayerC}-layer-c`;
      if (mapRefC.current.getLayer(activeLayerId)) {
        mapRefC.current.setLayoutProperty(
          activeLayerId,
          "visibility",
          "visible"
        );
      } else {
        console.error("Active layer", activeLayerId, "not found on map");
      }
    }
  }, [activeLayerC, mapsInitialized]);

  // Cursor-Location information (Reverse geocoding)

  useEffect(() => {
    if (!mapRefB.current) return;
    const getCoordinates = (e) => {
      const coords = e.lngLat;
      setClickedCoordinates(coords);
    };
    mapRefB.current.on("click", getCoordinates);

    // Event Cleanup
    return () => {
      if (mapRefB.current) {
        mapRefB.current.off("click", getCoordinates);
      }
    };
  }, []);

  /*
  useEffect(() => {
    if (clickedCoordinates) {
      console.log("Clicked coordinations:", clickedCoordinates);
    }
  }, [clickedCoordinates]);*/

  // try/catch for error handling
  useEffect(() => {
    if (!clickedCoordinates) return;
    {
      async function getCoordinatesData() {
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${clickedCoordinates.lng},${clickedCoordinates.lat}.json?access_token=pk.eyJ1IjoiZGV0cm9pdDMxMyIsImEiOiJjbTRqb3ljbTQwZnJxMmlzaTRtMWRzcnhpIn0.akOKBt52fpXDljrtyHo8wg`
          );
          const data = await response.json();
          setGeocodingData(data);
          console.log("geocading:", data);
          if (data.features.length > 0) {
            console.log("clicked location is:", data.features[0].place_name);
            const selectedFeature = data.features.find(
              (item) => item.place_name
            );
            setClickedLocation(selectedFeature.place_name);
          } else {
            setClickedLocation("Ozean");
          }
        } catch (error) {
          console.error("Error fetching reverse geocoding data:", error);
          setClickedLocation("Error loading location");
        }
      }
      getCoordinatesData();
    }
  }, [clickedCoordinates]);

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
            // Current active layer (null or layerId e.g("hcho"))
            isActive={activeMapLayers.mapA}
            // Callback function, that runs when user select a layer
            setIsActive={(layerId) => handleToggleMapA(layerId)}
            // ID, that specifies which map this LayerToggle applies to (A or C)
            mapId="A"
            targetMap="A"
          />
        </div>

        <div style={{ flex: 1, position: "relative", height: "100%" }}>
          <div
            ref={mapContainerRefB}
            style={{ width: "100%", height: "100%" }}
          />
          <ControlPanel
            sentinel5Position={sentinel5Position}
            clickedLocation={clickedLocation}
          />
          {clickedLocation && (
            <div
              style={{
                position: "absolute",
                top: "10px",
                left: "10px",
                backgroundColor: "black",
                padding: "5px",
                zIndex: 1000,
              }}
            >
              {clickedLocation}
            </div>
          )}
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
            targetMap="C"
          />
        </div>
      </div>
    </>
  );
}
