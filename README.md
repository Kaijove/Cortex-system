<div align="center">

# 🧠 Cortex

### ⚡ Your system, actually understood.

A real-time desktop system monitor built with **React + Rust (Tauri)** that clearly separates **real telemetry** from **illustrative data**.

**No fake charts. No misleading metrics. Just honest monitoring.**

<br>

[![🌐 Live Demo](https://img.shields.io/badge/🌐_Live_Demo-cortex--system.netlify.app-2dd4ee?style=for-the-badge)](https://cortex-system.netlify.app/)
[![🚧 Status](https://img.shields.io/badge/Status-Active_Development-orange?style=for-the-badge)](#)
[![📄 License](https://img.shields.io/badge/License-MIT-a78bfa?style=for-the-badge)](#license)
[![⚛️ Stack](https://img.shields.io/badge/React_+_Rust_\(Tauri\)-34d399?style=for-the-badge)](#tech-stack)
[![🌍 Languages](https://img.shields.io/badge/CA_|_EN-f5a623?style=for-the-badge)](#)

<br>

### ✨ Highlights

🖥️ **Real OS Metrics** • 🌐 **Live Network Diagnostics** • 🤖 **AI Insights** • 📊 **Advanced Analytics** • 🎨 **Fully Customizable** • ⚡ **Native Desktop App**

---

<p align="center">
<a href="#-screenshots">📸 Screenshots</a> •
<a href="#-features">🚀 Features</a> •
<a href="#-tech-stack">🛠️ Tech Stack</a> •
<a href="#-architecture">🏗️ Architecture</a> •
<a href="#-getting-started">⚙️ Getting Started</a> •
<a href="#-deployment">📦 Deployment</a> •
<a href="#-roadmap">🗺️ Roadmap</a>
</p>

</div>

---

# 📖 What this actually is

Cortex started as a simple system dashboard and gradually evolved into a complete monitoring platform covering **live operating system metrics, network diagnostics, automation, analytics, AI-powered insights and deep personalization**.

The philosophy behind the project never changed:

> **If a value isn't real, the interface explicitly says so.**

Instead of pretending to know things it cannot verify, Cortex always distinguishes between genuine information and illustrative examples.

Every value shown on screen is one of these:

✅ **Real**

* Read directly from `sysinfo` through the Rust backend
* Measured live using Web APIs (`fetch()`)
* Includes CPU, RAM, disks, processes, network, DNS latency, speed tests, service availability, public IP and much more

🎨 **Illustrative**

* Clearly tagged as `EXAMPLE` or `N/D`
* Used only where desktop sandbox limitations prevent real measurements (firewall rules, Docker internals, certain hardware sensors...)

That distinction isn't a tiny disclaimer.

It's the entire purpose of Cortex.

---

# 📸 Screenshots

> Explore the different areas of the application.

<table>
<tr>
<td width="50%">
<img src="docs/screenshots/ai-insights.png" width="100%"/>
<p align="center">
<b>🤖 AI System Insights</b><br>
Transparent rule-based observations generated from live metrics.
</p>
</td>

<td width="50%">
<img src="docs/screenshots/security-center.png" width="100%"/>
<p align="center">
<b>🛡️ Security Center</b><br>
Real SSH detection combined with clearly-labelled illustrative security data.
</p>
</td>
</tr>

<tr>
<td width="50%">
<img src="docs/screenshots/network-map.png" width="100%"/>
<p align="center">
<b>🌍 Network Map</b><br>
Real measured latency visualized across multiple regions.
</p>
</td>

<td width="50%">
<img src="docs/screenshots/sensors.png" width="100%"/>
<p align="center">
<b>🌡️ Hardware Sensors</b><br>
Live temperatures whenever the operating system exposes them.
</p>
</td>
</tr>
</table>

---

<p align="center">

<img src="docs/screenshots/network-suite.png" width="85%">

</p>

<p align="center">
<b>🌐 Professional Network Suite</b><br>
Cloudflare-backed speed tests, DNS latency, bandwidth monitor, connection quality and service monitoring.
</p>

---

<p align="center">

<img src="docs/screenshots/automation.png" width="65%">

</p>

<p align="center">
<b>⚙️ Automation Center</b><br>
Visual automation rules, scheduler, notifications and incident monitoring.
</p>

---

<p align="center">

<img src="docs/screenshots/analytics-overview.png" width="85%">

</p>

<p align="center">
<b>📊 Advanced Analytics</b><br>
Persistent history, trends, activity heatmaps and real statistical analysis.
</p>

---

<details>

<summary><b>📂 More screenshots</b></summary>

<br>

<table>

<tr>

<td width="50%">
<img src="docs/screenshots/settings-appearance.png" width="100%"/>
<p align="center">
🎨 Themes, profiles, custom colors and language switching.
</p>
</td>

<td width="50%">
<img src="docs/screenshots/quick-actions.png" width="100%"/>
<p align="center">
⚡ Floating quick actions for snapshots, exports, fullscreen and speed tests.
</p>
</td>

</tr>

<tr>

<td width="50%">
<img src="docs/screenshots/processes-notes.png" width="100%"/>
<p align="center">
📝 Process manager alongside productivity widgets.
</p>
</td>

<td width="50%">
<img src="docs/screenshots/calendar-logs.png" width="100%"/>
<p align="center">
📅 Calendar combined with live filtered system logs.
</p>
</td>

</tr>

<tr>

<td width="50%">
<img src="docs/screenshots/analytics-correlations.png" width="100%"/>
<p align="center">
📈 Metric correlations and unified performance timeline.
</p>
</td>

<td width="50%">
<img src="docs/screenshots/settings-dashboard.png" width="100%"/>
<p align="center">
🧩 Enable or disable any dashboard widget.
</p>
</td>

</tr>

<tr>

<td width="50%">
<img src="docs/screenshots/settings-accessibility.png" width="100%"/>
<p align="center">
♿ Accessibility options, reduced motion and high contrast.
</p>
</td>

<td width="50%">
<img src="docs/screenshots/settings-shortcuts.png" width="100%"/>
<p align="center">
⌨️ Complete keyboard shortcut reference.
</p>
</td>

</tr>

</table>

</details>

---

# 🚀 Features

### 🖥️ Live System Metrics

Real CPU, RAM, disks, processes, network interfaces, throughput, temperatures and operating system information powered by Rust + `sysinfo`.

### 🤖 AI System Insights

Rule-based observations, health scoring, notifications and transparent predictions generated from live system metrics.

### 🌐 Professional Network Suite

Cloudflare-backed speed tests, DNS latency, bandwidth monitor, service monitoring, public IP, ISP information and network diagnostics.

### 🛠️ Advanced System Tools

Storage explorer, GPU monitor, process inspector, sensor dashboard, snapshots, exports and clearly-labelled simulated operating system tools.

### 🎨 Personalization & Productivity

Nine themes, accent colors, multilingual interface, draggable widgets, layouts, notes, calendar and command palette.

### ⚙️ Automation & Monitoring

Visual rule engine, scheduler, incident center, notifications and automation analytics.

### 📊 Advanced Analytics

Persistent history, trend analysis, heatmaps, correlations, timeline and reporting.

### ✨ Premium UX

Fluid animations, aurora background, fullscreen widgets, accessibility features, Web Audio integration and polished desktop experience.

### 🏭 Production Ready

Unit testing, CI/CD, lazy loading, error boundaries, accessibility improvements, PWA support and screenshot exporting.

---

# 🛠️ Tech Stack

| Layer     | Technology            |
| --------- | --------------------- |
| UI        | React 19 + TypeScript |
| Desktop   | Tauri (Rust)          |
| Styling   | Tailwind CSS v4       |
| State     | Zustand               |
| Charts    | Recharts              |
| Animation | Framer Motion         |
| Metrics   | sysinfo               |
| Testing   | Vitest                |
| Icons     | Lucide React          |
| Build     | Vite                  |

---

# 🏗️ Architecture

*(Keep your existing architecture section here.)*

---

# ⚙️ Getting Started

*(Keep your existing Getting Started section here.)*

---

# 📦 Deployment

*(Keep your existing Deployment section here.)*

---

# 🗺️ Roadmap

*(Keep your existing Roadmap section here.)*

---

# 🤝 Contributing

Please keep the **Real vs Illustrative** philosophy if you contribute or fork the project.

Before opening a Pull Request, run:

```bash
npm run build
npm run test
```

---

# 📄 License

Released under the **MIT License**.
