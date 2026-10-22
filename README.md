# 🛒 POS System — .NET 8 + WPF + SQLite

A complete, local-only Point of Sale (POS) desktop application built with **.NET 8**, **WPF**, **C#**, and **SQLite**. Runs entirely on a single Windows machine — no server, no internet required.

--

## ✨ Features

| Module | What it does |
|---|---|
| 🔐 **Login & Signup** | Username + password (SHA256 + per-user salt). Public signups are always Cashiers; Admins are created from the Users panel. |
| 🧾 **Sales / Checkout** | Search products by name or barcode, add to cart, apply % discount, choose payment method (Cash / Card / Mobile), complete sale, print receipt. Cash payments validate that the amount received covers the total and show the correct change. |
| ⚖️ **Weight-based products** | Mark a product as weight-based and enter its stock and prices per kilogram. Checkout adds half a kilogram at a time, displays the unit on the receipt, and keeps fractional stock, sale, return, quotation, and report quantities. |
| 📦 **Inventory** | Full CRUD for products. Stock auto-decreases after every sale (atomic DB transaction). Rows highlight in **yellow** when `Stock <= MinStock`. CSV import/export includes the weight-based setting and decimal stock quantities. |
| 💳 **Payments** | Three methods recorded per sale: Cash, Card, Mobile. |
| 📊 **Reports** | Date-range sales and profit summaries, payment-method totals, top products, period comparisons, profit by category, dormant stock, imported mobile-representative sales, customer/trader statements, and daily invoice/cash-movement reports. |
| 🧾 **Invoice history** | Browse all sales invoices, open the full receipt and print it. |
| 💰 **Cash register** | Track daily cash movements, deposits, returns, withdrawals, collections, and balance summaries. |
| 👥 **Customers and traders** | Review customer balances and payments, and trader statements and purchase invoices. |
| ⚙️ **Settings** | Configure store identity and appearance, automatic/manual database backups, and mobile catalog export. |
| 👥 **Users (Admin only)** | Add/delete cashiers and admins. |

### Reports, printing, and PDF

Reports are arranged by purpose: **Cash drawer** (select a day to inspect invoices and incoming/outgoing cash, opening balance, and the amount remaining in the drawer), **Sales and profit** (date-range sales, costs, net profit, category profit, period comparisons, top products, and representative-phone invoices), **Capital and purchases** (purchase invoice totals, amounts paid on those invoices, and their remaining balances for a selected period), and **Other reports** (dormant/low-stock products and customer/trader accounts). Double-click a sales invoice to open and print its full receipt.

Use each report's print action and choose **Microsoft Print to PDF** in the Windows print dialog to save a PDF. Cash drawer invoices and movements can be printed separately for an auditable daily report. Card and mobile payments are not counted as physical cash in the drawer; credit invoice payments are.

The floating **Quick Assistant** runs locally against the on-device database and answers Arabic questions about the cash drawer, sales/profit, purchases, customers/traders, products, and invoice contents. It also provides period comparisons, category profit, dormant products, low-stock alerts, top sellers, mobile-representative invoices, and a daily detail report with invoice contents and cash movements. It handles common hamza/diacritic differences in names, supports date periods such as today, yesterday, this/last month, and the last N days, and can continue a report with short follow-ups such as "طيب امبارح؟". Results can be printed or saved using Microsoft Print to PDF.

### Roles
- **Admin** sees: Checkout, Inventory, Reports, Users.
- **Cashier** sees: Checkout only.

### Default seeded accounts (created on first run)
| Username | Password | Role |
|---|---|---|
| `admin` | `admin123` | Admin |
| `cashier1` | `cashier123` | Cashier |
| `cashier2` | `cashier123` | Cashier |

The database also seeds 10 sample products on first run so reports and inventory aren't empty.

---

## 📋 Requirements (for you and your friend)

- **Windows 10 or Windows 11** (WPF is Windows-only)
- **.NET 8 SDK** — download here: <https://dotnet.microsoft.com/download/dotnet/8.0>
  (Pick **".NET 8.0 SDK"** for Windows x64.)
- *(Optional)* **Visual Studio 2022** (Community edition is free) — only if you prefer an IDE over the command line.

You only need the SDK. You do NOT need to install SQLite separately — the app's NuGet package handles it.

---

## ▶️ How to run the project

### Option A — Easiest (command line)

1. **Unzip** `POSSystem.zip` somewhere, e.g. `C:\Projects\POSSystem`.
2. Open **Command Prompt** or **PowerShell** in that folder.
3. Run:
   ```
   cd POSSystem
   dotnet restore
   dotnet run
   ```
   The first `dotnet restore` downloads SQLite + dependencies (needs internet **once**). After that the app runs offline.
