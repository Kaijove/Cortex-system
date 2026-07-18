import { create } from 'zustand'
import type {
  DockerContainer,
  DockerContainerStatus,
  FsNode,
  PackageInfo,
  SensorReading,
  Snapshot,
  VirtualMachine,
  VmStatus,
} from '@/types/tools'
import type { TimeSeriesPoint } from '@/types/system'
import {
  createMockDockerContainers,
  createMockDockerImages,
  createMockDockerNetworks,
  createMockDockerVolumes,
  createMockFileSystem,
  createMockPackages,
  createMockStorageCategories,
  createMockVirtualMachines,
} from '@/lib/mockToolsData'
import { useSystemStore } from './systemStore'
import { useNetworkSuiteStore } from './networkSuiteStore'
import { nowLabel } from '@/lib/utils'

const HISTORY_LENGTH = 60

function pushPoint(history: TimeSeriesPoint[], value: number): TimeSeriesPoint[] {
  const next = [...history, { time: nowLabel(), value }]
  return next.length > HISTORY_LENGTH ? next.slice(next.length - HISTORY_LENGTH) : next
}

function buildInitialSensors(): SensorReading[] {
  return [
    { id: 'cpu-temp', label: 'CPU', category: 'temperature', unit: '°C', current: 0, min: 0, max: 0, avg: 0, isReal: true },
    { id: 'gpu-temp', label: 'GPU', category: 'temperature', unit: '°C', current: 0, min: 0, max: 0, avg: 0, isReal: false },
    { id: 'mobo-temp', label: 'Placa base', category: 'temperature', unit: '°C', current: 34, min: 32, max: 38, avg: 34, isReal: false },
    { id: 'ssd-temp', label: 'SSD', category: 'temperature', unit: '°C', current: 41, min: 38, max: 46, avg: 41, isReal: false },
    { id: 'vrm-temp', label: 'VRM', category: 'temperature', unit: '°C', current: 52, min: 48, max: 61, avg: 53, isReal: false },
    { id: 'fan1', label: 'Ventilador CPU', category: 'fan', unit: 'RPM', current: 1450, min: 900, max: 2100, avg: 1400, isReal: false },
    { id: 'fan2', label: 'Ventilador xassís', category: 'fan', unit: 'RPM', current: 980, min: 700, max: 1300, avg: 950, isReal: false },
    { id: 'power', label: 'Consum total', category: 'power', unit: 'W', current: 0, min: 0, max: 0, avg: 0, isReal: false },
    { id: 'voltage', label: 'Voltatge CPU', category: 'voltage', unit: 'V', current: 1.24, min: 1.15, max: 1.35, avg: 1.24, isReal: false },
  ]
}

function toggleFsFavorite(node: FsNode, id: string): FsNode {
  if (node.id === id) return { ...node, favorite: !node.favorite }
  if (!node.children) return node
  return { ...node, children: node.children.map((c) => toggleFsFavorite(c, id)) }
}

interface ToolsState {
  selectedProcessPid: number | null
  pinnedProcessPids: Set<number>
  terminatedProcessPids: Set<number>
  processHistories: Record<number, { cpu: TimeSeriesPoint[]; ram: TimeSeriesPoint[] }>

  gpuUsageHistory: TimeSeriesPoint[]
  gpuTempHistory: TimeSeriesPoint[]

  sensors: SensorReading[]

  fileSystem: FsNode
  currentPath: string[]

  dockerContainers: DockerContainer[]
  dockerImages: ReturnType<typeof createMockDockerImages>
  dockerVolumes: ReturnType<typeof createMockDockerVolumes>
  dockerNetworks: ReturnType<typeof createMockDockerNetworks>
  expandedContainerId: string | null

  vms: VirtualMachine[]

  packages: PackageInfo[]

  storageCategories: ReturnType<typeof createMockStorageCategories>

  snapshots: Snapshot[]
  compareIds: [string | null, string | null]

  tick: () => void
  selectProcess: (pid: number | null) => void
  togglePinProcess: (pid: number) => void
  terminateProcess: (pid: number) => void
  restartProcess: (pid: number) => void
  navigateTo: (path: string[]) => void
  toggleFavorite: (id: string) => void
  dockerAction: (id: string, action: 'start' | 'stop' | 'restart') => void
  toggleContainerExpand: (id: string) => void
  vmAction: (id: string, action: 'start' | 'stop' | 'restart') => void
  updatePackage: (id: string) => void
  updateAllPackages: () => void
  takeSnapshot: (label?: string) => void
  deleteSnapshot: (id: string) => void
  setCompare: (slot: 0 | 1, id: string | null) => void
}

