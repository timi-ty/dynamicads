import { getServerAuthSession } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import ModalOverlay from "./_generic_components/ModalOverlay";
import Link from "next/link";
import TopNav from "./_components/TopNav";
import Footer from "./_components/Footer";
import SideNav from "./_components/SideNav";
import EpisodeViewer from "./_components/EpisodeViewer";

export default async function Home() {
  const session = await getServerAuthSession();

  return (
    <HydrateClient>
      {session && (
        <>
          <TopNav className="top-nav border-b bg-zinc-50" />
          <div className="middle">
            <SideNav className="absolute bottom-0 left-0 top-0 h-full overflow-y-auto border-r bg-zinc-50" />
            <EpisodeViewer className="ms-80 h-full overflow-auto bg-zinc-50" />
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
