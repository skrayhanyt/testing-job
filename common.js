// admin_panel/js/common.js

// --- API Configuration ---
// এই URL টি আপনার আসল ব্যাকএন্ড API-এর URL দিয়ে প্রতিস্থাপন করুন
const API_BASE_URL = 'http://localhost:3000/api'; // উদাহরণ: আপনার Node.js/Express API

/**
 * API তে রিকোয়েস্ট পাঠানোর জন্য একটি জেনেরিক ফাংশন
 * @param {string} endpoint - API এন্ডপয়েন্ট (যেমন '/otc-europe-jobs')
 * @param {string} method - HTTP মেথড (GET, POST, PUT, DELETE)
 * @param {object|null} body - রিকোয়েস্ট বডি (POST, PUT এর জন্য)
 * @returns {Promise<object>} - API থেকে প্রাপ্ত JSON ডেটা
 */
async function apiRequest(endpoint, method = 'GET', body = null) {
    const headers = {
        'Content-Type': 'application/json',
    };
    // অ্যাডমিন টোকেন (auth.js থেকে সেট করা) থাকলে হেডার-এ যোগ করুন
    const token = localStorage.getItem('admin_token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method: method,
        headers: headers,
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (response.status === 401) { // Unauthorized
            console.error('Unauthorized. Redirecting to login.');
            if (typeof window.logout === 'function') { // auth.js এর logout ফাংশন
                window.logout();
            } else {
                window.location.href = 'login.html';
            }
            return Promise.reject({ message: 'Unauthorized' });
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            console.error(`API Error ${response.status}:`, errorData);
            throw new Error(errorData.message || `Failed to fetch ${method} ${endpoint}`);
        }

        // DELETE রিকোয়েস্টের ক্ষেত্রে কোনো বডি নাও থাকতে পারে
        if (method === 'DELETE' && response.status === 204) { // No Content
            return { success: true, message: 'Deleted successfully' };
        }
         if (method === 'DELETE' && response.status === 200) { // যদি OK সাথে বডি আসে
            return response.json();
        }


        return response.json(); // மற்ற সব ক্ষেত্রে JSON আশা করা হচ্ছে

    } catch (error) {
        console.error('apiRequest failed:', error);
        // একটি সাধারণ এরর অবজেক্ট রিটার্ন করা যেতে পারে
        return Promise.reject(error.message || 'Network error or failed to parse response.');
    }
}

/**
 * ডাইনামিকভাবে টেবিল তৈরি এবং পপুলেট করার ফাংশন
 * @param {HTMLElement} container - টেবিল যে DOM এলিমেন্টে যুক্ত হবে
 * @param {string} endpoint - ডেটা আনার জন্য API এন্ডপয়েন্ট
 * @param {Array<string>} columns - টেবিলের কলামের হেডার (অবজেক্টের কী অনুযায়ী)
 * @param {Array<object>} columnConfig - কলাম কনফিগারেশন (যেমন, { key: 'title', header: 'Title' })
 * @param {Function} onEdit - এডিট বাটনে ক্লিক করলে যে ফাংশন কল হবে (আইটেম অবজেক্ট পাস করবে)
 * @param {Function} onDelete - ডিলিট বাটনে ক্লিক করলে যে ফাংশন কল হবে (আইটেম আইডি পাস করবে)
 * @param {Function} onAddNew - 'Add New' বাটনে ক্লিক করলে যে ফাংশন কল হবে
 */
