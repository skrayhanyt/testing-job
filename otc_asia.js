// admin_panel/js/otc_asia.js

window.displayOtcAsiaList = async function(containerElement) {
    if (!containerElement) return;
    containerElement.innerHTML = '<h2>OTC Asia Jobs <span class="loading-dots">...</span></h2>';

    const columnConfig = [
        { key: 'id', header: 'ID' },
        { key: 'logo_url', header: 'লোগো' },
        { key: 'title', header: 'টাইটেল' },
        { key: 'description', header: 'বর্ণনা' },
        { key: 'telegram_user', header: 'টেলিগ্রাম' },
        { key: 'status', header: 'স্ট্যাটাস' }
    ];

    try {
        await renderTable( // common.js থেকে
            containerElement,
            '/otc-asia-jobs', // আপনার API এন্ডপয়েন্ট
            columnConfig,
            (item) => displayOtcAsiaForm(containerElement, item.id || item._id), // Edit
            async (itemId) => { // Delete
                if (confirm(`এই OTC Asia জবটি (ID: ${itemId}) ডিলিট করতে চান?`)) {
                    try {
                        await apiRequest(`/otc-asia-jobs/${itemId}`, 'DELETE');
                        showFormMessage(containerElement.querySelector('.table-message') || createGlobalMessageArea(containerElement), 'সফলভাবে ডিলিট করা হয়েছে।', 'success');
                        displayOtcAsiaList(containerElement); // তালিকা রিফ্রেশ
                    } catch (error) {
                        showFormMessage(containerElement.querySelector('.table-message') || createGlobalMessageArea(containerElement), `ডিলিট করতে সমস্যা: ${error.message || error}`, 'error');
                    }
                }
            },
            () => displayOtcAsiaForm(containerElement, null) // Add New
        );
        if(containerElement.querySelector('.table-title')) containerElement.querySelector('.table-title').textContent = 'OTC Asia Jobs';

    } catch (error) {
        containerElement.innerHTML = `<p style="color:red;">OTC Asia জবের তালিকা লোড করতে সমস্যা: ${error.message || error}</p>`;
    }
};

window.displayOtcAsiaForm = async function(containerElement, itemId = null) {
    if (!containerElement) return;
    const formTemplate = document.getElementById('genericJobFormTemplate'); // সাধারণ জব ফর্ম টেমপ্লেট ব্যবহার করা হচ্ছে
    if (!formTemplate) {
        containerElement.innerHTML = '<p style="color:red;">Error: Job Form Template খুঁজে পাওয়া যায়নি।</p>';
        return;
    }

    containerElement.innerHTML = `<h2>${itemId ? 'OTC Asia জব এডিট' : 'নতুন OTC Asia জব'}</h2>`;
    const formClone = formTemplate.content.cloneNode(true);
    const formElement = formClone.querySelector('form.data-form');
    const formTitleElement = formClone.querySelector('.form-title');
    const messageElement = formClone.querySelector('.form-message');

    if (formTitleElement) formTitleElement.textContent = itemId ? 'OTC Asia জব এডিট করুন' : 'নতুন OTC Asia জব যোগ করুন';

    // এই সেকশনের জন্য অপ্রয়োজনীয় ফিল্ডগুলো হাইড করা (genericJobFormTemplate অনুযায়ী)
    if(formClone.querySelector('[data-field="country"]')) formClone.querySelector('[data-field="country"]').style.display = 'none';
    // যদি 'telegram_user' দরকার হয়, তাহলে দেখান, নাহলে হাইড করুন
    if(formClone.querySelector('[data-field="telegram_user"]')) formClone.querySelector('[data-field="telegram_user"]').style.display = 'block';


    if (itemId) {
        try {
            const itemData = await apiRequest(`/otc-asia-jobs/${itemId}`);
            formElement.id.value = itemData.id || itemData._id; // hidden input name="id"
            formElement.title.value = itemData.title || '';
            formElement.description.value = itemData.description || '';
            formElement.logo_url.value = itemData.logo_url || '';
            formElement.telegram_user.value = itemData.telegram_user || '';
            if (formElement.status) formElement.status.value = itemData.status || (itemData.is_active ? 'active' : 'inactive');
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
        // delete formData.id; // API যদি বডিতে id না চায়

        try {
            let response;
            if (currentItemId) {
                response = await apiRequest(`/otc-asia-jobs/${currentItemId}`, 'PUT', formData);
            } else {
                response = await apiRequest('/otc-asia-jobs', 'POST', formData);
            }
            showFormMessage(messageElement, response.message || 'সফলভাবে সেভ করা হয়েছে!', 'success');
            setTimeout(() => {
                const listNavItem = document.querySelector('.nav-item[data-section="otc-asia-list"]');
                if (listNavItem) listNavItem.click();
            }, 1500);
        } catch (error) {
            showFormMessage(messageElement, `সেভ করতে সমস্যা: ${error.message || error}`, 'error');
        }
    });
    containerElement.appendChild(formClone);
};

console.log("otc_asia.js loaded.");