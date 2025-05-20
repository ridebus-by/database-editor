import { useRoutes } from "../context/routes-context"
import { RoutesActionDialog } from "./routes-action-dialog"
import { RoutesDeleteDialog } from "./routes-delete-dialog"

export function RoutesDialogs() {
    const { open, setOpen, currentRow, setCurrentRow } = useRoutes()
    return (
      <>
        <RoutesActionDialog
          key='route-add'
          open={open === 'add'}
          onOpenChange={() => setOpen('add')}
        />
  
        {currentRow && (
          <>
            <RoutesActionDialog
              key={`route-edit-${currentRow.id}`}
              open={open === 'edit'}
              onOpenChange={() => {
                setOpen(null)
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }}
              currentRow={currentRow}
            />
            
            <RoutesDeleteDialog
              key={`route-delete-${currentRow.id}`}
              open={open === 'delete'}
              onOpenChange={() => {
                setOpen(null)
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }}
              currentRow={currentRow}
            />
          </>
        )}
      </>
    )
  }
