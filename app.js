const configs = {
    customers: {
        title: 'Customers',
        endpoint: 'customers',
        id: 'customer_id',
        fields: [
            ['name', 'Customer name', 'text', true],
            ['phone', 'Phone number', 'tel', true],
            ['email', 'Email', 'email'],
            ['address', 'Address', 'text']
        ]
    },

    services: {
        title: 'Services',
        endpoint: 'services',
        id: 'service_id',
        fields: [
            ['service_name', 'Service name', 'text', true],
            ['price_per_kg', 'Price per kg', 'number', true],
            ['description', 'Description', 'text']
        ]
    },

    orders: {
        title: 'Orders',
        endpoint: 'orders',
        id: 'order_id',
        fields: [
            ['customer_id', 'Customer ID', 'number', true],
            ['service_id', 'Service ID', 'number', true],
            ['clothes_weight', 'Clothes weight (kg)', 'number', true],
            ['order_date', 'Order date', 'date', true],
            ['delivery_date', 'Delivery date', 'date'],
            ['total_amount', 'Total amount', 'number', true],
            ['status', 'Status', 'select', true,
                ['Pending', 'Processing', 'Ready', 'Delivered', 'Cancelled']]
        ]
    },

    payments: {
        title: 'Payments',
        endpoint: 'payments',
        id: 'payment_id',
        fields: [
            ['order_id', 'Order ID', 'number', true],
            ['amount', 'Amount', 'number', true],
            ['payment_date', 'Payment date', 'date', true],
            ['payment_method', 'Payment method', 'select', true,
                ['Cash', 'UPI', 'Card', 'Net Banking']],
            ['status', 'Status', 'select', true,
                ['Paid', 'Pending', 'Failed']]
        ]
    }
};

let current = 'dashboard';

// Escape HTML
const esc = value =>
    String(value ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[c]));

// DATE FORMAT FIX
function formatDate(date) {
    if (!date) return '';

    // Convert ISO date or MySQL date into YYYY-MM-DD
    return String(date).substring(0, 10);
}

// Format values before displaying in table
function displayValue(field, value) {
    if (field.endsWith('_date')) {
        return formatDate(value);
    }

    return value ?? '';
}

// API function
async function api(url, options = {}) {

    const response = await fetch('/api/' + url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Request failed');
    }

    return data;
}

// Toast message
function toast(message) {
    const t = document.getElementById('toast');

    if (!t) {
        alert(message);
        return;
    }

    t.textContent = message;
    t.style.display = 'block';

    setTimeout(() => {
        t.style.display = 'none';
    }, 2800);
}

// Navigation
document.querySelectorAll('.nav').forEach(button => {
    button.addEventListener('click', () => {
        showPage(button.dataset.page);
    });
});

// Show page
function showPage(page) {

    current = page;

    document.querySelectorAll('.page').forEach(element => {
        element.classList.add('hidden');
    });

    const selectedPage = document.getElementById(page);

    if (!selectedPage) {
        console.error('Page not found:', page);
        return;
    }

    selectedPage.classList.remove('hidden');

    document.querySelectorAll('.nav').forEach(element => {
        element.classList.toggle(
            'active',
            element.dataset.page === page
        );
    });

    const title = document.getElementById('pageTitle');

    if (title) {
        title.textContent =
            page === 'dashboard'
                ? 'Dashboard'
                : configs[page]?.title || page;
    }

    if (page === 'dashboard') {
        loadDashboard();
    } else if (configs[page]) {
        loadTable(page);
    }
}

// Dashboard
async function loadDashboard() {

    try {

        const data = await api('dashboard');

        document.getElementById('countCustomers').textContent =
            data.customers ?? 0;

        document.getElementById('countServices').textContent =
            data.services ?? 0;

        document.getElementById('countOrders').textContent =
            data.orders ?? 0;

        document.getElementById('revenue').textContent =
            '₹' + Number(data.revenue || 0).toFixed(2);

    } catch (error) {
        toast(error.message);
    }
}

