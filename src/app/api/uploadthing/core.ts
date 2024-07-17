import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

//Would use s3 directly instead of upload thing in a production app, but upload thing is convenient here

const f = createUploadthing();

// Fake auth function, we simply disable the upload button from server side if the session is not valid. This should instead integrate with nect-auth.
const auth = (_: Request) => ({ id: "fakeId" });

export const fileRouter = {
  //Small max size to protect my free quota
  videoUploader: f({ video: { maxFileSize: "128MB" } })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      const user = auth(req);
      if (!user) throw new UploadThingError("Unauthorized"); // Will never happen
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      return { fileUrl: file.url };
    }),
} satisfies FileRouter;

export type EpisodeFileRouter = typeof fileRouter;
