/*
========================================================================================
PROJECT TITLE: LIBRARY BOOK MANAGEMENT SYSTEM USING STRUCTURES
ACADEMIC LEVEL: First-Year Engineering / Computer Science (C Programming)
CORE CONCEPT: C Structures (struct Book), File Handling, Pointers, Arrays of Structures
========================================================================================
*/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_BOOKS 200
#define DATA_FILE "library_books.dat"

/* ==========================================================================
   ACADEMIC CORE: struct Book Definition
   Represents a book entity in the library with all required attributes.
   ========================================================================== */
struct Book {
    int bookId;                 // Unique identifier for the book
    char title[100];            // Title of the book
    char author[100];           // Author's name
    float price;                // Price per copy in currency units
    int quantity;               // Total copies owned by the library
    int availableQuantity;      // Number of copies currently on the shelf
};

// Global array of structures and count tracker
struct Book library[MAX_BOOKS];
int bookCount = 0;

/* Function Prototypes */
void loadFromFile();
void saveToFile();
void addBook();
void viewAllBooks();
void searchBookById();
void searchBookByTitle();
void issueBook();
void returnBook();
void updateBook();
void deleteBook();
void viewAvailableBooks();
void displayDashboard();
void seedSampleDataIfEmpty();
void clearInputBuffer();
void printHeader(const char* title);
void printBookRow(const struct Book* b);

/* ==========================================================================
   MAIN FUNCTION
   ========================================================================== */
int main() {
    int choice;
    loadFromFile();
    seedSampleDataIfEmpty();

    do {
        printf("\n");
        printf("==============================================================\n");
        printf("       LIBRARY BOOK MANAGEMENT SYSTEM USING STRUCTURES        \n");
        printf("==============================================================\n");
        printf("  1. Dashboard & Inventory Summary\n");
        printf("  2. Add New Book\n");
        printf("  3. View All Books\n");
        printf("  4. View Available Books\n");
        printf("  5. Search Book by ID\n");
        printf("  6. Search Book by Title\n");
        printf("  7. Issue Book to Student\n");
        printf("  8. Return Issued Book\n");
        printf("  9. Update Book Details\n");
        printf(" 10. Delete Book Record\n");
        printf(" 11. Save Data to File\n");
        printf("  0. Save and Exit\n");
        printf("==============================================================\n");
        printf("Enter your choice (0-11): ");
        
        if (scanf("%d", &choice) != 1) {
            printf("\n[ERROR] Invalid input! Please enter a valid number.\n");
            clearInputBuffer();
            continue;
        }
        clearInputBuffer();

        switch (choice) {
            case 1:
                displayDashboard();
                break;
            case 2:
                addBook();
                break;
            case 3:
                viewAllBooks();
                break;
            case 4:
                viewAvailableBooks();
                break;
            case 5:
                searchBookById();
                break;
            case 6:
                searchBookByTitle();
                break;
            case 7:
                issueBook();
                break;
            case 8:
                returnBook();
                break;
            case 9:
                updateBook();
                break;
            case 10:
                deleteBook();
                break;
            case 11:
                saveToFile();
                printf("\n[SUCCESS] Library database saved successfully!\n");
                break;
            case 0:
                saveToFile();
                printf("\n==============================================================\n");
                printf("  Thank you for using Library Book Management System! Goodbye.\n");
                printf("==============================================================\n");
                break;
            default:
                printf("\n[ERROR] Invalid choice (%d). Please choose between 0 and 11.\n", choice);
        }
    } while (choice != 0);

    return 0;
}

/* ==========================================================================
   HELPER UTILITIES
   ========================================================================== */
void clearInputBuffer() {
    int c;
    while ((c = getchar()) != '\n' && c != EOF);
}

void printHeader(const char* title) {
    printf("\n--------------------------------------------------------------\n");
    printf("  %s\n", title);
    printf("--------------------------------------------------------------\n");
}

void printBookRow(const struct Book* b) {
    int issued = b->quantity - b->availableQuantity;
    const char* status = (b->availableQuantity > 0) ? "AVAILABLE" : "OUT OF STOCK";
    printf("| %-4d | %-28.28s | %-18.18s | $%-6.2f | %-4d | %-4d | %-4d | %-12s |\n",
           b->bookId, b->title, b->author, b->price, b->quantity, b->availableQuantity, issued, status);
}

