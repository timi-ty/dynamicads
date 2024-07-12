import Image from "next/image";

export default function AdMarkers({
  className,
}: Readonly<{ className?: string }>) {
  return (
    <div className={className}>
      <div className="flex h-[552px] w-[412px] flex-col justify-between rounded-2xl border bg-white p-8 shadow">
        <div>
          <div className="flex flex-row justify-between">
            <span className="text-zinc-800">Ad markers</span>
            <span className="text-zinc-500">3 markers</span>
          </div>
          <div className="mt-4 flex flex-col">
            <MarkerItem />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <button className="font-inter flex w-full flex-row items-center justify-center gap-2 rounded-md bg-zinc-900 p-4 pb-3 pt-3 text-sm font-medium text-zinc-50">
            <span>Create ad marker</span>
            <Image
              src="ic_plus.svg"
              alt="create ad marker"
              width={16}
              height={16}
            />
          </button>
          <button className="font-inter flex w-full flex-row items-center justify-center gap-2 rounded-md border bg-white p-4 pb-3 pt-3 text-sm font-medium text-zinc-900">
            <span>Automatically place</span>
            <Image
              src="/ic_magic-wand.png"
              alt="automatically place"
              width={16}
              height={16}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

function MarkerItem({ className }: Readonly<{ className?: string }>) {
  return (
    <div className={className}>
      <div className="flex flex-row items-center justify-between gap-4">
        <div>1</div>
        <div className="flex flex-grow flex-row items-center justify-between rounded-lg border p-4 pb-3 pt-3 font-semibold shadow">
          <div className="flex flex-row gap-4">
            <span className="text-zinc-800">00:00:30</span>
            <span className="rounded-lg bg-green-200 p-2.5 pb-1 pt-1 text-xs text-green-800">
              Auto
            </span>
          </div>
          <div className="flex flex-row gap-4">
            <span className="rounded-md border bg-white p-3 pb-2 pt-2 text-sm text-zinc-900">
              Edit
            </span>
            <Image
              src="ic_trash.svg"
              alt="trash"
              width={36}
              height={36}
              className="rounded-md bg-red-300 p-2.5"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
