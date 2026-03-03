import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

async function getLeaderboardData() {
  const committees = await db.committee.findMany({
    include: {
      members: {
        include: {
          member: true,
        },
      },
    },
    orderBy: { points: "desc" },
  });

  // Calcular puntos totales por comité (puntos directos + suma de miembros)
  const committeesWithTotal = committees.map((c) => ({
    ...c,
    totalPoints:
      c.points + c.members.reduce((sum, mc) => sum + mc.member.points, 0),
    memberCount: c.members.length,
  }));

  // Ordenar por puntos totales
  committeesWithTotal.sort((a, b) => b.totalPoints - a.totalPoints);

  const activeMembers = await db.member.findMany({
    where: { type: "ACTIVE" },
    orderBy: { points: "desc" },
    take: 10,
  });

  const newMembers = await db.member.findMany({
    where: { type: "NEW" },
    orderBy: { points: "desc" },
    take: 10,
  });

  const upcomingEvents = await db.event.findMany({
    where: {
      date: { gte: new Date() },
      isActive: true,
    },
    orderBy: { date: "asc" },
    take: 5,
  });

  return { committees: committeesWithTotal, activeMembers, newMembers, upcomingEvents };
}

export default async function HomePage() {
  const { committees, activeMembers, newMembers, upcomingEvents } =
    await getLeaderboardData();

  const top3 = committees.slice(0, 3);
  const rest = committees.slice(3);

  return (
    <main className="min-h-screen bg-gradient-podium">
      {/* Header */}
      <header className="border-b border-white/10 bg-night-dark/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <div>
              <h1 className="text-xl font-bold text-gradient-gold">GH POINTS</h1>
              <p className="text-xs text-muted-foreground">OE EAFIT</p>
            </div>
          </div>
          <Link
            href="/admin"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Admin
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Podio de Comités */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8 text-gradient-gold">
            Copa de Comités
          </h2>

          {/* Top 3 Podio */}
          <div className="flex justify-center items-end gap-4 mb-8">
            {/* 2do lugar */}
            {top3[1] && (
              <div className="text-center">
                <div className="w-32 h-40 bg-card rounded-t-lg flex flex-col items-center justify-end pb-4 glow-celeste border border-celeste/30">
                  <span className="text-4xl mb-2">🥈</span>
                  <p className="font-semibold text-sm px-2 truncate w-full">
                    {top3[1].name}
                  </p>
                  <p className="text-2xl font-bold text-celeste">
                    {top3[1].totalPoints}
                  </p>
                </div>
                <div className="bg-celeste/20 h-24 w-32 flex items-center justify-center">
                  <span className="text-5xl font-bold text-celeste/50">2</span>
                </div>
              </div>
            )}

            {/* 1er lugar */}
            {top3[0] && (
              <div className="text-center">
                <div className="w-36 h-48 bg-card rounded-t-lg flex flex-col items-center justify-end pb-4 glow-gold border border-mustard/50">
                  <span className="text-5xl mb-2">🥇</span>
                  <p className="font-semibold px-2 truncate w-full">
                    {top3[0].name}
                  </p>
                  <p className="text-3xl font-bold text-mustard">
                    {top3[0].totalPoints}
                  </p>
                </div>
                <div className="bg-mustard/20 h-32 w-36 flex items-center justify-center">
                  <span className="text-6xl font-bold text-mustard/50">1</span>
                </div>
              </div>
            )}

            {/* 3er lugar */}
            {top3[2] && (
              <div className="text-center">
                <div className="w-32 h-36 bg-card rounded-t-lg flex flex-col items-center justify-end pb-4 glow-orange border border-orange/30">
                  <span className="text-3xl mb-2">🥉</span>
                  <p className="font-semibold text-sm px-2 truncate w-full">
                    {top3[2].name}
                  </p>
                  <p className="text-xl font-bold text-orange">
                    {top3[2].totalPoints}
                  </p>
                </div>
                <div className="bg-orange/20 h-16 w-32 flex items-center justify-center">
                  <span className="text-4xl font-bold text-orange/50">3</span>
                </div>
              </div>
            )}
          </div>

          {/* Resto de comités */}
          {rest.length > 0 && (
            <div className="max-w-2xl mx-auto space-y-2">
              {rest.map((committee, idx) => (
                <div
                  key={committee.id}
                  className="flex items-center justify-between bg-card/50 rounded-lg px-4 py-3 border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground font-mono w-6">
                      {idx + 4}
                    </span>
                    <span className="font-medium">{committee.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {committee.memberCount} miembros
                    </Badge>
                  </div>
                  <span className="font-bold text-primary">
                    {committee.totalPoints} pts
                  </span>
                </div>
              ))}
            </div>
          )}

          {committees.length === 0 && (
            <p className="text-center text-muted-foreground">
              No hay comités registrados aún
            </p>
          )}
        </section>

        {/* Ranking de Miembros */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-6">
            Ranking Individual
          </h2>

          <Tabs defaultValue="active" className="max-w-2xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 bg-card">
              <TabsTrigger value="active">Miembros Activos</TabsTrigger>
              <TabsTrigger value="new">Miembros Nuevos</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-4">
              <Card className="bg-card/50 border-white/5">
                <CardContent className="pt-4">
                  {activeMembers.length > 0 ? (
                    <div className="space-y-2">
                      {activeMembers.map((member, idx) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`font-mono w-6 ${
                                idx < 3 ? "text-mustard font-bold" : "text-muted-foreground"
                              }`}
                            >
                              {idx + 1}
                            </span>
                            <span>{member.name}</span>
                          </div>
                          <span className="font-bold text-celeste">
                            {member.points} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      No hay miembros activos registrados
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="new" className="mt-4">
              <Card className="bg-card/50 border-white/5">
                <CardContent className="pt-4">
                  {newMembers.length > 0 ? (
                    <div className="space-y-2">
                      {newMembers.map((member, idx) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`font-mono w-6 ${
                                idx < 3 ? "text-mustard font-bold" : "text-muted-foreground"
                              }`}
                            >
                              {idx + 1}
                            </span>
                            <span>{member.name}</span>
                          </div>
                          <span className="font-bold text-celeste">
                            {member.points} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      No hay miembros nuevos registrados
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* Próximos Eventos */}
        <section>
          <h2 className="text-2xl font-bold text-center mb-6">
            Próximos Eventos
          </h2>

          <div className="max-w-2xl mx-auto grid gap-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <Card key={event.id} className="bg-card/50 border-white/5">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{event.name}</CardTitle>
                      <Badge className="bg-mustard text-night">
                        +{event.pointsValue} pts
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.date).toLocaleDateString("es-CO", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    {event.description && (
                      <p className="text-sm mt-2">{event.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground">
                No hay eventos próximos
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>GH Points - Organización Estudiantil EAFIT</p>
        </div>
      </footer>
    </main>
  );
}
