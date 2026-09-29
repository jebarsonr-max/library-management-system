# LIBRARY BOOK MANAGEMENT SYSTEM USING STRUCTURES

> **Academic Project Submission for First-Year Engineering / Computer Science**  
> **Course:** Programming for Problem Solving / Data Structures in C  
> **Core Concept:** Structures in C (`struct Book`), Array of Structures, File Handling (`fopen`, `fwrite`, `fread`), Validation, and Responsive Web Application.

---

## 📋 Live Website Demonstration

- **Live Web Application URL:** `https://your-username.github.io/library-management-system/` *(or Vercel / Netlify deployment)*
- **GitHub Repository:** `https://github.com/your-username/library-management-system`

---

## 🎯 1. Project Objective

The primary objective of this project is to develop a complete, user-friendly **Library Book Management System** that demonstrates how real-world entities (books) can be modeled and manipulated using **Structures in C programming** (`struct Book`).

The project provides:
1. **Academic Standalone C Program (`c-program/library_management.c`)**: A menu-driven console application demonstrating `struct Book`, pointer manipulation, and binary file persistence.
2. **Interactive Modern Web Application (`index.html`, `style.css`, `script.js`)**: A responsive dashboard deployable on 100% free hosting (GitHub Pages, Vercel, Netlify) that visually mirrors the exact same academic `struct Book` data schema, business logic, and validation rules.

---

## 🧩 2. Core Academic Concept: C `struct Book`

### What is a Structure?
A **Structure** in C is a user-defined composite data type that allows grouping variables of different data types (heterogeneous data) under a single identifier name.

### Academic Definition

```c
struct Book {
    int   bookId;            // Unique numeric identifier for the book (4 bytes)
    char  title[100];        // Title of the book (100 bytes character array)
    char  author[100];       // Author name (100 bytes character array)
    float price;             // Price per copy (4 bytes floating-point)
    int   quantity;          // Total copies owned by the library (4 bytes)
    int   availableQuantity; // Number of copies currently on shelf (4 bytes)
};
```

### Memory Map Layout per Book Record
```
+----------------+----------------+----------------+----------------+----------------+-------------------+
|  bookId (4B)   |  title (100B)  | author (100B)  |   price (4B)   |  quantity (4B) | availableQty (4B) |
+----------------+----------------+----------------+----------------+----------------+-------------------+
0                4               104              204              208              212                 216 Bytes
```
*Each `struct Book` instance occupies **216 contiguous bytes** in memory.*

### Array of Structures
To manage up to 200 books in memory:
```c
#define MAX_BOOKS 200
struct Book library[MAX_BOOKS];
int bookCount = 0;
```

---

## ✨ 3. System Features

| # | Feature | Description |
|---|---|---|
| **1** | **Add Book** | Inserts a new `struct Book` with duplicate ID prevention and required field checks. |
| **2** | **View All Books** | Lists all registered books in formatted tabular or card grid views. |
| **3** | **Search by ID** | Instant lookup by primary key integer (`bookId`). |
| **4** | **Search by Title** | Substring keyword search across book titles and authors. |
| **5** | **Issue Book** | Decrements `availableQuantity` by 1; strictly prevents borrowing when stock is 0. |
| **6** | **Return Book** | Increments `availableQuantity` by 1; prevents returning beyond total copies. |
| **7** | **Update Book** | Modifies title, author, price, and total quantity in place. |
| **8** | **Delete Book** | Permanently deletes a book record with confirmation prompt and array shifting. |
| **9** | **View Available Books** | Filters catalog to display only books with `availableQuantity > 0`. |
| **10** | **Real-Time Dashboard** | Shows Total Distinct Titles, Total Physical Stock, Available Copies, Issued Copies, Valuation, and Stock Balance Bar. |
| **11** | **`struct Book` Visualizer** | Interactive tab that shows live C code syntax and memory byte breakdown for any chosen book. |
| **12** | **Data Persistence** | C program uses `library_books.dat` binary I/O; Web app uses browser `localStorage` + JSON export/import. |

---

## 🛠️ 4. Technology Stack

- **Console Backend:** C Language (C99 / C11 standard)
- **Web Frontend:** HTML5, Modern Vanilla CSS3, Vanilla JavaScript (ES6+)
- **Icons & Fonts:** FontAwesome 6, Google Fonts (`Plus Jakarta Sans` & `JetBrains Mono`)
- **Storage:**
  - C: `library_books.dat` via `fwrite()` and `fread()`
  - Web: Browser `localStorage` + JSON/CSV Export & Import

---

## 📁 5. Project Folder Structure

```text
Library-Management-System/
│
├── index.html                  # Main responsive web interface & dashboard
├── style.css                   # Modern CSS styling (Light & Dark theme, responsive)
├── script.js                   # JavaScript engine modeling C struct Book & state
├── README.md                   # Complete academic documentation & viva guide
└── c-program/
    └── library_management.c    # Standalone C program demonstrating struct Book & File I/O
```

