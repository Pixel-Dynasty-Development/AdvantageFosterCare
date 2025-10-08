# Advantage Family Outreach & Foster Care - Website Project

This document provides a summary of the development and architectural state of the Advantage Family Outreach & Foster Care website.

### **Company Overview**

- **Company Name:** Advantage Family Outreach & Foster Care
- **Mission:** To create environments that empower children to grow, heal, and thrive.
- **Core Business:** A private foster care agency licensed by the Ohio Department of Youth Services.

### **Services & Programs**

- **Specialized Foster Care:** For children with specific needs.
- **Sibling Group Placements:** Facilitates keeping siblings together.
- **Therapeutic Foster Homes:** Provides therapeutic environments for children.
- **Group Homes:** Offers a structured living environment.
- **Support:** Offers training and resources for foster families, along with 24/7 support.

### **Contact Information**

- **Main Phone:** (419) 526-KIDS or (419) 526-5437
- **Email:** info@advantagefostercare.com
- **Foster Parent Inquiries:** Contact Shannon, Foster Parent Coordinator, at 614-312-8778.

---

### **Project Architecture**

The website is built as a modern single-page application (SPA) managed by a central router in `assets/js/main.js`. It uses the browser's History API for clean, path-based URLs (e.g., `/about-us`).

- `index.html`: The main and only HTML shell for the entire application. It contains the Tailwind CSS configuration and placeholders for dynamic content.
- `404.html`: A copy of `index.html`, used as a workaround for GitHub Pages to support the History API and enable correct routing on page refreshes.
- `/assets`: Contains all static assets (CSS, JS, images).
- `/components`: Reusable HTML snippets like navigation bars and the footer.
- `/pages`: Individual content pages that are dynamically loaded into the `index.html` shell.

### **Color Scheme**

The website uses a unified and modern color palette defined in `index.html`.

- **Primary Blue:** `#5496dc`
- **Dark Blue:** `#2c5282`
- **Accent Gold:** `#e5b839`
- **Employee Portal (Slate):** `#4a5568`
- **Foster Portal (Teal):** `#2c7a7b`

### **Portals & URLs**

The application features two distinct, secure portals.

- **Employee Portal:**
  - **Login URL:** `/employee-login`
  - **Dashboard URL:** `/employee-dashboard`
- **Foster Parent Portal:**
  - **Login URL:** `/foster-login`
  - **Dashboard URL:** `/foster-dashboard`

### **Development Login Credentials**

- **Employee Login:**
  - **Username:** `admin_user`
  - **Password:** `admin`
- **Foster Parent Login:**
  - **Username:** `foster_parent`
  - **Password:** `parent`

### **Project Timeline**

- **Start Date:** September 15, 2025
- **Phase 1 (Core Architecture & SPA Setup):** Completed October 2025
- **Phase 2 (Content Integration & Styling):** In Progress
- **Phase 3 (Advanced Features & Testing):** TBD
- **Launch Date:** TBD

### **Technologies Used**

- **HTML5 & CSS3**
- **Tailwind CSS:** A utility-first CSS framework for rapid styling.
- **JavaScript (Vanilla):** Used for all routing, content loading, and dynamic functionality.
- **Lucide Icons:** Open-source icons used throughout the site.
