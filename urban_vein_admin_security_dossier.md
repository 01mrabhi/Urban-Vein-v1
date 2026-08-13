# 🛡️ URBAN VEIN — HQ EXECUTIVE SECURITY DOSSIER

> [!IMPORTANT]
> **CONFIDENTIAL SECURITY DOCUMENT**
> Keep this document stored securely. This dossier contains master administrative credentials and 2-Factor authentication procedures for the **Urban Vein HQ Control Center**.

---

## 🔑 1. Executive Master Credentials

| Security Field | Value / Access Credential |
| :--- | :--- |
| **HQ Admin Portal URL** | `https://www.urbanvein.in/admin` |
| **Master Security Key** | `UV-HQ-2026-X99` |
| **Master Access Passcode** | `urbanvein2026` |
| **Default 2FA Override Code** | `849201` |
| **Primary Authorized Email** | `urbanvein10@gmail.com` |
| **Secondary Authorized Email**| `kingmohit276@gmail.com` |
| **Corporate Domain Emails** | `@urbanvein.in` *(All team emails receive automatic admin clearance)* |

---

## 🔒 2. Two-Factor Authentication (2FA) Procedure

When logging into `https://www.urbanvein.in/admin`:

1. **Step 1 — Master Authentication**:
   - Enter either the **Master Access Passcode** (`urbanvein2026`) or **Master Security Key** (`UV-HQ-2026-X99`).
2. **Step 2 — 2-Factor OTP Challenge**:
   - The system generates a 6-digit dynamic OTP code on-screen (and dispatches to the active admin session).
   - Enter the displayed **6-Digit Security Code** (or fallback code `849201`) to unlock the live sales dashboard.
3. **Session Persistence**:
   - Once verified, a 24-hour encrypted session token is stored in the browser.
   - Click **Sign Out** or clear browser storage to re-lock the portal immediately.

---

## 📊 3. Live HQ Capabilities

- **Real-Time Revenue Analytics**: Live sales counter in ₹, Average Order Value (AOV), and gross revenue tracking.
- **Supabase Live WebSocket Feed**: Orders placed on `https://www.urbanvein.in` sync in real time without refreshing.
- **1-Click Customer Order Status Toggles**: Update orders from `Processing` ➔ `Shipped` ➔ `Delivered`.
- **1-Click Shipping Manifest CSV Export**: Download formatted CSVs for shipping label printing.
- **Day & Night Studio Themes**: Toggle between Dark Cyber Studio and Light Minimalist Studio.

---

## 🚨 4. Emergency Recovery Protocol

- **Revoking Access**: To revoke an admin's access, remove their email from `ADMIN_EMAILS` or change their role in the Supabase Auth Users table.
- **Domain Verification**: Ensure SMTP settings remain connected to `smtp.resend.com:587` with sender `support@urbanvein.in`.
