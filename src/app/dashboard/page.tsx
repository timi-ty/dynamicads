import Link from "next/link";
import NothingHere from "../_generic_components/NothingHere";

export default function DashbaordPage() {
  return (
    <>
      <Link href={"/"} className="link text-sm text-zinc-500">
        {"<-"} Dashbaord
      </Link>
      <NothingHere />;
    </>
  );
}
