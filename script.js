// Initialize EmailJS with your public key
emailjs.init("YOUR_PUBLIC_KEY"); // Replace with your actual EmailJS public key

// State
let grants = [];
let filters = {
    deadline: 'all',
    amount: 'all'
};

// DOM Elements
const grantsList = document.getElementById('grants-list');
const deadlineFilter = document.getElementById('deadline-filter');
const amountFilter = document.getElementById('amount-filter');
const modal = document.getElementById('reminder-modal');
const closeButton = document.querySelector('.close-button');
const reminderForm = document.getElementById('reminder-form');
const emailInput = document.getElementById('email-input');
const grantIdInput = document.getElementById('grant-id-input');
const newsletterForm = document.getElementById('newsletter-form');

// Stats Elements
const totalGrantsElement = document.getElementById('total-grants');
const upcomingDeadlinesElement = document.getElementById('upcoming-deadlines');
const totalFundingElement = document.getElementById('total-funding');

// Event Listeners
deadlineFilter.addEventListener('change', handleFilterChange);
amountFilter.addEventListener('change', handleFilterChange);
closeButton.addEventListener('click', closeModal);
reminderForm.addEventListener('submit', handleReminderSubmit);
newsletterForm?.addEventListener('submit', handleNewsletterSubmit);
window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// Fetch and load grants
async function loadGrants() {
    try {
        const response = await fetch('grants.json');
        const data = await response.json();
        grants = data.grants;
        updateStats();
        renderGrants();
    } catch (error) {
        console.error('Error loading grants:', error);
        grantsList.innerHTML = '<p class="error">Error loading grants. Please try again later.</p>';
    }
}

// Update stats section
function updateStats() {
    // Total active grants
    totalGrantsElement.textContent = grants.length;

    // Upcoming deadlines (next 30 days)
    const upcomingCount = grants.filter(grant => {
        const daysUntil = getDaysUntilDeadline(grant.deadline);
        return daysUntil <= 30 && daysUntil > 0;
    }).length;
    upcomingDeadlinesElement.textContent = upcomingCount;

    // Total available funding (maximum sum)
    const totalFunding = grants.reduce((sum, grant) => {
        const amounts = grant.amount.match(/\d+/g).map(Number);
        return sum + Math.max(...amounts);
    }, 0);
    totalFundingElement.textContent = formatCurrency(totalFunding);
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(amount);
}

// Calculate days until deadline
function getDaysUntilDeadline(deadline) {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Get deadline class based on days remaining
function getDeadlineClass(daysRemaining) {
    if (daysRemaining < 7) return 'urgent';
    if (daysRemaining < 30) return 'warning';
    return 'safe';
}

// Format amount for filtering
function formatAmount(amount) {
    const numbers = amount.match(/\d+/g).map(Number);
    return Math.max(...numbers);
}

// Filter grants based on current filters
function filterGrants(grant) {
    const daysUntilDeadline = getDaysUntilDeadline(grant.deadline);
    const maxAmount = formatAmount(grant.amount);

    if (filters.deadline !== 'all') {
        const days = parseInt(filters.deadline);
        if (daysUntilDeadline > days) return false;
    }

    if (filters.amount !== 'all') {
        switch (filters.amount) {
            case 'under10k':
                if (maxAmount >= 10000) return false;
                break;
            case '10k-50k':
                if (maxAmount < 10000 || maxAmount > 50000) return false;
                break;
            case 'over50k':
                if (maxAmount <= 50000) return false;
                break;
        }
    }

    return true;
}

// Render grants to the page
function renderGrants() {
    const filteredGrants = grants.filter(filterGrants);
    
    if (filteredGrants.length === 0) {
        grantsList.innerHTML = `
            <div class="no-results">
                <p>No grants found matching your criteria.</p>
                <button onclick="resetFilters()" class="button">Reset Filters</button>
            </div>
        `;
        return;
    }
    
    grantsList.innerHTML = filteredGrants.map(grant => {
        const daysRemaining = getDaysUntilDeadline(grant.deadline);
        const deadlineClass = getDeadlineClass(daysRemaining);
        
        return `
            <div class="grant-card">
                <h2>${grant.name}</h2>
                <p class="deadline ${deadlineClass}">
                    Deadline: ${new Date(grant.deadline).toLocaleDateString()} 
                    (${daysRemaining} days remaining)
                </p>
                <p class="amount">Amount: ${grant.amount}</p>
                <p>${grant.description}</p>
                <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                    <a href="${grant.url}" target="_blank" class="button">Apply Now</a>
                    <button onclick="openReminderModal('${grant.id}')" class="button">Set Reminder</button>
                </div>
            </div>
        `;
    }).join('');
}

// Reset filters
function resetFilters() {
    filters = {
        deadline: 'all',
        amount: 'all'
    };
    deadlineFilter.value = 'all';
    amountFilter.value = 'all';
    renderGrants();
}

// Handle filter changes
function handleFilterChange(e) {
    filters[e.target.id.split('-')[0]] = e.target.value;
    renderGrants();
}

// Modal functions
function openReminderModal(grantId) {
    grantIdInput.value = grantId;
    modal.style.display = 'block';
}

function closeModal() {
    modal.style.display = 'none';
    reminderForm.reset();
}

// Handle reminder form submission
async function handleReminderSubmit(e) {
    e.preventDefault();
    
    const grant = grants.find(g => g.id.toString() === grantIdInput.value);
    if (!grant) return;

    const templateParams = {
        user_email: emailInput.value,
        grant_name: grant.name,
        deadline: new Date(grant.deadline).toLocaleDateString(),
        amount: grant.amount,
        application_url: grant.url
    };

    try {
        await emailjs.send(
            'YOUR_SERVICE_ID', // Replace with your EmailJS service ID
            'YOUR_TEMPLATE_ID', // Replace with your EmailJS template ID
            templateParams
        );
        
        showToast('Reminder set successfully!', 'success');
        closeModal();
    } catch (error) {
        console.error('Error setting reminder:', error);
        showToast('Failed to set reminder. Please try again.', 'error');
    }
}

// Handle newsletter form submission
async function handleNewsletterSubmit(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;

    try {
        // Here you would typically send this to your backend
        // For now, we'll just show a success message
        showToast('Successfully subscribed to newsletter!', 'success');
        e.target.reset();
    } catch (error) {
        showToast('Failed to subscribe. Please try again.', 'error');
    }
}

// Toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Trigger reflow
    toast.offsetHeight;
    
    // Add visible class
    toast.classList.add('visible');
    
    // Remove toast after animation
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Initialize the application
loadGrants(); 