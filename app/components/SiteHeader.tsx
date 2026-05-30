import Link from "next/link";
import Image from "next/image";

export function SiteHeader({ showAdmin = true }: { showAdmin?: boolean }) {
  return (
    <header className="border-b border-slate-100 px-5 h-14 flex items-center justify-between bg-white sticky top-0 z-20">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 bg-slate-900">
          <Image
            src="/logo.jpeg"
            alt="Polygon"
            width={28}
            height={28}
            className="w-full h-full object-cover"
            priority
          />
        </div>
        <span className="text-sm font-semibold tracking-tight text-slate-900">
          Mathematics Melee
        </span>
        <span className="text-xs font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-sm">
          '26
        </span>
      </Link>
      {showAdmin && (
        <Link
          href="/admin/login"
          className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
        >
          Admin
        </Link>
      )}
    </header>
  );
}
