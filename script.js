/* ==========================================================================
   PROJECT TITLE: LIBRARY BOOK MANAGEMENT SYSTEM USING STRUCTURES
   ACADEMIC JAVASCRIPT ENGINE (Aligns 1:1 with C struct Book Model)
   ========================================================================== */

/**
 * Conceptual C Structure Equivalent:
 * 
 * struct Book {
 *     int bookId;
 *     char title[100];
 *     char author[100];
 *     float price;
 *     int quantity;
 *     int availableQuantity;
 * };
 */

// Storage Keys
const STORAGE_KEY_BOOKS = "libstruct_academic_books_v1";
const STORAGE_KEY_HISTORY = "libstruct_circulation_log_v1";
const STORAGE_KEY_THEME = "libstruct_theme_pref";

// Initial Academic Seed Dataset
const DEFAULT_BOOKS = [
    {
        bookId: 101,
        title: "The C Programming Language",
        author: "Dennis Ritchie & Brian Kernighan",
        price: 45.50,
        quantity: 10,
        availableQuantity: 8
    },
    {
        bookId: 102,
        title: "Data Structures and Algorithms in C",
        author: "Mark Allen Weiss",
        price: 55.00,
        quantity: 6,
        availableQuantity: 4
    },
    {
        bookId: 103,
        title: "Clean Code: A Handbook of Agile Software",
        author: "Robert C. Martin",
        price: 42.00,
        quantity: 8,
        availableQuantity: 8
    },
    {
        bookId: 104,
        title: "Introduction to Algorithms (CLRS)",
        author: "Thomas H. Cormen",
        price: 89.99,
        quantity: 5,
        availableQuantity: 2
    },
    {
        bookId: 105,
        title: "Operating System Concepts",
        author: "Silberschatz & Galvin",
        price: 68.50,
        quantity: 7,
        availableQuantity: 7
    }
];

// In-memory State
let libraryBooks = [];
let circulationHistory = [];
let pendingDeleteId = null;
let currentActiveView = "dashboard";
let currentViewMode = "table"; // 'table' or 'grid'

/* ==========================================================================
   INITIALIZATION & PERSISTENCE
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    loadTheme();
    loadLibraryData();
    initClock();
    setupNavigation();
    setupForms();
    setupModals();
    setupSearchAndFilters();
    setupShortcuts();
    renderAllViews();
});

function loadLibraryData() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY_BOOKS);
        if (stored) {
            libraryBooks = JSON.parse(stored);
        } else {
            libraryBooks = [...DEFAULT_BOOKS];
            saveLibraryData();
        }

        const storedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
        if (storedHistory) {
            circulationHistory = JSON.parse(storedHistory);
        } else {
            circulationHistory = [
                {
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    action: "ISSUE",
                    bookId: 101,
                    title: "The C Programming Language",
                    borrower: "First-Year Lab Demo",
                    availableAfter: 8
                }
            ];
            saveCirculationHistory();
        }
    } catch (e) {
        console.error("Failed to load local storage:", e);
        libraryBooks = [...DEFAULT_BOOKS];
    }
}

function saveLibraryData() {
    localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(libraryBooks));
}

function saveCirculationHistory() {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(circulationHistory));
}

/* ==========================================================================
   THEME TOGGLE
   ========================================================================== */
function loadTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) || "light";
    document.body.setAttribute("data-theme", savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const current = document.body.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.body.setAttribute("data-theme", next);
    localStorage.setItem(STORAGE_KEY_THEME, next);
    updateThemeIcon(next);
    showToast(`Switched to ${next.toUpperCase()} theme`, "info");
}

function updateThemeIcon(theme) {
    const icon = document.getElementById("themeIcon");
    if (icon) {
        icon.className = theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
    }
}

/* ==========================================================================
   LIVE CLOCK
   ========================================================================== */
function initClock() {
    const clockEl = document.getElementById("clockTime");
    const update = () => {
        if (clockEl) {
            const now = new Date();
            clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }
    };
    update();
    setInterval(update, 1000);
}

/* ==========================================================================
   NAVIGATION & VIEW ROUTING
   ========================================================================== */
function setupNavigation() {
    const navItems = document.querySelectorAll(".sidebar-nav .nav-item");
    navItems.forEach(item => {
        item.addEventListener("click", () => {
            const targetView = item.getAttribute("data-view");
            switchView(targetView);
            // Close mobile sidebar if open
            closeMobileSidebar();
        });
    });

    // Mobile Sidebar Toggles
    const openBtn = document.getElementById("mobileOpenSidebar");
    const closeBtn = document.getElementById("mobileCloseSidebar");
    const sidebar = document.getElementById("sidebar");

    if (openBtn && sidebar) {
        openBtn.addEventListener("click", () => sidebar.classList.add("open"));
    }
    if (closeBtn && sidebar) {
        closeBtn.addEventListener("click", closeMobileSidebar);
    }

    // Header Quick Buttons
    document.getElementById("btnQuickAddTop")?.addEventListener("click", () => switchView("add-book"));
    document.getElementById("heroBtnAddBook")?.addEventListener("click", () => switchView("add-book"));
    document.getElementById("heroBtnViewC")?.addEventListener("click", () => switchView("c-struct-view"));
    document.getElementById("heroBtnExportData")?.addEventListener("click", openBackupModal);
    document.getElementById("btnSeeAllInventory")?.addEventListener("click", () => switchView("inventory"));
    document.getElementById("btnInventoryAddBook")?.addEventListener("click", () => switchView("add-book"));

    // Dashboard Tiles
    document.getElementById("dashQuickAddBtn")?.addEventListener("click", () => switchView("add-book"));
    document.getElementById("dashQuickIssueBtn")?.addEventListener("click", () => switchView("issue-return"));
    document.getElementById("dashQuickReturnBtn")?.addEventListener("click", () => switchView("issue-return"));
    document.getElementById("dashViewAvailBtn")?.addEventListener("click", () => {
        switchView("inventory");
        const statusSelect = document.getElementById("filterStatusSelect");
        if (statusSelect) {
            statusSelect.value = "AVAILABLE";
            applyInventoryFilters();
        }
    });

    // Theme Toggle Button
    document.getElementById("themeToggleBtn")?.addEventListener("click", toggleTheme);

    // Reset Data Button
    document.getElementById("btnResetData")?.addEventListener("click", () => {
        if (confirm("Reset library database back to original sample academic books?")) {
            libraryBooks = JSON.parse(JSON.stringify(DEFAULT_BOOKS));
            circulationHistory = [];
            saveLibraryData();
            saveCirculationHistory();
            renderAllViews();
            showToast("Library database reset to initial academic sample data!", "success");
        }
    });

    // Clear History Button
    document.getElementById("btnClearHistoryBtn")?.addEventListener("click", () => {
        if (circulationHistory.length === 0) {
            showToast("Circulation history is already empty.", "info");
            return;
        }
        circulationHistory = [];
        saveCirculationHistory();
        renderCirculationHistory();
        showToast("Circulation history cleared.", "info");
    });

    // Viva Accordion Toggle
    document.querySelectorAll(".accordion-header").forEach(btn => {
        btn.addEventListener("click", () => {
            const item = btn.parentElement;
            item.classList.toggle("open");
        });
    });
}

function closeMobileSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.classList.remove("open");
}

function switchView(viewId) {
    currentActiveView = viewId;

    // Update Nav Active State
    document.querySelectorAll(".sidebar-nav .nav-item").forEach(btn => {
        if (btn.getAttribute("data-view") === viewId) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    // Update Panels
    document.querySelectorAll(".view-panel").forEach(panel => {
        if (panel.id === `view-${viewId}`) {
            panel.classList.add("active");
        } else {
            panel.classList.remove("active");
        }
    });

    // Update Breadcrumb
    const breadcrumb = document.getElementById("pageTitleBreadcrumb");
    if (breadcrumb) {
        const titles = {
            "dashboard": "Dashboard",
            "inventory": "Book Inventory",
            "add-book": "Add New Book",
            "issue-return": "Issue & Return Desk",
            "c-struct-view": "C struct Visualizer",
            "academic-guide": "Academic Guide & Viva"
        };
        breadcrumb.textContent = titles[viewId] || "Dashboard";
    }

    // Auto refresh view-specific content
    if (viewId === "inventory") {
        applyInventoryFilters();
    } else if (viewId === "c-struct-view") {
        populateCStructVisualizerOptions();
    } else if (viewId === "issue-return") {
        populateIssueReturnDropdowns();
    }
}

/* ==========================================================================
   RENDER ALL VIEWS & DASHBOARD METRICS
   ========================================================================== */
function renderAllViews() {
    renderDashboard();
    renderInventoryTable(libraryBooks);
    renderCirculationHistory();
    populateIssueReturnDropdowns();
    populateCStructVisualizerOptions();
    updateLiveCStructPreview();
}

function renderDashboard() {
    const totalTitles = libraryBooks.length;
    let totalCopies = 0;
    let totalAvailable = 0;
    let totalValue = 0;
    let lowStockCount = 0;

    libraryBooks.forEach(b => {
        totalCopies += Number(b.quantity);
        totalAvailable += Number(b.availableQuantity);
        totalValue += (Number(b.price) * Number(b.quantity));
        if (b.availableQuantity <= 2) {
            lowStockCount++;
        }
    });

    const totalIssued = totalCopies - totalAvailable;
    const availPercent = totalCopies > 0 ? Math.round((totalAvailable / totalCopies) * 100) : 0;
    const issuedPercent = totalCopies > 0 ? Math.round((totalIssued / totalCopies) * 100) : 0;

    // Update Dashboard DOM Elements
    document.getElementById("statUniqueTitles").textContent = totalTitles;
    document.getElementById("statTotalCopies").textContent = totalCopies;
    document.getElementById("statAvailableCopies").textContent = totalAvailable;
    document.getElementById("statIssuedCopies").textContent = totalIssued;

    document.getElementById("navTotalBadge").textContent = totalTitles;

    document.getElementById("statAvailablePercent").innerHTML = `<i class="fa-solid fa-circle-check"></i> ${availPercent}% in stock`;
    document.getElementById("statIssuedPercent").innerHTML = `<i class="fa-solid fa-arrow-right-from-bracket"></i> ${issuedPercent}% borrowed`;

    document.getElementById("legendAvailCount").textContent = `${totalAvailable} (${availPercent}%)`;
    document.getElementById("legendIssuedCount").textContent = `${totalIssued} (${issuedPercent}%)`;

    // Progress bar segment widths
    const barAvail = document.getElementById("barAvailSeg");
    const barIssued = document.getElementById("barIssuedSeg");
    if (barAvail) barAvail.style.width = `${availPercent}%`;
    if (barIssued) barIssued.style.width = `${issuedPercent}%`;

    // Inventory Valuation & Low Stock
    document.getElementById("statTotalValuation").textContent = `$${totalValue.toFixed(2)}`;
    document.getElementById("statLowStockCount").textContent = `${lowStockCount} Title${lowStockCount === 1 ? '' : 's'}`;

    // Badge Stock Status
    const badgeStock = document.getElementById("badgeStockStatus");
    if (badgeStock) {
        if (totalAvailable === 0 && totalTitles > 0) {
            badgeStock.textContent = "All Borrowed";
            badgeStock.className = "badge-status status-out";
        } else if (lowStockCount > 0) {
            badgeStock.textContent = `${lowStockCount} Low Stock`;
            badgeStock.className = "badge-status status-low";
        } else {
            badgeStock.textContent = "Healthy Stock";
            badgeStock.className = "badge-status status-avail";
        }
    }

    // Render Recent Books Table on Dashboard (top 5)
    renderDashboardRecentTable();
}

function renderDashboardRecentTable() {
    const tbody = document.getElementById("dashboardRecentTbody");
    if (!tbody) return;

    if (libraryBooks.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="text-align:center; padding: 24px;">No book records in system. Click "Add New Book" to begin.</td></tr>`;
        return;
    }

    const recent = [...libraryBooks].slice(0, 5);
    tbody.innerHTML = recent.map(book => {
        const issued = book.quantity - book.availableQuantity;
        let statusBadge = '';
        if (book.availableQuantity === 0) {
            statusBadge = `<span class="badge-status status-out"><i class="fa-solid fa-ban"></i> Out of Stock</span>`;
        } else if (book.availableQuantity <= 2) {
            statusBadge = `<span class="badge-status status-low"><i class="fa-solid fa-triangle-exclamation"></i> Low (${book.availableQuantity})</span>`;
        } else {
            statusBadge = `<span class="badge-status status-avail"><i class="fa-solid fa-check"></i> Available</span>`;
        }

        return `
            <tr>
                <td><span class="book-id-badge">ID #${escapeHtml(String(book.bookId))}</span></td>
                <td>
                    <span class="table-book-title">${escapeHtml(book.title)}</span>
                    <span class="table-book-author">by ${escapeHtml(book.author)}</span>
                </td>
                <td class="table-price">$${Number(book.price).toFixed(2)}</td>
                <td><strong>${book.quantity}</strong></td>
                <td><strong class="${book.availableQuantity === 0 ? 'text-danger' : 'text-emerald'}">${book.availableQuantity}</strong></td>
                <td>${statusBadge}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn-table-action btn-action-issue" onclick="openQuickIssueModal(${book.bookId})" title="Issue Book" ${book.availableQuantity <= 0 ? 'disabled' : ''}>
                            <i class="fa-solid fa-arrow-right-from-bracket"></i>
                        </button>
                        <button class="btn-table-action btn-action-return" onclick="handleDirectReturn(${book.bookId})" title="Return Book" ${book.availableQuantity >= book.quantity ? 'disabled' : ''}>
                            <i class="fa-solid fa-arrow-right-to-bracket"></i>
                        </button>
                        <button class="btn-table-action" onclick="openEditModal(${book.bookId})" title="Edit Details">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

/* ==========================================================================
   INVENTORY TABLE & GRID RENDERING
   ========================================================================== */
function renderInventoryTable(booksToRender) {
    const tbody = document.getElementById("inventoryTbody");
    const emptyState = document.getElementById("inventoryEmptyState");
    const gridContainer = document.getElementById("gridViewContainer");
    const tableContainer = document.getElementById("tableViewContainer");

    if (!tbody) return;

    if (booksToRender.length === 0) {
        tbody.innerHTML = "";
        if (emptyState) emptyState.style.display = "flex";
        if (gridContainer) gridContainer.innerHTML = "";
        return;
    }

    if (emptyState) emptyState.style.display = "none";

    // Table Render
    tbody.innerHTML = booksToRender.map(book => {
        const issued = book.quantity - book.availableQuantity;
        let statusBadge = '';
        if (book.availableQuantity === 0) {
            statusBadge = `<span class="badge-status status-out"><i class="fa-solid fa-ban"></i> Out of Stock</span>`;
        } else if (book.availableQuantity <= 2) {
            statusBadge = `<span class="badge-status status-low"><i class="fa-solid fa-triangle-exclamation"></i> Low (${book.availableQuantity})</span>`;
        } else {
            statusBadge = `<span class="badge-status status-avail"><i class="fa-solid fa-check"></i> Available</span>`;
        }

        return `
            <tr>
                <td><span class="book-id-badge">ID #${escapeHtml(String(book.bookId))}</span></td>
                <td>
                    <span class="table-book-title">${escapeHtml(book.title)}</span>
                </td>
                <td>
                    <span class="table-book-author">${escapeHtml(book.author)}</span>
                </td>
                <td class="table-price">$${Number(book.price).toFixed(2)}</td>
                <td>${book.quantity}</td>
                <td><strong class="${book.availableQuantity === 0 ? 'text-danger' : 'text-emerald'}">${book.availableQuantity}</strong></td>
                <td>${statusBadge}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn-table-action btn-action-issue" onclick="openQuickIssueModal(${book.bookId})" title="Issue 1 Copy" ${book.availableQuantity <= 0 ? 'disabled' : ''}>
                            <i class="fa-solid fa-arrow-right-from-bracket"></i>
                        </button>
                        <button class="btn-table-action btn-action-return" onclick="handleDirectReturn(${book.bookId})" title="Return 1 Copy" ${book.availableQuantity >= book.quantity ? 'disabled' : ''}>
                            <i class="fa-solid fa-arrow-right-to-bracket"></i>
                        </button>
                        <button class="btn-table-action" onclick="inspectBookInCVisualizer(${book.bookId})" title="Inspect struct Book">
                            <i class="fa-solid fa-code"></i>
                        </button>
                        <button class="btn-table-action" onclick="openEditModal(${book.bookId})" title="Edit Book">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn-table-action btn-action-delete" onclick="openDeleteModal(${book.bookId})" title="Delete Book">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");

    // Grid Cards Render
    if (gridContainer) {
        gridContainer.innerHTML = booksToRender.map(book => {
            const issued = book.quantity - book.availableQuantity;
            let statusBadge = book.availableQuantity === 0 ?
                `<span class="badge-status status-out">Out of Stock</span>` :
                (book.availableQuantity <= 2 ? `<span class="badge-status status-low">Low Stock</span>` : `<span class="badge-status status-avail">Available</span>`);

            return `
                <div class="book-card-item">
                    <div class="book-card-top">
                        <span class="book-id-badge">ID #${escapeHtml(String(book.bookId))}</span>
                        ${statusBadge}
                    </div>
                    <h3 class="book-card-title">${escapeHtml(book.title)}</h3>
                    <p class="book-card-author">by ${escapeHtml(book.author)}</p>
                    <div class="book-card-stats">
                        <div>Price: <strong class="text-emerald">$${Number(book.price).toFixed(2)}</strong></div>
                        <div>Available: <strong>${book.availableQuantity} / ${book.quantity}</strong></div>
                    </div>
                    <div class="book-card-actions">
                        <button class="btn-outline w-full" onclick="openQuickIssueModal(${book.bookId})" ${book.availableQuantity <= 0 ? 'disabled' : ''}>
                            <i class="fa-solid fa-arrow-right-from-bracket"></i> Issue
                        </button>
                        <button class="btn-outline w-full" onclick="handleDirectReturn(${book.bookId})" ${book.availableQuantity >= book.quantity ? 'disabled' : ''}>
                            <i class="fa-solid fa-arrow-right-to-bracket"></i> Return
                        </button>
                        <button class="btn-icon" onclick="openEditModal(${book.bookId})" title="Edit">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join("");
    }
}

/* ==========================================================================
   SEARCH, FILTER & SORT ENGINE
   ========================================================================== */
function setupSearchAndFilters() {
    const globalSearch = document.getElementById("globalSearchInput");
    const invSearch = document.getElementById("inventorySearchInput");
    const clearBtn = document.getElementById("btnClearSearch");
    const statusSelect = document.getElementById("filterStatusSelect");
    const sortSelect = document.getElementById("sortSelect");

    // Live filtering
    const handleSearch = (query) => {
        if (invSearch && invSearch.value !== query) invSearch.value = query;
        if (globalSearch && globalSearch.value !== query) globalSearch.value = query;
        if (clearBtn) clearBtn.style.display = query.length > 0 ? "block" : "none";
        applyInventoryFilters();
    };

    globalSearch?.addEventListener("input", (e) => {
        handleSearch(e.target.value);
        if (currentActiveView !== "inventory") {
            switchView("inventory");
        }
    });

    invSearch?.addEventListener("input", (e) => {
        handleSearch(e.target.value);
    });

    clearBtn?.addEventListener("click", () => {
        if (globalSearch) globalSearch.value = "";
        if (invSearch) invSearch.value = "";
        clearBtn.style.display = "none";
        applyInventoryFilters();
    });

    statusSelect?.addEventListener("change", applyInventoryFilters);
    sortSelect?.addEventListener("change", applyInventoryFilters);

    document.getElementById("btnResetFilters")?.addEventListener("click", resetAllFilters);
    document.getElementById("emptyStateResetBtn")?.addEventListener("click", resetAllFilters);

    // View switchers (Table vs Grid)
    const btnTable = document.getElementById("btnViewTable");
    const btnGrid = document.getElementById("btnViewGrid");
    const tableViewContainer = document.getElementById("tableViewContainer");
    const gridViewContainer = document.getElementById("gridViewContainer");

    btnTable?.addEventListener("click", () => {
        currentViewMode = "table";
        btnTable.classList.add("active");
        btnGrid.classList.remove("active");
        if (tableViewContainer) tableViewContainer.style.display = "block";
        if (gridViewContainer) gridViewContainer.style.display = "none";
    });

    btnGrid?.addEventListener("click", () => {
        currentViewMode = "grid";
        btnGrid.classList.add("active");
        btnTable.classList.remove("active");
        if (tableViewContainer) tableViewContainer.style.display = "none";
        if (gridViewContainer) gridViewContainer.style.display = "grid";
    });

    // CSV Export
    document.getElementById("btnExportCSV")?.addEventListener("click", exportInventoryCSV);
}

function applyInventoryFilters() {
    const invSearch = document.getElementById("inventorySearchInput");
    const statusSelect = document.getElementById("filterStatusSelect");
    const sortSelect = document.getElementById("sortSelect");
    const activeFilterBar = document.getElementById("activeFilterBar");
    const filterCountText = document.getElementById("filterCountText");

    const query = invSearch ? invSearch.value.trim().toLowerCase() : "";
    const status = statusSelect ? statusSelect.value : "ALL";
    const sort = sortSelect ? sortSelect.value : "ID_ASC";

    let filtered = [...libraryBooks];

    // Filter by Query (ID, Title, Author)
    if (query.length > 0) {
        filtered = filtered.filter(b => 
            String(b.bookId).includes(query) ||
            b.title.toLowerCase().includes(query) ||
            b.author.toLowerCase().includes(query)
        );
    }

    // Filter by Status
    if (status === "AVAILABLE") {
        filtered = filtered.filter(b => b.availableQuantity > 0);
    } else if (status === "OUT_OF_STOCK") {
        filtered = filtered.filter(b => b.availableQuantity === 0);
    } else if (status === "LOW_STOCK") {
        filtered = filtered.filter(b => b.availableQuantity > 0 && b.availableQuantity <= 2);
    }

    // Sorting
    filtered.sort((a, b) => {
        switch (sort) {
            case "ID_ASC": return a.bookId - b.bookId;
            case "ID_DESC": return b.bookId - a.bookId;
            case "TITLE_ASC": return a.title.localeCompare(b.title);
            case "PRICE_ASC": return a.price - b.price;
            case "PRICE_DESC": return b.price - a.price;
            case "AVAIL_DESC": return b.availableQuantity - a.availableQuantity;
            default: return 0;
        }
    });

    // Update Filter Indicator Bar
    const isFiltered = query.length > 0 || status !== "ALL";
    if (activeFilterBar) {
        activeFilterBar.style.display = isFiltered ? "flex" : "none";
        if (filterCountText) {
            filterCountText.textContent = `Showing ${filtered.length} of ${libraryBooks.length} books`;
        }
    }

    renderInventoryTable(filtered);
}

function resetAllFilters() {
    const globalSearch = document.getElementById("globalSearchInput");
    const invSearch = document.getElementById("inventorySearchInput");
    const clearBtn = document.getElementById("btnClearSearch");
    const statusSelect = document.getElementById("filterStatusSelect");
    const sortSelect = document.getElementById("sortSelect");

    if (globalSearch) globalSearch.value = "";
    if (invSearch) invSearch.value = "";
    if (clearBtn) clearBtn.style.display = "none";
    if (statusSelect) statusSelect.value = "ALL";
    if (sortSelect) sortSelect.value = "ID_ASC";

    applyInventoryFilters();
    showToast("Filters reset to default view.", "info");
}

/* ==========================================================================
   FEATURE 1: ADD BOOK (WITH FULL VALIDATION)
   ========================================================================== */
function setupForms() {
    const addForm = document.getElementById("addBookForm");
    const idInput = document.getElementById("inputBookId");
    const titleInput = document.getElementById("inputTitle");
    const authorInput = document.getElementById("inputAuthor");
    const priceInput = document.getElementById("inputPrice");
    const qtyInput = document.getElementById("inputQuantity");

    // Realtime live C struct preview updates
    [idInput, titleInput, authorInput, priceInput, qtyInput].forEach(inp => {
        inp?.addEventListener("input", updateLiveCStructPreview);
    });

    document.getElementById("btnResetAddForm")?.addEventListener("click", () => {
        addForm?.reset();
        clearFormErrors();
        updateLiveCStructPreview();
    });

    addForm?.addEventListener("submit", (e) => {
        e.preventDefault();
        clearFormErrors();

        const idVal = parseInt(idInput.value);
        const titleVal = titleInput.value.trim();
        const authorVal = authorInput.value.trim();
        const priceVal = parseFloat(priceInput.value);
        const qtyVal = parseInt(qtyInput.value);

        let hasError = false;

        // Validation 1: Book ID
        if (isNaN(idVal) || idVal <= 0) {
            showFieldError("errBookId", "Book ID must be a positive integer.");
            hasError = true;
        } else if (libraryBooks.some(b => b.bookId === idVal)) {
            showFieldError("errBookId", `Book ID ${idVal} already exists! Use a unique ID.`);
            hasError = true;
        }

        // Validation 2: Title
        if (!titleVal) {
            showFieldError("errTitle", "Book Title is required.");
            hasError = true;
        }

        // Validation 3: Author
        if (!authorVal) {
            showFieldError("errAuthor", "Author Name is required.");
            hasError = true;
        }

        // Validation 4: Price
        if (isNaN(priceVal) || priceVal < 0) {
            showFieldError("errPrice", "Price must be a valid non-negative number.");
            hasError = true;
        }

        // Validation 5: Quantity
        if (isNaN(qtyVal) || qtyVal <= 0) {
            showFieldError("errQuantity", "Quantity must be an integer >= 1.");
            hasError = true;
        }

        if (hasError) return;

        // Construct new Book structure
        const newBook = {
            bookId: idVal,
            title: titleVal,
            author: authorVal,
            price: priceVal,
            quantity: qtyVal,
            availableQuantity: qtyVal
        };

        libraryBooks.unshift(newBook);
        saveLibraryData();

        logCirculation("ADD_BOOK", newBook.bookId, newBook.title, "New record created", newBook.availableQuantity);

        renderAllViews();
        addForm.reset();
        updateLiveCStructPreview();
        showToast(`Book '${newBook.title}' (ID: ${newBook.bookId}) registered successfully!`, "success");

        // Navigate to inventory
        switchView("inventory");
    });
}

function updateLiveCStructPreview() {
    const id = document.getElementById("inputBookId")?.value || "106";
    const title = document.getElementById("inputTitle")?.value || "Master Algorithms in C";
    const author = document.getElementById("inputAuthor")?.value || "Robert Sedgewick";
    const price = parseFloat(document.getElementById("inputPrice")?.value || "49.99").toFixed(2);
    const qty = document.getElementById("inputQuantity")?.value || "5";

    const previewEl = document.getElementById("liveCStructCode");
    if (previewEl) {
        previewEl.innerHTML = `<span class="tok-kw">struct</span> <span class="tok-type">Book</span> newBook = {
    .<span class="tok-var">bookId</span> = ${id},
    .<span class="tok-var">title</span> = <span style="color:#a5d6ff">"${escapeHtml(title)}"</span>,
    .<span class="tok-var">author</span> = <span style="color:#a5d6ff">"${escapeHtml(author)}"</span>,
    .<span class="tok-var">price</span> = ${price}f,
    .<span class="tok-var">quantity</span> = ${qty},
    .<span class="tok-var">availableQuantity</span> = ${qty}
};`;
    }
}

function showFieldError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
}

function clearFormErrors() {
    document.querySelectorAll(".field-error").forEach(el => el.textContent = "");
}

/* ==========================================================================
   FEATURES 5 & 6: ISSUE AND RETURN SYSTEM
   ========================================================================== */
function populateIssueReturnDropdowns() {
    const issueSelect = document.getElementById("selectIssueBook");
    const returnSelect = document.getElementById("selectReturnBook");

    if (issueSelect) {
        issueSelect.innerHTML = `<option value="">-- Choose a book to issue --</option>` +
            libraryBooks.map(b => {
                const disabled = b.availableQuantity <= 0 ? 'disabled' : '';
                const tag = b.availableQuantity <= 0 ? '(Out of Stock)' : `(${b.availableQuantity} available)`;
                return `<option value="${b.bookId}" ${disabled}>[ID ${b.bookId}] ${escapeHtml(b.title)} ${tag}</option>`;
            }).join("");
    }

    if (returnSelect) {
        const issuedBooks = libraryBooks.filter(b => b.availableQuantity < b.quantity);
        returnSelect.innerHTML = `<option value="">-- Choose an issued book to return --</option>` +
            issuedBooks.map(b => {
                const borrowed = b.quantity - b.availableQuantity;
                return `<option value="${b.bookId}">[ID ${b.bookId}] ${escapeHtml(b.title)} (${borrowed} copy issued)</option>`;
            }).join("");
    }
}

// Issue Desk Form
document.getElementById("issueFormDesk")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const select = document.getElementById("selectIssueBook");
    const student = document.getElementById("inputStudentName")?.value.trim() || "Student";
    const bookId = parseInt(select.value);

    if (!bookId) {
        showToast("Please select a book to issue.", "error");
        return;
    }

    issueBookById(bookId, student);
    select.value = "";
    if (document.getElementById("inputStudentName")) document.getElementById("inputStudentName").value = "";
});

// Return Desk Form
document.getElementById("returnFormDesk")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const select = document.getElementById("selectReturnBook");
    const notes = document.getElementById("inputReturnNotes")?.value.trim() || "Regular return";
    const bookId = parseInt(select.value);

    if (!bookId) {
        showToast("Please select a book to return.", "error");
        return;
    }

    returnBookById(bookId, notes);
    select.value = "";
    if (document.getElementById("inputReturnNotes")) document.getElementById("inputReturnNotes").value = "";
});

