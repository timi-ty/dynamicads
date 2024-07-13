import Image from "next/image";

import { getServerAuthSession } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import AdMarkers from "./_components/AdMarkers";
import VideoPlayer from "./_components/VideoPlayer";
import CreateEpisodeButton from "./_components/CreateEpisodeButton";
import ModalOverlay from "./_components/ModalOverlay";
import Link from "next/link";

export default async function Home() {
  const session = await getServerAuthSession();

  return (
    <HydrateClient>
      {session && (
        <>
          <TopNav className="top-nav border-b bg-zinc-50" />
          <div className="middle">
            <SideNav className="absolute bottom-0 left-0 top-0 h-full overflow-y-auto border-r bg-zinc-50" />
            <Main className="ms-80 h-full overflow-auto bg-zinc-50" />
          </div>
          <Footer className="border-t bg-zinc-50" />
        </>
      )}
      {!session && (
        <ModalOverlay>
          <Link
            href={"/api/auth/signin"}
            className="font-inter block w-64 rounded-md bg-zinc-900 p-4 pb-3 pt-3 text-center text-sm font-medium text-zinc-50"
          >
            Sign In
          </Link>
        </ModalOverlay>
      )}
    </HydrateClient>
  );
}

function TopNav({ className }: Readonly<{ className?: string }>) {
  return (
    <nav className={className}>
      <div className="flex flex-row items-center justify-between p-16 pb-6 pt-6">
        <div className="flex flex-row items-center gap-4">
          <Image src={"ic_brandmark.svg"} alt="logo" width={24} height={24} />
          <div className="text-2xl">Vidpod</div>
        </div>
        <div className="flex flex-row gap-8">
          <Image
            src={"ic_settings.svg"}
            alt="settings"
            width={20}
            height={20}
          />
          <Image
            src={"ic_bell-dot.svg"}
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
              src={"ic_chevron-down.svg"}
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

function SideNav({ className }: Readonly<{ className?: string }>) {
  return (
    <nav className={className}>
      <div className="w-80 p-8">
        <CreateEpisodeButton />
        <button
          type="button"
          className="mt-4 flex w-64 flex-row items-center justify-between rounded-md border p-4 pb-3 pt-3 text-sm font-medium"
        >
          <Image
            src={"/placeholder_episode-thumbnail.png"}
            alt="profile"
            width={32}
            height={32}
          />
          <span className="text-zinc-500">The Diary Of A CEO</span>
          <Image
            src={"ic_chevron-down.svg"}
            alt="settings"
            width={16}
            height={16}
          />
        </button>
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

function Main({ className }: Readonly<{ className?: string }>) {
  return (
    <main className={className}>
      <div className="p-16">
        <span className="text-sm text-zinc-500">{"<-"} Ads</span>
        <div className="mt-4 max-w-[616px] text-3xl">
          The Longevity Expert: The Truth About Ozempic, The Magic Weight Loss
          Drug & The Link Between Milk & Cancer!
        </div>
        <span className="mt-4 text-zinc-500">Episode 503 • 12 April 2024</span>
        <div className="mt-8 flex flex-row gap-8">
          <AdMarkers />
          <VideoPlayer />
        </div>
      </div>
    </main>
  );
}

function Footer({ className }: Readonly<{ className?: string }>) {
  return (
    <footer className={className}>
      <div className="flex flex-row items-center justify-between p-16 pb-[37px] pt-[37px]">
        <span className="font-semibold text-zinc-500">
          Video first podcasts
        </span>
        <div className="flex flex-row items-center gap-4">
          <Image src={"ic_brandmark.svg"} alt="logo" width={24} height={24} />
          <span className="text-2xl">Vidpod</span>
        </div>
      </div>
    </footer>
  );
}