4. The login window opens. Use one of the default accounts above.

### Option B — Visual Studio 2022

1. Unzip the project.
2. Double-click **`POSSystem.sln`**.
3. Press **F5** (or click ▶ Start). Visual Studio handles restore + build + run.

### Option C — Build a portable EXE to share

If you want to give your friend a single ready-to-run EXE (no SDK install on their machine):

```
cd POSSystem
dotnet publish -c Release -r win-x64 --self-contained true /p:PublishSingleFile=true
```

The output appears in:
```
POSSystem\bin\Release\net8.0-windows\win-x64\publish\
```

Send the `publish` folder. Your friend just double-clicks `POSSystem.exe`. No .NET install needed on their side.

---

## 🗄️ Where is the database stored?

A file called **`pos.db`** is created next to the executable on first run. All users, products, sales, and sale items live in there. To **reset the system**, just delete `pos.db` and restart — it will recreate itself with default accounts and sample products.

---

## 📁 Project Structure

```
POSSystem/
├── POSSystem.sln
├── README.md
└── POSSystem/
    ├── POSSystem.csproj         ← project + SQLite dependency
    ├── App.xaml / App.xaml.cs   ← startup + global styles
    ├── Models/                  ← User, Product, Sale, SaleItem, CartItem
    ├── Data/
    │   └── DatabaseHelper.cs    ← creates pos.db, schema, seeds defaults
    ├── Helpers/
    │   └── PasswordHasher.cs    ← SHA256 + salt
    ├── Services/                ← Auth, Product, Sale, User, Report, Session
    ├── Views/                   ← Login, Signup, Main, Receipt, ProductDialog
    └── UserControls/            ← Checkout, Inventory, Reports, Users
```

---

## 🧪 Quick test workflow

1. Launch the app, login as `admin` / `admin123`.
2. Go to **Inventory** → confirm 10 sample products are listed.
3. Go to **Checkout** → search "Cola" → click **+ Add** → click **✓ Complete Sale** → receipt window opens.
4. Go to **Inventory** → notice the stock for that product decreased.
5. Go to **Reports** → click **Today** → see the sale you just made, with revenue + profit.
6. Logout → login as `cashier1` / `cashier123` → confirm only Checkout is visible.
7. In **Inventory**, add a product with **Weight-based** enabled, set its price per kilogram and stock in kilograms, then add it in **Checkout**. Start with 0.5 kg and use **+** once for 1 kg; confirm the receipt and remaining stock show the correct weight.

## 📱 Mobile sales companion

The mobile sales companion is the installable PWA served from the repository root (`index.html`). It works offline and stores its catalog, invoices, customers, and daily reports locally on the phone.

### Transfer the desktop catalog to a phone

1. In the desktop app, open **Settings** and export the mobile catalog JSON.
2. On the phone, open the PWA, go to **Settings**, choose **Import desktop data / restore phone**, and select that JSON file.
3. The catalog transfer includes product IDs, barcodes, prices, stock, and the **Weight-based** flag. Re-export the catalog after enabling weight sales or changing stock so the phone has the latest data.
4. In a mobile invoice, choose a weight-based product to enter quantities in 0.5 kg increments. Saving checks and deducts the phone's local stock; editing and deleting invoices recalculate it.

### Transfer mobile invoices to the desktop

1. On the phone, select the relevant day in **Reports**, return to **Sales**, and choose **Generate system transfer code**; alternatively, download the JSON transfer file from that transfer screen.
2. On the desktop, open the mobile representative-sales import screen and scan the QR or load the JSON.
3. Imported invoice items are matched by product ID, barcode, or name. Weight quantities remain decimal and are validated against the desktop product and stock.

Transfers are manual; the desktop and phone do **not** synchronize live, even when both are online. Use **Save phone backup** and restore it from the same Settings screen to preserve or move the phone's local data. Restoring a phone backup replaces the phone's current catalog, customers, invoices, and days.

---

## 🛠️ Troubleshooting

**"dotnet is not recognized as a command"**
You haven't installed the .NET 8 SDK, or it's not on PATH. Reinstall from the link above and reopen your terminal.

**"Cannot open file pos.db"** or weird DB errors
Delete `pos.db` (next to the .exe or in `POSSystem\bin\Debug\net8.0-windows\`) and restart the app — it will rebuild from scratch.

**Build error mentioning Microsoft.Data.Sqlite**
Run `dotnet restore` once with internet, then build again.

**App opens but no products show in Inventory**
You probably ran a build that created `pos.db` before products were seeded. Delete `pos.db` and re-run.

---

Made with care. Happy selling 🛒
# POINT-OF-SALE-SYSTEM
