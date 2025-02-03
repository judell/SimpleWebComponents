customElements.define('app-form', class extends HTMLElement {
    static get observedAttributes() {
        return ['for', 'required'];
    }

    constructor() {
        super();
        this.onButtonClick = this.onButtonClick.bind(this);
    }

    connectedCallback() {
        console.log('app-form initialized');

        // Ensure "required" attribute is set
        if (!this.hasAttribute('required')) {
            console.error('<app-form> missing required="..." attribute');
            return;
        }
        console.log('addEventListener')
        this.addEventListener('buttonClick', this.onButtonClick);
    }

    disconnectedCallback() {
        console.log('removeEventListener')
        this.removeEventListener('buttonClick', this.onButtonClick);
    }

    attributeChangedCallback(name, oldVal, newVal) {
        console.log('app-form attribute changed:', name, oldVal, newVal);
    }

    async onButtonClick(e) {
        e.preventDefault();
        console.log("app-form button clicked for", this.getAttribute('for'));

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

        const fields = Array.from(this.querySelectorAll('[name]'));
        if (!fields.length) {
            console.warn('No [name] fields found in <app-form>');
            return;
        }

        // Build record object
        const record = {};
        for (const f of fields) {
            record[f.getAttribute('name')] = f.value.trim();
        }

        console.log("Built record:", record);

        // Validate required fields
        const requiredFields = this.getAttribute('required').split(',').map(f => f.trim());
        const missingFields = requiredFields.filter(field => !record[field]);

        if (missingFields.length) {
            console.error("Form validation failed. Missing fields:", missingFields);
            this.dispatchEvent(new CustomEvent('formError', {
                bubbles: true,
                composed: true,
                detail: { error: `Missing required fields: ${missingFields.join(', ')}` }
            }));
            return;
        }

        try {
            console.log('Record being created:', record);
            await dataSource.createRecord(record);

            console.log('Clearing fields');
            fields.forEach(f => f.value = '');

            console.log('Dispatching success event');
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