void printTableHeading() {
    printf("+------+------------------------------+--------------------+---------+------+------+------+--------------+\n");
    printf("| ID   | Title                        | Author             | Price   | Tot  | Avail| Iss  | Status       |\n");
    printf("+------+------------------------------+--------------------+---------+------+------+------+--------------+\n");
}

void printTableFooter() {
    printf("+------+------------------------------+--------------------+---------+------+------+------+--------------+\n");
}

/* ==========================================================================
   1. DASHBOARD & STATISTICS
   ========================================================================== */
void displayDashboard() {
    int i;
    int totalBooks = 0;
    int totalAvailable = 0;
    int totalIssued = 0;
    float totalInventoryValue = 0.0f;

    for (i = 0; i < bookCount; i++) {
        totalBooks += library[i].quantity;
        totalAvailable += library[i].availableQuantity;
        totalIssued += (library[i].quantity - library[i].availableQuantity);
        totalInventoryValue += (library[i].price * library[i].quantity);
    }

    printHeader("LIBRARY DASHBOARD & INVENTORY SUMMARY");
    printf("  Distinct Book Titles (Records) : %d / %d\n", bookCount, MAX_BOOKS);
    printf("  Total Book Copies in System    : %d\n", totalBooks);
    printf("  Total Copies Available on Shelf: %d\n", totalAvailable);
    printf("  Total Copies Issued / Borrowed : %d\n", totalIssued);
    printf("  Total Inventory Capital Value  : $%.2f\n", totalInventoryValue);
    printf("--------------------------------------------------------------\n");
}

/* ==========================================================================
   2. ADD BOOK
   ========================================================================== */
void addBook() {
    struct Book newBook;
    int i;

    if (bookCount >= MAX_BOOKS) {
        printf("\n[ERROR] Library capacity reached (%d books). Cannot add more.\n", MAX_BOOKS);
        return;
    }

    printHeader("ADD NEW BOOK RECORD");

    // Book ID with duplicate validation
    while (1) {
        printf("Enter Book ID (Integer > 0): ");
        if (scanf("%d", &newBook.bookId) != 1 || newBook.bookId <= 0) {
            printf("[ERROR] Please enter a valid positive numeric ID.\n");
            clearInputBuffer();
            continue;
        }
        clearInputBuffer();

        // Check for duplicates
        int isDuplicate = 0;
        for (i = 0; i < bookCount; i++) {
            if (library[i].bookId == newBook.bookId) {
                isDuplicate = 1;
                break;
            }
        }

        if (isDuplicate) {
            printf("[ERROR] Book ID %d already exists in the system. Try another ID.\n", newBook.bookId);
        } else {
            break;
        }
    }

    // Title
    printf("Enter Book Title: ");
    if (fgets(newBook.title, sizeof(newBook.title), stdin)) {
        newBook.title[strcspn(newBook.title, "\r\n")] = '\0';
    }
    if (strlen(newBook.title) == 0) {
        strcpy(newBook.title, "Untitled Book");
    }

    // Author
    printf("Enter Author Name: ");
    if (fgets(newBook.author, sizeof(newBook.author), stdin)) {
        newBook.author[strcspn(newBook.author, "\r\n")] = '\0';
    }
    if (strlen(newBook.author) == 0) {
        strcpy(newBook.author, "Unknown Author");
    }

    // Price
    while (1) {
        printf("Enter Price ($): ");
        if (scanf("%f", &newBook.price) != 1 || newBook.price < 0.0f) {
            printf("[ERROR] Please enter a valid positive price.\n");
            clearInputBuffer();
            continue;
        }
        clearInputBuffer();
        break;
    }

    // Total Quantity
    while (1) {
        printf("Enter Total Quantity of Copies: ");
        if (scanf("%d", &newBook.quantity) != 1 || newBook.quantity <= 0) {
            printf("[ERROR] Quantity must be an integer >= 1.\n");
            clearInputBuffer();
            continue;
        }
        clearInputBuffer();
        break;
    }

    // Initially, available copies equals total quantity
    newBook.availableQuantity = newBook.quantity;

    // Store in global array of structures
    library[bookCount++] = newBook;
    saveToFile();

    printf("\n[SUCCESS] Book '%s' (ID: %d) added successfully!\n", newBook.title, newBook.bookId);
}

