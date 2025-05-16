// At the moment don't need the authService for Copernicus fetching data (Not needed for DLR services)
/*
async function getAccessToken() {
  // src/services/authServiice
  const clientId = import.meta.env.VITE_COPERNICUS_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_COPERNICUS_CLIENT_SECRET;

  // Send data as FormData
  const formData = new URLSearchParams();
  formData.append("grant_type", "client_credentials");
  formData.append("client_id", clientId);
  formData.append("client_secret", clientSecret);

  const response = await fetch(
    "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    }
  );
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const data = await response.json();
  return data.access_token;
}

export { getAccessToken };
*/
