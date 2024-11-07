"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import classes from "./page.module.css";
import { login } from "@actions/auth";
import Link from "next/link";
import "bootstrap-icons/font/bootstrap-icons.css";

const Login = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const error = searchParams.get("error");
    const success = searchParams.get("success");

    if (error) {
      setErrorMessage(decodeURIComponent(error));
    } else {
      setErrorMessage("");
    }

    if (success) {
      setSuccessMessage(decodeURIComponent(success));
    } else {
      setSuccessMessage("");
    }
  }, [searchParams]);

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  return (
    <div className={classes.loginContainer}>
      <div className={classes.loginLogo}>
        <Image src="/ERPT logo.png" width={100} height={0} alt="Logo" />
      </div>
      <h2 className="mb-3 fw-bold">Sign in to eRPT-Unisan</h2>
      {successMessage && (
        <div className={classes.successMessage}>{successMessage}</div>
      )}
      {errorMessage && (
        <div className={classes.errorMessage}>{errorMessage}</div>
      )}
      <form action={login}>
        <div className={classes.inputGroup}>
          <label>Email:</label>
          <input type="text" name="email" required />
        </div>
        <div className={classes.inputGroup}>
          <label>Password:</label>
          <div className={`position-relative ${classes.passwordWrapper}`}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
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
        <div className={classes.forgotPassword}>
          <Link href="/auth/forgot-password">Forgot Password?</Link>
        </div>
        <div className={classes.loginButtonContainer}>
          <button type="submit" className={classes.loginButton}>
            Login
          </button>
        </div>
      </form>
      <div className={classes.signupLink}>
        <p>
          Verify your email. <Link href="/auth/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export { Login };
