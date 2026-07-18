import { invoke } from '@tauri-apps/api/tauri'

// Mirrors the *Dto structs on the Rust side (src-tauri/src/main.rs).
// Field names are camelCase because the structs there use
// #[serde(rename_all = "camelCase")].

export interface RealCpuCore {
  id: number
  usage: number
  clockSpeedGhz: number
}

export interface RealCpu {
  usage: number
  cores: RealCpuCore[]
  threads: number
  temperatureC: number | null
}

export interface RealRam {
  totalGb: number
  usedGb: number
  availableGb: number
  swapTotalGb: number
  swapUsedGb: number
}

export interface RealDiskPartition {
  id: string
  mountPoint: string
  totalGb: number
  usedGb: number
  filesystem: string
}

export interface RealDisk {
  partitions: RealDiskPartition[]
}

export interface RealNetworkInterface {
  name: string
  uploadBytesDelta: number
  downloadBytesDelta: number
}

export interface RealNetwork {
  interfaces: RealNetworkInterface[]
}

export interface RealDiskIo {
  readBytesDelta: number
  writeBytesDelta: number
}

export interface RealProcess {
  pid: number
  name: string
  cpu: number
  ramMb: number
  status: string
  runTimeSeconds: number
  owner: string
}

export interface RealSystemInfo {
  hostname: string
  os: string
  kernel: string
  uptimeSeconds: number
}

export interface RealSnapshot {
  cpu: RealCpu
  ram: RealRam
  disk: RealDisk
  diskIo: RealDiskIo
  network: RealNetwork
  processes: RealProcess[]
  systemInfo: RealSystemInfo
}

/** Calls the Rust `get_snapshot` command. Only works inside the Tauri shell. */
export function fetchRealSnapshot(): Promise<RealSnapshot> {
  return invoke<RealSnapshot>('get_snapshot')
}
