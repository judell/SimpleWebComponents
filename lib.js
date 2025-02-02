// lib.js
import { fetchAll, createRecord } from './db.js';


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

customElements.define('layout-box', class extends HTMLElement {
  connectedCallback() {
    this.classList.add('swc-layout-box');

    const layout = this.getAttribute('layout') || 'vertical';
    const align = this.getAttribute('align') || 'left';
    const gap = this.getAttribute('gap') || '10px';
    const responsive = this.hasAttribute('responsive'); // Enable auto-stacking

    this.style.display = 'flex';
    this.style.flexDirection = layout === 'horizontal' ? 'row' : 'column';
    this.style.gap = gap;

    switch (align) {
      case 'center': this.style.justifyContent = 'center'; break;
      case 'right': this.style.justifyContent = 'flex-end'; break;
      case 'space-between': this.style.justifyContent = 'space-between'; break;
      case 'space-around': this.style.justifyContent = 'space-around'; break;
      default: this.style.justifyContent = 'flex-start';
    }

    // Apply responsive behavior if enabled
    if (responsive) {
      this.style.flexWrap = 'wrap'; // Allow wrapping on small screens
    }
  }
});

customElements.define('list-view', class extends HTMLElement {
  connectedCallback() {
    this.setupDataSource();
  }

  setupDataSource() {
    const sourceId = this.getAttribute('for');
    if (!sourceId) return;

    const dataSource = document.getElementById(sourceId);
    if (!dataSource) return;

    if (this._onDataLoaded) {
      dataSource.removeEventListener('dataLoaded', this._onDataLoaded);
    }

    this._onDataLoaded = (e) => {
      this.render(e.detail.records || []);
    };
    dataSource.addEventListener('dataLoaded', this._onDataLoaded);

    if (dataSource.records && dataSource.records.length) {
      this.render(dataSource.records);
    }
  }

  render(records) {
    // Find the first <list-card> inside <list-view> (used as a template)
    const template = this.querySelector('list-card');
    if (!template) {
      console.error('No <list-card> found inside <list-view>.');
      return;
    }

    this.innerHTML = ''; // Clear existing cards

    const fieldsAttr = this.getAttribute('fields') || '';
    const fields = fieldsAttr.split(',').map(f => f.trim()).filter(Boolean);

    records.forEach(item => {
      const card = template.cloneNode(true); // Clone the template
      card.data = { fields, record: item }; // Populate with data
      this.appendChild(card);
    });
  }
});


customElements.define('list-card', class extends HTMLElement {
  set data({ fields, record }) {
    const content = fields.map(fieldName => {
      const val = record[fieldName] ?? '';
      return `<p><strong>${fieldName}:</strong> ${val}</p>`;
    }).join('');

    // Ensure default styles only if not set by the author
    if (!this.style.display) this.style.display = 'block';
    if (!this.style.marginTop) this.style.marginTop = '8px';
    if (!this.style.padding) this.style.padding = '8px';
    if (!this.style.border) this.style.border = '1px solid #ccc'; // Match text-box border

    this.innerHTML = content;
  }
});



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
