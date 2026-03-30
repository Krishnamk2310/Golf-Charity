"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Eye, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchUsers(searchTerm)
  }, [searchTerm])

  const fetchUsers = async (search: string) => {
    try {
      const res = await fetch(`/api/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`)
      const data = await res.json()
      if (res.ok) setUsers(data.users)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-900 p-6 rounded-xl border-l-4 border-l-indigo-500 shadow-sm gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center"><Users className="w-5 h-5 mr-2 text-indigo-500"/> User Management</h1>
          <p className="text-muted-foreground mt-1">Search, view, and manage player accounts and subscriptions.</p>
        </div>
        <div className="w-full sm:w-auto relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search name or email..." 
            className="pl-9 w-full sm:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Users</CardTitle>
          <CardDescription>Click a row or the action button to view details and manage the user.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-slate-200 rounded"></div>
              <div className="h-10 bg-slate-200 rounded"></div>
              <div className="h-10 bg-slate-200 rounded"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No users found matching your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Joined Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => {
                    const latestSub = user.subscriptions[0]
                    return (
                      <tr key={user.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="px-4 py-3 font-medium">{user.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={user.role === 'ADMIN' ? 'border-primary text-primary' : ''}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {latestSub ? latestSub.plan : <span className="text-muted-foreground">-</span>}
                        </td>
                        <td className="px-4 py-3">
                          {latestSub ? (
                            <Badge variant={latestSub.status === "ACTIVE" ? "default" : "secondary"}>
                              {latestSub.status}
                            </Badge>
                          ) : <span className="text-muted-foreground">NO SUB</span>}
                        </td>
                        <td className="px-4 py-3">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/admin/users/${user.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
