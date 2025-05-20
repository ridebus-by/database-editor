import { IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useStops } from '../context/stops-context'

export function StopsPrimaryButtons() {
  const { setOpen, loading, error } = useStops()
  const disabled = loading || Boolean(error)

  return (
    <div className='flex gap-2'>
      <Button disabled={disabled} className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Stop</span> <IconPlus size={18} />
      </Button>
    </div>
  )
}