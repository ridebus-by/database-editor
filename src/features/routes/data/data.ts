import { IconBolt, IconBus, IconDeer, IconPlant2, IconShip, IconWindmill } from "@tabler/icons-react";

export const routeTypes = [
  {
    label: 'Автобус',
    value: '-OChj3_m8zd9ZFj9yYmI',
    icon: IconBus,
  },
  {
    label: 'Маршрутка',
    value: '-OChj8N1wIBLdvUOb957',
    icon: IconBolt,
  },
  {
    label: 'Экспресс',
    value: '-OChjC6cijFaSmq2QbHN',
    icon: IconWindmill,
  }
] as const

export const cities = [
  {
    label: 'Полоцк',
    value: 294116064,
    icon: IconShip,
  },
  {
    label: 'Новополоцк',
    value: 524164709,
    icon: IconPlant2,
  },
  {
    label: 'Россоны',
    value: 1251525154,
    icon: IconDeer,
  }
] as const