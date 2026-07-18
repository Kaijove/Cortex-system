import type { CpuStats, NetworkStats, RamStats, SystemInfo } from '@/types/system'
import { formatUptime } from '@/lib/utils'

export interface TerminalContext {
  cpu: CpuStats
  ram: RamStats
  network: NetworkStats
  systemInfo: SystemInfo
  history: string[]
}

const NEOFETCH_ART = [
  '       _,met$$$$$gg.          ',
  '    ,g$$$$$$$$$$$$$$$P.       ',
  '  ,g$$P""       """Y$$.".     ',
  ' ,$$P\'              `$$$.     ',
  '\',$$P       ,ggs.     `$$b:   ',
  '`d$$\'     ,$P"\'   .    $$$    ',
  ' $$P      d$\'     ,    $$P    ',
  ' $$:      $$.   -    ,d$$\'    ',
  ' $$;      Y$b._   _,d$P\'      ',
  ' Y$$.    `.`"Y$$$$P"\'         ',
  ' `$$b      "-.__               ',
  '  `Y$$                        ',
  '   `Y$$.                      ',
  '     `$$b.                    ',
  '       `Y$$b.                 ',
  '          `"Y$b._             ',
  '              `""""           ',
]

export function runCommand(raw: string, ctx: TerminalContext): string[] {
  const [cmd, ...args] = raw.trim().split(/\s+/)

  switch (cmd) {
    case '':
      return []
    case 'help':
      return [
        'Comandes disponibles:',
        '  help       mostra aquesta ajuda',
        '  clear      neteja la pantalla',
        '  neofetch   informació del sistema amb logo',
        '  top / htop resum de processos i ús de recursos',
        '  ps         llista de processos',
        '  ls         llista fitxers del directori actual',
        '  pwd        mostra el directori actual',
        '  whoami     usuari actual',
        '  uname      informació del kernel',
        '  date       data i hora actual',
        '  uptime     temps en marxa del sistema',
        '  ip / ifconfig  configuració de xarxa',
        '  ping       simula un ping a un host',
        '  history    historial de comandes',
        '  echo       repeteix el text',
        '  cat        mostra contingut d\'un fitxer fictici',
        '  tree       mostra l\'arbre de directoris',
      ]
    case 'clear':
      return ['__CLEAR__']
    case 'neofetch': {
      const info = [
        `${ctx.systemInfo.user}@${ctx.systemInfo.hostname}`,
        '-----------------',
        `OS: ${ctx.systemInfo.os}`,
        `Kernel: ${ctx.systemInfo.kernel}`,
        `Uptime: ${formatUptime(ctx.systemInfo.uptimeSeconds)}`,
        `CPU: ${ctx.cpu.threads / 2} cores @ ${ctx.cpu.clockSpeedGHz.toFixed(2)}GHz`,
        `Memory: ${ctx.ram.usedGB.toFixed(1)}GB / ${ctx.ram.totalGB}GB`,
        `Shell: zsh 5.9`,
        `Terminal: monitor-term`,
      ]
      return NEOFETCH_ART.map((line, i) => `${line}  ${info[i] ?? ''}`)
    }
    case 'top':
    case 'htop':
      return [
        `Tasks: ${ctx.cpu.processes} total,  ${Math.max(1, Math.round(ctx.cpu.processes * 0.03))} running`,
        `%Cpu(s): ${ctx.cpu.usage.toFixed(1)} us,  ${(100 - ctx.cpu.usage).toFixed(1)} id`,
        `MiB Mem : ${(ctx.ram.totalGB * 1024).toFixed(0)} total, ${(ctx.ram.availableGB * 1024).toFixed(0)} free, ${(ctx.ram.usedGB * 1024).toFixed(0)} used`,
        '',
        '  PID  USER      CPU%  MEM%  COMMAND',
        '  1042 kai       12.3   4.1  chrome',
        '  1187 kai        8.7   2.0  code',
        '  1355 root       3.2   0.5  systemd',
        '   999 kai        2.1   1.2  node',
      ]
    case 'ps':
      return [
        '  PID TTY          TIME CMD',
        ' 1042 pts/0    00:04:12 chrome',
        ' 1187 pts/0    00:12:45 code',
        ' 1355 ?        00:00:58 systemd',
        '  999 pts/1    00:01:03 node',
      ]
    case 'ls':
      return ['Desktop  Documents  Downloads  Projects  README.md  .bashrc  .config']
    case 'pwd':
      return [`/home/${ctx.systemInfo.user}`]
    case 'whoami':
      return [ctx.systemInfo.user]
    case 'uname':
      return args.includes('-a')
        ? [`Linux ${ctx.systemInfo.hostname} ${ctx.systemInfo.kernel} x86_64 GNU/Linux`]
        : ['Linux']
    case 'date':
      return [new Date().toString()]
    case 'uptime': {
      const load = (ctx.cpu.usage / 25).toFixed(2)
      return [`${new Date().toLocaleTimeString('en-GB', { hour12: false })} up ${formatUptime(ctx.systemInfo.uptimeSeconds)}, load average: ${load}, ${(ctx.cpu.usage / 30).toFixed(2)}, ${(ctx.cpu.usage / 35).toFixed(2)}`]
    }
    case 'ip':
      return [
        `2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500`,
        `    inet ${ctx.network.privateIp}/24 brd 192.168.1.255 scope global eth0`,
      ]
    case 'ifconfig':
      return [
        `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500`,
        `        inet ${ctx.network.privateIp}  netmask 255.255.255.0`,
        `        RX packets 84213  bytes 102481923`,
        `        TX packets 51022  bytes 8234123`,
      ]
    case 'ping': {
      const host = args[0] ?? '8.8.8.8'
      const latency = ctx.network.latencyMs ?? 20 + Math.random() * 15
      return [
        `PING ${host} 56(84) bytes of data.`,
        `64 bytes from ${host}: icmp_seq=1 ttl=57 time=${latency.toFixed(1)} ms`,
        `64 bytes from ${host}: icmp_seq=2 ttl=57 time=${(latency + Math.random() * 4).toFixed(1)} ms`,
        `--- ${host} ping statistics ---`,
        `2 packets transmitted, 2 received, 0% packet loss`,
      ]
    }
    case 'history':
      return ctx.history.map((h, i) => `  ${i + 1}  ${h}`)
    case 'echo':
      return [args.join(' ')]
    case 'cat':
      if (!args[0]) return ['cat: falta el nom del fitxer']
      if (args[0] === 'README.md') return ['# System Monitor Dashboard', 'Fet amb React + Vite + Tailwind.']
      return [`cat: ${args[0]}: No such file or directory`]
    case 'tree':
      return [
        '.',
        '├── src',
        '│   ├── components',
        '│   ├── store',
        '│   ├── hooks',
        '│   └── types',
        '├── package.json',
        '└── README.md',
      ]
    default:
      return [`bash: ${cmd}: ordre no trobada`]
  }
}
