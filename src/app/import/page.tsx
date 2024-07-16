import Link from "next/link";
import NothingHere from "../_generic_components/NothingHere";

export default function ImportPage() {
  return (
    <>
      <Link href={"/"} className="link text-sm text-zinc-500">
        {"<-"} Import
      </Link>
      <NothingHere />;
    </>
  );
}
