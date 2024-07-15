import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

const pickedEpisodeAtom = atomWithStorage("picked_episode", 0);

export default function usePickedEpisodeId() {
  return useAtom(pickedEpisodeAtom);
}
