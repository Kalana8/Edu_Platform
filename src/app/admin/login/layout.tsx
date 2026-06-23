export default function LoginLayout({ children }: { children: React.ReactNode }) {
  // This layout overrides the parent admin layout for the login route
  // so the sidebar/topbar are not rendered on the login page.
  return <>{children}</>;
}