/* ==========================================================================
   3. VIEW ALL BOOKS
   ========================================================================== */
void viewAllBooks() {
    int i;
    if (bookCount == 0) {
        printf("\n[INFO] No books found in the library database.\n");
        return;
    }

    printHeader("ALL BOOKS IN LIBRARY");
    printTableHeading();
    for (i = 0; i < bookCount; i++) {
        printBookRow(&library[i]);
    }
    printTableFooter();
    printf("Total records: %d\n", bookCount);
}

/* ==========================================================================
   4. VIEW AVAILABLE BOOKS ONLY
   ========================================================================== */
void viewAvailableBooks() {
    int i, count = 0;
    if (bookCount == 0) {
        printf("\n[INFO] No books in the system.\n");
        return;
    }

    printHeader("AVAILABLE BOOKS (AVAILABLE COPIES > 0)");
    printTableHeading();
    for (i = 0; i < bookCount; i++) {
        if (library[i].availableQuantity > 0) {
            printBookRow(&library[i]);
            count++;
        }
    }
    printTableFooter();
    printf("Total available titles: %d of %d\n", count, bookCount);
}

/* ==========================================================================
   5. SEARCH BOOK BY ID
   ========================================================================== */
void searchBookById() {
    int searchId, i, found = 0;
    if (bookCount == 0) {
        printf("\n[INFO] Library is empty.\n");
        return;
    }

    printHeader("SEARCH BOOK BY ID");
    printf("Enter Book ID to search: ");
    if (scanf("%d", &searchId) != 1) {
        printf("[ERROR] Invalid ID format.\n");
        clearInputBuffer();
        return;
    }
    clearInputBuffer();

    for (i = 0; i < bookCount; i++) {
        if (library[i].bookId == searchId) {
            found = 1;
            printTableHeading();
            printBookRow(&library[i]);
            printTableFooter();
            break;
        }
    }

    if (!found) {
        printf("\n[NOT FOUND] No book with ID %d exists in records.\n", searchId);
    }
}

/* ==========================================================================
   6. SEARCH BOOK BY TITLE (Case-insensitive Substring)
   ========================================================================== */
void searchBookByTitle() {
    char searchTitle[100];
    int i, matches = 0;
    if (bookCount == 0) {
        printf("\n[INFO] Library is empty.\n");
        return;
    }

    printHeader("SEARCH BOOK BY TITLE");
    printf("Enter Title keyword: ");
    if (fgets(searchTitle, sizeof(searchTitle), stdin)) {
        searchTitle[strcspn(searchTitle, "\r\n")] = '\0';
    }

    if (strlen(searchTitle) == 0) {
        printf("[ERROR] Keyword cannot be empty.\n");
        return;
    }

    printTableHeading();
    for (i = 0; i < bookCount; i++) {
        // Simple case-insensitive search
        char tempTitle[100], tempSearch[100];
        strcpy(tempTitle, library[i].title);
        strcpy(tempSearch, searchTitle);

        for (int k = 0; tempTitle[k]; k++) if (tempTitle[k] >= 'A' && tempTitle[k] <= 'Z') tempTitle[k] += 32;
        for (int k = 0; tempSearch[k]; k++) if (tempSearch[k] >= 'A' && tempSearch[k] <= 'Z') tempSearch[k] += 32;

        if (strstr(tempTitle, tempSearch) != NULL) {
            printBookRow(&library[i]);
            matches++;
        }
    }
    printTableFooter();

    if (matches == 0) {
        printf("\n[NOT FOUND] No book matching '%s' was found.\n", searchTitle);
    } else {
        printf("Found %d matching record(s).\n", matches);
    }
}

/* ==========================================================================
   7. ISSUE BOOK (BORROW)
   ========================================================================== */
