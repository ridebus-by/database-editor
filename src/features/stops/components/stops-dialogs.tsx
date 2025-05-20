import { useStops } from "../context/stops-context"
import { StopsActionDialog } from "./stops-action-dialog"

export function StopsDialogs() {
    const { open, setOpen, currentRow, setCurrentRow } = useStops()
    return (
      <>
        <StopsActionDialog
          key='route-add'
          open={open === 'add'}
          onOpenChange={() => setOpen('add')}
        />
  
        {currentRow && (
          <>
            <StopsActionDialog
              key={`route-edit-${currentRow.id}`}
              open={open === 'edit'}
              onOpenChange={() => {
                setOpen('edit')
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