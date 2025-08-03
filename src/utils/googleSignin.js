const BASE_URL =
  "https://9d0d88e9-6bd2-4673-a08f-33671041c47b-00-35z61v490r1d8.sisko.replit.dev";

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
