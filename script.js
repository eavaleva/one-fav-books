import { books } from '/resources/books.js';


// Pagination settings
let booksPerPage = 6;
let currentPage = 1;

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
        reader.onload = function(e) {
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

function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const newBook = {
        title: form.title.value,
        author: form.author.value,
        year: form.year.value,
        genre: form.genre.value,
        summary: form.summary.value,
        cover: document.getElementById('coverDataUrl').value || '/resources/images/placeholder.png'
    };
    // add new book to the list
    books.unshift(newBook);
    // reset form and display books
    form.reset();
    // const previewImg = document.getElementById('coverPreview');
    // if (previewImg) {
    //     previewImg.src = '';
    //     previewImg.style.display = 'none';
    // }
    document.getElementById('coverDataUrl').value = '';
    currentPage = 1;
    displayBooks();

    // Show success message
    alert('Book added successfully!');
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
   displayBooks();
   createGenreOptions();
   toggleMenu();
});
