"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import classes from "./page.module.css";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { parsePageToken } from "@utils/token";
import "bootstrap-icons/font/bootstrap-icons.css";

const SetPassword = ({ action }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      setErrorMessage(error);
    }

    if (!searchParams.get("token")) {
      notFound();
    }

    const token = searchParams.get("token");
    const user = parsePageToken(token);

    if (!user) {
      notFound();
    }
  }, [router, searchParams]);

  const validatePassword = (password) => {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)[A-Za-z\d\W]{8,}$/;
    return strongPasswordRegex.test(password);
  };

  const handleInputChange = () => {
    setErrorMessage("");
    setPasswordError("");
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    if (!validatePassword(password)) {
      setPasswordError(
        "Password must be at least 8 characters long, contain both uppercase and lowercase letters, numbers, and special characters."
      );
      return;
    }

    const user = parsePageToken(searchParams.get("token"));
    await action(user, password);
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  return (
    <div className={classes.loginContainer}>
      <div className={classes.loginLogo}>
        <Image src="/ERPT logo.png" width={100} height={0} alt="Logo" />
      </div>
      <h2 className="fw-bold">Set Your Password</h2>

      {errorMessage && (
        <div className={classes.errorMessage}>{errorMessage}</div>
      )}

      {passwordError && (
        <div className={classes.errorMessage}>{passwordError}</div>
      )}

      <form onSubmit={handleSetPassword}>
        <div className={classes.inputGroup}>
          <label>Password:</label>
          <div className="position-relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              onChange={handleInputChange}
              className="form-control"
            />
            <i
              className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} ${
                classes.eyeIcon
              }`}
              onClick={togglePasswordVisibility}
            ></i>
          </div>
        </div>
        <div className={classes.inputGroup}>
          <label>Confirm Password:</label>
          <div className="position-relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              required
              onChange={handleInputChange}
              className="form-control"
            />
            <i
              className={`bi ${
                showConfirmPassword ? "bi-eye-slash" : "bi-eye"
              } ${classes.eyeIcon}`}
              onClick={toggleConfirmPasswordVisibility}
            ></i>
          </div>
        </div>
        <div className={classes.loginButtonContainer}>
          <button type="submit" className={classes.loginButton}>
            Set Password
          </button>
        </div>
      </form>
    </div>
  );
};

export { SetPassword };