void issueBook() {
    int id, i, foundIndex = -1;
    if (bookCount == 0) {
        printf("\n[INFO] Library is empty.\n");
        return;
    }

    printHeader("ISSUE BOOK TO STUDENT");
    printf("Enter Book ID to issue: ");
    if (scanf("%d", &id) != 1) {
        printf("[ERROR] Invalid ID input.\n");
        clearInputBuffer();
        return;
    }
    clearInputBuffer();

    for (i = 0; i < bookCount; i++) {
        if (library[i].bookId == id) {
            foundIndex = i;
            break;
        }
    }

    if (foundIndex == -1) {
        printf("\n[NOT FOUND] Book ID %d not found.\n", id);
        return;
    }

    struct Book* b = &library[foundIndex];
    printf("Selected Book: '%s' by %s\n", b->title, b->author);
    printf("Available copies: %d / %d\n", b->availableQuantity, b->quantity);

    // Validation: cannot issue if available copies == 0
    if (b->availableQuantity <= 0) {
        printf("\n[DENIED] Cannot issue book! All copies of '%s' are currently issued out.\n", b->title);
        return;
    }

    b->availableQuantity--;
    saveToFile();

    printf("\n[SUCCESS] 1 copy of '%s' issued successfully!\n", b->title);
    printf("Remaining available copies: %d\n", b->availableQuantity);
}

/* ==========================================================================
   8. RETURN BOOK
   ========================================================================== */
void returnBook() {
    int id, i, foundIndex = -1;
    if (bookCount == 0) {
        printf("\n[INFO] Library is empty.\n");
        return;
    }

    printHeader("RETURN ISSUED BOOK");
    printf("Enter Book ID to return: ");
    if (scanf("%d", &id) != 1) {
        printf("[ERROR] Invalid ID input.\n");
        clearInputBuffer();
        return;
    }
    clearInputBuffer();

    for (i = 0; i < bookCount; i++) {
        if (library[i].bookId == id) {
            foundIndex = i;
            break;
        }
    }

    if (foundIndex == -1) {
        printf("\n[NOT FOUND] Book ID %d not found.\n", id);
        return;
    }

    struct Book* b = &library[foundIndex];
    printf("Selected Book: '%s' by %s\n", b->title, b->author);
    printf("Current status: %d available, %d total copies\n", b->availableQuantity, b->quantity);

    // Validation: cannot return more than total quantity
    if (b->availableQuantity >= b->quantity) {
        printf("\n[DENIED] All %d copies are already in the library. Cannot return extra copies.\n", b->quantity);
        return;
    }

    b->availableQuantity++;
    saveToFile();

    printf("\n[SUCCESS] 1 copy of '%s' returned successfully!\n", b->title);
    printf("Updated available copies: %d / %d\n", b->availableQuantity, b->quantity);
}

/* ==========================================================================
   9. UPDATE BOOK
   ========================================================================== */
void updateBook() {
    int id, i, foundIndex = -1;
    char inputBuf[100];
    float newPrice;
    int newQty;

    if (bookCount == 0) {
        printf("\n[INFO] Library is empty.\n");
        return;
    }

    printHeader("UPDATE BOOK DETAILS");
    printf("Enter Book ID to update: ");
    if (scanf("%d", &id) != 1) {
        printf("[ERROR] Invalid ID.\n");
        clearInputBuffer();
        return;
    }
    clearInputBuffer();

    for (i = 0; i < bookCount; i++) {
        if (library[i].bookId == id) {
            foundIndex = i;
            break;
        }
    }

    if (foundIndex == -1) {
        printf("\n[NOT FOUND] Book ID %d not found.\n", id);
        return;
    }

    struct Book* b = &library[foundIndex];
    printf("\nUpdating Book: [ID: %d] %s\n", b->bookId, b->title);
    printf("(Press ENTER without typing to keep the current value)\n\n");

    // Title
    printf("Current Title: %s\nNew Title: ", b->title);
    if (fgets(inputBuf, sizeof(inputBuf), stdin)) {
        inputBuf[strcspn(inputBuf, "\r\n")] = '\0';
        if (strlen(inputBuf) > 0) {
            strcpy(b->title, inputBuf);
        }
    }

    // Author
    printf("Current Author: %s\nNew Author: ", b->author);
    if (fgets(inputBuf, sizeof(inputBuf), stdin)) {
        inputBuf[strcspn(inputBuf, "\r\n")] = '\0';
        if (strlen(inputBuf) > 0) {
            strcpy(b->author, inputBuf);
        }
    }

    // Price
    printf("Current Price: $%.2f\nNew Price (or -1 to skip): ", b->price);
    if (scanf("%f", &newPrice) == 1 && newPrice >= 0.0f) {
        b->price = newPrice;
    }
    clearInputBuffer();

    // Total Quantity
    int currentlyIssued = b->quantity - b->availableQuantity;
    printf("Current Total Quantity: %d (Currently Issued: %d)\nNew Total Quantity (or -1 to skip): ", b->quantity, currentlyIssued);
    if (scanf("%d", &newQty) == 1 && newQty > 0) {
        if (newQty < currentlyIssued) {
            printf("[WARNING] New quantity (%d) cannot be less than currently issued copies (%d). Setting to %d.\n", newQty, currentlyIssued, currentlyIssued);
            b->quantity = currentlyIssued;
            b->availableQuantity = 0;
        } else {
            b->quantity = newQty;
            b->availableQuantity = newQty - currentlyIssued;
        }
    }
    clearInputBuffer();

    saveToFile();
    printf("\n[SUCCESS] Book ID %d details updated successfully!\n", b->bookId);
}

