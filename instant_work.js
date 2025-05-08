// admin_panel/js/instant_work.js

window.displayInstantWorkList = async function(containerElement) {
    if (!containerElement) return;
    containerElement.innerHTML = '<h2>Instant Work (BD) <span class="loading-dots">...</span></h2>';

    const columnConfig = [
        { key: 'id', header: 'ID' },
        { key: 'logo_url', header: 'লোগো' },
        { key: 'title', header: 'টাইটেল' },
        // { key: 'full_info', header: 'সংক্ষিপ্ত তথ্য' } // সংক্ষিপ্ত তথ্য দেখানো কঠিন হতে পারে
    ];

    try {
        await renderTable( // common.js থেকে
            containerElement,
            '/instant-works-bd', // আপনার API এন্ডপয়েন্ট
            columnConfig,
            (item) => displayInstantWorkForm(containerElement, item.id || item._id), // Edit
            async (itemId) => { // Delete
                 if (confirm(`এই Instant Work পোস্টটি (ID: ${itemId}) ডিলিট করতে চান?`)) {
                    try {
                        await apiRequest(`/instant-works-bd/${itemId}`, 'DELETE');
                        showFormMessage(containerElement.querySelector('.table-message') || createGlobalMessageArea(containerElement), 'সফলভাবে ডিলিট করা হয়েছে।', 'success');
                        displayInstantWorkList(containerElement);
                    } catch (error) {
                        showFormMessage(containerElement.querySelector('.table-message') || createGlobalMessageArea(containerElement), `ডিলিট করতে সমস্যা: ${error.message || error}`, 'error');
                    }
                }
            },
            () => displayInstantWorkForm(containerElement, null) // Add New
        );
        if(containerElement.querySelector('.table-title')) containerElement.querySelector('.table-title').textContent = 'Instant Work (BD)';
    } catch (error) {
        containerElement.innerHTML = `<p style="color:red;">Instant Work তালিকা লোড করতে সমস্যা: ${error.message || error}</p>`;
    }
};

window.displayInstantWorkForm = async function(containerElement, itemId = null) {
    if (!containerElement) return;
    const formTemplate = document.getElementById('articleFormTemplate'); // আর্টিকেল ফর্ম টেমপ্লেট ব্যবহার
    if (!formTemplate) {
        containerElement.innerHTML = '<p style="color:red;">Error: Article Form Template খুঁজে পাওয়া যায়নি।</p>';
        return;
    }
    containerElement.innerHTML = `<h2>${itemId ? 'Instant Work এডিট' : 'নতুন Instant Work'}</h2>`;
    const formClone = formTemplate.content.cloneNode(true);
    const formElement = formClone.querySelector('form.data-form');
    const formTitleElement = formClone.querySelector('.form-title');
    const messageElement = formClone.querySelector('.form-message');

    if(formTitleElement) formTitleElement.textContent = itemId ? 'Instant Work (BD) পোস্ট এডিট করুন' : 'নতুন Instant Work (BD) পোস্ট যোগ করুন';

    if (itemId) {
        try {
            const itemData = await apiRequest(`/instant-works-bd/${itemId}`);
            formElement.id.value = itemData.id || itemData._id;
            formElement.title.value = itemData.title || '';
            formElement.logo_url.value = itemData.logo_url || '';
            formElement.full_info.value = itemData.full_info || '';
        } catch (error) {
            showFormMessage(messageElement, `তথ্য লোড করতে সমস্যা: ${error.message || error}`, 'error');
        }
    } else {
        if(formElement.id) formElement.id.value = '';
    }

    formElement.addEventListener('submit', async function(event) {
        event.preventDefault();
        const formData = getFormData(this);
        const currentItemId = formData.id;
        // delete formData.id;

        try {
            let response;
            if (currentItemId) {
                response = await apiRequest(`/instant-works-bd/${currentItemId}`, 'PUT', formData);
            } else {
                response = await apiRequest('/instant-works-bd', 'POST', formData);
            }
            showFormMessage(messageElement, response.message || 'সফলভাবে সেভ করা হয়েছে!', 'success');
            setTimeout(() => {
                const listNavItem = document.querySelector('.nav-item[data-section="instant-work-bd-list"]');
                if (listNavItem) listNavItem.click();
            }, 1500);
        } catch (error) {
            showFormMessage(messageElement, `সেভ করতে সমস্যা: ${error.message || error}`, 'error');
        }
    });
    containerElement.appendChild(formClone);
};
console.log("instant_work.js loaded.");