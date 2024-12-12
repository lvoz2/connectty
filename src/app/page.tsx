import Link from "next/link";

export default function Page() {
	return <Link className="p-5 m-2 bg-slate-500 shadow-md font-mono text-white hover:bg-white border-slate-500 hover:text-slate-500 border-4 border-rounded transition" href="/login">Login</Link>;
}