/* ==========================================================================
   10. DELETE BOOK
   ========================================================================== */
void deleteBook() {
    int id, i, foundIndex = -1;
    char confirm;

    if (bookCount == 0) {
        printf("\n[INFO] Library is empty.\n");
        return;
    }

    printHeader("DELETE BOOK RECORD");
    printf("Enter Book ID to delete: ");
    if (scanf("%d", &id) != 1) {
        printf("[ERROR] Invalid ID.\n");
        clearInputBuffer();
        return;
    }
    clearInputBuffer();

    for (i = 0; i < bookCount; i++) {
        if (library[i].bookId == id) {
            foundIndex = i;
            break;
        }
    }

    if (foundIndex == -1) {
        printf("\n[NOT FOUND] Book ID %d not found.\n", id);
        return;
    }

    printf("Are you sure you want to permanently delete '%s' (ID: %d)? (y/N): ", library[foundIndex].title, id);
    if (scanf(" %c", &confirm) == 1 && (confirm == 'y' || confirm == 'Y')) {
        // Shift remaining array elements to fill the gap
        for (i = foundIndex; i < bookCount - 1; i++) {
            library[i] = library[i + 1];
        }
        bookCount--;
        saveToFile();
        printf("\n[SUCCESS] Book ID %d deleted successfully.\n", id);
    } else {
        printf("\n[CANCELLED] Deletion cancelled by user.\n");
    }
    clearInputBuffer();
}

/* ==========================================================================
   FILE PERSISTENCE & SAMPLE DATA
   ========================================================================== */
void saveToFile() {
    FILE *fp = fopen(DATA_FILE, "wb");
    if (fp == NULL) {
        printf("[ERROR] Could not open file '%s' for saving!\n", DATA_FILE);
        return;
    }
    fwrite(&bookCount, sizeof(int), 1, fp);
    fwrite(library, sizeof(struct Book), bookCount, fp);
    fclose(fp);
}

void loadFromFile() {
    FILE *fp = fopen(DATA_FILE, "rb");
    if (fp == NULL) {
        // File doesn't exist yet, which is normal on first run
        return;
    }
    if (fread(&bookCount, sizeof(int), 1, fp) == 1) {
        fread(library, sizeof(struct Book), bookCount, fp);
    }
    fclose(fp);
}

void seedSampleDataIfEmpty() {
    if (bookCount > 0) return;

    struct Book samples[] = {
        {101, "The C Programming Language", "Dennis Ritchie & Brian Kernighan", 45.50f, 10, 8},
        {102, "Data Structures and Algorithms in C", "Mark Allen Weiss", 55.00f, 6, 4},
        {103, "Clean Code: A Handbook of Agile Software", "Robert C. Martin", 42.00f, 8, 8},
        {104, "Introduction to Algorithms (CLRS)", "Thomas H. Cormen", 89.99f, 5, 2},
        {105, "Operating System Concepts", "Silberschatz & Galvin", 68.50f, 7, 7}
    };

    int n = sizeof(samples) / sizeof(samples[0]);
    for (int i = 0; i < n && i < MAX_BOOKS; i++) {
        library[i] = samples[i];
    }
    bookCount = n;
    saveToFile();
}