function issueBookById(bookId, borrower) {
    const book = libraryBooks.find(b => b.bookId === bookId);
    if (!book) {
        showToast("Book record not found.", "error");
        return;
    }

    // Validation: Check availability
    if (book.availableQuantity <= 0) {
        showToast(`Cannot issue '${book.title}'. All copies are currently issued!`, "error");
        return;
    }

    book.availableQuantity--;
    saveLibraryData();

    logCirculation("ISSUE", book.bookId, book.title, borrower || "Student", book.availableQuantity);
    renderAllViews();
    showToast(`1 copy of '${book.title}' issued successfully! (${book.availableQuantity} left)`, "success");
}

function returnBookById(bookId, notes) {
    const book = libraryBooks.find(b => b.bookId === bookId);
    if (!book) {
        showToast("Book record not found.", "error");
        return;
    }

    // Validation: Cannot return beyond total quantity
    if (book.availableQuantity >= book.quantity) {
        showToast(`Cannot return copy: All ${book.quantity} copies are already in library!`, "error");
        return;
    }

    book.availableQuantity++;
    saveLibraryData();

    logCirculation("RETURN", book.bookId, book.title, notes || "Returned", book.availableQuantity);
    renderAllViews();
    showToast(`1 copy of '${book.title}' returned successfully! (${book.availableQuantity} in stock)`, "success");
}

