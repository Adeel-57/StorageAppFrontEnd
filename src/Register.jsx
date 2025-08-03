import React, { useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";
import ProfileImg from "./ProfileImg";
import OtpVerification from "./OTP";
import { GoogleLogin } from "@react-oauth/google";
import googleLogin from "./utils/googleSignin";

const Register = () => {
  const navigate = useNavigate();
  const BASE_URL = "http://localhost:4000";

  // Error will hold the error message from the server or request failure
  const [isVerified, setIsVerified] = useState(false);
  const [isShowPopup, setShowPopup] = useState(false);

  // Error will hold the error message from the server or request failure
  const [Error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "Adeel",
    email: "adeel@gmail.com",
    password: "abcd",
  });

  // Handler for input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name == "email") {
      setIsVerified(false);
    }
    // Clear the server error as soon as the user starts typing
    setError("");

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  // Profile image handler
  const [profileImg, setProfileImg] = useState(null);
  const inptRef = useRef();
  async function handleProfileImg() {
    setProfileImg(inptRef.current.files[0]);
  }

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isVerified) {
      setIsSuccess(false); // reset success if any
      const formdata = new FormData();
      formdata.append("name", formData.name);
      formdata.append("email", formData.email);
      formdata.append("password", formData.password);
      formdata.append("profileImg", profileImg);
      try {
        const response = await fetch(`${BASE_URL}/user/register`, {
          method: "POST",
          body: formdata,
        });

        const data = await response.json();

        if (data.error) {
          // Show error below the email field (e.g., "Email already exists")
          setError(data.error);
        } else {
          // Registration success
          setIsSuccess(true);
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        }
      } catch (error) {
        // In case fetch fails
        setError("Something went wrong. Please try again.");
      }
    } else {
      setError("Please varify your email first!");
    }
  };

  function isValidEmail(email) {
    const regex = /^[^\s@]{3,}@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
  const handleOTP = async () => {
    const emailValidation = isValidEmail(formData.email);
    if (!emailValidation) return setError("Please enter a valid email");
    const formdata = new FormData();
    formdata.append("email", formData.email);
    try {
      const response = await fetch(`${BASE_URL}/user/send-otp`, {
        method: "POST",
        body: formdata,
      });

      const data = await response.json();
      if (data.error) {
        setError("Something went wrong. Please try again.");
      } else {
        setShowPopup(true);
      }
    } catch (error) {
      // In case fetch fails
      setError("Something went wrong. Please try again.");
    }
  };

  const handelVerified = () => {
    setIsVerified(!isVerified);
  };

  return (
    <>
      {isShowPopup && (
        <OtpVerification
          setShowPopup={setShowPopup}
          handelVerified={handelVerified}
          userEmail={formData.email}
        />
      )}
      <div className="container">
        <h2 className="heading">Register</h2>
        <ProfileImg profileImg={profileImg} inptRef={inptRef} />
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              className="input"
              type="file"
              accept="image"
              ref={inptRef}
              id="profileImg"
              placeholder="Select your profile image"
              required
              onChange={handleProfileImg}
              style={profileImg ? { display: "none" } : {}}
            />
          </div>
          {/* Name */}
          <div className="form-group">
            <label htmlFor="name" className="label">
              Name
            </label>
            <input
              className="input"
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              // If there's a Error, add an extra class to highlight border
              className={`input`}
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
            {!isVerified && (
              <button
                type="button"
                onClick={() => {
                  handleOTP();
                }}
              >
                Varify
              </button>
            )}
            {/* Absolutely-positioned error message below email field */}
            {/* {Error && <span className="error-msg">{Error}</span>} */}
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              className="input"
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
            {Error && <span className="error-msg">{Error}</span>}
          </div>
          <button
            type="submit"
            className={`submit-button ${isSuccess ? "success" : ""}`}
          >
            {isSuccess ? "Registration Successful" : "Register"}
          </button>
        </form>

        {/* Link to the login page */}
        <p className="link-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
        <div class="or-divider">OR</div>
        <GoogleLogin
          onSuccess={async (response) => {
            const data = await googleLogin(response.credential);
            if (data.error) {
              setServerError(data.error);
            } else {
              navigate("/");
            }
          }}
          text="signin_with"
          onError={(err) => {
            setServerError("Something went wrong. Please try again!")
          }}
        ></GoogleLogin>
      </div>
    </>
  );
};

export default Register;
