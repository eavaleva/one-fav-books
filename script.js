import { books } from '/resources/books.js';


// Pagination settings
const booksPerPage = 6;
let currentPage = 1;

const booksGrid = document.getElementById('booksGrid');
const paginationContainer = document.getElementById('pagination');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const genreFilter = document.getElementById('genreFilter');

// Function to display books for current page
function displayBooks(filteredBooks = books) {
    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    const booksToDisplay = filteredBooks.slice(startIndex, endIndex);

    booksGrid.innerHTML = '';

    booksToDisplay.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.innerHTML = `
            <div class="card-front">
                <img src="${book.cover}" alt="${book.title} cover" class="book-cover">
                <div class="book-info">
                    <h3>${book.title}</h3>
                    <div class="book-meta">
                        <p><strong>Author:</strong> ${book.author}</p>
                        <p><strong>Year:</strong> ${book.year}</p>
                        <p><strong>Genre:</strong> ${book.genre}</p>
                    </div>
                </div>
                <span class="flip-hint">↻</span>
            </div>
            <div class="card-back">
                <h3>${book.title}</h3>
                <div class="book-summary">
                    ${book.summary}
                </div>
                <span class="flip-hint">↺</span>
            </div>
        `;

        // Add click event for flipping
        bookCard.addEventListener('click', () => {
            bookCard.classList.toggle('flipped');
        });

        booksGrid.appendChild(bookCard);
    });

    updatePagination(filteredBooks.length);
}

// Function to update pagination buttons
function updatePagination(totalBooks) {
    const totalPages = Math.ceil(totalBooks / booksPerPage);
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.className = i === currentPage ? 'active' : '';
        button.addEventListener('click', () => {
            currentPage = i;
            displayBooks(filterAndSortBooks());
        });
        paginationContainer.appendChild(button);
    }
}

// Function to filter and sort books
function filterAndSortBooks() {
    const searchTerm = searchInput.value.toLowerCase();
    const sortBy = sortSelect.value;
    const selectedGenre = genreFilter.value;

    let filteredBooks = books.filter(book =>
        (book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm)) &&
        (selectedGenre === '' || book.genre === selectedGenre)
    );

    if (sortBy === 'year') {
        filteredBooks.sort((a, b) => a.year - b.year);
    } else {
        filteredBooks.sort((a, b) => a[sortBy].localeCompare(b[sortBy]));
    }

    return filteredBooks;
}

// Function to handle input events
function handleInputEvents() {
    currentPage = 1;
    displayBooks(filterAndSortBooks());
}

// Event listeners
searchInput.addEventListener('input', handleInputEvents);
sortSelect.addEventListener('change', handleInputEvents);
genreFilter.addEventListener('change', handleInputEvents);

// Initial display of books
document.addEventListener('DOMContentLoaded', () => {
   displayBooks();
});
