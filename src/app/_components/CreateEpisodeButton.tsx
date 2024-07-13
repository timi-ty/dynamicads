"use client";

import { FormEvent, useState } from "react";
import { UploadButton } from "~/utils/uploadthing";
import ModalOverlay from "./ModalOverlay";
import Image from "next/image";
import { api } from "~/trpc/react";

type CreateEpisodeStatus =
  | "Done"
  | "Uploading"
  | "Naming"
  | "Error"
  | "Finishing";

export default function CreateEpisodeButton() {
  const [status, setStatus] = useState<CreateEpisodeStatus>("Done");
  const [fileUrl, setFileUrl] = useState("");

  const createEpisode = api.episode.create.useMutation();

  function handleFinish(episodeName: string) {
    createEpisode.mutate(
      { episodeName: episodeName, episodeUrl: fileUrl },
      {
        onSuccess: () => {
          setStatus("Done");
        },
        onError: () => {
          setStatus("Error");
        },
      },
    );
  }

  function handleDismiss() {
    setStatus("Done");
  }

  return (
    <>
      {/*Here we overlap the upload thing upload button with ours and make it
      transparent so that it can handle the click without affecting the UI*/}
      <button
        type="button"
        className="font-inter pointer-events-none relative w-64 rounded-md bg-zinc-900 p-4 pb-3 pt-3 text-sm font-medium text-zinc-50"
      >
        <span>Create an episode</span>
        <UploadButton
          endpoint="videoUploader"
          onUploadProgress={(_) => {
            setStatus("Uploading");
          }}
          onClientUploadComplete={(res) => {
            if (res && res.length > 0 && res[0]) {
              setFileUrl(res[0].url);
              setStatus("Naming");
            } else {
              setStatus("Error");
            }
          }}
          onUploadError={(_: Error) => {
            setStatus("Error");
          }}
          className="pointer-events-auto absolute bottom-[-16px] left-0 right-0 top-0 w-full overflow-hidden opacity-0"
        />
      </button>
      <CreateEpisodeModalGroup
        status={status}
        handleFinish={handleFinish}
        handleDismiss={handleDismiss}
      />
    </>
  );
}

function CreateEpisodeModalGroup({
  status,
  handleFinish,
  handleDismiss,
}: Readonly<{
  status: CreateEpisodeStatus;
  handleFinish: (episodeName: string) => void;
  handleDismiss: () => void;
}>) {
  const [episodeName, setEpisodeName] = useState("");

  function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    handleFinish(episodeName);
  }

  return (
    <>
      {status !== "Done" && (
        <ModalOverlay>
          {(status === "Uploading" || status == "Finishing") && (
            <div className="flex flex-row items-center justify-center gap-2">
              <span className="w-full">{status}</span>
              <Image src="spinner.svg" alt={status} width={32} height={32} />
            </div>
          )}
          {status === "Naming" && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label htmlFor="input_name_episode" className="text-sm">
                Name your episode:
              </label>
              <input
                className="h-10 w-64 rounded border p-2"
                id="input_name_episode"
                type="text"
                maxLength={30}
                minLength={4}
                required
                value={episodeName}
                onChange={(ev) => setEpisodeName(ev.target.value)}
              />
              <input
                type="submit"
                value={"Finish"}
                className="font-inter relative w-full rounded-md bg-zinc-900 p-4 pb-3 pt-3 text-sm font-medium text-zinc-50"
              />
            </form>
          )}
          {status === "Error" && (
            <div className="flex flex-col gap-8">
              <span>Something went wrong.</span>
              <button
                type="button"
                className="font-inter relative w-full rounded-md bg-zinc-900 p-4 pb-3 pt-3 text-sm font-medium text-zinc-50"
                onClick={handleDismiss}
              >
                Dismiss
              </button>
            </div>
          )}
        </ModalOverlay>
      )}
    </>
  );
}
