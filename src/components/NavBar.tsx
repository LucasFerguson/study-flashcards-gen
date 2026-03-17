import Link from "next/link";
import { useRouter } from "next/router";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/editor", label: "Editor" },
  { href: "/cards", label: "Cards" },
  { href: "/print", label: "Print" },
  { href: "/tabletop", label: "Tabletop" },
];

const NavBar = () => {
  const router = useRouter();

  return (
    <header className="w-full border-b bg-white/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-gray-900">
          Study Flashcards
        </Link>
        <div className="flex items-center gap-4 text-sm font-medium text-gray-600">
          {navItems.map((item) => {
            const isActive = router.pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded px-3 py-1 transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
