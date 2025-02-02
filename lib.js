// lib.js
import { fetchAll, createRecord } from './db.js';

// 1) <data-source> : fetches + stores data from a specific table attribute, e.g. table="books".
customElements.define('data-source', class extends HTMLElement {
  constructor() {
    super();
    this._records = [];
  }

  static get observedAttributes() {
    return ['table'];
  }

  attributeChangedCallback(name, oldVal, newVal) {
    console.log('data-source attrChangedCallback', oldVal, newVal)
    if (name === 'table' && oldVal !== newVal) {
      this.loadData(); 
    }
  }

  connectedCallback() {
    console.log('data-source', this.getAttribute('table'))
    // On first connect, load data (if table attribute is present)
    const table = this.getAttribute('table');
    if (table) {
      this.loadData();
    }
  }

  get records() {
    return this._records;
  }

  // Called by e.g. <app-form> after creating a new record, or re-called automatically if table changes
  async loadData() {
    const table = this.getAttribute('table');
    if (!table) return;

    try {
      const data = await fetchAll(table);
      this._records = data;

      // Dispatch an event so <list-view> or others can re-render
      this.dispatchEvent(new CustomEvent('dataLoaded', {
        detail: { records: this._records }
      }));
    } catch (err) {
      console.error('Error loading data from table:', table, err);
    }
  }

  async createRecord(record) {
    const table = this.getAttribute('table');
    if (!table) return;

    try {
      // Insert row
      await createRecord(table, record);
      // Reload after creating
      await this.loadData();
    } catch (err) {
      console.error('Error creating record:', err);
      throw err; // let the form handle it
    }
  }
});

// 2) <list-view> : displays data from a <data-source for="someSourceId">, plus a fields="title,author,year" attribute
customElements.define('list-view', class extends HTMLElement {
  static get observedAttributes() {
    return ['for', 'fields'];
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal !== newVal && (name === 'for' || name === 'fields')) {
      this.setupDataSource();
    }
  }

  connectedCallback() {
    this.setupDataSource();
  }

  setupDataSource() {
    const sourceId = this.getAttribute('for');
    if (!sourceId) return;

    const dataSource = document.getElementById(sourceId);
    if (!dataSource) return;

    // Remove old listeners if re-binding
    if (this._onDataLoaded) {
      dataSource.removeEventListener('dataLoaded', this._onDataLoaded);
    }

    // Listen for dataLoaded
    this._onDataLoaded = (e) => {
      this.render(e.detail.records || []);
    };
    dataSource.addEventListener('dataLoaded', this._onDataLoaded);

    // If data is already loaded, render immediately
    if (dataSource.records && dataSource.records.length) {
      this.render(dataSource.records);
    }
  }

  render(records) {
    // Clear existing
    this.innerHTML = '';
    
    // Parse fields attribute
    const fieldsAttr = this.getAttribute('fields') || '';
    const fields = fieldsAttr.split(',')
      .map(f => f.trim())
      .filter(Boolean); // e.g. ["title", "author", "year"]

    records.forEach(item => {
      // We create <list-card> for each row
      const card = document.createElement('list-card');
      card.data = { fields, record: item };
      this.appendChild(card);
    });
  }
});

// 3) <list-card> : given a {fields, record} object, displays them
customElements.define('list-card', class extends HTMLElement {
  set data({ fields, record }) {
    // Build dynamic HTML for each field
    const content = fields.map(fieldName => {
      const val = record[fieldName] ?? '';
      return `<p><strong>${fieldName}:</strong> ${val}</p>`;
    }).join('');

    this.innerHTML = `
      <div style="border: 1px solid #ccc; padding: 10px; margin: 5px; background: #fff;">
        ${content}
      </div>
    `;
  }
});

// 4) <text-box> : a basic text input with a placeholder
customElements.define('text-box', class extends HTMLElement {
  connectedCallback() {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = this.getAttribute('placeholder') || '';
    input.style.width = this.getAttribute('width') || '100%';

    // optional name to reference in form
    const nameAttr = this.getAttribute('name');
    if (nameAttr) input.name = nameAttr;

    this.appendChild(input);
  }

  get value() {
    return this.querySelector('input').value;
  }

  set value(val) {
    this.querySelector('input').value = val;
  }
});

// 5) <app-button> : dispatches a custom "buttonClick" event when clicked
customElements.define('app-button', class extends HTMLElement {
  connectedCallback() {
    const button = document.createElement('button');
    button.textContent = this.getAttribute('label') || 'Click Me';
    this.appendChild(button);

    // Convert click on the inner <button> => custom "buttonClick" event
    this.addEventListener('click', (e) => {
      if (e.target === button) {
        e.stopPropagation();
        this.dispatchEvent(new CustomEvent('buttonClick', {
          bubbles: true,
          composed: true
        }));
      }
    });
  }
});
