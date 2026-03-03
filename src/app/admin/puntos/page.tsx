"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

type Event = { id: string; name: string; pointsValue: number };
type Committee = { id: string; name: string };
type Member = {
  id: string;
  name: string;
  email: string;
  type: "NEW" | "ACTIVE";
  committees: { committee: Committee }[];
};

export default function PuntosPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [filterCommittee, setFilterCommittee] = useState<string>("ALL");

  // For committee bonus
  const [bonusCommittee, setBonusCommittee] = useState<string>("");
  const [bonusPoints, setBonusPoints] = useState<number>(10);
  const [bonusReason, setBonusReason] = useState<string>("");

  async function fetchData() {
    const [eventsRes, membersRes, committeesRes] = await Promise.all([
      fetch("/api/events"),
      fetch("/api/members"),
      fetch("/api/committees"),
    ]);
    setEvents(await eventsRes.json());
    setMembers(await membersRes.json());
    setCommittees(await committeesRes.json());
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  function toggleMember(id: string) {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  }

  function selectAll() {
    setSelectedMembers(filteredMembers.map((m) => m.id));
  }

  function clearSelection() {
    setSelectedMembers([]);
  }

  async function assignPoints() {
    if (!selectedEvent || selectedMembers.length === 0) {
      alert("Selecciona un evento y al menos un miembro");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/points/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: selectedEvent,
        memberIds: selectedMembers,
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (data.error) {
      alert(data.error);
    } else {
      alert(`Puntos asignados a ${data.assigned} miembros`);
      setSelectedMembers([]);
      fetchData();
    }
  }

  async function assignCommitteeBonus() {
    if (!bonusCommittee || !bonusPoints || !bonusReason) {
      alert("Completa todos los campos");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/points/committee-bonus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        committeeId: bonusCommittee,
        points: bonusPoints,
        reason: bonusReason,
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (data.error) {
      alert(data.error);
    } else {
      alert(`+${bonusPoints} puntos asignados al comité`);
      setBonusCommittee("");
      setBonusPoints(10);
      setBonusReason("");
      fetchData();
    }
  }

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());
    const matchesCommittee =
      filterCommittee === "ALL" ||
      m.committees.some((c) => c.committee.id === filterCommittee);
    return matchesSearch && matchesCommittee;
  });

  const selectedEvent_ = events.find((e) => e.id === selectedEvent);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Asignar GH Points</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asignar por Evento */}
        <div className="lg:col-span-2">
          <Card className="bg-card/50 border-white/10">
            <CardHeader>
              <CardTitle>Asignar por Evento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Event Selection */}
              <div className="space-y-2">
                <Label>Evento</Label>
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Selecciona un evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.name} (+{event.pointsValue} pts)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedEvent_ && (
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm">
                    Cada miembro seleccionado recibirá{" "}
                    <span className="font-bold text-primary">
                      +{selectedEvent_.pointsValue} GH Points
                    </span>
                  </p>
                </div>
              )}

              <Separator />

              {/* Filters */}
              <div className="flex gap-4">
                <Input
                  placeholder="Buscar miembro..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-background/50 flex-1"
                />
                <Select value={filterCommittee} onValueChange={setFilterCommittee}>
                  <SelectTrigger className="w-48 bg-background/50">
                    <SelectValue placeholder="Filtrar por comité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos los comités</SelectItem>
                    {committees.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selection actions */}
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {selectedMembers.length} de {filteredMembers.length} seleccionados
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAll}>
                    Seleccionar todos
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearSelection}>
                    Limpiar
                  </Button>
                </div>
              </div>

              {/* Member grid */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => toggleMember(member.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors flex justify-between items-center ${
                      selectedMembers.includes(member.id)
                        ? "bg-primary/20 border border-primary"
                        : "bg-background/30 border border-white/5 hover:border-white/20"
                    }`}
                  >
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <div className="flex gap-1 mt-1">
                        {member.committees.map((mc) => (
                          <Badge key={mc.committee.id} variant="outline" className="text-xs">
                            {mc.committee.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={member.type === "ACTIVE" ? "default" : "secondary"}>
                        {member.type === "ACTIVE" ? "Activo" : "Nuevo"}
                      </Badge>
                      {selectedMembers.includes(member.id) && (
                        <span className="text-primary text-lg">✓</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={assignPoints}
                disabled={!selectedEvent || selectedMembers.length === 0 || saving}
                className="w-full bg-primary"
              >
                {saving
                  ? "Asignando..."
                  : `Asignar ${selectedEvent_ ? `+${selectedEvent_.pointsValue}` : ""} pts a ${selectedMembers.length} miembros`}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Committee Bonus */}
        <div>
          <Card className="bg-card/50 border-white/10">
            <CardHeader>
              <CardTitle>Bonus a Comité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Asigna puntos directos a un comité (dinámicas especiales, bonificaciones, etc.)
              </p>

              <div className="space-y-2">
                <Label>Comité</Label>
                <Select value={bonusCommittee} onValueChange={setBonusCommittee}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Selecciona comité" />
                  </SelectTrigger>
                  <SelectContent>
                    {committees.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Puntos</Label>
                <Input
                  type="number"
                  min="1"
                  value={bonusPoints}
                  onChange={(e) => setBonusPoints(parseInt(e.target.value) || 1)}
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label>Razón</Label>
                <Input
                  value={bonusReason}
                  onChange={(e) => setBonusReason(e.target.value)}
                  placeholder="Ej: Mejor decoración semana X"
                  className="bg-background/50"
                />
              </div>

              <Button
                onClick={assignCommitteeBonus}
                disabled={!bonusCommittee || !bonusReason || saving}
                className="w-full bg-orange"
              >
                {saving ? "Asignando..." : `Asignar +${bonusPoints} pts`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
