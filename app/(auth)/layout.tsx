export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#dbeafe,_#f8fafc_45%,_#eef2ff)] p-6">
      {children}
    </div>
  );
}