function handleDirectReturn(bookId) {
    returnBookById(bookId, "Quick return desk");
}

/* ==========================================================================
   CIRCULATION LOG
   ========================================================================== */
function logCirculation(action, bookId, title, borrower, availableAfter) {
    const entry = {
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        action,
        bookId,
        title,
        borrower,
        availableAfter
    };
    circulationHistory.unshift(entry);
    if (circulationHistory.length > 50) circulationHistory.pop();
    saveCirculationHistory();
    renderCirculationHistory();
}

function renderCirculationHistory() {
    const tbody = document.getElementById("transactionTbody");
    if (!tbody) return;

    if (circulationHistory.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="text-align:center; padding: 20px;">No transactions logged in this session.</td></tr>`;
        return;
    }

    tbody.innerHTML = circulationHistory.map(entry => {
        let actionBadge = '';
        if (entry.action === "ISSUE") {
            actionBadge = `<span class="badge-status status-low"><i class="fa-solid fa-arrow-right-from-bracket"></i> ISSUED</span>`;
        } else if (entry.action === "RETURN") {
            actionBadge = `<span class="badge-status status-avail"><i class="fa-solid fa-arrow-right-to-bracket"></i> RETURNED</span>`;
        } else {
            actionBadge = `<span class="badge-status" style="background:var(--primary-light); color:var(--primary);"><i class="fa-solid fa-plus"></i> CREATED</span>`;
        }

        return `
            <tr>
                <td style="font-family: var(--font-mono); font-size: 0.78rem;">${entry.timestamp}</td>
                <td>${actionBadge}</td>
                <td><span class="book-id-badge">ID #${entry.bookId}</span></td>
                <td><strong>${escapeHtml(entry.title)}</strong></td>
                <td class="text-muted">${escapeHtml(entry.borrower)}</td>
                <td><strong class="text-emerald">${entry.availableAfter} on shelf</strong></td>
            </tr>
        `;
    }).join("");
}

/* ==========================================================================
   MODALS: EDIT, DELETE, QUICK ISSUE, BACKUP
   ========================================================================== */
function setupModals() {
    // Edit Modal Events
    document.getElementById("btnCancelEdit")?.addEventListener("click", closeEditModal);
    document.getElementById("btnCancelEditModal")?.addEventListener("click", closeEditModal);

    document.getElementById("editBookForm")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById("editOriginalId").value);
        const title = document.getElementById("editTitle").value.trim();
        const author = document.getElementById("editAuthor").value.trim();
        const price = parseFloat(document.getElementById("editPrice").value);
        const qty = parseInt(document.getElementById("editQuantity").value);
        const avail = parseInt(document.getElementById("editAvailable").value);

        if (!title || !author || isNaN(price) || price < 0 || isNaN(qty) || qty <= 0 || isNaN(avail) || avail < 0) {
            showToast("Please fill all edit fields with valid values.", "error");
            return;
        }

        if (avail > qty) {
            showToast("Available quantity cannot exceed total quantity!", "error");
            return;
        }

        const book = libraryBooks.find(b => b.bookId === id);
        if (book) {
            book.title = title;
            book.author = author;
            book.price = price;
            book.quantity = qty;
            book.availableQuantity = avail;

            saveLibraryData();
            renderAllViews();
            closeEditModal();
            showToast(`Book ID #${id} updated successfully!`, "success");
        }
    });

    // Delete Modal Events
    document.getElementById("btnCancelDelete")?.addEventListener("click", closeDeleteModal);
    document.getElementById("btnCancelDeleteX")?.addEventListener("click", closeDeleteModal);
    document.getElementById("btnConfirmDelete")?.addEventListener("click", () => {
        if (pendingDeleteId !== null) {
            const index = libraryBooks.findIndex(b => b.bookId === pendingDeleteId);
            if (index !== -1) {
                const deleted = libraryBooks.splice(index, 1)[0];
                saveLibraryData();
                renderAllViews();
                showToast(`Book '${deleted.title}' (ID #${deleted.bookId}) deleted.`, "info");
            }
            closeDeleteModal();
        }
    });

    // Quick Issue Modal Events
    let activeQuickIssueId = null;
    window.openQuickIssueModal = function(bookId) {
        const book = libraryBooks.find(b => b.bookId === bookId);
        if (!book) return;
        if (book.availableQuantity <= 0) {
            showToast(`Cannot issue '${book.title}': Out of Stock!`, "error");
            return;
        }

        activeQuickIssueId = bookId;
        document.getElementById("quickIssueBookTitle").textContent = `[ID #${book.bookId}] ${book.title}`;
        document.getElementById("quickIssueBookMeta").textContent = `Author: ${book.author} | Available: ${book.availableQuantity} of ${book.quantity}`;
        document.getElementById("quickIssueStudent").value = "";
        document.getElementById("quickIssueModal")?.classList.add("show");
    };

    document.getElementById("btnCancelQuickIssue")?.addEventListener("click", closeQuickIssueModal);
    document.getElementById("btnCancelQuickIssueX")?.addEventListener("click", closeQuickIssueModal);

    document.getElementById("quickIssueForm")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const student = document.getElementById("quickIssueStudent").value.trim() || "Student";
        if (activeQuickIssueId !== null) {
            issueBookById(activeQuickIssueId, student);
            closeQuickIssueModal();
        }
    });

    function closeQuickIssueModal() {
        document.getElementById("quickIssueModal")?.classList.remove("show");
        activeQuickIssueId = null;
    }

    // Backup & Export / Import
    document.getElementById("btnCancelBackup")?.addEventListener("click", closeBackupModal);
    document.getElementById("btnCancelBackupX")?.addEventListener("click", closeBackupModal);
    document.getElementById("btnModalExportJSON")?.addEventListener("click", exportDatabaseJSON);
    document.getElementById("btnModalImportJSON")?.addEventListener("click", () => {
        document.getElementById("importFileInput")?.click();
    });

    document.getElementById("importFileInput")?.addEventListener("change", handleImportJSON);
}

