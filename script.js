// Base URL for the API
const API_URL = 'http://localhost:8000/api/books';

// Pagination settings
let booksPerPage = 6;
let currentPage = 1;

// Store books
let books = [];

const booksGrid = document.getElementById('booksGrid');
const paginationContainer = document.getElementById('pagination');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const genreFilter = document.getElementById('genreFilter');
const form = document.getElementById('addBookForm');
const coverInput = document.getElementById('cover');
const booksPerPageSelect = document.getElementById('amountSelect');
const burgerMenu = document.querySelector('.burger-menu');
const navLinks = document.querySelector('.nav-links');
const links = document.querySelectorAll('.nav-links a');

// Function to fetch books from the API
async function fetchBooks() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! Failed to fetch books, status: ${response.status}`);
        }

        const data = await response.json();
        console.log('RAW API data response:', data);

        // Process API response
        if (Array.isArray(data)) {
            books = data;
        } else if (!data || typeof data !== 'object') {
            throw new Error('Invalid data format received from API response');
        } else if (Array.isArray(data.books)) {
            books = data.books;
        } else {
            const possibleArrayProps = Object.keys(data).filter(key => Array.isArray(data[key]));
            if (possibleArrayProps.length > 0) {
                books = data[possibleArrayProps[0]];
                console.log(`Found books array in property: ${possibleArrayProps[0]} in API response`);
            } else {
                // Last resort: convert object values to an array
                console.warn('API response is not an array. Attempting to convert:', data);
                books = Object.values(data).filter(item => typeof item === 'object' && item !== null);

                if (books.length === 0) {
                    throw new Error('Could not extract books from API response');
                }
            }
        }

        console.log('Processed books array:', books);

        if (books.length === 0) {
            booksGrid.innerHTML = '<div class="no-books-message">No books found. Your collection is empty.</div>';
            return;
        }

        displayBooks(books);
        createGenreOptions();
    } catch (error) {
        console.error('Error fetching books:', error);
        booksGrid.innerHTML = `<div class="error-message">Failed to load books: ${error.message}</div>`;
    }
}

// Function to display books for current page
function displayBooks(filteredBooks = books) {
    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    const booksToDisplay = filteredBooks.slice(startIndex, endIndex);

    booksGrid.innerHTML = '';
    if (booksToDisplay.length === 0) {
        booksGrid.innerHTML = '<div class="no-books-message">No books found matching your criteria.</div>';
        updatePagination(0);
        return;
    }
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

// Function to dynamically create select options for genres based on the books data
function createGenreOptions() {
    const genres = books.reduce((acc, book) => {
        if (!acc.includes(book.genre)) {
            acc.push(book.genre);
        }
        return acc;
    }, []);
    genreFilter.innerHTML = '<option value="">All Genres</option>';

    genres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        genreFilter.appendChild(option);
    });
}

// Function choose amount of books per page select option event
function chooseAmountOfBooksPerPage(event) {
    booksPerPage = event.target.value;
    currentPage = 1;
    displayBooks(filterAndSortBooks());

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


// Handle cover upload
function handleCoverUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            // Store the data URL in a hidden input
            document.getElementById('coverDataUrl').value = e.target.result;

            // Show preview
            const previewImg = document.getElementById('coverPreview');
            if (previewImg) {
                previewImg.src = e.target.result;
                previewImg.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    }
}

async function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;

    // Generate a unique ID for the new book
    const newId = Date.now().toString();

    const newBook = {
        id: newId,
        title: form.title.value,
        author: form.author.value,
        year: parseInt(form.year.value),
        genre: form.genre.value,
        summary: form.summary.value,
        cover: document.getElementById('coverDataUrl').value || '/resources/images/placeholder.png'
    };
    console.log('Submitting new book:', newBook);
    console.log('Request URL:', API_URL);
    console.log('Request body as JSON:', JSON.stringify(newBook));

    try {
        console.log('About to send POST request to:', API_URL);
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newBook)
        });
        console.log('Response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Get the response data
        const responseData = await response.json();
        console.log('Book added successfully:', responseData);

        // Reset form and refresh books
        form.reset();
        document.getElementById('coverDataUrl').value = '';

        // Reset cover preview if it exists
        const previewImg = document.getElementById('coverPreview');
        if (previewImg) {
            previewImg.style.display = 'none';
            previewImg.src = '';
        }

        // Add to local array for immediate display
        books.unshift(newBook);
        currentPage = 1;
        displayBooks(filterAndSortBooks());

        // Show success message
        alert('Book added successfully!');
    } catch (error) {
        console.error('Error adding book:', error);
        alert(`Failed to add book: ${error.message}`);
    }
}

// Burger menu functionality
function toggleMenu() {
    burgerMenu.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        burgerMenu.classList.toggle('active');
    });

    // Close menu when a link is clicked
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            burgerMenu.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !burgerMenu.contains(e.target)) {
            navLinks.classList.remove('active');
            burgerMenu.classList.remove('active');
        }
    });
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
form.addEventListener('submit', handleFormSubmit);
coverInput.addEventListener('change', handleCoverUpload);
booksPerPageSelect.addEventListener('change', chooseAmountOfBooksPerPage);

// Initial display of books
document.addEventListener('DOMContentLoaded', () => {
    fetchBooks();
    createGenreOptions();
    toggleMenu();
});
