import { Button } from "@/components/ui/button"
import { Table } from "@tanstack/react-table"
import { Route } from "../data/schema"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRoutes } from "../context/routes-context"
import { IconCheck, IconTrash, IconWifi } from "@tabler/icons-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface RoutesBulkActionsProps {
  table: Table<Route>
}

export function RoutesBulkActions({ table }: RoutesBulkActionsProps) {
  const [openDialog, setOpenDialog] = useState<'delete' | 'update' | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const { deleteRoute, updateRoute } = useRoutes()
  
  // Получаем выбранные строки
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedCount = selectedRows.length
  
  // Состояние для массового обновления
  const [updateOptions, setUpdateOptions] = useState({
    isWifiAvailable: false,
    isQRCodeAvailable: false,
    isEcological: false,
    isLowFloor: false,
    isCashAccepted: false
  })
  
  // Обработчик массового удаления
  const handleBulkDelete = async () => {
    try {
      setIsProcessing(true)
      
      // Последовательно удаляем все выбранные маршруты
      for (const row of selectedRows) {
        await deleteRoute(row.original.id)
      }
      
      // Сбрасываем выделение
      table.resetRowSelection()
      setOpenDialog(null)
    } catch (error) {
      console.error("Ошибка при массовом удалении:", error)
    } finally {
      setIsProcessing(false)
    }
  }
  
  // Обработчик массового обновления
  const handleBulkUpdate = async () => {
    try {
      setIsProcessing(true)
      
      // Собираем только те поля, которые нужно обновить
      const updateData: Partial<Route> = {}
      
      if (updateOptions.isWifiAvailable) updateData.isWifiAvailable = true
      if (updateOptions.isQRCodeAvailable) updateData.isQRCodeAvailable = true
      if (updateOptions.isEcological) updateData.isEcological = true
      if (updateOptions.isLowFloor) updateData.isLowFloor = true
      if (updateOptions.isCashAccepted) updateData.isCashAccepted = true
      
      // Последовательно обновляем все выбранные маршруты
      for (const row of selectedRows) {
        await updateRoute(row.original.id, updateData)
      }
      
      // Сбрасываем выделение и закрываем диалог
      table.resetRowSelection()
      setOpenDialog(null)
      
      // Сбрасываем опции обновления
      setUpdateOptions({
        isWifiAvailable: false,
        isQRCodeAvailable: false,
        isEcological: false,
        isLowFloor: false,
        isCashAccepted: false
      })
    } catch (error) {
      console.error("Ошибка при массовом обновлении:", error)
    } finally {
      setIsProcessing(false)
    }
  }
  
  if (selectedCount === 0) return null
  
  return (
    <>
      <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md mb-2">
        <span className="text-sm font-medium">Выбрано: {selectedCount}</span>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => setOpenDialog('update')}
          className="ml-2"
        >
          <IconCheck className="mr-1 h-4 w-4" />
          Обновить
        </Button>
        <Button 
          size="sm" 
          variant="destructive"
          onClick={() => setOpenDialog('delete')}
        >
          <IconTrash className="mr-1 h-4 w-4" />
          Удалить
        </Button>
      </div>
      
      {/* Диалог массового удаления */}
      <Dialog open={openDialog === 'delete'} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удаление маршрутов</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить {selectedCount} выбранных маршрутов? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)} disabled={isProcessing}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete} disabled={isProcessing}>
              {isProcessing ? "Удаление..." : "Удалить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Диалог массового обновления */}
      <Dialog open={openDialog === 'update'} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Обновление маршрутов</DialogTitle>
            <DialogDescription>
              Выберите параметры, которые нужно включить для {selectedCount} выбранных маршрутов.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="wifi" 
                checked={updateOptions.isWifiAvailable}
                onCheckedChange={(checked) => 
                  setUpdateOptions(prev => ({ ...prev, isWifiAvailable: checked === true }))
                }
              />
              <Label htmlFor="wifi" className="flex items-center">
                <IconWifi className="mr-2 h-4 w-4" />
                Wi-Fi в транспорте
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="qr" 
                checked={updateOptions.isQRCodeAvailable}
                onCheckedChange={(checked) => 
                  setUpdateOptions(prev => ({ ...prev, isQRCodeAvailable: checked === true }))
                }
              />
              <Label htmlFor="qr">Оплата по QR-коду</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="eco" 
                checked={updateOptions.isEcological}
                onCheckedChange={(checked) => 
                  setUpdateOptions(prev => ({ ...prev, isEcological: checked === true }))
                }
              />
              <Label htmlFor="eco">Экологичный транспорт</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="lowFloor" 
                checked={updateOptions.isLowFloor}
                onCheckedChange={(checked) => 
                  setUpdateOptions(prev => ({ ...prev, isLowFloor: checked === true }))
                }
              />
              <Label htmlFor="lowFloor">Низкопольный транспорт</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="cash" 
                checked={updateOptions.isCashAccepted}
                onCheckedChange={(checked) => 
                  setUpdateOptions(prev => ({ ...prev, isCashAccepted: checked === true }))
                }
              />
              <Label htmlFor="cash">Оплата наличными</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)} disabled={isProcessing}>
              Отмена
            </Button>
            <Button onClick={handleBulkUpdate} disabled={isProcessing}>
              {isProcessing ? "Обновление..." : "Обновить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