function openEditModal(bookId) {
    const book = libraryBooks.find(b => b.bookId === bookId);
    if (!book) return;

    document.getElementById("editOriginalId").value = book.bookId;
    document.getElementById("editBookId").value = book.bookId;
    document.getElementById("editTitle").value = book.title;
    document.getElementById("editAuthor").value = book.author;
    document.getElementById("editPrice").value = book.price;
    document.getElementById("editQuantity").value = book.quantity;
    document.getElementById("editAvailable").value = book.availableQuantity;

    document.getElementById("editModal")?.classList.add("show");
}

function closeEditModal() {
    document.getElementById("editModal")?.classList.remove("show");
}

function openDeleteModal(bookId) {
    const book = libraryBooks.find(b => b.bookId === bookId);
    if (!book) return;

    pendingDeleteId = bookId;
    document.getElementById("deleteBookTitle").textContent = `[ID #${book.bookId}] ${book.title}`;
    document.getElementById("deleteBookMeta").textContent = `By ${book.author} | Total Copies: ${book.quantity} (${book.availableQuantity} available)`;

    document.getElementById("deleteModal")?.classList.add("show");
}

function closeDeleteModal() {
    document.getElementById("deleteModal")?.classList.remove("show");
    pendingDeleteId = null;
}

function openBackupModal() {
    document.getElementById("backupModal")?.classList.add("show");
}

