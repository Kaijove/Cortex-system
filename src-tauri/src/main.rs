// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::Serialize;
use std::sync::Mutex;
use sysinfo::{Components, Disks, Networks, System, Users};

/// Shared, long-lived system handle. sysinfo needs to be refreshed twice
/// (with a delay) to compute accurate per-process/per-cpu percentages, so we
/// keep it alive across calls instead of recreating it every tick.
struct MonitorState {
    sys: Mutex<System>,
    networks: Mutex<Networks>,
    disks: Mutex<Disks>,
    components: Mutex<Components>,
    users: Users,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct CpuCoreDto {
    id: usize,
    usage: f32,
    clock_speed_ghz: f32,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct CpuDto {
    usage: f32,
    cores: Vec<CpuCoreDto>,
    threads: usize,
    /// None when the OS/hardware doesn't expose a temperature sensor sysinfo can read.
    /// Never fabricated — the frontend shows "N/D" in that case.
    temperature_c: Option<f32>,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct RamDto {
    total_gb: f64,
    used_gb: f64,
    available_gb: f64,
    swap_total_gb: f64,
    swap_used_gb: f64,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct DiskPartitionDto {
    id: String,
    mount_point: String,
    total_gb: f64,
    used_gb: f64,
    filesystem: String,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct DiskDto {
    partitions: Vec<DiskPartitionDto>,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct NetworkInterfaceDto {
    name: String,
    upload_bytes_delta: u64,
    download_bytes_delta: u64,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct NetworkDto {
    interfaces: Vec<NetworkInterfaceDto>,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct DiskIoDto {
    read_bytes_delta: u64,
    write_bytes_delta: u64,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct ProcessDto {
    pid: u32,
    name: String,
    cpu: f32,
    ram_mb: f64,
    status: String,
    run_time_seconds: u64,
    owner: String,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct SystemInfoDto {
    hostname: String,
    os: String,
    kernel: String,
    uptime_seconds: u64,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct Snapshot {
    cpu: CpuDto,
    ram: RamDto,
    disk: DiskDto,
    disk_io: DiskIoDto,
    network: NetworkDto,
    processes: Vec<ProcessDto>,
    system_info: SystemInfoDto,
}

const BYTES_PER_GB: f64 = 1024.0 * 1024.0 * 1024.0;

#[tauri::command]
fn get_snapshot(state: tauri::State<MonitorState>) -> Snapshot {
    let mut sys = state.sys.lock().unwrap();
    sys.refresh_cpu_usage();
    sys.refresh_memory();
    sys.refresh_processes();

    let mut networks = state.networks.lock().unwrap();
    networks.refresh();

    let mut disks = state.disks.lock().unwrap();
    disks.refresh();

    let cores: Vec<CpuCoreDto> = sys
        .cpus()
        .iter()
        .enumerate()
        .map(|(id, cpu)| CpuCoreDto {
            id,
            usage: cpu.cpu_usage(),
            clock_speed_ghz: cpu.frequency() as f32 / 1000.0,
        })
        .collect();

    let overall_usage = if cores.is_empty() {
        0.0
    } else {
        cores.iter().map(|c| c.usage).sum::<f32>() / cores.len() as f32
    };

    let mut components = state.components.lock().unwrap();
    components.refresh();
    let cpu_temp_readings: Vec<f32> = components
        .iter()
        .filter(|c| {
            let label = c.label().to_lowercase();
            label.contains("cpu") || label.contains("core") || label.contains("package")
        })
        .map(|c| c.temperature())
        .filter(|t| !t.is_nan())
        .collect();
    let temperature_c = if cpu_temp_readings.is_empty() {
        None
    } else {
        Some(cpu_temp_readings.iter().sum::<f32>() / cpu_temp_readings.len() as f32)
    };

    let cpu = CpuDto {
        usage: overall_usage,
        threads: cores.len(),
        cores,
        temperature_c,
    };

    let ram = RamDto {
        total_gb: sys.total_memory() as f64 / BYTES_PER_GB,
        used_gb: sys.used_memory() as f64 / BYTES_PER_GB,
        available_gb: sys.available_memory() as f64 / BYTES_PER_GB,
        swap_total_gb: sys.total_swap() as f64 / BYTES_PER_GB,
        swap_used_gb: sys.used_swap() as f64 / BYTES_PER_GB,
    };

    let partitions: Vec<DiskPartitionDto> = disks
        .iter()
        .map(|d| DiskPartitionDto {
            id: d.name().to_string_lossy().to_string(),
            mount_point: d.mount_point().to_string_lossy().to_string(),
            total_gb: d.total_space() as f64 / BYTES_PER_GB,
            used_gb: (d.total_space() - d.available_space()) as f64 / BYTES_PER_GB,
            filesystem: d.file_system().to_string_lossy().to_string(),
        })
        .collect();

    let interfaces: Vec<NetworkInterfaceDto> = networks
        .iter()
        .map(|(name, data)| NetworkInterfaceDto {
            name: name.clone(),
            // received()/transmitted() are deltas since the last refresh (this tick), not totals.
            upload_bytes_delta: data.transmitted(),
            download_bytes_delta: data.received(),
        })
        .collect();

    // sysinfo doesn't expose a single "global disk throughput" counter, so we
    // derive it from the sum of each process' disk I/O delta since the last
    // refresh (Process::disk_usage() bytes are also deltas, same as network).
    let (read_bytes_delta, write_bytes_delta) = sys.processes().values().fold(
        (0u64, 0u64),
        |(r, w), p| {
            let usage = p.disk_usage();
            (r + usage.read_bytes, w + usage.written_bytes)
        },
    );
    let disk_io = DiskIoDto {
        read_bytes_delta,
        write_bytes_delta,
    };

    let processes: Vec<ProcessDto> = sys
        .processes()
        .values()
        .take(80)
        .map(|p| {
            let owner = p
                .user_id()
                .and_then(|uid| state.users.get_user_by_id(uid))
                .map(|u| u.name().to_string())
                .unwrap_or_else(|| "?".to_string());
            ProcessDto {
                pid: p.pid().as_u32(),
                name: p.name().to_string(),
                cpu: p.cpu_usage(),
                ram_mb: p.memory() as f64 / (1024.0 * 1024.0),
                status: format!("{:?}", p.status()).to_lowercase(),
                run_time_seconds: p.run_time(),
                owner,
            }
        })
        .collect();

    let system_info = SystemInfoDto {
        hostname: System::host_name().unwrap_or_else(|| "unknown".into()),
        os: System::long_os_version().unwrap_or_else(|| "unknown".into()),
        kernel: System::kernel_version().unwrap_or_else(|| "unknown".into()),
        uptime_seconds: System::uptime(),
    };

    Snapshot {
        cpu,
        ram,
        disk: DiskDto { partitions },
        disk_io,
        network: NetworkDto { interfaces },
        processes,
        system_info,
    }
}

fn main() {
    let mut sys = System::new_all();
    sys.refresh_all();

    tauri::Builder::default()
        .manage(MonitorState {
            sys: Mutex::new(sys),
            networks: Mutex::new(Networks::new_with_refreshed_list()),
            disks: Mutex::new(Disks::new_with_refreshed_list()),
            components: Mutex::new(Components::new_with_refreshed_list()),
            users: Users::new_with_refreshed_list(),
        })
        .invoke_handler(tauri::generate_handler![get_snapshot])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
