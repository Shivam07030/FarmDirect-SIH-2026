# FarmDirect · Direct Farm-to-Consumer & B2B Cold-Chain Platform

> **Smart India Hackathon (SIH 2026)**  
> **Problem Statement ID**: `SIH26033`  
> **Problem Statement**: *Multiple intermediaries reduce farmers' earnings and increase consumer prices*  
> **Team Name**: *AGRONEX AI*  
> **Live Production URL**: [http://169.58.5.209:3000](http://169.58.5.209:3000) (SSL: `https://169.58.5.209:3443`)  
> **Android Mobile APK**: [http://169.58.5.209:3000/downloads/farmdirect-latest.apk](http://169.58.5.209:3000/downloads/farmdirect-latest.apk)  
> **Comprehensive Dossier**: [PROJECT_DOSSIER.md](PROJECT_DOSSIER.md)

---

## 🌾 1. Project Overview

**FarmDirect** is a modern agricultural disintermediation and refrigerated cold-chain platform designed to eliminate exploitative mandi middlemen, guarantee fair prices above MSP to farmers, prevent speculative hoarding for consumers, and prevent post-harvest food waste through real-time IoT temperature monitoring.

Traditional APMC mandis subject farmers to a multi-layered chain of village aggregators, commission agents (*arhatiyas*), and mandi cartels—diluting the farmer's share to under 35% of the consumer rupee. FarmDirect establishes a transparent, direct farmgate-to-buyer corridor with digital escrow, verifiable identity, and guaranteed cold-chain delivery.

---

## 🚀 2. Cutting-Edge Technologies & Innovations

| Technology / Framework | Category | Implementation & Purpose |
| :--- | :--- | :--- |
| **Google Gemini 2.5 Flash** (`@google/genai`) | **Multimodal Vision AI** | Computer vision produce scanner analyzing surface defects, color ripeness, AGMARK/APEDA grade classification, and shelf-life prediction. |
| **WebRTC & Live Camera Viewfinder** | **Direct Hardware MediaStream** | In-app live camera viewfinder (`getUserMedia`) with framing reticle, dual-facing camera switch, and native `@capacitor/camera` hardware trigger for fresh produce verification. |
| **Recharts Data Visualization** (`recharts 3.10`) | **Arbitrage & Financial Charts** | Real-time comparative net in-hand realization charts contrasting FarmDirect against traditional APMCs after commission and cess deductions. |
| **Agmarknet & e-NAM Data Sync** | **Government Benchmarks** | Daily automated ingestion of wholesale arrival volumes and modal, minimum, and maximum rates from Ministry of Agriculture APMC mandis. |
| **India Stack / DPI (Meon & DigiLocker)** | **Identity & DBT Banking** | Real-time Aadhaar e-KYC, PAN authentication, and Meon Penny Drop bank account validation for instant IMPS DBT payouts. |
| **IoT Cold-Chain Telematics** | **Sensors & Hardware Simulation** | Real-time 2°–6°C chamber temperature monitoring, relative humidity tracking, GPS coordinates, and Amazon-style 4-digit OTP delivery security. |
| **Driver Detention & Salvage Protocol** | **Logistics Risk Management** | GPS Geofence (<35m), 30-min grace countdown, automated ₹150/hr demurrage escrow debit, IVR sirens, and emergency APMC re-route salvage to Azadpur Mandi. |
| **Kisan Vaani Voice Assistant** | **Multilingual Speech AI** | Web Speech API speech-to-text allowing hands-free crop listing via voice in Hindi and regional dialects. |
| **Cashfree Nodal Escrow** | **FinTech & Settlement** | RBI-compliant digital escrow holding buyer funds until OTP-authenticated physical delivery, preventing payment defaults. |
| **Dynamic Freshness SLA & Cancellation** | **Marketplace Governance** | 12h/24h photo freshness enforcement with purchase locks and pre-shipment order cancellation with 100% automated escrow refund. |

---

## 🏛️ 3. Core Architectural Pillars

### A. Agmarknet & e-NAM Mandi Arbitrage Matrix
Traditional APMC mandis display deceptive gross prices. The platform automatically factors in:
- **Arhatiya (Middleman) Commission**: `6.0%`
- **APMC Mandi Cess**: `1.5% to 2.0%`
- **Palledari (Handling & Unloading Charges)**: `₹25 – ₹30 per quintal`
- **Transit Spoilage & Open Freight Decay**: `7% – 9%`
Calculates true net take-home realization across regional mandis (**Agra APMC, Azadpur Delhi, Mathura, Jaipur**) proving an extra **+₹420 to +₹685 per quintal net gain** for farmers.

### B. Algorithmic Fair Price Collar Engine
- **MSP Distress Floor**: Prevents farmers from being forced into distressed selling below cost of cultivation.
- **Anti-Gouging Ceiling**: Dynamically restricts price gouging during artificial shortages, protecting urban household consumers.
- **Fair Band Indicator**: Real-time visual compliance feedback for farmers when listing produce.

### C. Transporter & Driver Detention Protocol
Protects delivery drivers and farmers from unresponsive buyers:
1. **GPS Geo-Fence Arrival Proof**: Confirms vehicle position within <35m of destination.
2. **30-Minute Grace Countdown Timer**: Automated detention clock.
3. **₹150/hr Reefer Demurrage Surcharge**: Auto-debited from the buyer's locked escrow to cover idling refrigeration expenses.
4. **Urgent Multi-Channel IVR & SMS Siren**: Automated telephone voice call and SMS dispatch to the buyer.
5. **Perishable Emergency Salvage**: Re-routes truck to Azadpur Mandi if the buyer fails to respond, liquidating produce before rot occurs.

### D. Dual-Tier Anti-Hoarding Marketplace
- **Household Retail Tier**: Hard 2 kg cap per crop lot under the Essential Commodities Act to eliminate speculative hoarding, with flat ₹25 doorstep delivery.
- **B2B Wholesale Tier**: 25 kg to 500+ kg bulk lots requiring verified 15-digit GSTIN & FSSAI registration.

---

## 🛠️ 4. Technology Stack Summary

```
Frontend:          React 19 · TypeScript 5.8 · Vite 6 · Tailwind CSS v4 · Motion
Mobile Container:  Capacitor 8 (Android Studio / Gradle · iOS Native SDK)
Artificial Intel: Google Gemini 2.5 Flash Vision API (`@google/genai`)
Charting & Stats:  Recharts 3.10
Backend & APIs:    Node.js · Express 4 · REST · JWT
Database Layer:    MySQL 8.0 (InnoDB · Normalized 3NF Schema · Connection Pool)
Cloud Infrastructure: Ubuntu 24.04 LTS (`169.58.5.209`) · Nginx Reverse Proxy · PM2
DPI Integrations:  Agmarknet · e-NAM · PM-KISAN · DigiLocker / UIDAI · Cashfree Escrow
```

---

## 💻 5. Quick Start (Local Setup)

```bash
# 1. Clone repository
git clone -b dev git@github.com:Shivam07030/FarmDirect-SIH-2026.git
cd FarmDirect-SIH-2026

# 2. Install dependencies
npm install

# 3. Start local development environment (Frontend + Backend)
npm run dev

# 4. Open in browser
open http://localhost:3000
```

### Android APK Compilation
```bash
# Build native APK using Gradle
cd android
./gradlew assembleDebug

# Output APK path:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 👥 6. Evaluator Personas for Live Testing

Live server: [http://169.58.5.209:3000](http://169.58.5.209:3000) (Universal Sandbox OTP: **`2026`**):

| Persona | Registered Phone | Access & Primary Demo Capabilities |
| :--- | :--- | :--- |
| **Farmer (Agra Cluster)** | `+91 98765 43210` | Live Camera Harvest Listing, Mandi Arbitrage Matrix, AI APEDA Quality Scanner, Kisan Vaani Voice Assistant, Farm-to-Fork Trust Passport. |
| **Household Retail Buyer** | `+91 98112 00000` | Anti-hoarding 2 kg capped cart, live 4°C IoT cold-chain tracker, 4-digit security OTP, pre-shipment order cancellation with 100% refund. |
| **Wholesaler (B2B Commercial)** | `+91 98112 99881` | Bulk ordering (100 kg+), GSTIN/FSSAI verified badge, Driver Gate Detention protocol, Reefer demurrage tracking. |
| **Market Authority Admin** | `+91 99999 00000` | Zero-hardcoding dynamic market rules, photo freshness SLA sliders, ECA rationing toggles, dispute resolution desk. |

---

## 🖥️ 7. Server Access & Deployment Guide

### Remote Cloud Server SSH Access
```bash
ssh root@169.58.5.209
# Password: Ajay2026
```

### Deploying Updates to Live Production
```bash
# Login to the machine and run the automated deployment script
./deploy.sh
```

### Git Branching & Push Workflow
```bash
# 1. Check current branch
git branch

# 2. Always make sure to have the latest pull to avoid conflicts
git pull origin dev

# 3. Switch to specific branch if needed
git checkout <BRANCH_NAME>

# 4. Add specific desired files with relative paths
git add <file-path>

# 5. Commit your changes
git commit -m "feat/fix: your commit description"

# 6. Push to specific branch
git push origin <BRANCH_NAME>
```

---

## 📄 License & Attribution
Developed for the **Smart India Hackathon (SIH 2026)** by **Team AGRONEX AI**. All rights reserved.
