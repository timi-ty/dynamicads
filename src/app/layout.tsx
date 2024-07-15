import "~/styles/globals.css";
import { Manrope } from "next/font/google";
import { type Metadata } from "next";
import { TRPCReactProvider } from "~/trpc/react";
import Link from "next/link";
import { HydrateClient } from "~/trpc/server";
import Footer from "./_components/Footer";
import SideNav from "./_components/SideNav";
import TopNav from "./_components/TopNav";
import ModalOverlay from "./_generic_components/ModalOverlay";
import { getServerAuthSession } from "~/server/auth";
import AtomProvider from "~/jotai/react";

const manrope = Manrope({ subsets: ["latin"], weight: "700" });

export const metadata: Metadata = {
  title: "Dynamic Ads",
  description: "Created by Timilehin Tayo",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerAuthSession();
  return (
    <html lang="en" className={manrope.className}>
      <body>
        <AtomProvider>
          <TRPCReactProvider>
            <HydrateClient>
              {session && (
                <>
                  <TopNav className="top-nav z-10 overflow-visible border-b bg-zinc-50" />
                  <div className="middle flex flex-row">
                    <SideNav className="h-full flex-shrink-0 overflow-y-auto border-r bg-zinc-50" />
                    <main className="h-full flex-grow overflow-auto bg-zinc-50 p-16">
                      {children}
                    </main>
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
          </TRPCReactProvider>
        </AtomProvider>
      </body>
    </html>
  );
}
