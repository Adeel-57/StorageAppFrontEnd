const BASE_URL = "https://storageapp-production-e5a5.up.railway.app";

const googleLogin = async (idToken) => {
  const response = await fetch(`${BASE_URL}/auth/google`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idToken }),
  });
  return response.json();
};

export default googleLogin;
