export function SiteHeader({ title }: { title: string }) {
  return (
    <header className="flex h-14 items-center border-b bg-card px-6">
      <h1 className="font-display text-lg font-semibold tracking-tight">
        {title}
      </h1>
    </header>
  );
}