export const useToolsStore = create<ToolsState>((set, get) => ({
  selectedProcessPid: null,
  pinnedProcessPids: new Set(),
  terminatedProcessPids: new Set(),
  processHistories: {},

  gpuUsageHistory: [],
  gpuTempHistory: [],

  sensors: buildInitialSensors(),

  fileSystem: createMockFileSystem(),
  currentPath: [],

  dockerContainers: createMockDockerContainers(),
  dockerImages: createMockDockerImages(),
  dockerVolumes: createMockDockerVolumes(),
  dockerNetworks: createMockDockerNetworks(),
  expandedContainerId: null,

  vms: createMockVirtualMachines(),

  packages: createMockPackages(),

  storageCategories: createMockStorageCategories(),

  snapshots: [],
  compareIds: [null, null],

  tick: () => {
    const { cpu, gpu, processes } = useSystemStore.getState()

    set((s) => {
      const trackedPids = new Set([...s.pinnedProcessPids, ...(s.selectedProcessPid ? [s.selectedProcessPid] : [])])
      const processHistories = { ...s.processHistories }
      trackedPids.forEach((pid) => {
        const proc = processes.find((p) => p.pid === pid)
        if (!proc) return
        const prev = processHistories[pid] ?? { cpu: [], ram: [] }
        processHistories[pid] = { cpu: pushPoint(prev.cpu, proc.cpu), ram: pushPoint(prev.ram, proc.ram) }
      })

      const sensors = s.sensors.map((sensor) => {
        if (sensor.id === 'cpu-temp') {
          const value = cpu.temperatureC ?? sensor.current
          return { ...sensor, current: value, min: Math.min(sensor.min || value, value), max: Math.max(sensor.max, value), avg: sensor.avg * 0.9 + value * 0.1 }
        }
        if (sensor.id === 'gpu-temp') {
          return { ...sensor, current: gpu.temperatureC, min: Math.min(sensor.min || gpu.temperatureC, gpu.temperatureC), max: Math.max(sensor.max, gpu.temperatureC), avg: sensor.avg * 0.9 + gpu.temperatureC * 0.1 }
        }
        if (sensor.id === 'power') {
          const value = gpu.powerDrawW + 45
          return { ...sensor, current: value, min: Math.min(sensor.min || value, value), max: Math.max(sensor.max, value), avg: sensor.avg * 0.9 + value * 0.1 }
        }
        return sensor
      })

      return {
        processHistories,
        gpuUsageHistory: pushPoint(s.gpuUsageHistory, gpu.usagePercent),
        gpuTempHistory: pushPoint(s.gpuTempHistory, gpu.temperatureC),
        sensors,
      }
    })
  },

  selectProcess: (pid) => set({ selectedProcessPid: pid }),
  togglePinProcess: (pid) =>
    set((s) => {
      const next = new Set(s.pinnedProcessPids)
      if (next.has(pid)) next.delete(pid)
      else next.add(pid)
      return { pinnedProcessPids: next }
    }),
  terminateProcess: (pid) => set((s) => ({ terminatedProcessPids: new Set(s.terminatedProcessPids).add(pid) })),
  restartProcess: () => {
    // Simulated: no real process is restarted. Intentionally a no-op beyond UI feedback,
    // handled by the calling component (toast/animation), to avoid faking a state change.
  },

  navigateTo: (path) => set({ currentPath: path }),
  toggleFavorite: (id) => set((s) => ({ fileSystem: toggleFsFavorite(s.fileSystem, id) })),

  dockerAction: (id, action) =>
    set((s) => ({
      dockerContainers: s.dockerContainers.map((c) => {
        if (c.id !== id) return c
        const status: DockerContainerStatus = action === 'stop' ? 'stopped' : action === 'restart' ? 'restarting' : 'running'
        return { ...c, status, uptime: action === 'stop' ? '—' : '0m' }
      }),
    })),
  toggleContainerExpand: (id) => set((s) => ({ expandedContainerId: s.expandedContainerId === id ? null : id })),

  vmAction: (id, action) =>
    set((s) => ({
      vms: s.vms.map((vm) => {
        if (vm.id !== id) return vm
        const status: VmStatus = action === 'stop' ? 'stopped' : 'running'
        return { ...vm, status, uptime: action === 'stop' ? '—' : '0m' }
      }),
    })),

  updatePackage: (id) =>
    set((s) => ({
      packages: s.packages.map((p) => (p.id === id ? { ...p, version: p.latestVersion ?? p.version, hasUpdate: false } : p)),
    })),
  updateAllPackages: () =>
    set((s) => ({
      packages: s.packages.map((p) => (p.hasUpdate ? { ...p, version: p.latestVersion ?? p.version, hasUpdate: false } : p)),
    })),

  takeSnapshot: (label) => {
    const { cpu, ram, disk, healthScore } = useSystemStore.getState()
    const { bandwidth } = useNetworkSuiteStore.getState()
    const diskTotal = disk.partitions.reduce((sum, p) => sum + p.totalGB, 0)
    const diskUsed = disk.partitions.reduce((sum, p) => sum + p.usedGB, 0)
    const snapshot: Snapshot = {
      id: `snap-${Date.now()}`,
      label: label?.trim() || `Snapshot ${get().snapshots.length + 1}`,
      timestamp: nowLabel(),
      healthScore: healthScore.value,
      cpuUsage: cpu.usage,
      ramUsedGB: ram.usedGB,
      ramTotalGB: ram.totalGB,
      diskUsedGB: diskUsed,
      diskTotalGB: diskTotal,
      downloadMbps: bandwidth.currentDownMbps,
      uploadMbps: bandwidth.currentUpMbps,
    }
    set((s) => ({ snapshots: [snapshot, ...s.snapshots].slice(0, 30) }))
  },
  deleteSnapshot: (id) => set((s) => ({ snapshots: s.snapshots.filter((sn) => sn.id !== id) })),
  setCompare: (slot, id) =>
    set((s) => {
      const next: [string | null, string | null] = [...s.compareIds]
      next[slot] = id
      return { compareIds: next }
    }),
}))
