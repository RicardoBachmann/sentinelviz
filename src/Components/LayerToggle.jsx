import { useState } from "react";

export default function LayerToggle({ isActive, setIsActive, mapId }) {
  const productLayers = [
    {
      id: "hcho",
      displayName: "Formaldehyde (HCHO)",
    },
    {
      id: "so2",
      displayName: "Sulfur Dioxide (SO2)",
    },
    {
      id: "o3",
      displayName: "Ozone (O3)",
    },
    { id: "ai", displayName: "Aerosol Index (AI)" },
  ];

  const handleToggle = (layerId) => {
    console.log("Button clicked:", layerId);
    console.log("Current active layer:", isActive);
    if (isActive === layerId) {
      setIsActive(null);
      console.log("Deactivating layer");
    } else {
      console.log("Activating layer:", layerId);
      setIsActive(layerId);
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "10px",
        left: "10px",
        zIndex: 1,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        color: "black",
        padding: "10px",
        borderRadius: "5px",
      }}
    >
      {productLayers.map((layer) => (
        <button
          key={layer.id}
          onClick={() => handleToggle(layer.id)}
          style={{ backgroundColor: isActive === layer.id ? "green" : null }}
        >
          {layer.displayName}
        </button>
      ))}
    </div>
  );
}
