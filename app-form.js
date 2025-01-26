// app-form.js

customElements.define('app-form', class extends HTMLElement {
    static get observedAttributes() {
      return ['for'];
    }
  
    constructor() {
      super();
      this.onButtonClick = this.onButtonClick.bind(this);
    }
  
    connectedCallback() {
      // Listen for "buttonClick" on any child <app-button>
      this.addEventListener('buttonClick', this.onButtonClick);
  
      // Optional: an event to signal that this form is ready
      this.dispatchEvent(new CustomEvent('formInit', {
        bubbles: true,
        composed: true,
        detail: { message: 'app-form initialized' }
      }));
    }
  
    disconnectedCallback() {
      this.removeEventListener('buttonClick', this.onButtonClick);
    }
  
    attributeChangedCallback(name, oldVal, newVal) {
      if (name === 'for' && oldVal !== newVal) {
        // Optionally, do something if the data-source changes
      }
    }
  
    async onButtonClick(e) {
      e.preventDefault();
  
      // Collect all fields with [name]
      const fields = Array.from(this.querySelectorAll('[name]'));
      if (!fields.length) {
        console.warn('No [name] fields found in <app-form>');
        return;
      }
  
      // Build a record object
      const record = {};
      for (const f of fields) {
        record[f.getAttribute('name')] = f.value.trim();
      }
  
      // Simple validation example: require at least "title" or something
      if (!record.title) {
        this.dispatchEvent(new CustomEvent('formError', {
          bubbles: true,
          composed: true,
          detail: { error: 'Title is required' }
        }));
        return;
      }
  
      // Identify the <data-source> we need
      const sourceId = this.getAttribute('for');
      if (!sourceId) {
        console.error('No "for" attribute set on <app-form>');
        return;
      }
      const dataSource = document.getElementById(sourceId);
      if (!dataSource) {
        console.error('Could not find data-source with id:', sourceId);
        return;
      }
  
      try {
        // Insert the record
        await dataSource.createRecord(record);
  
        // Clear fields
        for (const f of fields) {
          f.value = '';
        }
  
        // Dispatch a success event
        this.dispatchEvent(new CustomEvent('formSubmit', {
          bubbles: true,
          composed: true,
          detail: record
        }));
      } catch (err) {
        console.error('Error creating record:', err);
        this.dispatchEvent(new CustomEvent('formError', {
          bubbles: true,
          composed: true,
          detail: { error: err.message }
        }));
      }
    }
  });
  