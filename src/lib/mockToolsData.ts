import type {
  DockerContainer,
  DockerImage,
  DockerNetworkInfo,
  DockerVolume,
  FsNode,
  PackageInfo,
  StorageCategoryNode,
  VirtualMachine,
} from '@/types/tools'

export function createMockFileSystem(): FsNode {
  return {
    id: 'root',
    name: '/home/user',
    kind: 'folder',
    sizeBytes: 0,
    modified: '2026-07-10',
    children: [
      {
        id: 'documents',
        name: 'Documents',
        kind: 'folder',
        sizeBytes: 0,
        modified: '2026-07-12',
        favorite: true,
        children: [
          { id: 'doc1', name: 'resume.pdf', kind: 'file', sizeBytes: 245_000, modified: '2026-07-12' },
          { id: 'doc2', name: 'cover-letter.pdf', kind: 'file', sizeBytes: 180_000, modified: '2026-07-11' },
          { id: 'doc3', name: 'Apunts XAL.odt', kind: 'file', sizeBytes: 92_000, modified: '2026-06-28' },
        ],
      },
      {
        id: 'projects',
        name: 'Projectes',
        kind: 'folder',
        sizeBytes: 0,
        modified: '2026-07-17',
        favorite: true,
        children: [
          { id: 'proj1', name: 'system-monitor-dashboard', kind: 'folder', sizeBytes: 48_000_000, modified: '2026-07-17' },
          { id: 'proj2', name: 'weather-app', kind: 'folder', sizeBytes: 12_000_000, modified: '2026-06-20' },
          { id: 'proj3', name: 'sample-project', kind: 'folder', sizeBytes: 8_500_000, modified: '2026-05-14' },
        ],
      },
      {
        id: 'downloads',
        name: 'Baixades',
        kind: 'folder',
        sizeBytes: 0,
        modified: '2026-07-17',
        children: [
          { id: 'dl1', name: 'installer-tool.tar.gz', kind: 'file', sizeBytes: 42_000_000, modified: '2026-06-02' },
          { id: 'dl2', name: 'os-image.img', kind: 'file', sizeBytes: 1_200_000_000, modified: '2026-05-30' },
        ],
      },
      { id: 'iso', name: 'ISO', kind: 'folder', sizeBytes: 3_400_000_000, modified: '2026-04-18' },
      { id: 'readme', name: 'readme.md', kind: 'file', sizeBytes: 2_100, modified: '2026-07-01' },
    ],
  }
}

export function createMockDockerContainers(): DockerContainer[] {
  return [
    { id: 'c1', name: 'app-postgres', image: 'postgres:16', status: 'running', cpuPercent: 3.2, ramMB: 210, ports: '5432:5432', uptime: '4d 12h', logs: ['LOG: database system is ready to accept connections', 'LOG: checkpoint complete'] },
    { id: 'c2', name: 'app-nginx', image: 'nginx:alpine', status: 'running', cpuPercent: 0.8, ramMB: 24, ports: '80:80, 443:443', uptime: '4d 12h', logs: ['GET /health 200', 'GET /api/status 200'] },
    { id: 'c3', name: 'app-redis', image: 'redis:7', status: 'running', cpuPercent: 1.1, ramMB: 48, ports: '6379:6379', uptime: '4d 12h', logs: ['Ready to accept connections'] },
    { id: 'c4', name: 'test-runner', image: 'node:20-alpine', status: 'stopped', cpuPercent: 0, ramMB: 0, ports: '—', uptime: '—', logs: ['Process exited with code 0'] },
    { id: 'c5', name: 'legacy-api', image: 'php:8.1-fpm', status: 'restarting', cpuPercent: 12.4, ramMB: 96, ports: '9000:9000', uptime: '0m', logs: ['Restarting due to health check failure...'] },
  ]
}

export function createMockDockerImages(): DockerImage[] {
  return [
    { id: 'img1', repository: 'postgres', tag: '16', sizeGB: 0.41 },
    { id: 'img2', repository: 'nginx', tag: 'alpine', sizeGB: 0.042 },
    { id: 'img3', repository: 'redis', tag: '7', sizeGB: 0.117 },
    { id: 'img4', repository: 'node', tag: '20-alpine', sizeGB: 0.178 },
    { id: 'img5', repository: 'php', tag: '8.1-fpm', sizeGB: 0.512 },
  ]
}