function closeBackupModal() {
    document.getElementById("backupModal")?.classList.remove("show");
}

/* ==========================================================================
   FEATURE: C STRUCT VISUALIZER (ACADEMIC VIVA DEMONSTRATION)
   ========================================================================== */
function populateCStructVisualizerOptions() {
    const select = document.getElementById("selectVisualizerBook");
    if (!select) return;

    if (libraryBooks.length === 0) {
        select.innerHTML = `<option value="">No books in library</option>`;
        renderCStructInspector(null);
        return;
    }

    const currentVal = parseInt(select.value);
    select.innerHTML = libraryBooks.map(b => 
        `<option value="${b.bookId}" ${b.bookId === currentVal ? 'selected' : ''}>[ID ${b.bookId}] ${escapeHtml(b.title)}</option>`
    ).join("");

    select.onchange = () => {
        const selectedId = parseInt(select.value);
        const book = libraryBooks.find(b => b.bookId === selectedId);
        renderCStructInspector(book);
    };

    const firstBook = libraryBooks.find(b => b.bookId === parseInt(select.value)) || libraryBooks[0];
    renderCStructInspector(firstBook);
}

function inspectBookInCVisualizer(bookId) {
    switchView("c-struct-view");
    const select = document.getElementById("selectVisualizerBook");
    if (select) {
        select.value = bookId;
        const book = libraryBooks.find(b => b.bookId === bookId);
        renderCStructInspector(book);
    }
}

