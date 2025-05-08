// admin_panel/js/articles.js (How to Work Article এর জন্য)

window.displayArticlesList = async function(containerElement) {
    if (!containerElement) return;
    containerElement.innerHTML = '<h2>How to Work Articles <span class="loading-dots">...</span></h2>';

    const columnConfig = [
        { key: 'id', header: 'ID' },
        { key: 'logo_url', header: 'লোগো' },
        { key: 'title', header: 'টাইটেল' },
    ];

    try {
        await renderTable( // common.js থেকে
            containerElement,
            '/how-to-work-articles', // আপনার API এন্ডপয়েন্ট
            columnConfig,
            (item) => displayArticleForm(containerElement, item.id || item._id), // Edit
            async (itemId) => { // Delete
                if (confirm(`এই আর্টিকেলটি (ID: ${itemId}) ডিলিট করতে চান?`)) {
                    try {
                        await apiRequest(`/how-to-work-articles/${itemId}`, 'DELETE');
                        showFormMessage(containerElement.querySelector('.table-message') || createGlobalMessageArea(containerElement), 'সফলভাবে ডিলিট করা হয়েছে।', 'success');
                        displayArticlesList(containerElement);
                    } catch (error) {
                        showFormMessage(containerElement.querySelector('.table-message') || createGlobalMessageArea(containerElement), `ডিলিট করতে সমস্যা: ${error.message || error}`, 'error');
                    }
                }
            },
            () => displayArticleForm(containerElement, null) // Add New
        );
        if(containerElement.querySelector('.table-title')) containerElement.querySelector('.table-title').textContent = 'How to Work Articles';
    } catch (error) {
        containerElement.innerHTML = `<p style="color:red;">আর্টিকেল তালিকা লোড করতে সমস্যা: ${error.message || error}</p>`;
    }
};

window.displayArticleForm = async function(containerElement, itemId = null) {
    if (!containerElement) return;
    const formTemplate = document.getElementById('articleFormTemplate'); // আর্টিকেল ফর্ম টেমপ্লেট ব্যবহার
    if (!formTemplate) {
        containerElement.innerHTML = '<p style="color:red;">Error: Article Form Template খুঁজে পাওয়া যায়নি।</p>';
        return;
    }
    containerElement.innerHTML = `<h2>${itemId ? 'আর্টিকেল এডিট' : 'নতুন আর্টিকেল'}</h2>`;
    const formClone = formTemplate.content.cloneNode(true);
    const formElement = formClone.querySelector('form.data-form');
    const formTitleElement = formClone.querySelector('.form-title');
    const messageElement = formClone.querySelector('.form-message');

    if(formTitleElement) formTitleElement.textContent = itemId ? 'আর্টিকেল এডিট করুন' : 'নতুন আর্টিকেল যোগ করুন';

    if (itemId) {
        try {
            const itemData = await apiRequest(`/how-to-work-articles/${itemId}`);
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
                response = await apiRequest(`/how-to-work-articles/${currentItemId}`, 'PUT', formData);
            } else {
                response = await apiRequest('/how-to-work-articles', 'POST', formData);
            }
            showFormMessage(messageElement, response.message || 'সফলভাবে সেভ করা হয়েছে!', 'success');
            setTimeout(() => {
                const listNavItem = document.querySelector('.nav-item[data-section="how-to-work-list"]');
                if (listNavItem) listNavItem.click();
            }, 1500);
        } catch (error) {
            showFormMessage(messageElement, `সেভ করতে সমস্যা: ${error.message || error}`, 'error');
        }
    });
    containerElement.appendChild(formClone);
};
console.log("articles.js loaded.");