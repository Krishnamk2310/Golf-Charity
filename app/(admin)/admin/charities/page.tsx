"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Star, Heart, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

const EMPTY_FORM = { name: "", description: "", imageUrl: "", websiteUrl: "", isFeatured: false }

export default function AdminCharitiesPage() {
  const { toast } = useToast()
  const [charities, setCharities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<any>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<any>(null)

  useEffect(() => { fetchCharities() }, [])

  const fetchCharities = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/charities")
      const data = await res.json()
      if (res.ok) setCharities(data.charities)
    } finally { setLoading(false) }
  }

  const openCreate = () => {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setFormOpen(true)
  }

  const openEdit = (charity: any) => {
    setEditTarget(charity)
    setForm({ name: charity.name, description: charity.description, imageUrl: charity.imageUrl || "", websiteUrl: charity.websiteUrl || "", isFeatured: charity.isFeatured })
    setFormOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const url = editTarget ? `/api/admin/charities/${editTarget.id}` : "/api/admin/charities"
      const method = editTarget ? "PUT" : "POST"
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast({ title: editTarget ? "Charity updated" : "Charity created" })
      setFormOpen(false)
      setEditTarget(null)
      fetchCharities()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/admin/charities/${deleteTarget.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")
      toast({ title: "Charity deleted" })
      setDeleteTarget(null)
      fetchCharities()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-xl border-l-4 border-l-rose-500 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold flex items-center"><Heart className="w-5 h-5 mr-2 text-rose-500"/> Charity Management</h1>
          <p className="text-muted-foreground mt-1">Add, edit, and feature your partner charities.</p>
        </div>
        <Button onClick={openCreate} className="bg-rose-600 hover:bg-rose-700">
          <Plus className="w-4 h-4 mr-2" /> Add Charity
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Charities ({charities.length})</CardTitle>
          <CardDescription>Only one charity can be featured at a time. Toggle to change.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-3"><div className="h-16 bg-slate-200 rounded"/><div className="h-16 bg-slate-200 rounded"/></div>
          ) : charities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No charities yet. Add your first one!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-4 py-3">Charity</th>
                    <th className="px-4 py-3">Events</th>
                    <th className="px-4 py-3">Featured</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {charities.map(c => (
                    <tr key={c.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold">{c.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{c.description}</p>
                      </td>
                      <td className="px-4 py-3">{c._count?.events || 0} events</td>
                      <td className="px-4 py-3">
                        {c.isFeatured ? (
                          <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-400">
                            <Star className="w-3 h-3 mr-1 fill-yellow-900" /> Featured
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setDeleteTarget(c)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Charity" : "Add New Charity"}</DialogTitle>
            <DialogDescription>Fill in all fields. Featured toggles off any previously featured charity.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 py-4">
            <div className="space-y-2"><Label>Name</Label><Input required value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} /></div>
            <div className="space-y-2"><Label>Description</Label>
              <textarea required rows={4} className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} />
            </div>
            <div className="space-y-2"><Label>Image URL (Cloudinary or external)</Label><Input value={form.imageUrl} onChange={e => setForm(p => ({...p, imageUrl: e.target.value}))} placeholder="https://..." /></div>
            <div className="space-y-2"><Label>Website URL</Label><Input type="url" value={form.websiteUrl} onChange={e => setForm(p => ({...p, websiteUrl: e.target.value}))} placeholder="https://..." /></div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <button type="button" onClick={() => setForm(p => ({...p, isFeatured: !p.isFeatured}))} className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${form.isFeatured ? 'bg-yellow-400 border-yellow-400' : 'border-slate-400'}`}>
                {form.isFeatured && <Check className="w-3 h-3 text-yellow-900" />}
              </button>
              <label className="text-sm font-medium cursor-pointer" onClick={() => setForm(p => ({...p, isFeatured: !p.isFeatured}))}>
                Mark as Featured Charity (replaces current featured)
              </label>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : (editTarget ? "Save Changes" : "Create Charity")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete "{deleteTarget?.name}"?</DialogTitle>
            <DialogDescription>This action cannot be undone. All associated data will be lost.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
