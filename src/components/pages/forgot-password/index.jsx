"use client";

import React from "react";
import { forgot } from "@actions/auth"
import { useRouter } from "next/navigation";
import classes from "./page.module.css";
import Image from 'next/image';
import Link from 'next/link';

const ForgotPassword = () => {
    const router = useRouter();

    const handleSendOTP = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);

        const email = formData.get("email");

        await forgot(email);
    };

    return (
      <>
        <div className={classes.forgotPasswordContainer}>
          <div className={classes.forgotPasswordLogo}>
            <Image src="/ERPT logo.png" width={100} height={0} alt="Logo" />
          </div>
          <h2 className="mb-3 fw-bold">Forgot Password</h2>
          <p className="text-center">
            Please enter your email or phone number to <br /> receive a password
            reset link.
          </p>
          <form onSubmit={handleSendOTP}>
            <div className={classes.inputGroup}>
              <label for="email">
                Email:
                
              </label>
              <input
                type="email"
                placeholder="Enter your email address"
                name="email"
                required
              />
            </div>
            <div className={classes.forgotPasswordButtonContainer}>
              <button type="submit" className={classes.forgotPasswordButton}>
                Send Verification
              </button>
            </div>
          </form>
          <div className={classes.backToLoginLink}>
            <p>
              Remembered your password? <Link href="/auth/login">Sign in</Link>
            </p>
          </div>
        </div>
      </>
    );
};

export { ForgotPassword };