async function renderTable(container, endpoint, columnConfig, onEdit, onDelete, onAddNew) {
    const tableTemplate = document.getElementById('genericTableTemplate');
    if (!tableTemplate) {
        container.innerHTML = '<p>Error: Table template not found.</p>';
        return;
    }
    container.innerHTML = ''; // আগের কন্টেন্ট মুছে ফেলা
    container.appendChild(tableTemplate.content.cloneNode(true));

    const tableBody = container.querySelector('tbody');
    const tableHeadRow = container.querySelector('thead tr') || document.createElement('tr'); // Create tr if not exists
    if (!container.querySelector('thead tr')) {
        container.querySelector('thead').appendChild(tableHeadRow);
    }
    const searchInput = container.querySelector('.search-input');
    const addNewBtn = container.querySelector('.add-new-btn');

    if(addNewBtn && typeof onAddNew === 'function') {
        addNewBtn.onclick = onAddNew;
    } else if (addNewBtn) {
        addNewBtn.style.display = 'none'; // যদি onAddNew ফাংশন না থাকে
    }


    // টেবিলের হেডার তৈরি
    tableHeadRow.innerHTML = ''; // Clear existing headers
    columnConfig.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col.header;
        tableHeadRow.appendChild(th);
    });
    if (typeof onEdit === 'function' || typeof onDelete === 'function') {
        const thActions = document.createElement('th');
        thActions.textContent = 'Actions';
        tableHeadRow.appendChild(thActions);
    }

    try {
        const data = await apiRequest(endpoint); // API থেকে ডেটা আনা
        tableBody.innerHTML = ''; // আগের রো মুছে ফেলা

        if (!data || data.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = columnConfig.length + (onEdit || onDelete ? 1 : 0);
            td.textContent = 'কোনো ডেটা পাওয়া যায়নি।';
            td.style.textAlign = 'center';
            tr.appendChild(td);
            tableBody.appendChild(tr);
            return;
        }

        data.forEach(item => {
            const tr = document.createElement('tr');
            columnConfig.forEach(col => {
                const td = document.createElement('td');
                let value = item[col.key];
                if (col.key === 'logo_url' && value) {
                    td.innerHTML = `<img src="${value}" alt="logo" style="width: 50px; height: auto;">`;
                } else if (col.key === 'is_active' || col.key === 'isActive') { // isActive বা is_active উভয়ই হ্যান্ডেল করা
                    td.textContent = (value === true || value === 'true' || value === 1 || value === '1') ? 'Active' : 'Inactive';
                    td.style.color = (value === true || value === 'true' || value === 1 || value === '1') ? 'green' : 'red';
                }
                 else if (typeof value === 'boolean') {
                    td.textContent = value ? 'Yes' : 'No';
                } else {
                    td.textContent = value !== undefined && value !== null ? value : 'N/A';
                }
                tr.appendChild(td);
            });

            if (typeof onEdit === 'function' || typeof onDelete === 'function') {
                const tdActions = document.createElement('td');
                tdActions.className = 'action-buttons';
                if (typeof onEdit === 'function') {
                    const editButton = document.createElement('button');
                    editButton.textContent = 'Edit';
                    editButton.className = 'edit-btn';
                    editButton.onclick = () => onEdit(item);
                    tdActions.appendChild(editButton);
                }
                if (typeof onDelete === 'function') {
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.className = 'delete-btn';
                    deleteButton.onclick = () => onDelete(item.id || item._id); // MongoDB _id সাপোর্ট
                    tdActions.appendChild(deleteButton);
                }
                tr.appendChild(tdActions);
            }
            tableBody.appendChild(tr);
        });

    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="${columnConfig.length + 1}" style="text-align:center; color:red;">ডেটা লোড করতে সমস্যা হয়েছে: ${error}</td></tr>`;
        console.error("Error rendering table:", error);
    }
}

/**
 * ফর্ম থেকে ডেটা সংগ্রহ করে অবজেক্ট হিসেবে রিটার্ন করে
 * @param {HTMLFormElement} formElement - যে ফর্ম থেকে ডেটা সংগ্রহ করা হবে
 * @returns {object} - ফর্মের ডেটা
 */
function getFormData(formElement) {
    const formData = new FormData(formElement);
    const data = {};
    for (const [key, value] of formData.entries()) {
        // is_active বা isActive কে boolean হিসেবে কনভার্ট করা
        if (key === 'is_active' || key === 'isActive') {
            data[key] = (value === 'true' || value === 'active');
        } else if (formElement.querySelector(`[name="${key}"]`) && formElement.querySelector(`[name="${key}"]`).type === 'number') {
            data[key] = parseFloat(value);
        }
         else {
            data[key] = value;
        }
    }
    return data;
}

/**
 * একটি মেসেজ দেখানোর জন্য (ফর্ম বা অন্যান্য ক্ষেত্রে)
 * @param {HTMLElement} element - যে DOM এলিমেন্টে মেসেজ দেখানো হবে
 * @param {string} message - মেসেজ টেক্সট
 * @param {string} type - 'success' or 'error'
 */
function showFormMessage(element, message, type = 'success') {
    if(!element) return;
    element.textContent = message;
    element.className = `form-message ${type}`; // CSS এ .success ও .error ক্লাস ডিফাইন করতে হবে
    setTimeout(() => {
        element.textContent = '';
        element.className = 'form-message';
    }, 5000); // ৫ সেকেন্ড পর মেসেজ মুছে যাবে
}

// Helper to get current section from hash
function getCurrentAdminSection() {
    return window.location.hash.substring(1); // # চিহ্ন বাদ দিয়ে
}

// এই ফাইলটি লোড হওয়ার সাথে সাথে প্রয়োজনীয় গ্লোবাল ভ্যারিয়েবল বা ফাংশন এখানে রাখা যায়
console.log("common.js loaded");

// (উদাহরণ) CSS এ যোগ করুন:
// .form-message.success { color: green; border: 1px solid green; padding: 5px; margin-top: 5px; }
// .form-message.error { color: red; border: 1px solid red; padding: 5px; margin-top: 5px; }