import { getBooks, addBook } from './db.js';

customElements.define('app-form', class extends HTMLElement {
  static get observedAttributes() {
    return ['data-source']; // if you want to pass "books" or another table name
  }

  constructor() {
    super();
    this.onButtonClick = this.onButtonClick.bind(this);
  }

  connectedCallback() {
    // Listen for the custom "buttonClick" event from <app-button>
    this.addEventListener('buttonClick', this.onButtonClick);

    this.dispatchEvent(new CustomEvent('formInit', {
      bubbles: true,
      composed: true,
      detail: { message: 'app-form initialized' }
    }));

    // Load existing books on attach
    this.loadItems();
  }

  disconnectedCallback() {
    this.removeEventListener('buttonClick', this.onButtonClick);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log('attributeChanged', name, oldValue, newValue)
    if (name === 'data-source' && oldValue !== null) {
      this.loadItems();
    }
  }

  /**
   * Called when <app-button> dispatches "buttonClick".
   * Gathers user input, validates, calls addBook(), and refreshes.
   */
  async onButtonClick(e) {
    e.preventDefault();

    const titleBox = this.querySelector('text-box[name="title"]');
    const authorBox = this.querySelector('text-box[name="author"]');
    const yearBox   = this.querySelector('text-box[name="year"]');
    const listView  = this.querySelector('list-view');

    if (!titleBox || !authorBox || !yearBox || !listView) {
      console.error('Missing inputs or list-view in <app-form>');
      return;
    }

    const title = titleBox.value.trim();
    const author = authorBox.value.trim();
    const yearString = yearBox.value.trim();
    const year = parseInt(yearString, 10) || 0; // fallback if empty or invalid

    if (!title || !author) {
      // Dispatch an event or just alert
      this.dispatchEvent(new CustomEvent('formError', {
        bubbles: true,
        composed: true,
        detail: { error: 'Please provide at least a title and author.' }
      }));
      return;
    }

    // Insert new book record
    try {
      await addBook({ title, author, year });
      // Clear the inputs
      titleBox.value = '';
      authorBox.value = '';
      yearBox.value = '';
      // Reload the list
      await this.loadItems();

      this.dispatchEvent(new CustomEvent('formSubmit', {
        bubbles: true,
        composed: true,
        detail: { title, author, year }
      }));
    } catch (err) {
      console.error('Error adding book:', err);
      this.dispatchEvent(new CustomEvent('formError', {
        bubbles: true,
        composed: true,
        detail: { error: err.message }
      }));
    }
  }

  /**
   * Loads books from the data layer and displays them in <list-view>.
   */
  async loadItems() {
    console.log('loadItems')
    const listView = this.querySelector('list-view');
    if (!listView) return;

    try {
      const books = await getBooks(); // or getBooks('books') if your data-source logic differs
      listView.innerHTML = '';
      books.forEach(book => {
        const card = document.createElement('list-card');
        // Show author and year in the subtitle
        card.setAttribute('title', book.title);
        card.setAttribute('subtitle', `${book.author} (${book.year || 'Unknown'})`);
        listView.appendChild(card);
      });
    } catch (err) {
      console.error('Error loading books:', err);
      // Optionally dispatch an error event
    }
  }
});