function renderCStructInspector(book) {
    const codeEl = document.getElementById("codeVisualizerOutput");
    const tbody = document.getElementById("memMapTbody");
    if (!codeEl || !tbody) return;

    if (!book) {
        codeEl.innerHTML = `// No book selected`;
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No records available</td></tr>`;
        return;
    }

    const priceFormatted = Number(book.price).toFixed(2);

    codeEl.innerHTML = `<span class="tok-kw">#include</span> <span style="color:#a5d6ff">&lt;stdio.h&gt;</span>

<span class="tok-kw">struct</span> <span class="tok-type">Book</span> {
    <span class="tok-type">int</span>   <span class="tok-var">bookId</span>;            <span class="text-muted">// 4 bytes</span>
    <span class="tok-type">char</span>  <span class="tok-var">title</span>[100];        <span class="text-muted">// 100 bytes</span>
    <span class="tok-type">char</span>  <span class="tok-var">author</span>[100];       <span class="text-muted">// 100 bytes</span>
    <span class="tok-type">float</span> <span class="tok-var">price</span>;            <span class="text-muted">// 4 bytes</span>
    <span class="tok-type">int</span>   <span class="tok-var">quantity</span>;         <span class="text-muted">// 4 bytes</span>
    <span class="tok-type">int</span>   <span class="tok-var">availableQuantity</span>;<span class="text-muted">// 4 bytes</span>
};

<span class="tok-kw">struct</span> <span class="tok-type">Book</span> currentBook = {
    .<span class="tok-var">bookId</span> = ${book.bookId},
    .<span class="tok-var">title</span> = <span style="color:#a5d6ff">"${escapeHtml(book.title)}"</span>,
    .<span class="tok-var">author</span> = <span style="color:#a5d6ff">"${escapeHtml(book.author)}"</span>,
    .<span class="tok-var">price</span> = ${priceFormatted}f,
    .<span class="tok-var">quantity</span> = ${book.quantity},
    .<span class="tok-var">availableQuantity</span> = ${book.availableQuantity}
};`;

    // Populate Memory Byte Map
    tbody.innerHTML = `
        <tr>
            <td><code>bookId</code></td>
            <td><code>int</code></td>
            <td>4 Bytes</td>
            <td><code>${book.bookId}</code></td>
        </tr>
        <tr>
            <td><code>title[100]</code></td>
            <td><code>char[100]</code></td>
            <td>100 Bytes</td>
            <td><code>"${escapeHtml(book.title)}"</code></td>
        </tr>
        <tr>
            <td><code>author[100]</code></td>
            <td><code>char[100]</code></td>
            <td>100 Bytes</td>
            <td><code>"${escapeHtml(book.author)}"</code></td>
        </tr>
        <tr>
            <td><code>price</code></td>
            <td><code>float</code></td>
            <td>4 Bytes</td>
            <td><code>$${priceFormatted}</code></td>
        </tr>
        <tr>
            <td><code>quantity</code></td>
            <td><code>int</code></td>
            <td>4 Bytes</td>
            <td><code>${book.quantity}</code></td>
        </tr>
        <tr>
            <td><code>availableQuantity</code></td>
            <td><code>int</code></td>
            <td>4 Bytes</td>
            <td><code>${book.availableQuantity}</code></td>
        </tr>
        <tr style="background:var(--primary-light); font-weight:bold;">
            <td colspan="2"><strong>Total struct Book Size:</strong></td>
            <td colspan="2"><strong>216 Bytes per Record</strong></td>
        </tr>
    `;

    // Copy Code Button
    document.getElementById("btnCopyCCode").onclick = () => {
        const rawCode = `struct Book currentBook = {\n    .bookId = ${book.bookId},\n    .title = "${book.title}",\n    .author = "${book.author}",\n    .price = ${priceFormatted}f,\n    .quantity = ${book.quantity},\n    .availableQuantity = ${book.availableQuantity}\n};`;
        navigator.clipboard.writeText(rawCode).then(() => {
            showToast("C struct code copied to clipboard!", "success");
        });
    };
}

/* ==========================================================================
   EXPORT & IMPORT ENGINE
   ========================================================================== */
function exportDatabaseJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(libraryBooks, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `library_books_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    showToast("JSON backup downloaded successfully!", "success");
}

function handleImportJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            if (Array.isArray(imported)) {
                libraryBooks = imported;
                saveLibraryData();
                renderAllViews();
                closeBackupModal();
                showToast(`Successfully imported ${imported.length} book records!`, "success");
            } else {
                showToast("Invalid JSON file structure.", "error");
            }
        } catch (err) {
            showToast("Error parsing JSON file.", "error");
        }
    };
    reader.readAsText(file);
}

