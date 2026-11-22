import { useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Show, SignInButton, UserButton } from "@clerk/react";
import ThemeSelect from "@/components/theme-select";
import { useProfile } from "@/hooks/use-profile";
import { Menu, Plus, UserRound, X } from "lucide-react";

const navigation = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/jobs", label: "Find jobs" },
  { to: "/saved-jobs", label: "Saved jobs" },
  { to: "/my-jobs", label: "Applications" },
];

const Header = () => {
  const { profile } = useProfile();
  const initials = profile.fullName.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const { pathname, search } = useLocation();
  const menuRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    menuRef.current?.removeAttribute("open");
  }, [pathname, search]);

  useEffect(() => {
    const dismiss = (event) => {
      if (menuRef.current?.open && !menuRef.current.contains(event.target)) menuRef.current.removeAttribute("open");
    };
    const media = window.matchMedia("(min-width: 1280px)");
    const resize = () => { if (media.matches) menuRef.current?.removeAttribute("open"); };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("focusin", dismiss);
    media.addEventListener("change", resize);
    return () => { document.removeEventListener("pointerdown", dismiss); document.removeEventListener("focusin", dismiss); media.removeEventListener("change", resize); };
  }, []);

  const closeMenu = () => menuRef.current?.removeAttribute("open");
  const linkClass = (isActive) =>
    `rounded-lg px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
      isActive
        ? "bg-accent text-accent-foreground"
        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
    }`;

  const renderLinks = () => navigation.map(({ to, label, end }) => (
    <NavLink
      key={to}
      to={to}
      end={end}
      aria-current={to === "/jobs" && pathname.startsWith("/job/") ? "page" : undefined}
      onClick={closeMenu}
      className={({ isActive }) => linkClass(isActive || (to === "/jobs" && pathname.startsWith("/job/")))}
    >
      {label}
    </NavLink>
  ));

  const postJobLink = (
    <NavLink
      to="/post-job"
      onClick={closeMenu}
      className={({ isActive }) =>
        `inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          isActive
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-secondary text-secondary-foreground hover:bg-accent"
        }`
      }
    >
      <Plus className="size-4" aria-hidden="true" />
      Post a job
    </NavLink>
  );

  return (
    <header
      className="relative z-30 mb-8 border-b border-border bg-background/95 backdrop-blur-xl sm:mb-10"
      onKeyDown={(event) => {
        if (event.key === "Escape" && menuRef.current?.open) {
          closeMenu();
          toggleRef.current?.focus();
        }
      }}
    >
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:gap-6 sm:px-6 lg:px-8">
        <Link
          to="/"
          aria-label="Job Portal home"
          onClick={closeMenu}
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:gap-2.5"
        >
          <img src="/logo.svg" alt="" width="40" height="40" className="size-9 shrink-0 dark:invert sm:size-10" />
          <span className="whitespace-nowrap text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            Job<span className="font-normal text-muted-foreground">Portal</span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 xl:flex">
          {renderLinks()}
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <NavLink to="/profile" aria-label={profile.fullName ? `Open profile for ${profile.fullName}` : "Open your profile"} className={({ isActive }) => `hidden size-11 shrink-0 items-center justify-center rounded-full border text-sm font-semibold xl:flex ${isActive ? "border-ring bg-secondary" : "border-border hover:bg-accent"}`}>{initials || <UserRound aria-hidden="true" className="size-5" />}</NavLink>
          <div className="hidden xl:block"><ThemeSelect id="desktop-theme" /></div>
          <div className="hidden xl:block">{postJobLink}</div>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button
                type="button"
                onClick={closeMenu}
                className="min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Sign in
              </button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>

          <details ref={menuRef} className="group xl:hidden">
            <summary
              ref={toggleRef}
              aria-label="Toggle navigation menu"
              aria-controls="mobile-navigation"
              className="flex size-11 cursor-pointer list-none items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden"
            >
              <Menu className="size-5 group-open:hidden" aria-hidden="true" />
              <X className="hidden size-5 group-open:block" aria-hidden="true" />
            </summary>
            <nav
              id="mobile-navigation"
              aria-label="Mobile navigation"
              className="absolute inset-x-0 top-full flex max-h-[calc(100dvh-5rem)] flex-col gap-1 overflow-y-auto overscroll-contain border-b border-border bg-background p-4 shadow-xl sm:px-6"
            >
              <NavLink to="/profile" onClick={closeMenu} className={({ isActive }) => `mb-3 flex min-h-16 items-center gap-3 rounded-xl border p-3 ${isActive ? "border-ring bg-secondary" : "border-border"}`}><span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold">{initials || <UserRound className="size-5" />}</span><span className="min-w-0"><span className="block truncate text-sm font-semibold">{profile.fullName || "Your profile"}</span><span className="mt-1 block truncate text-sm text-muted-foreground">{profile.headline || "Add your details and career goals"}</span></span></NavLink>
              <Link to="/" onClick={closeMenu} className={linkClass(pathname === "/")}>Home</Link>
              {renderLinks()}
              <div className="mt-3 border-t border-border pt-4"><p className="mb-2 text-sm font-medium text-muted-foreground">Appearance</p><ThemeSelect id="mobile-theme" /></div>
              <div className="mt-2 border-t border-border pt-3 [&>a]:flex">
                {postJobLink}
              </div>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
};

export default Header;
