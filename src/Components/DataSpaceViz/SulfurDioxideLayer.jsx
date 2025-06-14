import { useEffect } from "react";

export default function SulfurDioxide({ data, mapRefs }) {
  console.log("mapRefs structure:", mapRefs);

  useEffect(() => {
    if (mapRefs && mapRefs.mapA && mapRefs.mapC) {
      console.log("Adding SO2-WMS layer to map A & C");

      const wmsUrl =
        "/api/dlr/eoc/atmosphere/wms?SERVICE=WMS&REQUEST=GetMap&LAYERS=S5P_TROPOMI_L3_P1D_SO2&FORMAT=image/png&TRANSPARENT=TRUE&WIDTH=256&HEIGHT=256&CRS=EPSG:3857&BBOX={bbox-epsg-3857}&VERSION=1.3.0";

      //Map A
      if (mapRefs.mapA.isStyleLoaded()) {
        if (!mapRefs.mapA.getSource("so2-source-a"))
          mapRefs.mapA.addSource("so2-source-a", {
            type: "raster",
            tiles: [wmsUrl],
            tileSize: 256,
          });
        mapRefs.mapA.addLayer({
          id: "so2-layer-a",
          type: "raster",
          source: "so2-source-a",
          paint: {
            "raster-opacity": 0.7,
          },
        });
      }

      //Map C
      if (mapRefs.mapC.isStyleLoaded()) {
        if (!mapRefs.mapC.getSource("so2-source-c"))
          mapRefs.mapC.addSource("so2-source-c", {
            type: "raster",
            tiles: [wmsUrl],
            tileSize: 256,
          });
        mapRefs.mapC.addLayer({
          id: "so2-layer-c",
          type: "raster",
          source: "so2-source-c",
          paint: {
            "raster-opacity": 0.7,
          },
        });
      }
    }
    // Clean up
    return () => {
      if (mapRefs.mapA) {
        if (mapRefs.mapA.getLayer("so2-layer-a")) {
          mapRefs.mapA.removeLayer("so2-layer-a");
        }
        if (mapRefs.mapA.getSource("so2-source-a")) {
          mapRefs.mapA.removeSource("so2-source-a");
        }
      }
      if (mapRefs.mapC) {
        if (mapRefs.mapC.getLayer("so2-layer-c")) {
          mapRefs.mapC.removeLayer("so2-layer-c");
        }
        if (mapRefs.mapC.getSource("so2-source-c")) {
          mapRefs.mapC.removeSource("so2-source-c");
        }
      }
    };
  }, [mapRefs]);

  return null;
}