function exportInventoryCSV() {
    if (libraryBooks.length === 0) {
        showToast("No books to export.", "info");
        return;
    }

    let csv = "BookID,Title,Author,Price,TotalQuantity,AvailableQuantity,IssuedQuantity,Status\n";
    libraryBooks.forEach(b => {
        const issued = b.quantity - b.availableQuantity;
        const status = b.availableQuantity > 0 ? "AVAILABLE" : "OUT_OF_STOCK";
        csv += `"${b.bookId}","${b.title.replace(/"/g, '""')}","${b.author.replace(/"/g, '""')}","${b.price}","${b.quantity}","${b.availableQuantity}","${issued}","${status}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `library_inventory_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV exported successfully!", "success");
}

/* ==========================================================================
   TOAST NOTIFICATION ENGINE
   ========================================================================== */
function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    let icon = 'fa-circle-info';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-circle-xmark';

    toast.innerHTML = `
        <i class="fa-solid ${icon} toast-icon"></i>
        <div class="toast-content">
            <strong>${type === 'error' ? 'Validation Error' : (type === 'success' ? 'Success' : 'Notice')}</strong>
            <p>${escapeHtml(message)}</p>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 250);
    }, 3800);
}

/* ==========================================================================
   KEYBOARD SHORTCUTS & HELPERS
   ========================================================================== */
function setupShortcuts() {
    window.addEventListener("keydown", (e) => {
        // Press '/' to focus search
        if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
            e.preventDefault();
            const search = document.getElementById("globalSearchInput");
            if (search) {
                search.focus();
                search.select();
            }
        }
        // Escape closes modals
        if (e.key === "Escape") {
            closeEditModal();
            closeDeleteModal();
            closeBackupModal();
            document.getElementById("quickIssueModal")?.classList.remove("show");
        }
    });
}

function escapeHtml(str) {
    if (typeof str !== "string") return str;
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
