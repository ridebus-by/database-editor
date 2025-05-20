import { Cross2Icon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableFacetedFilter } from '@/components/data-table-faceted-filter'
import { routeTypes } from '../data/data'
import { useEffect, useState } from 'react'
import { child, get, ref } from 'firebase/database'
import { db } from '@/lib/firebase'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

interface CitiesOption {
  label: string
  value: string
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const [cityOptions, setCityOptions] = useState<CitiesOption[]>([])

  useEffect(() => {
    async function loadCities() {
      try {
        const snap = await get(child(ref(db), 'city'))
        if (!snap.exists()) return
        const obj = snap.val() as Record<
          string,
          { id?: number; name: string }
        >
        const opts = Object.values(obj)
          .filter((c) => c.id !== undefined)
          .map((c) => ({
            label: c.name,
            // TanStack Filter expects string[] of values
            value: String(c.id),
          }))
        setCityOptions(opts)
      } catch (e) {
        console.error('Failed to load cities', e)
      }
    }
    loadCities()
  }, [])

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <Input
          placeholder='Filter routes...'
          value={
            (table.getColumn('title')?.getFilterValue() as string) ?? ''
          }
          onChange={(event) =>
            table.getColumn('title')?.setFilterValue(event.target.value)
          }
          className='h-8 w-[150px] lg:w-[250px]'
        />
        <div className='flex gap-x-2'>
          {table.getColumn('typeId') && (
            <DataTableFacetedFilter
              column={table.getColumn('typeId')}
              title='Type'
              options={routeTypes.map((t) => ({ ...t }))}
            />
          )}
          {table.getColumn('cityId') && (
            <DataTableFacetedFilter
              column={table.getColumn('cityId')}
              title='City'
              options={cityOptions}
            />
          )}
        </div>
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => table.resetColumnFilters()}
            className='h-8 px-2 lg:px-3'
          >
            Reset
            <Cross2Icon className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>
    </div>
  )
}