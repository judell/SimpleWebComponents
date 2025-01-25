// lib.js

// AppLayout
customElements.define('app-layout', class extends HTMLElement {
    connectedCallback() {
        const layout = this.getAttribute('layout') || 'vertical';
        this.style.display = layout === 'vertical' ? 'block' : 'flex';
    }
});

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
                this.dispatchEvent(new CustomEvent('buttonClick'));
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
