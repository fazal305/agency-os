import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="font-heading text-lg tracking-tight text-muted-foreground">
        Agency OS
      </span>
      <h1 className="font-heading text-3xl tracking-tight">Page not found</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved.
      </p>
      <Button render={<Link href="/" />} className="mt-2">
        Back to home
      </Button>
    </div>
  );
}
