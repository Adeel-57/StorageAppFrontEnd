import React, { useState } from "react";

const OtpVerification = ({ setShowPopup, handelVerified, userEmail }) => {
  const BASE_URL = "https://storageapp-production-e5a5.up.railway.app";

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const handelSuccess = () => {
    setIsSuccess(!isSuccess);
  };
  const handleChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (index < 3) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length < 4) return setOtpError("Please enter your OTP");
    const formdata = new FormData();
    formdata.append("email", userEmail);
    formdata.append("otp", enteredOtp);
    try {
      const response = await fetch(`${BASE_URL}/user/otp-verify`, {
        method: "POST",
        body: formdata,
      });

      const data = await response.json();

      if (data.error) {
        // Show error below the otp field (e.g., "invalid or expired otp")
        setOtpError(data.error);
      } else {
        // OPT varification success
        handelVerified();
        handelSuccess();
        setTimeout(() => {
          setShowPopup(false);
        }, 2000);
      }
    } catch (error) {
      // In case fetch fails
      setOtpError("Something went wrong. Please try again.");
    }
  };

  const containerStyle = {
    position: "absolute",
    height: "100%",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: "10",
    backgroundColor: "rgba(243, 244, 246, 0.9)",
  };

  const cardStyle = {
    width: "100%",
    maxWidth: "400px",
    padding: "24px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    borderRadius: "16px",
    backgroundColor: "white",
    position: "relative",
  };

  const headingStyle = {
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "center",
  };

  const paragraphStyle = {
    fontSize: "14px",
    textAlign: "center",
    color: "#6b7280",
  };

  const inputContainerStyle = {
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
    marginTop: "16px",
    marginBottom: "16px",
  };

  const inputStyle = {
    textAlign: "center",
    fontSize: "20px",
    fontWeight: "500",
    height: "48px",
    width: "48px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
  };

  const buttonStyle = {
    width: "100%",
    padding: "10px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
  };

  const successMessageStyle = {
    color: "#10b981",
    textAlign: "center",
    fontWeight: "500",
    marginTop: "12px",
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <button
          style={{ position: "absolute", right: "20px" }}
          onClick={() => {
            setShowPopup(false);
            setOtpError("");
          }}
        >
          x
        </button>
        <h2 style={headingStyle}>OTP Verification</h2>
        <p style={paragraphStyle}>Enter the 4-digit code sent to your email</p>

        <div style={inputContainerStyle}>
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-input-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              style={inputStyle}
            />
          ))}
        </div>

        {otpError && <p style={{ color: "red" }}>{otpError}</p>}

        <button style={buttonStyle} onClick={handleVerify}>
          Verify OTP
        </button>

        {isSuccess && (
          <p style={successMessageStyle}>OTP Verified Successfully!</p>
        )}
      </div>
    </div>
  );
};

export default OtpVerification;
