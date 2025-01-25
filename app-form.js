import { addItem, getItems } from './db.js';

customElements.define('app-form', class extends HTMLElement {
  static get observedAttributes() {
    return ['data-source']; // Optional: if you want to configure store or table name, etc.
  }

  constructor() {
    super();
    this.onButtonClick = this.onButtonClick.bind(this);
  }

  connectedCallback() {
    // Listen for "buttonClick" from child <app-button>
    this.addEventListener('buttonClick', this.onButtonClick);

    // Dispatch a 'formInit' event so external scripts can hook in if they want
    this.dispatchEvent(new CustomEvent('formInit', {
      bubbles: true,
      composed: true,
      detail: { message: 'app-form initialized' }
    }));

    // Automatically load items when the component is attached
    this.loadItems();
  }

  disconnectedCallback() {
    // Clean up event listeners if needed
    this.removeEventListener('buttonClick', this.onButtonClick);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // If you'd like to dynamically switch data sources or other configs
    if (name === 'data-source' && oldValue !== newValue) {
      // Example: console.log('Data source changed:', newValue);
      // Potentially reload items from a different store
      this.loadItems();
    }
  }

  /**
   * Handles the custom 'buttonClick' event dispatched by <app-button>.
   */
  async onButtonClick(e) {
    e.preventDefault();

    const textbox = this.querySelector('text-box');
    const listView = this.querySelector('list-view');
    if (!textbox || !listView) return;

    const title = (textbox.value || '').trim();
    if (!title) {
      // Dispatch a custom event to let something else handle empty input
      this.dispatchEvent(new CustomEvent('formError', {
        bubbles: true,
        composed: true,
        detail: { error: 'Title was empty' }
      }));
      return;
    }

    // Insert into IndexedDB (could also handle validations, transformations, etc.)
    await addItem({ title });
    textbox.value = ''; // Clear the input

    // Reload items in the list
    await this.loadItems();

    // Dispatch a 'formSubmit' event so outside code can react (analytics, etc.)
    this.dispatchEvent(new CustomEvent('formSubmit', {
      bubbles: true,
      composed: true,
      detail: { title }
    }));
  }

  /**
   * Public method to load and display items in the child <list-view>.
   * External code could also call this explicitly if needed.
   */
  async loadItems() {
    const listView = this.querySelector('list-view');
    if (!listView) return;

    // Optionally, use the data-source attribute to decide which store/table to query
    // e.g., const source = this.getAttribute('data-source') || 'items';
    // for now, we just call getItems() as before
    const items = await getItems();

    // Render the items
    listView.innerHTML = '';
    items.forEach(item => {
      const card = document.createElement('list-card');
      card.setAttribute('title', item.title);
      listView.appendChild(card);
    });
  }
});
