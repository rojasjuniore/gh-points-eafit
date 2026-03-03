"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Committee = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  points: number;
  _count: { members: number };
};

export default function ComitesPage() {
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", color: "#d4a017" });

  async function fetchCommittees() {
    const res = await fetch("/api/committees");
    const data = await res.json();
    setCommittees(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchCommittees();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/committees/${editingId}` : "/api/committees";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setDialogOpen(false);
    setEditingId(null);
    setForm({ name: "", description: "", color: "#d4a017" });
    fetchCommittees();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este comité?")) return;
    await fetch(`/api/committees/${id}`, { method: "DELETE" });
    fetchCommittees();
  }

  function openEdit(committee: Committee) {
    setEditingId(committee.id);
    setForm({
      name: committee.name,
      description: committee.description || "",
      color: committee.color || "#d4a017",
    });
    setDialogOpen(true);
  }

  function openNew() {
    setEditingId(null);
    setForm({ name: "", description: "", color: "#d4a017" });
    setDialogOpen(true);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Comités</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="bg-primary">
              + Nuevo Comité
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-white/10">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar Comité" : "Nuevo Comité"}
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
                <Label>Descripción</Label>
                <Input
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Color (para podio)</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="bg-background/50 flex-1"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary">
                {editingId ? "Guardar" : "Crear"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card/50 border-white/10">
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-center text-muted-foreground">Cargando...</p>
          ) : committees.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Miembros</TableHead>
                  <TableHead>Puntos Directos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {committees.map((committee) => (
                  <TableRow key={committee.id} className="border-white/10">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: committee.color || "#d4a017" }}
                        />
                        {committee.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {committee.description || "-"}
                    </TableCell>
                    <TableCell>{committee._count.members}</TableCell>
                    <TableCell className="text-primary font-bold">
                      {committee.points}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(committee)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDelete(committee.id)}
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
              No hay comités. Crea el primero.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
