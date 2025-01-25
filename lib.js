// lib.js

// TextBox
customElements.define('text-box', class extends HTMLElement {
    connectedCallback() {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = this.getAttribute('placeholder') || '';
        input.style.width = '100%';
        this.appendChild(input);
    }

    get value() {
        return this.querySelector('input').value;
    }

    set value(val) {
        this.querySelector('input').value = val;
    }    
});

// AppButton
customElements.define('app-button', class extends HTMLElement {
    connectedCallback() {
        const button = document.createElement('button');
        button.textContent = this.getAttribute('label') || 'Click Me';
        // Remove the click listener from the button
        this.appendChild(button);
        
        // Add click handler to the component itself
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

// ListView
customElements.define('list-view', class extends HTMLElement {
    connectedCallback() {
        this.style.display = 'block';
    }
});

// ListCard
customElements.define('list-card', class extends HTMLElement {
    connectedCallback() {
        const title = this.getAttribute('title') || 'Untitled';
        const subtitle = this.getAttribute('subtitle') || '';
        this.innerHTML = `
            <div style="border: 1px solid #ccc; padding: 10px; margin: 5px;">
                <h3>${title}</h3>
                <p>${subtitle}</p>
            </div>
        `;
    }
});
