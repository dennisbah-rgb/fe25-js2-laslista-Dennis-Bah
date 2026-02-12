const BASE_URL = "https://dennis-database-c83b1-default-rtdb.europe-west1.firebasedatabase.app/";


class Book {
    constructor(id, title, author, favorite = false) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.favorite = favorite;
    }

    toggleFavorite() {
        this.favorite = !this.favorite;
    }
}


let books = [];
let currentFilter = 'all';       // all favorites
let currentSort = 'added-desc'; // olika sorteringslägen



const bookList = document.querySelector('#bookList');
const form = document.querySelector('#addBookForm');
const titleInput = document.querySelector('#titleInput');
const authorInput = document.querySelector('#authorInput');

const filterSelect = document.querySelector('#filter');
const sortSelect = document.querySelector('#sort');


// Hämta alla böcker
async function fetchBooks() {
    const response = await fetch(`${BASE_URL}.json`);
    const data = await response.json();

    books = [];

    if (data) {
        for (const id in data) {
            const b = data[id];
            books.push(new Book(id, b.title, b.author, b.favorite));
        }
    }

    renderBooks();
}

// Lägg till bok
async function addBook(book) {
    await fetch(`${BASE_URL}.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book)
    });

    fetchBooks();
}

// Ta bort bok
async function deleteBook(id) {
    await fetch(`${BASE_URL}/${id}.json`, {
        method: 'DELETE'
    });

    fetchBooks();
}

// Uppdatera favorit
async function updateBook(book) {
    await fetch(`${BASE_URL}/${book.id}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorite: book.favorite })
    });

    fetchBooks();
}



function getFilteredBooks(list) {
    if (currentFilter === 'favorites') {
        return list.filter(book => book.favorite);
    }
    return list;
}

function getSortedBooks(list) {
    const copy = [...list];

    switch (currentSort) {
        case 'title-asc':
            return copy.sort((a, b) => a.title.localeCompare(b.title));
        case 'title-desc':
            return copy.sort((a, b) => b.title.localeCompare(a.title));
        case 'author-asc':
            return copy.sort((a, b) => a.author.localeCompare(b.author));
        case 'author-desc':
            return copy.sort((a, b) => b.author.localeCompare(a.author));
        case 'added-asc':
            return copy.reverse();
        default:
            return copy;
    }
}



function renderBooks() {
    bookList.innerHTML = '';

    const filtered = getFilteredBooks(books);
    const sorted = getSortedBooks(filtered);

    sorted.forEach(book => {
        const li = document.createElement('li');

        li.innerHTML = `
            <strong>${book.title}</strong> – ${book.author}
            ${book.favorite ? '⭐' : ''}
        `;

        const favBtn = document.createElement('button');
        favBtn.textContent = 'Favorit';
        favBtn.addEventListener('click', () => {
            book.toggleFavorite();
            updateBook(book);
        });

        const delBtn = document.createElement('button');
        delBtn.textContent = 'Ta bort';
        delBtn.addEventListener('click', () => {
            deleteBook(book.id);
        });

        li.appendChild(favBtn);
        li.appendChild(delBtn);
        bookList.appendChild(li);
    });
}



form.addEventListener('submit', event => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const author = authorInput.value.trim();

    if (!title || !author) return;

    const newBook = {
        title,
        author,
        favorite: false
    };

    addBook(newBook);
    form.reset();
});

filterSelect.addEventListener('change', event => {
    currentFilter = event.target.value;
    renderBooks();
});

sortSelect.addEventListener('change', event => {
    currentSort = event.target.value;
    renderBooks();
});



fetchBooks();