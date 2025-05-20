import { ColumnDef, Row } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import LongText from '@/components/long-text'
import { DataTableColumnHeader } from '../../../components/data-table-column-header'
import { Route } from '../data/schema'
import { DataTableRowActions } from './routes-table-row-actions'
import { CityCell } from '@/components/city-cell'
import { TypeCell } from '@/components/type-cell'

// Функция для выбора всех строк на странице
function SelectAllCheckbox({ table }: { table: any }) {
  return (
    <Checkbox
      checked={
        table.getIsAllPageRowsSelected() ||
        (table.getIsSomePageRowsSelected() && "indeterminate")
      }
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label="Select all"
      className="translate-y-[2px]"
    />
  )
}

// Функция для выбора одной строки
function SelectRowCheckbox({ row }: { row: Row<Route> }) {
  return (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(value) => row.toggleSelected(!!value)}
      aria-label="Select row"
      className="translate-y-[2px]"
    />
  )
}

export const columns: ColumnDef<Route>[] = [
  // Колонка с чекбоксом для выбора строк
  {
    id: 'select',
    header: ({ table }) => <SelectAllCheckbox table={table} />,
    cell: ({ row }) => <SelectRowCheckbox row={row} />,
    enableSorting: false,
    enableHiding: false,
    meta: {
      className: 'w-12'
    }
  },
  {
    accessorKey: 'number',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Номер' />
    ),
    cell: ({ row }) => <span>{row.getValue('number')}</span>,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Название' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-xs'>{row.getValue('title')}</LongText>
    ),
    enableHiding: false,
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Описание' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-md'>{row.getValue('description')}</LongText>
    ),
    enableHiding: false,
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
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'typeId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Тип транспорта' />
    ),
    cell: ({ row }) => {
      return <TypeCell typeId={row.original.typeId} />
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
