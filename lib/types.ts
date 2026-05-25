export interface Machine {
  id: string
  name: string
  workCenter: string
  oee: number
  status: 'running' | 'idle' | 'downtime'
  availability: number
}

export interface WorkCenter {
  id: string
  name: string
  machines: Machine[]
  production_line: number
}

export interface Material {
  id: string
  name: string
  sku: string
  quantity: number
  capacity: number
  consumption_rate: number
}

export interface BOMComponent {
  material_id: string
  quantity: number
}

export interface BOM {
  id: string
  product: string
  components: BOMComponent[]
}

export interface Order {
  id: string
  product: string
  quantity: number
  status: 'queued' | 'processing' | 'halted'
  workCenter: string
  startTime: string
  completion: number
}