export function createMockDockerVolumes(): DockerVolume[] {
  return [
    { name: 'app-postgres-data', driver: 'local', sizeGB: 2.4 },
    { name: 'app-redis-data', driver: 'local', sizeGB: 0.3 },
  ]
}

export function createMockDockerNetworks(): DockerNetworkInfo[] {
  return [
    { name: 'bridge', driver: 'bridge', containers: 5 },
    { name: 'app-internal', driver: 'overlay', containers: 3 },
  ]
}

export function createMockVirtualMachines(): VirtualMachine[] {
  return [
    { id: 'vm1', name: 'haos-dev', status: 'running', os: 'Home Assistant OS 18.1', cpuCores: 2, ramGB: 4, storageGB: 32, network: 'NAT', uptime: '2d 3h' },
    { id: 'vm2', name: 'win11-test', status: 'stopped', os: 'Windows 11 Pro', cpuCores: 4, ramGB: 8, storageGB: 80, network: 'Bridged', uptime: '—' },
    { id: 'vm3', name: 'ubuntu-server-lab', status: 'paused', os: 'Ubuntu Server 24.04', cpuCores: 2, ramGB: 2, storageGB: 20, network: 'NAT', uptime: '5h 20m' },
  ]
}

export function createMockPackages(): PackageInfo[] {
  return [
    { id: 'p1', name: 'linux-image-generic', version: '6.14.0-29', latestVersion: '6.14.0-31', repository: 'noble-updates', category: 'kernel', hasUpdate: true, installedOn: '2026-03-01' },
    { id: 'p2', name: 'firefox', version: '141.0', latestVersion: '141.0', repository: 'noble', category: 'internet', hasUpdate: false, installedOn: '2026-06-15' },
    { id: 'p3', name: 'docker-ce', version: '27.3.1', latestVersion: '27.4.0', repository: 'docker-ce-stable', category: 'devel', hasUpdate: true, installedOn: '2026-02-10' },
    { id: 'p4', name: 'code', version: '1.94.2', latestVersion: '1.94.2', repository: 'vscode', category: 'devel', hasUpdate: false, installedOn: '2026-05-22' },
    { id: 'p5', name: 'gimp', version: '2.10.38', latestVersion: '2.10.38', repository: 'noble', category: 'graphics', hasUpdate: false, installedOn: '2026-01-18' },
    { id: 'p6', name: 'openssh-server', version: '9.6p1', latestVersion: '9.7p1', repository: 'noble-security', category: 'network', hasUpdate: true, installedOn: '2026-03-01' },
    { id: 'p7', name: 'nodejs', version: '20.17.0', latestVersion: '20.17.0', repository: 'nodesource', category: 'devel', hasUpdate: false, installedOn: '2026-04-09' },
  ]
}

export function createMockStorageCategories(): StorageCategoryNode[] {
  return [
    {
      name: 'Sistema',
      sizeGB: 18.4,
      children: [
        { name: '/usr', sizeGB: 9.2 },
        { name: '/var', sizeGB: 5.1 },
        { name: '/etc', sizeGB: 0.1 },
        { name: 'altres', sizeGB: 4.0 },
      ],
    },
    {
      name: 'Baixades',
      sizeGB: 46.6,
      children: [
        { name: 'os-image.img', sizeGB: 1.2 },
        { name: 'ISO', sizeGB: 3.4 },
        { name: 'altres', sizeGB: 42.0 },
      ],
    },
    {
      name: 'Projectes',
      sizeGB: 6.8,
      children: [
        { name: 'system-monitor-dashboard', sizeGB: 0.05 },
        { name: 'altres repos', sizeGB: 6.75 },
      ],
    },
    { name: 'Documents', sizeGB: 0.9 },
    { name: 'Cache/temporals', sizeGB: 3.2 },
  ]
}
