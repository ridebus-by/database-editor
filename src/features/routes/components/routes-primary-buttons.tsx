import { IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useRoutes } from '../context/routes-context'

export function RoutesPrimaryButtons() {
  const { setOpen, loading, error } = useRoutes()
  const disabled = loading || Boolean(error)

  return (
    <div className='flex gap-2'>
      <Button disabled={disabled} className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Route</span> <IconPlus size={18} />
      </Button>
    </div>
  )
}