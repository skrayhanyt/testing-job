// admin_panel/js/active_work.js

window.displayActiveWorkList = async function(containerElement) {
    if (!containerElement) return;
    containerElement.innerHTML = '<h2>Active Work <span class="loading-dots">...</span></h2>';

    const columnConfig = [
        { key: 'id', header: 'ID' },
        { key: 'name', header: 'কাজের নাম' },
        { key: 'country', header: 'দেশ' },
        { key: 'is_active', header: 'স্ট্যাটাস' } // API থেকে বুলিয়ান (true/false) আসবে
    ];

    try {
        await renderTable( // common.js থেকে
            containerElement,
            '/active-works', // আপনার API এন্ডপয়েন্ট
            columnConfig,
            (item) => displayActiveWorkForm(containerElement, item.id || item._id), // Edit
            async (itemId) => { // Delete
                if (confirm(`এই Active Work (ID: ${itemId}) ডিলিট করতে চান?`)) {
                    try {
                        await apiRequest(`/active-works/${itemId}`, 'DELETE');
                         showFormMessage(containerElement.querySelector('.table-message') || createGlobalMessageArea(containerElement), 'সফলভাবে ডিলিট করা হয়েছে।', 'success');
                        displayActiveWorkList(containerElement); // তালিকা রিফ্রেশ
                    } catch (error) {
                        showFormMessage(containerElement.querySelector('.table-message') || createGlobalMessageArea(containerElement), `ডিলিট করতে সমস্যা: ${error.message || error}`, 'error');
                    }
                }
            },
            () => displayActiveWorkForm(containerElement, null) // Add New
        );
        if(containerElement.querySelector('.table-title')) containerElement.querySelector('.table-title').textContent = 'Active Work';
    } catch (error) {
        containerElement.innerHTML = `<p style="color:red;">Active Work তালিকা লোড করতে সমস্যা: ${error.message || error}</p>`;
    }
};

window.displayActiveWorkForm = async function(containerElement, itemId = null) {
    if (!containerElement) return;
    const formTemplate = document.getElementById('genericJobFormTemplate'); // সাধারণ জব ফর্ম টেমপ্লেট ব্যবহার
    if (!formTemplate) {
        containerElement.innerHTML = '<p style="color:red;">Error: Job Form Template খুঁজে পাওয়া যায়নি।</p>';
        return;
    }
    containerElement.innerHTML = `<h2>${itemId ? 'Active Work এডিট' : 'নতুন Active Work'}</h2>`;
    const formClone = formTemplate.content.cloneNode(true);
    const formElement = formClone.querySelector('form.data-form');
    const formTitleElement = formClone.querySelector('.form-title');
    const messageElement = formClone.querySelector('.form-message');

    if(formTitleElement) formTitleElement.textContent = itemId ? 'Active Work এডিট করুন' : 'নতুন Active Work যোগ করুন';

    // এই সেকশনের জন্য ফিল্ডগুলো অ্যাডজাস্ট করা
    if(formClone.querySelector('[data-field="description"]')) formClone.querySelector('[data-field="description"]').style.display = 'none'; // বিবরণী হাইড
    if(formClone.querySelector('[data-field="logo_url"]')) formClone.querySelector('[data-field="logo_url"]').style.display = 'none'; // লোগো হাইড
    if(formClone.querySelector('[data-field="telegram_user"]')) formClone.querySelector('[data-field="telegram_user"]').style.display = 'none'; // টেলিগ্রাম হাইড
    if(formClone.querySelector('[data-field="country"]')) formClone.querySelector('[data-field="country"]').style.display = 'block'; // দেশ দেখান
    
    // স্ট্যাটাস ফিল্ড 'is_active' (বুলিয়ান) হিসেবে হ্যান্ডেল করতে হবে
    const statusSelect = formClone.querySelector('[name="status"]'); // genericJobFormTemplate এ name="status"
    if (statusSelect) {
        statusSelect.name = "is_active"; // API যদি 'is_active' আশা করে
        // অপশনের ভ্যালু true/false করা যেতে পারে
        statusSelect.options[0].value = "true"; // Active
        statusSelect.options[1].value = "false"; // Inactive
    }
    // টাইটেল ফিল্ডের লেবেল পরিবর্তন
    const titleLabel = formClone.querySelector('label[for="formTitle"]');
    if (titleLabel) titleLabel.textContent = "কাজের নাম:";


    if (itemId) {
        try {
            const itemData = await apiRequest(`/active-works/${itemId}`);
            formElement.id.value = itemData.id || itemData._id;
            formElement.title.value = itemData.name || ''; // API 'name' ফিল্ড পাঠালে
            formElement.country.value = itemData.country || '';
            if (formElement.is_active) formElement.is_active.value = String(itemData.is_active); // 'true' or 'false' string
        } catch (error) {
             showFormMessage(messageElement, `তথ্য লোড করতে সমস্যা: ${error.message || error}`, 'error');
        }
    } else {
        if(formElement.id) formElement.id.value = '';
    }

    formElement.addEventListener('submit', async function(event) {
        event.preventDefault();
        const formData = getFormData(this); // এখানে is_active স্ট্রিং "true" বা "false" হিসেবে আসবে
        formData.is_active = (formData.is_active === 'true'); // বুলিয়ানে কনভার্ট করা
        
        // API যদি 'name' ফিল্ড আশা করে, 'title' এর পরিবর্তে
        if (formData.title !== undefined && !formData.name) {
            formData.name = formData.title;
            delete formData.title;
        }

        const currentItemId = formData.id;
        // delete formData.id;

        try {
            let response;
            if (currentItemId) {
                response = await apiRequest(`/active-works/${currentItemId}`, 'PUT', formData);
            } else {
                response = await apiRequest('/active-works', 'POST', formData);
            }
            showFormMessage(messageElement, response.message || 'সফলভাবে সেভ করা হয়েছে!', 'success');
            setTimeout(() => {
                const listNavItem = document.querySelector('.nav-item[data-section="active-work-list"]');
                if (listNavItem) listNavItem.click();
            }, 1500);
        } catch (error) {
            showFormMessage(messageElement, `সেভ করতে সমস্যা: ${error.message || error}`, 'error');
        }
    });
    containerElement.appendChild(formClone);
};
console.log("active_work.js loaded.");