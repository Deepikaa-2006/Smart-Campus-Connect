# Smart Campus Connect - College Management Portal
> **Full-Stack Academic Web Programming Project**  
> Demonstrating end-to-end concepts across all 5 syllabus units of the Web Programming course curriculum.

---

## 📖 1. Project Overview

**Smart Campus Connect** is a responsive college management web portal designed for **Students**, **Faculty**, and **Administrators**. It delivers centralized academic digital governance including attendance tracking, course assignment management, event registrations, circular broadcasting, and student grievance resolution.

### Technology Stack & Syllabus Alignment

| Course Unit | Technology | Demonstrated Concepts & Implementation |
|---|---|---|
| **Unit 1** | **HTML5** | Semantic tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`, `<dialog>`), structured tables, accessible form controls (`email`, `tel`, `date`, `number`, `select`). |
| **Unit 2** | **CSS3** | CSS Custom Properties (Variables), CSS Grid & Flexbox, responsive sidebar layout, card designs, smooth transitions, keyframe animations, and mobile/tablet media queries. |
| **Unit 3** | **JavaScript** | Client-side form validation with Regular Expressions (roll number, email format, password strength), dynamic DOM manipulation, interactive attendance gauge, modal dialogs, and async `fetch()` API calls. |
| **Unit 4** | **PHP** | RESTful backend API, PHP session management, input sanitization, secure password hashing using **BCrypt** (`password_hash`), and **PDO Prepared Statements** for 100% SQL injection prevention. |
| **Unit 5** | **XML** | XML Schema Definition (`.xsd`), Document Type Definition (`.dtd`), live XML generation from MySQL using PHP `DOMDocument`, schema validation, SimpleXML ingestion, and Java DOM/SAX parsers. |
| **Unit 6** | **Java Servlets** | `HttpServlet`, `HttpServletRequest`, `HttpServletResponse`, `HttpSession` management, and standard deployment descriptor (`web.xml`). |
| **Unit 7** | **JDBC** | `DriverManager`, `Connection`, `PreparedStatement`, and `ResultSet` executing transactional CRUD queries against MySQL. |
| **Unit 8** | **MySQL** | Relational database schema with foreign keys, cascading constraints, unique indexes, and seed sample data. |
| **Unit 9** | **React JS** | Modern interactive dashboards built with Vite + React 18, reusable functional components (`Navbar`, `Sidebar`, `StatCard`, `AttendanceGauge`, `Modal`), props, and state hooks (`useState`, `useEffect`, React Context). |

---

## 🗂️ 2. Project Directory Structure

```
web progam/
├── database/
│   ├── schema.sql                 # Complete MySQL schema (tables, foreign keys, constraints)
│   ├── sample_data.sql            # Seed data with BCrypt hashed passwords
│   └── setup_db.php               # Automated 1-click database initialization script
│
├── backend-php/                   # Unit 4: PHP Server-Side Processing
│   ├── config/
│   │   └── db.php                 # Secure PDO connection & JSON response helpers
│   ├── api/
│   │   ├── auth.php               # Login, Student Registration, Session & Logout
│   │   ├── student.php            # Profile, attendance stats, assignments & announcements
│   │   ├── attendance.php         # Roster retrieval & batch attendance recording
│   │   ├── assignments.php        # Create, view, submit & grade course assignments
│   │   ├── events.php             # Event listing, creation & student registration
│   │   ├── announcements.php      # Campus circular broadcaster with role targeting
│   │   ├── admin.php              # Full student/faculty CRUD management & stats
│   │   └── feedback.php           # Student grievance submission & admin resolution
│   └── test_api.php               # Automated test suite verifying 10 core endpoints
│
├── frontend-html/                 # Units 1, 2, 3: Pure HTML5, CSS3 & JavaScript
│   ├── index.html                 # College portal landing page & hero
│   ├── login.html                 # Unified multi-role login with 1-click demo chips
│   ├── register.html              # Student registration form with live regex validation
│   ├── student-dashboard.html     # Student portal with attendance gauge & assignments
│   ├── faculty-dashboard.html     # Faculty portal with interactive class attendance marker
│   ├── admin-dashboard.html       # Administration portal with CRUD directories
│   ├── events.html                # College events catalog with search & filters
│   ├── feedback.html              # Student feedback form with 5-star rating widget
│   ├── xml-exchange.html          # Interactive XML data viewer & XSD validator
│   ├── css/                       # main.css, layout.css, components.css, animations.css
│   └── js/                        # api.js, validation.js, auth.js, student.js, faculty.js, admin.js, etc.
│
├── xml-module/                    # Unit 5: XML Structured Data Exchange
│   ├── schema/
│   │   ├── campus_report.xsd      # XML Schema Definition (XSD) with data types & constraints
│   │   └── events.dtd             # Document Type Definition (DTD) for event feeds
│   ├── data/
│   │   ├── sample_report.xml      # Conforming XML academic report
│   │   └── sample_events.xml      # Conforming XML events feed
│   ├── parser_php/
│   │   ├── export_xml.php         # Generates XML from MySQL using PHP DOMDocument
│   │   ├── validate_xml.php       # Validates XML documents against campus_report.xsd
│   │   └── import_xml.php         # Parses and processes XML using PHP SimpleXMLElement
│   └── parser_java/
│       ├── XMLReportGenerator.java# Java DOM XML report generator
│       └── XMLFeedParser.java     # Java DOM XML feed parser
│
├── backend-java/                  # Units 6 & 7: Java Servlets & JDBC
│   ├── src/com/smartcampus/
│   │   ├── config/DBConnection.java       # JDBC connection manager
│   │   ├── dao/                           # JDBC PreparedStatement DAOs (Student, Attendance, Event)
│   │   ├── servlets/                      # HttpServlets (Student, Attendance, Event, Auth)
│   │   └── server/StandaloneServletRunner.java # Embedded HTTP server for immediate execution
│   ├── lib/                       # servlet-api.jar and mysql-connector-j.jar
│   ├── web/WEB-INF/web.xml        # Standard Tomcat deployment descriptor
│   ├── compile.bat                # 1-click Java build script
│   └── run_java_service.bat       # 1-click Java service launcher
│
├── frontend-react/                # Unit 9: Modern React JS Dashboards
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   │   ├── context/AuthContext.jsx
│   │   ├── components/            # Reusable Navbar, Sidebar, StatCard, AttendanceGauge, Modal
│   │   ├── pages/                 # Role-based dashboard pages
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── dist/                      # Production build output
│
└── README.md
```

---

## 🔑 3. Default Demo Accounts

All pre-seeded test accounts use the password: `Password@123`

| Role | Username | Email | Full Name / Title |
|---|---|---|---|
| **Administrator** | `admin` | `admin@smartcampus.edu` | Dr. Ramesh Kumar (Principal) |
| **Faculty Member** | `prof_sharma` | `sharma@smartcampus.edu` | Prof. Rajesh Sharma (Associate Professor) |
| **Student** | `rahul_v` | `rahul.verma@smartcampus.edu` | Rahul Verma (Roll: `CS2023-001`) |
| **Student** | `priya_s` | `priya.sharma@smartcampus.edu` | Priya Sharma (Roll: `CS2023-002`) |

---

## 🚀 4. Step-by-Step Execution Guide

### Prerequisites
1. **XAMPP / MySQL**: Make sure MySQL is running on port `3306`.
2. **PHP**: PHP 8.x with `pdo_mysql` extension (included with XAMPP).
3. **Java**: OpenJDK 11 or higher installed and on `PATH`.
4. **Node.js**: Node.js v18+ and `npm`.

---

### Step 1: Initialize Database (MySQL)

Run the automated PHP migration script from the project root:
```bash
# Using XAMPP PHP:
C:\xampp\php\php.exe database/setup_db.php

