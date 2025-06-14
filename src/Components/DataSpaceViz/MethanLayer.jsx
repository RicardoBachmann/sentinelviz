import { useEffect } from "react";

export default function MethanLayer({ data, mapRefs }) {
  console.log("mapRefs structure:", mapRefs);

  useEffect(() => {
    if (mapRefs && mapRefs.mapA && mapRefs.mapC) {
      console.log("Adding CH4-WMS layer to map A & C");

      const wmsUrl =
        "/api/dlr/eoc/atmosphere/wms?SERVICE=WMS&REQUEST=GetMap&LAYERS=S5P_TROPOMI_L3_P1D_CH4&FORMAT=image/png&TRANSPARENT=TRUE&WIDTH=256&HEIGHT=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&VERSION=1.3.0";

      //Map A
      if (mapRefs.mapA.isStyleLoaded()) {
        if (!mapRefs.mapA.getSource("ch4-source-a"))
          mapRefs.mapA.addSource("ch4-source-a", {
            type: "raster",
            tiles: [wmsUrl],
            tileSize: 256,
          });
        mapRefs.mapA.addLayer({
          id: "ch4-layer-a",
          type: "raster",
          source: "ch4-source-a",
          paint: {
            "raster-opacity": 0.7,
          },
        });
      }
      //Map C
      if (mapRefs.mapC.isStyleLoaded()) {
        if (!mapRefs.mapC.getSource("ch4-source-c"))
          mapRefs.mapC.addSource("ch4-source-c", {
            type: "raster",
            tiles: [wmsUrl],
            tileSize: 256,
          });
        mapRefs.mapC.addLayer({
          id: "ch4-layer-c",
          type: "raster",
          source: "ch4-source-c",
          paint: {
            "raster-opacity": 0.7,
          },
        });
      }
    }
    // Clean up
    return () => {
      if (mapRefs.mapA) {
        if (mapRefs.mapA.getLayer("ch4-layer-a")) {
          mapRefs.mapA.removeLayer("ch4-layer-a");
        }
        if (mapRefs.mapA.getSource("ch4-source-a")) {
          mapRefs.mapA.removeSource("ch4-source-a");
        }
      }
      if (mapRefs.mapC) {
        if (mapRefs.mapC.getLayer("ch4-layer-c")) {
          mapRefs.mapC.removeLayer("ch4-layer-c");
        }
        if (mapRefs.mapC.getSource("ch4-source-c")) {
          mapRefs.mapC.removeSource("ch4-source-c");
        }
      }
    };
  }, [mapRefs]);

  return null;
}
