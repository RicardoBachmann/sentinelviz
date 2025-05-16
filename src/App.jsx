import { useState, useEffect } from "react";
import "./App.css";

import fetchDLRStacData from "./sentinel5DLRdata";
import SyncMapTracking from "./Components/SyncMapTracking";
import Sentinel5Tracking from "./Components/Sentinel5Tracking";

function App() {
  const [error, setError] = useState(null);
  const [sentinelData, setSentinelData] = useState({
    carbonMonoxideLayer: null,
    formaldehyde: null,
    methan: null,
    nitrogenDioxide: null,
    ozone: null,
    sulfurDioxide: null,
    aerosolIndex: null,
  });
  const [isPositionLoaded, setIsPositionLoaded] = useState(false);
  const [mapRefs, setMapRefs] = useState(null);

  const handleMapsReady = (refs) => {
    setMapRefs(refs);
  };

  const [sentinel5Position, setSentinel5Position] = useState({
    longitude: 0,
    latitude: 0,
    altitude: 0,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const formaldehydeData = await fetchDLRStacData("Formaldehyde");
        const sulfurDioxideData = await fetchDLRStacData("SulfurDioxide");
        const aerosolIndexData = await fetchDLRStacData("AerosolIndex");
        const ozoneData = await fetchDLRStacData("Ozone");
        setSentinelData({
          formaldehyde: formaldehydeData,
          sulfurDioxide: sulfurDioxideData,
          aerosolIndex: aerosolIndexData,
          ozone: ozoneData,
        });
        console.log(
          "Data:",
          formaldehydeData,
          sulfurDioxideData,
          aerosolIndexData,
          ozoneData
        );
      } catch (error) {
        console.error("Error to get Sentinel5 product-data:", error);
        setError(error.message);
      }
    }
    fetchData();
  }, []);

  const handleSetPosition = (position) => {
    setSentinel5Position(position);
    setIsPositionLoaded(true);
  };

  return (
    <div>
      <section>
        {isPositionLoaded ? (
          <SyncMapTracking
            onLayerReady={handleMapsReady}
            sentinel5Position={sentinel5Position}
            sentinelData={sentinelData}
          />
        ) : (
          <div className="loading">Loading satellite position...</div>
        )}
        <Sentinel5Tracking
          setSentinel5Position={handleSetPosition}
          sentinelData={sentinelData}
        />
      </section>
    </div>
  );
}

export default App;
