import { BookOpen } from "lucide-react";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" prefetch={false}>
      <BookOpen className="h-6 w-6 text-primary" />
      <span className="text-xl font-headline font-bold">OpenMark Blog</span>
    </Link>
  );
}
