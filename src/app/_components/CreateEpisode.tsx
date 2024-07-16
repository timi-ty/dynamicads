"use client";

import { FormEvent, useEffect, useState } from "react";
import { UploadButton } from "~/utils/uploadthing";
import ModalOverlay from "../_generic_components/ModalOverlay";
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
  const [fileDesc, setFileDesc] = useState({ name: "", url: "" });
  const [uploadProgress, setUploadProgress] = useState(0);

  const queryApi = api.useUtils();
  const createEpisode = api.episode.create.useMutation();

  function handleFinish(episodeName: string) {
    setStatus("Finishing");
    createEpisode.mutate(
      { episodeName: episodeName, videoUrl: fileDesc.url },
      {
        onSuccess: () => {
          setStatus("Done");
          queryApi.episode.invalidate();
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
      {/*Here we overlap the upload thing upload button on ours and make it
      transparent so that it can handle the click without affecting the UI. 
      Using upload thing for ease only. Would use direct s3 in production.*/}
      <div className="font-inter pointer-events-none relative w-64 rounded-md bg-zinc-900 p-4 pb-3 pt-3 text-center text-sm font-medium text-zinc-50">
        <span>Create an episode</span>
        <UploadButton
          endpoint="videoUploader"
          onUploadProgress={(progress) => {
            setUploadProgress(progress);
            setStatus("Uploading");
          }}
          onClientUploadComplete={(res) => {
            if (res && res.length > 0 && res[0]) {
              setFileDesc({ name: res[0].name, url: res[0].url });
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
      </div>
      <CreateEpisodeModalGroup
        status={status}
        uploadProgress={uploadProgress}
        handleFinish={handleFinish}
        handleDismiss={handleDismiss}
        defaultName={fileDesc.name}
      />
    </>
  );
}

function CreateEpisodeModalGroup({
  status,
  uploadProgress,
  handleFinish,
  handleDismiss,
  defaultName,
}: Readonly<{
  status: CreateEpisodeStatus;
  uploadProgress: number;
  handleFinish: (episodeName: string) => void;
  handleDismiss: () => void;
  defaultName: string;
}>) {
  const [episodeName, setEpisodeName] = useState(defaultName);

  useEffect(() => setEpisodeName(defaultName), [defaultName]);

  function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    handleFinish(episodeName);
  }

  if (status === "Uploading" || status === "Finishing")
    return (
      <ModalOverlay>
        <div className="flex flex-row items-center justify-center gap-2">
          <span>
            {status === "Uploading" ? `${status}: ${uploadProgress}%` : status}
          </span>
          <Image src="/spinner.svg" alt={status} width={32} height={32} />
        </div>
      </ModalOverlay>
    );

  if (status === "Naming")
    return (
      <ModalOverlay>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label htmlFor="input_name_episode" className="text-sm">
            Name your episode:
          </label>
          <input
            className="h-10 w-64 rounded border p-2"
            id="input_name_episode"
            type="text"
            maxLength={120}
            minLength={1}
            required
            value={episodeName}
            onChange={(ev) => setEpisodeName(ev.target.value)}
          />
          <input
            type="submit"
            value={"Finish"}
            className="font-inter relative w-full cursor-pointer rounded-md bg-zinc-900 p-4 pb-3 pt-3 text-sm font-medium text-zinc-50"
          />
        </form>
      </ModalOverlay>
    );

  if (status === "Error")
    return (
      <ModalOverlay>
        <div className="flex flex-col gap-8">
          <span>Something went wrong.</span>
          <button
            type="button"
            className="font-inter relative w-full cursor-pointer rounded-md bg-zinc-900 p-4 pb-3 pt-3 text-sm font-medium text-zinc-50"
            onClick={handleDismiss}
          >
            Dismiss
          </button>
        </div>
      </ModalOverlay>
    );

  return <></>;
}
