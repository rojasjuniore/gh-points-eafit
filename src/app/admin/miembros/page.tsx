"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Committee = { id: string; name: string };
type Member = {
  id: string;
  name: string;
  email: string;
  type: "NEW" | "ACTIVE";
  points: number;
  committees: { committee: Committee }[];
};

export default function MiembrosPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [form, setForm] = useState({
    name: "",
    email: "",
    type: "NEW" as "NEW" | "ACTIVE",
    committeeIds: [] as string[],
  });

  async function fetchData() {
    const [membersRes, committeesRes] = await Promise.all([
      fetch("/api/members"),
      fetch("/api/committees"),
    ]);
    setMembers(await membersRes.json());
    setCommittees(await committeesRes.json());
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/members/${editingId}` : "/api/members";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setDialogOpen(false);
    setEditingId(null);
    setForm({ name: "", email: "", type: "NEW", committeeIds: [] });
    fetchData();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este miembro?")) return;
    await fetch(`/api/members/${id}`, { method: "DELETE" });
    fetchData();
  }

  function openEdit(member: Member) {
    setEditingId(member.id);
    setForm({
      name: member.name,
      email: member.email,
      type: member.type,
      committeeIds: member.committees.map((c) => c.committee.id),
    });
    setDialogOpen(true);
  }

  function openNew() {
    setEditingId(null);
    setForm({ name: "", email: "", type: "NEW", committeeIds: [] });
    setDialogOpen(true);
  }

  function toggleCommittee(id: string) {
    setForm((prev) => {
      const has = prev.committeeIds.includes(id);
      if (has) {
        return { ...prev, committeeIds: prev.committeeIds.filter((c) => c !== id) };
      }
      if (prev.committeeIds.length >= 3) {
        alert("Máximo 3 comités por miembro");
        return prev;
      }
      return { ...prev, committeeIds: [...prev.committeeIds, id] };
    });
  }

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "ALL" || m.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Miembros</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="bg-primary">
              + Nuevo Miembro
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-white/10 max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar Miembro" : "Nuevo Miembro"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v as "NEW" | "ACTIVE" })}
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">Nuevo</SelectItem>
                    <SelectItem value="ACTIVE">Activo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Comités (máx. 3)</Label>
                <div className="flex flex-wrap gap-2">
                  {committees.map((c) => (
                    <Badge
                      key={c.id}
                      variant={
                        form.committeeIds.includes(c.id) ? "default" : "secondary"
                      }
                      className="cursor-pointer"
                      onClick={() => toggleCommittee(c.id)}
                    >
                      {c.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary">
                {editingId ? "Guardar" : "Crear"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm bg-card/50 border-white/10"
        />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40 bg-card/50 border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            <SelectItem value="NEW">Nuevos</SelectItem>
            <SelectItem value="ACTIVE">Activos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-card/50 border-white/10">
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-center text-muted-foreground">Cargando...</p>
          ) : filteredMembers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Comités</TableHead>
                  <TableHead>Puntos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id} className="border-white/10">
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {member.email}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={member.type === "ACTIVE" ? "default" : "secondary"}
                      >
                        {member.type === "ACTIVE" ? "Activo" : "Nuevo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {member.committees.map((mc) => (
                          <Badge key={mc.committee.id} variant="outline" className="text-xs">
                            {mc.committee.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-primary font-bold">
                      {member.points}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(member)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDelete(member.id)}
                      >
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {search || filterType !== "ALL"
                ? "No se encontraron miembros"
                : "No hay miembros. Crea el primero."}
            </p>
          )}
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground mt-4">
        Mostrando {filteredMembers.length} de {members.length} miembros
      </p>
    </div>
  );
}
