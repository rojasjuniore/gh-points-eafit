import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/comites", label: "Comités", icon: "🏛️" },
  { href: "/admin/miembros", label: "Miembros", icon: "👥" },
  { href: "/admin/eventos", label: "Eventos", icon: "📅" },
  { href: "/admin/puntos", label: "Asignar Puntos", icon: "⭐" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-podium flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <div>
              <h1 className="font-bold text-gradient-gold">GH POINTS</h1>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent transition-colors text-sm"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs">👤</span>
            </div>
            <div>
              <p className="text-sm font-medium">{session.name || "Admin"}</p>
              <p className="text-xs text-muted-foreground">{session.email}</p>
            </div>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="text-sm text-muted-foreground hover:text-destructive transition-colors"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
