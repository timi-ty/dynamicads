import Image from "next/image";
import CreateEpisodeButton from "./CreateEpisode";
import EpisodePicker from "./EpisodePicker";

export default function SideNav({
  className,
}: Readonly<{ className?: string }>) {
  return (
    <nav className={className}>
      <div className="w-80 p-8">
        <CreateEpisodeButton />
        <EpisodePicker />
        <div className="mt-8 flex flex-col gap-8 pe-8 ps-8">
          <div className="flex flex-row items-center gap-4">
            <Image src={"ic_home.svg"} alt="logo" width={20} height={20} />
            <span className="text-2xl text-zinc-500">Dashboard</span>
          </div>
          <div className="flex flex-row items-center gap-4">
            <Image src={"ic_analytics.svg"} alt="logo" width={20} height={20} />
            <span className="text-2xl text-zinc-500">Analytics</span>
          </div>
          <div className="flex flex-row items-center gap-4">
            <Image
              src={"ic_circle-dollar-sign.svg"}
              alt="logo"
              width={20}
              height={20}
            />
            <span className="text-2xl text-zinc-500">Ads</span>
          </div>
          <div className="flex flex-row items-center gap-4">
            <Image src={"ic_tv.svg"} alt="logo" width={20} height={20} />
            <span className="text-2xl text-zinc-500">Channels</span>
          </div>
          <div className="flex flex-row items-center gap-4">
            <Image src={"ic_import.svg"} alt="logo" width={20} height={20} />
            <span className="text-2xl text-zinc-500">Import</span>
          </div>
          <div className="flex flex-row items-center gap-4">
            <Image src={"ic_settings.svg"} alt="logo" width={20} height={20} />
            <span className="text-2xl text-zinc-500">Settings</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
