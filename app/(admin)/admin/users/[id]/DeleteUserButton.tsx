"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useTransition } from "react"
import { deleteUser } from "./actions"
import { useToast } from "@/hooks/use-toast"

export function DeleteUserButton({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleDelete = () => {
    if (confirm("Are you sure you want to permanently delete this user account? This cannot be undone.")) {
      startTransition(async () => {
        try {
          await deleteUser(userId)
        } catch (e: any) {
           toast({ title: "Error deleting user", description: e.message, variant: "destructive" })
        }
      })
    }
  }

  return (
    <Button 
      variant="outline" 
      onClick={handleDelete}
      disabled={isPending}
      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      <Trash2 className="h-4 w-4 mr-2" /> 
      {isPending ? "Deleting..." : "Delete Account"}
    </Button>
  )
}
