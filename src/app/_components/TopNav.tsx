"use client";

import Image from "next/image";
import withDropdown from "../_generic_components/withDrodpdown";
import Link from "next/link";

export default function TopNav({
  className,
  userName,
}: Readonly<{ className?: string; userName: string }>) {
  return (
    <nav className={className}>
      <div className="flex flex-row items-center justify-between p-16 pb-6 pt-6">
        <div className="flex flex-row items-center gap-4">
          <Image src={"/ic_brandmark.svg"} alt="logo" width={24} height={24} />
          <div className="text-2xl">Vidpod</div>
        </div>
        <div className="flex flex-row items-center gap-6">
          <button className="rounded-full hover:bg-zinc-100">
            <Image
              src={"/ic_settings.svg"}
              alt="settings"
              width={28}
              height={28}
              className="p-1"
            />
          </button>
          <button className="rounded-full hover:bg-zinc-100">
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
      <button className="flex flex-row items-center gap-4 rounded-lg border p-4 pb-3 pt-3 shadow hover:shadow-md">
        <Image
          src={"/placeholder_profile.png"}
          alt="profile"
          width={32}
          height={32}
        />
        <div>{data.value}</div>
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
        className="z-50 flex flex-row items-center gap-4 rounded-lg border bg-zinc-50 p-4 pb-3 pt-3 shadow"
      >
        <div>Sign out</div>
      </Link>
    );
}

const ProfileDropDown = withDropdown(ProfileDropdownItem);
