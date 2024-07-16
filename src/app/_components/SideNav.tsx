"use client";

import Image from "next/image";
import CreateEpisodeButton from "./CreateEpisode";
import EpisodePicker from "./EpisodePicker";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Switch from "../_generic_components/Switch";
import { useState } from "react";

export default function SideNav({
  className,
}: Readonly<{ className?: string }>) {
  const pathName = usePathname();
  const [isDemoMode, setIsDemoMode] = useState(false);

  return (
    <nav className={className}>
      <div className="w-80 overflow-x-hidden p-8">
        <CreateEpisodeButton />
        <EpisodePicker className="mt-4" />
        <div className="mt-8 flex flex-col gap-8 pe-8 ps-8">
          <Link
            href={"/dashboard"}
            className={`link flex cursor-pointer flex-row items-center gap-4 ${pathName.includes("/dashboard") ? "activeLink" : ""}`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.5 18.3333V10H12.5V18.3333M2.5 7.5L10 1.66667L17.5 7.5V16.6667C17.5 17.1087 17.3244 17.5326 17.0118 17.8452C16.6993 18.1577 16.2754 18.3333 15.8333 18.3333H4.16667C3.72464 18.3333 3.30072 18.1577 2.98816 17.8452C2.67559 17.5326 2.5 17.1087 2.5 16.6667V7.5Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-2xl">Dashboard</span>
          </Link>

          <Link
            href={"/analytics"}
            className={`link flex cursor-pointer flex-row items-center gap-4 ${pathName.includes("/analytics") ? "activeLink" : ""}`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.5 2.5V17.5H17.5M15 14.1667V7.5M10.8333 14.1667V4.16667M6.66667 14.1667V11.6667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-2xl">Analytics</span>
          </Link>

          <Link
            className={`link flex cursor-pointer flex-row items-center gap-4 ${pathName.includes("/ads") ? "activeLink" : ""}`}
            href={"/ads"}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.3334 6.66667H8.33341C7.89139 6.66667 7.46746 6.84226 7.1549 7.15482C6.84234 7.46738 6.66675 7.89131 6.66675 8.33333C6.66675 8.77536 6.84234 9.19928 7.1549 9.51185C7.46746 9.82441 7.89139 10 8.33341 10H11.6667C12.1088 10 12.5327 10.1756 12.8453 10.4882C13.1578 10.8007 13.3334 11.2246 13.3334 11.6667C13.3334 12.1087 13.1578 12.5326 12.8453 12.8452C12.5327 13.1577 12.1088 13.3333 11.6667 13.3333H6.66675M10.0001 15V5M18.3334 10C18.3334 14.6024 14.6025 18.3333 10.0001 18.3333C5.39771 18.3333 1.66675 14.6024 1.66675 10C1.66675 5.39763 5.39771 1.66667 10.0001 1.66667C14.6025 1.66667 18.3334 5.39763 18.3334 10Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-2xl">Ads</span>
          </Link>

          <Link
            href={"/channels"}
            className={`link flex cursor-pointer flex-row items-center gap-4 ${pathName.includes("/channels") ? "activeLink" : ""}`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14.1667 1.66667L10.0001 5.83333L5.83341 1.66667M3.33341 5.83333H16.6667C17.5872 5.83333 18.3334 6.57952 18.3334 7.5V16.6667C18.3334 17.5871 17.5872 18.3333 16.6667 18.3333H3.33341C2.41294 18.3333 1.66675 17.5871 1.66675 16.6667V7.5C1.66675 6.57952 2.41294 5.83333 3.33341 5.83333Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-2xl">Channels</span>
          </Link>

          <Link
            href={"/import"}
            className={`link flex cursor-pointer flex-row items-center gap-4 ${pathName.includes("/import") ? "activeLink" : ""}`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.0001 2.5V12.5M10.0001 12.5L6.66675 9.16667M10.0001 12.5L13.3334 9.16667M6.66675 4.16667H3.33341C2.89139 4.16667 2.46746 4.34226 2.1549 4.65482C1.84234 4.96738 1.66675 5.39131 1.66675 5.83333V14.1667C1.66675 14.6087 1.84234 15.0326 2.1549 15.3452C2.46746 15.6577 2.89139 15.8333 3.33341 15.8333H16.6667C17.1088 15.8333 17.5327 15.6577 17.8453 15.3452C18.1578 15.0326 18.3334 14.6087 18.3334 14.1667V5.83333C18.3334 5.39131 18.1578 4.96738 17.8453 4.65482C17.5327 4.34226 17.1088 4.16667 16.6667 4.16667H13.3334"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-2xl">Import</span>
          </Link>

          <Link
            href={"/settings"}
            className={`link flex cursor-pointer flex-row items-center gap-4 ${pathName.includes("/settings") ? "activeLink" : ""}`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.1833 1.66666H9.81667C9.37464 1.66666 8.95072 1.84225 8.63816 2.15481C8.3256 2.46737 8.15 2.8913 8.15 3.33332V3.48332C8.1497 3.77559 8.07255 4.06265 7.92628 4.31569C7.78002 4.56873 7.56978 4.77885 7.31667 4.92499L6.95834 5.13332C6.70497 5.2796 6.41756 5.35661 6.125 5.35661C5.83244 5.35661 5.54503 5.2796 5.29167 5.13332L5.16667 5.06666C4.78422 4.84604 4.32987 4.78619 3.90334 4.90025C3.47681 5.0143 3.11296 5.29294 2.89167 5.67499L2.70833 5.99166C2.48772 6.3741 2.42787 6.82846 2.54192 7.25499C2.65598 7.68152 2.93461 8.04536 3.31667 8.26666L3.44167 8.34999C3.69356 8.49542 3.90302 8.70423 4.04921 8.95568C4.1954 9.20713 4.27325 9.49247 4.275 9.78332V10.2083C4.27617 10.502 4.19971 10.7908 4.05337 11.0454C3.90703 11.3 3.69601 11.5115 3.44167 11.6583L3.31667 11.7333C2.93461 11.9546 2.65598 12.3185 2.54192 12.745C2.42787 13.1715 2.48772 13.6259 2.70833 14.0083L2.89167 14.325C3.11296 14.707 3.47681 14.9857 3.90334 15.0997C4.32987 15.2138 4.78422 15.1539 5.16667 14.9333L5.29167 14.8667C5.54503 14.7204 5.83244 14.6434 6.125 14.6434C6.41756 14.6434 6.70497 14.7204 6.95834 14.8667L7.31667 15.075C7.56978 15.2211 7.78002 15.4313 7.92628 15.6843C8.07255 15.9373 8.1497 16.2244 8.15 16.5167V16.6667C8.15 17.1087 8.3256 17.5326 8.63816 17.8452C8.95072 18.1577 9.37464 18.3333 9.81667 18.3333H10.1833C10.6254 18.3333 11.0493 18.1577 11.3618 17.8452C11.6744 17.5326 11.85 17.1087 11.85 16.6667V16.5167C11.8503 16.2244 11.9275 15.9373 12.0737 15.6843C12.22 15.4313 12.4302 15.2211 12.6833 15.075L13.0417 14.8667C13.295 14.7204 13.5824 14.6434 13.875 14.6434C14.1676 14.6434 14.455 14.7204 14.7083 14.8667L14.8333 14.9333C15.2158 15.1539 15.6701 15.2138 16.0967 15.0997C16.5232 14.9857 16.887 14.707 17.1083 14.325L17.2917 14C17.5123 13.6175 17.5721 13.1632 17.4581 12.7367C17.344 12.3101 17.0654 11.9463 16.6833 11.725L16.5583 11.6583C16.304 11.5115 16.093 11.3 15.9466 11.0454C15.8003 10.7908 15.7238 10.502 15.725 10.2083V9.79166C15.7238 9.49797 15.8003 9.2092 15.9466 8.95457C16.093 8.69994 16.304 8.4885 16.5583 8.34166L16.6833 8.26666C17.0654 8.04536 17.344 7.68152 17.4581 7.25499C17.5721 6.82846 17.5123 6.3741 17.2917 5.99166L17.1083 5.67499C16.887 5.29294 16.5232 5.0143 16.0967 4.90025C15.6701 4.78619 15.2158 4.84604 14.8333 5.06666L14.7083 5.13332C14.455 5.2796 14.1676 5.35661 13.875 5.35661C13.5824 5.35661 13.295 5.2796 13.0417 5.13332L12.6833 4.92499C12.4302 4.77885 12.22 4.56873 12.0737 4.31569C11.9275 4.06265 11.8503 3.77559 11.85 3.48332V3.33332C11.85 2.8913 11.6744 2.46737 11.3618 2.15481C11.0493 1.84225 10.6254 1.66666 10.1833 1.66666Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 9.99999C12.5 8.61928 11.3807 7.49999 10 7.49999C8.61929 7.49999 7.5 8.61928 7.5 9.99999C7.5 11.3807 8.61929 12.5 10 12.5Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-2xl">Settings</span>
          </Link>
        </div>
        <Image
          src="/placeholder_widget.png"
          alt="trends placeholder"
          width={256}
          height={226}
          className="mt-[176px]"
        />
        <div className="mt-[176px] flex flex-col gap-8 pe-8 ps-8">
          <div className="link flex cursor-pointer flex-row items-center gap-4">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.0001 18.3334C14.6025 18.3334 18.3334 14.6024 18.3334 10C18.3334 5.39765 14.6025 1.66669 10.0001 1.66669C5.39771 1.66669 1.66675 5.39765 1.66675 10C1.66675 14.6024 5.39771 18.3334 10.0001 18.3334Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8.33341 6.66669L13.3334 10L8.33341 13.3334V6.66669Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Demo mode</span>
            <Switch
              isOn={isDemoMode}
              handleToggle={() => setIsDemoMode((d) => !d)}
            />
          </div>

          <div className="link flex cursor-pointer flex-row items-center gap-4">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18.3334 10.8333V4.99998C18.3334 4.55795 18.1578 4.13403 17.8453 3.82147C17.5327 3.50891 17.1088 3.33331 16.6667 3.33331H3.33341C2.89139 3.33331 2.46746 3.50891 2.1549 3.82147C1.84234 4.13403 1.66675 4.55795 1.66675 4.99998V15C1.66675 15.9166 2.41675 16.6666 3.33341 16.6666H10.0001M18.3334 5.83331L10.8584 10.5833C10.6011 10.7445 10.3037 10.83 10.0001 10.83C9.69648 10.83 9.39902 10.7445 9.14175 10.5833L1.66675 5.83331M15.8334 13.3333V18.3333M13.3334 15.8333H18.3334"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Invite your team</span>
          </div>

          <div className="link flex cursor-pointer flex-row items-center gap-4">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.5 11.6667C12.6667 10.8334 13.0833 10.25 13.75 9.58335C14.5833 8.83335 15 7.75002 15 6.66669C15 5.3406 14.4732 4.06883 13.5355 3.13115C12.5979 2.19347 11.3261 1.66669 10 1.66669C8.67392 1.66669 7.40215 2.19347 6.46447 3.13115C5.52678 4.06883 5 5.3406 5 6.66669C5 7.50002 5.16667 8.50002 6.25 9.58335C6.83333 10.1667 7.33333 10.8334 7.5 11.6667M7.5 15H12.5M8.33333 18.3334H11.6667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Give feedback</span>
          </div>

          <div className="link flex cursor-pointer flex-row items-center gap-4">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.57508 7.50002C7.771 6.94308 8.15771 6.47344 8.66671 6.1743C9.17571 5.87515 9.77416 5.7658 10.3561 5.86561C10.938 5.96543 11.4658 6.26796 11.846 6.71963C12.2262 7.1713 12.4343 7.74296 12.4334 8.33335C12.4334 10 9.93341 10.8334 9.93341 10.8334M10.0001 14.1667H10.0084M18.3334 10C18.3334 14.6024 14.6025 18.3334 10.0001 18.3334C5.39771 18.3334 1.66675 14.6024 1.66675 10C1.66675 5.39765 5.39771 1.66669 10.0001 1.66669C14.6025 1.66669 18.3334 5.39765 18.3334 10Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Help & support</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
