import { Outlet, Link, createRootRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "sonner";

// Import your styles
import "../styles.css";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">หลงทางในป่าเหรอ?</h2>
        <p className="mt-2 text-sm text-muted-foreground">หน้านี้ไม่มีในแผนที่ของหมู่บ้านไนลาโซ</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          กลับหมู่บ้าน
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    console.error("React error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">เกิดบางอย่างผิดพลาด</h1>
        <p className="mt-2 text-sm text-muted-foreground">ลองโหลดใหม่อีกครั้งนะ</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          ลองใหม่
        </button>
      </div>
    </div>
  );
}

// 1. We changed this to a simple createRootRoute!
export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  // 2. We removed the extra QueryClient wrapper because main.tsx already handles it
  return (
    <>
      <Outlet />
      <Toaster position="top-center" richColors />
    </>
  );
}