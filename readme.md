# AI-Powered Network Intrusion Detection System (NIDS)

An end-to-end Machine Learning & Deep Learning based Network Intrusion Detection System built for benchmark dataset analysis (CSE-CIC-IDS2018), offline data processing, and intrusion classification without requiring an active internet connection.

---

## 📌 Project Overview

This project implements a **Hybrid Deep Learning Model (CNN + RFNN)** capable of analyzing benchmark network traffic flow records completely offline and classifying activities into **15 distinct categories** (Benign traffic + 14 cyber attack vectors) across 78 statistical network flow features.

> **Note**: This is an **Offline Network Intrusion Detection System (NIDS)**. It operates locally on provided benchmark datasets without connecting to or requiring the live internet.

### Supported Attack Classifications:
1. **Benign** (Normal traffic)
2. **DDOS attack-HOIC**
3. **DDoS attacks-LOIC-HTTP**
4. **DDOS attack-LOIC-UDP**
5. **DoS attacks-Hulk**
6. **DoS attacks-SlowHTTPTest**
7. **DoS attacks-GoldenEye**
8. **DoS attacks-Slowloris**
9. **FTP-BruteForce**
10. **SSH-Bruteforce**
11. **Brute Force - Web**
12. **Brute Force - XSS**
13. **SQL Injection**
14. **Infiltration**
15. **Botnet Activity**

---

## 🏗️ System Architecture

```
[ Benchmark Dataset (CSE-CIC-IDS2018 / CSV / Pickle) ]
               │
               ▼
[ Preprocessing & Data Cleaning (cleaner.py: NaN/Inf Cleaned) ]
               │
               ▼
[ 78 Statistical Feature Extraction (feature_engineering.py) ]
               │
               ▼
[ StandardScaler Normalization (scaler.pkl) ]
               │
               ▼
[ Hybrid AI Engine (PyTorch 1D-CNN + RFNN) ]
               │ (Outputs Attack Classification & Confidence Score)
               ▼
[ FastAPI Backend REST API (Port 8000) ] ── SQLite Database (nidps.db)
               │
               ▼
[ React Modern Security Operations Dashboard (Port 3000) ]
```

---

## 🔑 Login Credentials

The dashboard is secured with JWT (JSON Web Tokens) and role-based access:

| Role | Username | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin` | `admin123` | Full dashboard, Threat blocking, User management |
| **Security Analyst** | `analyst` | `analyst123` | View logs, Live traffic monitoring, Threat analysis |

---

## 🚀 How to Run the Project

### Option 1: One-Click Launch (Recommended)
Simply double-click:
```
start_project.bat
```
This will automatically:
1. Launch the FastAPI Backend on `http://127.0.0.1:8000`
2. Launch the React Frontend on `http://localhost:3000`
3. Open your default web browser to the dashboard login page!

---

### Option 2: Manual Start (via Terminal)

#### Step 1: Start the Backend
Open a terminal in the project root directory:
```powershell
# Activate Virtual Environment
.venv\Scripts\activate

# Start the Backend Server
python app.py
```
> Backend API will be live at: `http://127.0.0.1:8000`  
> Interactive Swagger API Documentation: `http://127.0.0.1:8000/docs`

#### Step 2: Start the Frontend
Open a second terminal:
```powershell
cd frontend
npm start
```
> React Dashboard will be live at: `http://localhost:3000`

---

### Option 3: Real-Time Live Network Sniffing (Optional)
To capture live packets directly from your network interface using Scapy:
1. Ensure **Npcap** or **WinPcap** is installed on your Windows PC with "WinPcap API-compatible Mode" enabled.
2. Run as Administrator:
```powershell
.venv\Scripts\activate
python -m backend.realtime.packet_capture
```
*(Or double-click `run_live_sniffer.bat`)*

---

## 📊 Key Features & Dashboard Modules

- **Live Network & Dataset Simulator (`/simulation`)**:
  - **Multi-Route Ingress Visualization**: Visualizes incoming traffic traveling through 4 active network interfaces (*Public Internet WAN, Remote VPN Gateway, Cloud Interconnect, Corporate LAN*).
  - **Process Dataset Batch**: One-click button to process real benchmark dataset rows through the pipeline, demonstrating how raw data is converted into classified intrusions.
  - **Live 6-Stage Process Pipeline (The Data Journey)**: Explicitly demonstrates what happens to incoming network packets or uploaded dataset records:
    1. *Data Ingestion* (Packet or dataset row arrival)
    2. *Data Cleaning* (`cleaner.py` handles missing values, NaN/Inf, and schema validation)
    3. *78 Feature Engineering* (`feature_engineering.py` extracts statistical flow features)
    4. *StandardScaler Normalization* (`scaler.pkl` scales all 78 numerical features)
    5. *PyTorch Hybrid AI Inference* (1D-CNN + RFNN forward pass classification)
    6. *NIDS Alert Dispatch & Audit* (Logged to SQLite `nidps.db`)
  - **One-Click Attack Injector**: Live attack injection buttons (*DDoS HOIC, DoS Hulk, SSH BruteForce, SQL Injection, Botnet, FTP BruteForce, Benign Web*) designed for seamless college viva and project demonstrations.
  - **Passive Detection & Zero IP Blocking**: Strictly passive detection (NIDS) as required for security monitoring without disrupting production uptime.
  - **Deep Packet Inspector**: Interactive modal inspecting raw 5-tuples, protocol flags, and key extracted flow features.
- **Executive Security Dashboard (`/`)**: Displays Total Network Traffic, Risk Score, Active Threats, and System Health.
- **Real-Time Traffic Graphs**: Interactive bandwidth and packet volume metrics rendered using Recharts.
- **Attack Distribution**: Donut and Pie charts breaking down malicious traffic by attack type.
- **Attack Logs & Audit Trail (`/attack-logs`)**: Comprehensive searchable and filterable database logs stored in SQLite (`nidps.db`).
- **Threat Intelligence Panel**: Highlights latest high-severity threats, attacking IP addresses, and classification confidences.

---

## 🎓 Viva / Guide Demonstration Tips

When presenting to your project guide / professor:
1. Open the dashboard at `http://localhost:3000` and log in with `admin` / `admin123`.
2. Click **"Live Simulation"** in the sidebar.
3. Click **"📊 Process Dataset Batch"**: Show how test dataset records are cleaned, scaled, and classified by the AI engine.
4. Click **"Start Simulation"**: Show the continuous traffic flowing through the network routes and the 6 stages lighting up in real-time.
5. Click **"SQL Injection"** or **"DDoS HOIC"**:
   - Point out which network interface the attack enters through (e.g. Public Internet WAN).
   - Show Stage 2 cleaning missing values.
   - Show Stage 3 calculating the **78 network features**.
   - Show Stage 4 normalizing the features via **StandardScaler**.
   - Show Stage 5 running the **Hybrid CNN + RFNN** model in PyTorch.
   - Show Stage 6 generating a **Security Alert** and logging the threat to the SQLite database (`nidps.db`).
6. Click on any row in the **Telemetry Stream** to open the **Deep Packet Inspector** and show the actual numerical features evaluated by the neural network!

---

## 🛠️ Technology Stack

- **Deep Learning / AI**: PyTorch, Scikit-Learn, NumPy, Pandas, Joblib
- **Backend API**: FastAPI, Uvicorn, Python-Jose (JWT), Passlib, Bcrypt, SQLite3, WebSockets
- **Network Analysis**: Scapy (Real-time packet capture & flow reconstruction)
- **Frontend Dashboard**: React.js 19, Material-UI (MUI v9), Recharts, Axios, React Router v7