# Or if php is on your system PATH:
php database/setup_db.php
```
*Expected Output:* Creates the `smart_campus_connect` database, creates all 11 tables with relational foreign keys, and seeds sample data.

---

### Step 2: Start PHP Backend API Server

Start the PHP development server on port `8000`:
```bash
# In the project root:
C:\xampp\php\php.exe -S localhost:8000
```
Run automated test suite to verify all 10 API tests pass:
```bash
C:\xampp\php\php.exe backend-php/test_api.php
```

---

### Step 3: Run HTML5/CSS3/JavaScript Frontend

1. Open your web browser and navigate to:
   ```
   http://localhost:8000/frontend-html/index.html
   ```
   *(Or double-click `frontend-html/index.html` directly in your file explorer for standalone mode)*
2. Click **Portal Login** or use the **1-Click Demo Accounts** on `login.html` to log in as Student, Faculty, or Admin.

---

### Step 4: Run & Test Java Servlets & JDBC Module

The Java module contains compiled `.class` files, source files, and dependencies (`servlet-api.jar`, `mysql-connector-j.jar`).

1. **Compile all Java sources:**
   ```cmd
   cd backend-java
   compile.bat
   ```
2. **Test JDBC connectivity:**
   ```cmd
   java -cp "bin;lib/*" com.smartcampus.config.DBConnection
   ```
3. **Run the Embedded Java Servlet Engine:**
   ```cmd
   run_java_service.bat
   ```
   The Java service starts on `http://localhost:8080`.
   * Test Student Servlet API: `http://localhost:8080/api/student?id=1`
   * Test Attendance Servlet API: `http://localhost:8080/api/attendance?semester=6`
   * Test Events Servlet API: `http://localhost:8080/api/events`
   * Test Service Health: `http://localhost:8080/api/health`

