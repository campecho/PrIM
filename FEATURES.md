# Print Management Portal Features

This application is a comprehensive operational portal designed for print service providers and their clients to manage print workflows, assets, specs, and orders.

## Core Modules

### 1. Program Dashboard
- **Customer Management:** View and manage a list of program print customers.
- **Customer Profiles:** 
  - Manage details, notes, and specific print settings per customer.
  - View pinned notes or history for customer interactions.
  - Specifically assign available **Print Specs** directly to a customer account.
- **File Assignment:** Easily assign imported or uploaded files directly to specific customer accounts to maintain strict version control and history.

### 2. Projects Module
- **Project Tracking:** High-level dashboard to view Active and Completed projects.
- *Future capabilities*: Project scoping, scheduling, and milestone tracking.

### 3. Files Management
- **Asset Library:** Securely host and manage file assets across all accounts.
- **Status Workflows:** Categorize file assets into working stages: `Pre-flight`, `Review`, `Approved`, or `Rejected`.
- **Advanced Filtering & Search:**
  - Search by Customer Account, Company Name, or File Name.
  - Filter by precise file types (PDF, JPG, PNG, etc).
  - Sort by date and track files that require immediate attention.
- **Drafts & Importing:** File import queue that allows batch uploads and metadata definition before formally saving files to the library.

### 4. Products & Specifications Library (Specs)
- **Centralized Print Specs:** Manage production-level definitions including bleed specifications, sizing, JDF tokens, media, and finish preferences.
- **Component Resources Directory:**
  - **Finished Sizes:** Manage standard dimensions (e.g., A4, US Letter, Custom Cut).
  - **Media:** Track paper stock, rigid substrates, or roll media parameters.
  - **Finishing Options:** Die-cutting, binding, folding, or laminating specs.
  - **Colors:** Identify and name required color matching or production types.
  - **Impressions:** Manage coating or impression techniques.
- **Production Types:** Link products directly to internal routing groups like *Cut Sheet*, *Wide Format Roll*, or *Wide Format Rigid*.

### 5. Orders Tracker
- **Order Queue:** Monitor incoming print orders.
- **Cross-referencing:** Review linked customer external IDs and system order numbers.
- **Status Flagging:** Specific alerting on orders requiring urgent prepress or production attention.

### 6. Settings & Administration
- **Global Config:** Define core variables for the platform natively like bleed inches per production type.
- **Database Synchronization:** Underlying support for Firestore to ensure seamless live updates securely.

### 7. User Role Simulation
- **Context Switching:** Simulated authentication allowing UI preview under distinct internal user personas.
