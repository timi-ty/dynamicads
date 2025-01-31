import { generateUploadButton } from "@uploadthing/react";

import type { EpisodeFileRouter } from "~/app/api/uploadthing/core";

export const UploadButton = generateUploadButton<EpisodeFileRouter>();
