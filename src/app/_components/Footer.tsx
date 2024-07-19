import Image from "next/image";

export default function Footer({
  className,
}: Readonly<{ className?: string }>) {
  return (
    <footer className={className}>
      <div className="flex flex-row items-center justify-between p-6 pb-[37px] pt-[37px] sm:pe-16 sm:ps-16">
        <span className="font-semibold text-zinc-500">
          Video first podcasts
        </span>
        <div className="flex flex-row items-center gap-4">
          <Image src={"/ic_brandmark.svg"} alt="logo" width={24} height={24} />
          <span className="text-2xl">Vidpod</span>
        </div>
      </div>
    </footer>
  );
}
