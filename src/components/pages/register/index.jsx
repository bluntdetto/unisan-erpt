"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import classes from "./page.module.css";
import { register } from "@actions/auth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from 'next/link';

const Register = () => {
    const router = useRouter();
    const [ errorMessage, setErrorMessage ] = useState("");
    const searchParams = useSearchParams()

    useEffect(() => {
        const error = searchParams.get("error");
        console.log("error", error);

        if (error) {
            setErrorMessage(error);
        }
        router.replace("/auth/register");

    }, [ searchParams, router ]);

    return (
      <div className={classes.signupContainer}>
        <div className={classes.signupLogo}>
          <Image src="/ERPT logo.png" width={100} height={0} alt="Logo" />
        </div>
        <h2 className="fw-bold">Verify your Email</h2>
        {errorMessage && (
          <div className={classes.errorMessage}>{errorMessage}</div>
        )}
        <form className={classes.signupForm} action={register}>
          <div className={classes.inputGroup}>
            <label className="mb-1">Email:</label>
            <input
              name="email"
              type="email"
              placeholder="Enter your email address"
              required
            />
          </div>
          <div className={classes.signupButtonContainer}>
            <button type="submit" className={classes.signupButton}>
              Send Verification
            </button>
          </div>
        </form>
        <div className={classes.loginLink}>
          <p>
            Already have an account? <Link href="/auth/login">Sign in</Link>
          </p>
        </div>
      </div>
    );
};

export { Register };