---

### Step 5: Test XML Generation & Validation Module

1. **Export live XML from MySQL:**
   ```cmd
   C:\xampp\php\php.exe xml-module/parser_php/export_xml.php
   ```
2. **Validate against XML Schema (XSD):**
   ```cmd
   C:\xampp\php\php.exe xml-module/parser_php/validate_xml.php
   ```
3. **Run Java XML Parser:**
   ```cmd
   java -cp "xml-module/bin" com.smartcampus.xml.XMLFeedParser "xml-module/data/sample_events.xml"
   ```
4. **Interactive XML UI:** Visit `http://localhost:8000/frontend-html/xml-exchange.html` to view, validate against XSD, and download XML reports in the browser.

---

### Step 6: Run React JS Modern Frontend

1. Open a new terminal and navigate to `frontend-react`:
   ```bash
   cd frontend-react
   npm run dev
   ```
2. Open your browser at:
   ```
   http://localhost:3000
   ```
3. Use the interactive Student, Faculty, and Admin dashboards with live props, state management, and real-time calculation gauges.

---

## 🔒 5. Security & Academic Best Practices

1. **Prepared Statements**: All database queries in PHP (PDO) and Java (JDBC) utilize parameterized Prepared Statements (`?` or `:placeholder`), completely mitigating SQL Injection.
2. **Password Hashing**: Passwords are never stored in plain text. They are hashed using BCrypt (`$2y$10$...`) via PHP's native `password_hash()` and verified using `password_verify()`.
3. **Dual Validation**:
   - **Client-Side**: Immediate regex validation on inputs for roll numbers (`CS2023-XXX`), emails, phone numbers, and password complexity in `js/validation.js`.
   - **Server-Side**: Strict type casting, regex re-validation, and email sanitation before any database writes.
4. **Atomic Transactions**: Relational inserts (e.g. creating a User and corresponding Student record) use database transactions (`beginTransaction()` / `commit()` / `rollBack()`) to maintain relational integrity.

---

## 🎓 6. Viva-Voce / Lab Exam Q&A Reference

* **Q1: What are semantic HTML5 elements and why are they used?**  
  *Answer:* Semantic elements (like `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`) clearly describe their meaning to both the browser and developer. They improve web accessibility (screen readers), SEO, and maintainable document structure compared to generic `<div>` tags.

* **Q2: How does CSS Flexbox differ from CSS Grid in this project?**  
  *Answer:* Flexbox is one-dimensional (used for navigation bars, button groups, and horizontal stat items), while CSS Grid is two-dimensional (used for multi-column dashboard layouts and card grids).

* **Q3: What is the purpose of Prepared Statements in PHP and Java?**  
  *Answer:* Prepared statements separate SQL query code from user-supplied input data. The database engine compiles the SQL query structure first, then treats inputs strictly as parameter values, preventing SQL Injection attacks.

* **Q4: What is the difference between an XML Schema (XSD) and a DTD?**  
  *Answer:* A DTD (Document Type Definition) defines basic element tags and structure using a legacy syntax without strong typing. An XML Schema (XSD) is written in XML itself, supports strongly typed data types (`xs:string`, `xs:integer`, `xs:decimal`), namespaces, and min/max value restrictions.

* **Q5: What is the Servlet Lifecycle in Java?**  
  *Answer:* A servlet lifecycle consists of:
  1. `init()`: called once when the servlet is first loaded.
  2. `service()`: called for every client request, dispatching to `doGet()` or `doPost()`.
  3. `destroy()`: called once when the servlet container shuts down or unloads the servlet.

* **Q6: In React, what is the difference between props and state?**  
  *Answer:* Props (properties) are read-only inputs passed from a parent component to a child component. State is mutable data managed locally within a component that triggers a UI re-render when updated via `useState()`.

---

**Developed for Academic Excellence & Laboratory Demonstration.**
