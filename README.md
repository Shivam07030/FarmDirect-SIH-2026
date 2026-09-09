# FarmDirect · Direct Farm-to-Consumer & B2B Cold-Chain Platform

> **Smart India Hackathon (SIH 2026)**  
> **Problem Statement ID**: `SIH26033`  
> **Problem Statement**: *Multiple intermediaries reduce farmers' earnings and increase consumer prices*  
> **Team Name**: *AGRONEX AI*  
> **Live Web App**: [http://169.58.5.209:3000](http://169.58.5.209:3000)  
> **Android APK**: [http://169.58.5.209:3000/downloads/farmdirect-latest.apk](http://169.58.5.209:3000/downloads/farmdirect-latest.apk)  
> **Full Project Dossier**: [PROJECT_DOSSIER.md](PROJECT_DOSSIER.md)

---

## 🌾 Project Overview

**FarmDirect** is a modern agricultural supply chain platform engineered to eliminate exploitative mandi middlemen, guarantee minimum support fair prices to farmers, prevent speculative retail hoarding, and eliminate perishable food losses using an IoT-monitored refrigerated cold chain.

### Key Capabilities
- **Farmer Portal**: Verified PM-KISAN KYC, Khasra/Khatauni land record verification, native camera produce capture, and cluster GPS detection.
- **Fair Price Collar Engine**: Algorithmic MSP floor and price ceiling preventing distress selling and consumer gouging.
- **Dual-Tier Buyer Marketplace**:
  - *Household Retail*: Anti-hoarding cap of **max 2 kg per crop** with flat ₹25 doorstep eco-delivery.
  - *B2B Wholesale*: Minimum order quantities of **25 kg to 500+ kg** requiring verified 15-digit GSTIN & FSSAI.
- **Amazon-Grade Live Delivery Tracker**: Step-by-step dispatch tracking with real-time **4°C reefer telematics** and secure **4-digit OTP handover**.
- **Produce Freshness & Logistics Rating**: Multi-criteria star rating system updating farmer reputation dynamically in MySQL.
- **Grievance & Dispute Desk**: End-to-end support ticket resolution desk for damaged produce, temperature breaches, and escrow settlement disputes.
- **Market Authority Admin Console**: Live, zero-hardcoding market rule adjustments and user account sanctions (`ACTIVE`, `SUSPENDED`, `BANNED`).

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, TypeScript 5.8, Tailwind CSS v4, Vite 6, Lucide Icons |
| **Mobile** | Capacitor 8 (Android SDK & iOS Native Plugins), Progressive Web App (PWA) |
| **Backend** | Node.js, Express 4, RESTful Architecture, JSON Web Tokens |
| **Database** | MySQL 8.0 (InnoDB, Normalized 3NF Schema, Connection Pooling), phpMyAdmin |
| **IoT / Logistics** | Telematics Simulator, Cold-Chain Temperature Sensors, GPS Geofencing |
| **DevOps / Cloud** | Ubuntu Linux Cloud Server (`169.58.5.209`), PM2 Process Manager, Nginx, Gradle |

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Clone repository (dev branch)
git clone -b dev git@github.com:Shivam07030/FarmDirect-SIH-2026.git
cd FarmDirect-SIH-2026

# 2. Install dependencies
npm install

# 3. Start Backend Server & Frontend Dev Server
npm run dev

# 4. Access the web app
open http://localhost:3000
```

### Mobile App Build (Android APK)
```bash
# Build Android APK directly via Gradle
cd android
./gradlew assembleDebug

# Output APK location:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 👥 Demo Logins for Evaluators

Test directly on [http://169.58.5.209:3000](http://169.58.5.209:3000) using **OTP: `2026`**:

1. **Farmer Persona**: Phone `+91 98765 43210` (Rajesh Kumar · Agra Farm Cluster)
2. **Normal Buyer (Household)**: Phone `+91 98112 00000` (Max 2 kg Rationing Cap active)
3. **Wholesaler (B2B Bulk)**: Phone `+91 98112 99881` (AgroPure Processing · GSTIN Verified)
4. **Admin Authority**: Phone `+91 99999 00000` (Market Interventions, Sanctions & Dispute Desk)






## How to access machien 
## ssh root@169.58.5.209
## Password: Ajay2026