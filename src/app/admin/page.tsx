import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function getStats() {
  const [totalMembers, totalCommittees, totalEvents, totalPoints] =
    await Promise.all([
      db.member.count(),
      db.committee.count(),
      db.event.count(),
      db.member.aggregate({ _sum: { points: true } }),
    ]);

  const recentAssignments = await db.pointAssignment.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      member: { select: { name: true } },
      event: { select: { name: true } },
    },
  });

  return {
    totalMembers,
    totalCommittees,
    totalEvents,
    totalPoints: totalPoints._sum.points || 0,
    recentAssignments,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-card/50 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Miembros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-celeste">{stats.totalMembers}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Comités
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-mustard">{stats.totalCommittees}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange">{stats.totalEvents}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Puntos Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gradient-gold">
              {stats.totalPoints}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-card/50 border-white/10">
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentAssignments.length > 0 ? (
            <div className="space-y-3">
              {stats.recentAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                >
                  <div>
                    <p className="font-medium">{assignment.member.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {assignment.event.name}
                    </p>
                  </div>
                  <span className="text-primary font-bold">
                    +{assignment.points} pts
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No hay actividad reciente
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
