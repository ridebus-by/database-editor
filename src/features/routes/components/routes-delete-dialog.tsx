import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRoutes } from "../context/routes-context"
import { Route } from "../data/schema"
import { useState } from "react"

interface Props {
  currentRow: Route
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RoutesDeleteDialog({ currentRow, open, onOpenChange }: Props) {
  const { deleteRoute } = useRoutes()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteRoute(currentRow.id)
      onOpenChange(false)
    } catch (error) {
      console.error("Ошибка при удалении маршрута:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Удаление маршрута</DialogTitle>
          <DialogDescription>
            Вы уверены, что хотите удалить маршрут "{currentRow.number} {currentRow.title}"?
            Это действие нельзя отменить.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Отмена
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Удаление..." : "Удалить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