---

## 🚀 6. How to Run Locally

### A. Running the Standalone C Program

#### Option 1: Using GCC (Command Line / Terminal)
```bash
# Navigate to c-program folder
cd c-program

# Compile with GCC
gcc library_management.c -o library_management

# Run on Windows
library_management.exe

# Run on Linux / macOS
./library_management
```

#### Option 2: Using Code::Blocks / Dev-C++ / VS Code
1. Open `c-program/library_management.c` in your IDE.
2. Click **Build and Run** (or press `F9`).
3. The interactive console menu will appear.

---

### B. Running the Web Application

1. Simply double-click `index.html` in your file explorer to open it in any web browser (Chrome, Edge, Firefox, Safari).
2. Alternatively, if using VS Code: Right-click `index.html` and click **"Open with Live Server"**.

---

## 🌐 7. Free Deployment Guide (Step-by-Step)

You can host this project on **100% free hosting platforms** without spending any money.

---

### Method A: Deploy on GitHub Pages (Recommended)

1. **Create a GitHub Repository**:
   - Go to [GitHub.com](https://github.com) and click **"New Repository"**.
   - Name it `library-book-management-system`.
   - Set visibility to **Public** and click **Create repository**.

2. **Push the Project from your Computer**:
   Open Terminal / PowerShell in the project directory:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Library Book Management System using Structures"
   git branch -M main
   git remote add origin https://github.com/your-username/library-book-management-system.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**:
   - In your GitHub repo, go to **Settings** > **Pages** (in the left sidebar).
   - Under **Build and deployment** > **Source**, select **Deploy from a branch**.
   - Under **Branch**, select `main` and `/ (root)`, then click **Save**.
   - Wait 1 minute. Your live URL will be ready at:
     ```text
     https://your-username.github.io/library-book-management-system/
     ```

---

### Method B: Deploy on Vercel (Free)

1. Go to [vercel.com](https://vercel.com) and log in with GitHub.
2. Click **"Add New Project"** > **"Import Git Repository"**.
3. Select your `library-book-management-system` repository.
4. Click **Deploy**.
5. Within 10 seconds, Vercel will provide your free production URL:
   ```text
   https://library-book-management-system.vercel.app
   ```

---

### Method C: Deploy on Netlify (Free Drag & Drop)

1. Go to [netlify.com](https://netlify.com) and log in.
2. Go to **"Sites"** and drag-and-drop the entire `Library-Management-System` folder into the upload box.
3. Your website is instantly live at a free URL like:
   ```text
   https://libstruct-system.netlify.app
   ```

---

## 🎓 8. Academic Viva Voce Questions & Answers

### Q1: What is a structure in C, and why did you use it?
> **Answer:** A structure (`struct`) in C is a user-defined data type that groups related variables of different data types into a single unit. In our project, a book has multiple diverse properties (integer ID, character arrays for title/author, float price, integer quantity). Grouping them inside `struct Book` allows treating each book as an indivisible record.

### Q2: What is the difference between a `struct` and an `array`?
> **Answer:** 
> - An **array** is a collection of homogeneous elements (all of the exact same data type, e.g., `int arr[10]`).
> - A **structure** is a collection of heterogeneous elements (elements of different data types grouped together under one name).

### Q3: How is data stored permanently in the C program?
> **Answer:** Data persistence is achieved via binary file handling using standard C functions:
> - `fopen("library_books.dat", "wb")` opens the file in write-binary mode.
> - `fwrite(&bookCount, sizeof(int), 1, fp);` writes the total number of records.
> - `fwrite(library, sizeof(struct Book), bookCount, fp);` writes the entire array of structures to disk in a single contiguous write.
> - `fread()` reloads the database into memory when the program starts.

### Q4: How does your system prevent invalid issue or return operations?
> **Answer:**
> - **Issue Validation:** The program checks if `availableQuantity > 0`. If copies are 0, it blocks the issue and displays an "Out of Stock" alert.
> - **Return Validation:** The program checks if `availableQuantity < quantity`. If all copies are already present in the library, it blocks returning extra phantom copies.

### Q5: What is the purpose of passing `const struct Book* b` with pointers?
> **Answer:** Passing by pointer (reference) avoids copying the 216 bytes of the structure onto the call stack for every function call. Using `const` ensures the function is read-only and cannot accidentally alter book data.

---

## 👨‍💻 Project Submission Details

- **Project Title:** Library Book Management System Using Structures
- **Domain:** Systems Programming & Web Technologies
- **Target Audience:** First-Year Engineering Examination / Practical Assessment
- **Status:** Complete, Tested, and Production-Ready.
