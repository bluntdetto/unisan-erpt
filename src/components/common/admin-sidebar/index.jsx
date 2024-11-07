"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from 'next-auth/react';

import classes from "./component.module.css";
import Image from 'next/image';

const AdminSidebar = ({ user }) => {
    const currentPath = usePathname()

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
                href="/admin/arptc"
                className={`nav-link text-dark fs-5 d-flex align-items-center ${
                  currentPath === "/admin/arptc" ? classes.active : ""
                }`}
              >
                <i className={`bi bi-receipt ${classes.customIcon}`}></i>
                <span className="ms-3 d-none d-sm-inline fs-6">ARPTC</span>
              </Link>
            </li>
            <li className="nav-item my-1">
              <Link
                href="/admin/tax-bill"
                className={`nav-link text-dark fs-5 d-flex align-items-center ${
                  currentPath === "/admin/tax-bill" ? classes.active : ""
                }`}
              >
                <i className={`bi bi-credit-card ${classes.customIcon}`}></i>
                <span className="ms-3 d-none d-sm-inline fs-6">Tax Bill</span>
              </Link>
            </li>
            <li className="nav-item my-1">
              <Link
                href="/admin/users"
                className={`nav-link text-dark fs-5 d-flex align-items-center ${
                  currentPath === "/admin/users" ? classes.active : ""
                }`}
              >
                <i className="bi bi-person-gear custom-icon"></i>
                <span className="ms-3 d-none d-sm-inline fs-6">
                  User Management
                </span>
              </Link>
            </li>
            <li className="nav-item my-1">
              <Link
                href="/admin/employees"
                className={`nav-link text-dark fs-5 d-flex align-items-center ${
                  currentPath === "/admin/employees" ? classes.active : ""
                }`}
              >
                <i className="bi bi-briefcase custom-icon"></i>
                <span className="ms-3 d-none d-sm-inline fs-6">Employees</span>
              </Link>
            </li>
          </ul>
        </div>
        <div className="dropdown open p-3">
          <Link
            href="#"
            className="text-decoration-none text-dark dropdown-toggle d-flex align-items-center"
            role="button"
            id="triggerId"
            data-bs-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            <i className="bi bi-person-circle"></i>
            <span className="ms-2 d-none d-sm-inline">Admin</span>
          </Link>
          <div className="dropdown-menu" aria-labelledby="triggerId">
          
            <button
              className="dropdown-item"
              onClick={async () => await signOut()}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
};

export { AdminSidebar };
