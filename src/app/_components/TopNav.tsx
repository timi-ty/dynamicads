import Image from "next/image";

export default function TopNav({
  className,
}: Readonly<{ className?: string }>) {
  return (
    <nav className={className}>
      <div className="flex flex-row items-center justify-between p-16 pb-6 pt-6">
        <div className="flex flex-row items-center gap-4">
          <Image src={"/ic_brandmark.svg"} alt="logo" width={24} height={24} />
          <div className="text-2xl">Vidpod</div>
        </div>
        <div className="flex flex-row items-center gap-8">
          <Image
            src={"/ic_settings.svg"}
            alt="settings"
            width={20}
            height={20}
          />
          <Image
            src={"/ic_bell-dot.svg"}
            alt="notifications"
            width={20}
            height={20}
          />
          <div className="flex flex-row items-center gap-4 rounded-lg border p-4 pb-3 pt-3 shadow">
            <Image
              src={"/placeholder_profile.png"}
              alt="profile"
              width={32}
              height={32}
            />
            <div>Emma Warren</div>
            <Image
              src={"/ic_chevron-down.svg"}
              alt="settings"
              width={16}
              height={16}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
