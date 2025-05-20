import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import LongText from '@/components/long-text'
import { DataTableColumnHeader } from '../../../components/data-table-column-header'
import { Stop } from '../data/schema'
import { DataTableRowActions } from './stops-table-row-actions'
import { CityCell } from '@/components/city-cell'

export const columns: ColumnDef<Stop>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Название' />
    ),
    cell: ({ row }) => <span>{row.getValue('name')}</span>,
  },
  {
    accessorKey: 'direction',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Направление' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-xs'>{row.getValue('direction')}</LongText>
    ),
  },
  {
    accessorKey: 'cityId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Город' />
    ),
    cell: ({ row }) => {
      return <CityCell cityId={row.original.cityId} />
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'latitude',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Широта' />
    ),
    cell: ({ row }) => <span>{row.getValue('latitude')}</span>,
  },
  {
    accessorKey: 'longitude',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Долгота' />
    ),
    cell: ({ row }) => <span>{row.getValue('longitude')}</span>,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]