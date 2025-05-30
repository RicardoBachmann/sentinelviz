import { useState, useEffect } from "react";
import "./App.css";

import fetchDLRStacData from "./sentinel5DLRdata";
import SyncMapTracking from "./Components/SyncMapTracking";
import Sentinel5Tracking from "./Components/Sentinel5Tracking";

function App() {
  const [error, setError] = useState(null);
  // null Initial state and indicates that the data is not yet loaded
  const [sentinelData, setSentinelData] = useState({
    carbonMonoxideLayer: null,
    formaldehyde: null,
    methan: null,
    nitrogenDioxide: null,
    ozone: null,
    sulfurDioxide: null,
    aerosolIndex: null,
  });

  // State to store the map instance that are initialized in SyncMapTracking
  // and needed by layer components to add visualizations (instances available all over the app hierarchy).
  const [mapInstance, setMapInstance] = useState(null);

  // Callback func passed to SyncMapTracking
  // Recevies map instance once they're initialized and ready for use
  const handleMapsReady = (refs) => {
    setMapInstance(refs);
  };

  // States and lower callback func for position tracking S5-Satellite
  const [isPositionLoaded, setIsPositionLoaded] = useState(false);
  const [sentinel5Position, setSentinel5Position] = useState({
    longitude: 0,
    latitude: 0,
    altitude: 0,
  });

  const handleSetPosition = (position) => {
    setSentinel5Position(position);
    setIsPositionLoaded(true);
  };

  // useEffect fetches satellite data products on component mount
  // and stores them in the sentinelData state for use throughout the app
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
        {error && <div className="error-message">Error:{error}</div>}
        <Sentinel5Tracking
          setSentinel5Position={handleSetPosition}
          sentinelData={sentinelData}
        />
      </section>
    </div>
  );
}

export default App;