// Load table
async function loadTable(key) {

    const config = configs[key];

    if (!config) return;

    const root = document.getElementById(key);

    if (!root) {
        console.error('Table container not found:', key);
        return;
    }

    root.innerHTML = `
        <div class="toolbar">
            <p>Manage and maintain your ${key} records.</p>

            <button class="primary" onclick="openForm('${key}')">
                + Add ${config.title.slice(0, -1)}
            </button>
        </div>

        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        ${
                            [
                                config.id,
                                ...config.fields.map(field => field[0]),
                                'Actions'
                            ].map(column => `
                                <th>${esc(column.replaceAll('_', ' '))}</th>
                            `).join('')
                        }
                    </tr>
                </thead>

                <tbody id="${key}Rows">
                    <tr>
                        <td colspan="${config.fields.length + 2}"
                            class="empty">
                            Loading...
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;

    try {

        const rows = await api(config.endpoint);

        const tbody = document.getElementById(key + 'Rows');

        if (!tbody) return;

        if (!Array.isArray(rows)) {
            throw new Error('Invalid response from server');
        }

        if (rows.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="${config.fields.length + 2}"
                        class="empty">
                        No records found. Add your first record.
                    </td>
                </tr>
            `;

            return;
        }

        tbody.innerHTML = rows.map(row => {

            const id = row[config.id];

            const columns = config.fields.map(field => {

                const fieldName = field[0];

                const value = displayValue(
                    fieldName,
                    row[fieldName]
                );

                return `<td>${esc(value)}</td>`;

            }).join('');

            return `
                <tr>
                    <td>${esc(id)}</td>

                    ${columns}

                    <td class="actions">

                        <button onclick="openForm('${key}', ${Number(id)})">
                            Edit
                        </button>

                        <button class="del"
                            onclick="removeRow('${key}', ${Number(id)})">
                            Delete
                        </button>

                    </td>
                </tr>
            `;

        }).join('');

    } catch (error) {

        console.error('Table loading error:', error);

        const tbody = document.getElementById(key + 'Rows');

        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="${config.fields.length + 2}"
                        class="empty">
                        ${esc(error.message)}
                    </td>
                </tr>
            `;
        }

        toast(error.message);
    }
}

// Add / Edit Form
async function openForm(key, id = null) {

    const config = configs[key];

    if (!config) return;

    let row = {};

    try {

        if (id !== null) {

            const rows = await api(config.endpoint);

            row = rows.find(
                item => String(item[config.id]) === String(id)
            ) || {};

        }

        // Form fields
        const inputs = config.fields.map(field => {

            const [name, label, type, required, options] = field;

            let input = '';

            if (type === 'select') {

                input = `
                    <select name="${name}" ${required ? 'required' : ''}>

                        ${options.map(option => `
                            <option value="${esc(option)}"
                                ${String(row[name]) === option ? 'selected' : ''}>
                                ${esc(option)}
                            </option>
                        `).join('')}

                    </select>
                `;

            } else {

                // DATE INPUT FIX
                const value = type === 'date'
                    ? formatDate(row[name])
                    : row[name] ?? '';

                input = `
                    <input
                        name="${name}"
                        type="${type}"
                        ${required ? 'required' : ''}
                        ${type === 'number' ? 'step="0.01" min="0"' : ''}
                        value="${esc(value)}"
                    >
                `;
            }

            return `
                <div class="field ${name === 'address' ? 'full' : ''}">

                    <label>${esc(label)}</label>

                    ${input}

                </div>
            `;

        }).join('');

        // Modal
        const modal = document.createElement('div');

        modal.className = 'modal';

        modal.innerHTML = `
            <form class="dialog">

                <h2>${id ? 'Edit' : 'Add'} ${esc(config.title)}</h2>

                <div class="form-grid">
                    ${inputs}
                </div>

                <div class="form-actions">

                    <button type="button"
                        class="secondary"
                        id="cancel">
                        Cancel
                    </button>

                    <button type="submit" class="primary">
                        Save record
                    </button>

                </div>

            </form>
        `;

        document.body.appendChild(modal);

        modal.querySelector('#cancel').onclick = () => {
            modal.remove();
        };

        modal.onclick = event => {
            if (event.target === modal) {
                modal.remove();
            }
        };

        // Save record
        modal.querySelector('form').onsubmit = async event => {

            event.preventDefault();

            const formData = new FormData(event.target);

            const data = Object.fromEntries(formData.entries());

            // Convert number fields into numbers
            config.fields.forEach(field => {

                const name = field[0];
                const type = field[2];

                if (type === 'number' && data[name] !== '') {
                    data[name] = Number(data[name]);
                }

            });

            try {

                await api(
                    config.endpoint + (id !== null ? '/' + id : ''),
                    {
                        method: id !== null ? 'PUT' : 'POST',
                        body: JSON.stringify(data)
                    }
                );

                modal.remove();

                toast(
                    id !== null
                        ? 'Record updated successfully'
                        : 'Record added successfully'
                );

                await loadTable(key);

                await loadDashboard();

            } catch (error) {

                toast(error.message);

                console.error(error);
            }
        };

    } catch (error) {

        toast(error.message);

        console.error(error);
    }
}

// Delete record
async function removeRow(key, id) {

    if (!confirm('Are you sure you want to delete this record?')) {
        return;
    }

    try {

        await api(
            configs[key].endpoint + '/' + id,
            {
                method: 'DELETE'
            }
        );

        toast('Record deleted successfully');

        await loadTable(key);

        await loadDashboard();

    } catch (error) {

        toast(error.message);

        console.error(error);
    }
}

// Initial page
showPage('dashboard');