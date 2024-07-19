"use client";

import Image from "next/image";
import withDropdown from "../_generic_components/withDrodpdown";
import Link from "next/link";
import { useContext } from "react";
import MenuStateContext from "../_context/MenuStateContext";

export default function TopNav({
  className,
  userName,
}: Readonly<{ className?: string; userName: string }>) {
  const { isMenuOpen, toggleMenu } = useContext(MenuStateContext);

  return (
    <nav className={className}>
      <div className="flex flex-row items-center justify-between p-6 pb-6 pt-6 sm:pe-16 sm:ps-16">
        <div className="flex flex-row gap-8">
          <button
            onClick={() => toggleMenu()}
            type="button"
            className="xl:hidden"
          >
            <Image
              src={isMenuOpen ? "/ic_return.svg" : "/ic_hamburger.svg"}
              alt="menu"
              width={24}
              height={24}
            />
          </button>

          <Link href={"/"} className="flex flex-row items-center gap-4">
            <Image
              src={"/ic_brandmark.svg"}
              alt="logo"
              width={24}
              height={24}
            />
            <div className="text-2xl">Vidpod</div>
          </Link>
        </div>
        <div className="flex flex-row items-center gap-6">
          <button className="rounded-full hover:bg-zinc-100" type="button">
            <Image
              src={"/ic_settings.svg"}
              alt="settings"
              width={28}
              height={28}
              className="p-1"
            />
          </button>
          <button className="rounded-full hover:bg-zinc-100" type="button">
            <Image
              src={"/ic_bell-dot.svg"}
              alt="notifications"
              width={28}
              height={28}
              className="p-1"
            />
          </button>
          <ProfileDropDown
            items={[{ id: "profile", value: userName }, { id: "signout" }]}
          />
        </div>
      </div>
    </nav>
  );
}

function ProfileDropdownItem({
  data,
  isPicker,
}: Readonly<{ data: { id: string; value?: string }; isPicker?: boolean }>) {
  // Only show profile item if it is the picker
  if (data.id === "profile" && !isPicker) return <></>;
  // Regardless of the selected item, return the profile item as the picker item.
  if (isPicker)
    return (
      <button
        className="flex flex-row items-center gap-4 rounded-lg border p-4 pb-3 pt-3 shadow hover:shadow-md"
        type="button"
      >
        <Image
          src={"/placeholder_profile.png"}
          alt="profile"
          width={32}
          height={32}
        />
        <div className="hidden sm:block">{data.value}</div>
        <Image
          src={"/ic_chevron-down.svg"}
          alt="settings"
          width={16}
          height={16}
        />
      </button>
    );

  // Return an item to do a sign out
  if (data.id === "signout")
    return (
      <Link
        href={"/api/auth/signout"}
        className="z-50 flex flex-row items-center gap-4 rounded-lg border bg-zinc-50 p-4 pb-3 pt-3 text-sm shadow sm:text-base"
      >
        <span>Sign out</span>
      </Link>
    );
}

const ProfileDropDown = withDropdown(ProfileDropdownItem);
