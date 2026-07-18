#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# setup.sh — Instal·lació automàtica de l'entorn per al System Monitor Dashboard
# Fet per a Ubuntu. Instal·la curl, nvm, Node 22 i les dependències del projecte.
# Ús:
#   chmod +x setup.sh
#   ./setup.sh
# -----------------------------------------------------------------------------

set -e # si algun pas falla, para immediatament

# Aquest script és per a Linux / macOS. Si algú l'executa sense voler
# des d'un entorn Windows (Git Bash, WSL...), li ho indiquem igualment.
case "$(uname -s)" in
  Linux*|Darwin*) ;;
  *)
    echo "Sembla que estàs a Windows. Fes servir setup.bat en lloc d'aquest script."
    exit 1
    ;;
esac

echo "== 1/5 Comprovant curl =="
if ! command -v curl >/dev/null 2>&1; then
  echo "curl no trobat, instal·lant..."
  sudo apt update
  sudo apt install -y curl
else
  echo "curl ja instal·lat, OK"
fi

echo "== 2/5 Comprovant nvm =="
export NVM_DIR="$HOME/.nvm"
if [ ! -d "$NVM_DIR" ]; then
  echo "nvm no trobat, instal·lant..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
else
  echo "nvm ja instal·lat, OK"
fi

# Carrega nvm a la sessió actual del script (no cal reobrir terminal)
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "== 3/5 Instal·lant Node 22 =="
nvm install 22
nvm use 22

echo "== 4/5 Versions instal·lades =="
node -v
npm -v

echo "== 5/5 Instal·lant dependències del projecte =="
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
npm install

echo ""
echo "Tot llest! Per arrencar el projecte:"
echo "  npm run dev"
