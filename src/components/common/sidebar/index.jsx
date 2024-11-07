"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import classes from "./component.module.css";
import Image from "next/image";
import { signOut } from "next-auth/react";

const Sidebar = ({ user }) => {
  const pathname = usePathname();

  return (
    <div
      className={`col-auto col-sm-4 col-md-3 col-lg-2 min-vh-100 d-flex flex-column justify-content-between p-2 ${classes.bg} ${classes.sidebar}`}
    >
      <div>
        <Link
          href="/"
          className="text-decoration-none text-dark d-flex align-items-center ms-1 mt-2"
        >
          <Image
            src="/ERPT logo 1.png"
            alt="ERPT Unisan Logo"
            width={112}
            height={0}
            className={`d-none d-sm-block ms-3 ${classes.sidebarLogo}`}
          />
          <Image
            src="/ERPT logo sm.png"
            alt="ERPT Unisan Logo"
            width={40}
            height={40}
            className="d-sm-none"
          />
        </Link>
        <hr className="text-secondary d-none d-sm-block" />
        <ul className="nav nav-pills flex-column mt-3">
          <li className="nav-item my-1">
            <Link
              href="/"
              className={`nav-link text-dark fs-5 d-flex align-items-center ${
                pathname === "/" ? classes.active : ""
              }`}
              aria-current="page"
            >
              <i className={`bi bi-columns-gap pl-1 ${classes.customIcon}`}></i>
              <span className="ms-3 d-none d-sm-inline fs-6">Overview</span>
            </Link>
          </li>
          <li className="nav-item my-1">
            <Link
              href="/payments"
              className={`nav-link text-dark fs-5 d-flex align-items-center ${
                pathname === "/payments" ? classes.active : ""
              }`}
              aria-current={pathname === "/payments" ? "page" : undefined}
            >
              <i className={`bi bi-credit-card pl-1 ${classes.customIcon}`}></i>
              <span className="ms-3 d-none d-sm-inline fs-6">Payments</span>
            </Link>
          </li>
          <li className="nav-item my-1">
            <Link
              href="/account"
              className={`nav-link text-dark fs-5 d-flex align-items-center ${
                pathname === "/account" ? classes.active : ""
              }`}
              aria-current={pathname === "/account" ? "page" : undefined}
            >
              <i className={`bi bi-person pl-1 ${classes.customIcon}`}></i>
              <span className="ms-3 d-none d-sm-inline fs-6">Account</span>
            </Link>
          </li>
        </ul>
      </div>
      <div className="dropdown open p-3">
        <a
          className="text-decoration-none text-dark dropdown-toggle d-flex align-items-center"
          href="#"
          role="button"
          id="triggerId"
          data-bs-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
        >
          <i className="bi bi-person-circle "></i>
          <span className="ms-2 d-none d-sm-inline">
            {user.name.split(" ").slice(0, 2).join(" ")}
          </span>
        </a>
        <div className="dropdown-menu" aria-labelledby="triggerId">
        
          <a
            className="dropdown-item"
            href="#"
            onClick={async () => await signOut()}
          >
            Logout
          </a>
        </div>
      </div>
    </div>
  );
};

export { Sidebar };
