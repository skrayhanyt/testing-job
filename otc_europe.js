// admin_panel/js/otc_europe.js

/**
 * OTC Europe জবের তালিকা দেখানোর ফাংশন
 * @param {HTMLElement} containerElement - যে DOM এলিমেন্টে কন্টেন্ট লোড হবে (সাধারণত adminContentArea)
 */
window.displayOtcEuropeList = async function(containerElement) {
    if (!containerElement) {
        console.error("OTC Europe List: Container element not provided.");
        return;
    }
    containerElement.innerHTML = '<h2>OTC Europe Jobs <span class="loading-dots">...</span></h2>'; // লোডিং ইন্ডিকেটর

    const columnConfig = [
        // API থেকে আসা ফিল্ডের 'key' এবং টেবিলের হেডারে যা দেখাবে 'header'
        { key: 'id', header: 'ID' }, // অথবা '_id' যদি MongoDB ব্যবহার করেন
        { key: 'logo_url', header: 'লোগো' },
        { key: 'title', header: 'টাইটেল' },
        { key: 'description', header: 'সংক্ষিপ্ত বর্ণনা' }, // API থেকে সংক্ষিপ্ত বর্ণনা বা সম্পূর্ণ বর্ণনা থেকে কিছু অংশ
        { key: 'telegram_user', header: 'টেলিগ্রাম' },
        { key: 'status', header: 'স্ট্যাটাস' } // API তে 'status' (active/inactive) অথবা 'is_active' (boolean) থাকতে পারে
    ];

    try {
        // common.js এর renderTable ফাংশন ব্যবহার করা হচ্ছে
        await renderTable(
            containerElement,
            '/otc-europe-jobs', // আপনার API এন্ডপয়েন্ট (GET)
            columnConfig,
            (job) => { // Edit বাটন ক্লিক করলে এই ফাংশন কল হবে
                window.displayOtcEuropeForm(containerElement, job.id || job._id);
            },
            async (jobId) => { // Delete বাটন ক্লিক করলে এই ফাংশন কল হবে
                if (confirm(`আপনি কি নিশ্চিত যে আপনি জব আইডি "${jobId}" ডিলিট করতে চান?`)) {
                    try {
                        await apiRequest(`/otc-europe-jobs/${jobId}`, 'DELETE');
                        // ডিলিট সফল হলে একটি মেসেজ দেখান এবং তালিকা রিফ্রেশ করুন
                        // একটি গ্লোবাল মেসেজ এরিয়া ব্যবহার করা ভালো অথবা containerElement এর শুরুতে একটি div তৈরি করা
                        const globalMessageArea = document.getElementById('globalAdminMessage') || createGlobalMessageArea(containerElement);
                        showFormMessage(globalMessageArea, 'জব সফলভাবে ডিলিট করা হয়েছে।', 'success');
                        displayOtcEuropeList(containerElement); // তালিকা রিফ্রেশ
                    } catch (error) {
                        const globalMessageArea = document.getElementById('globalAdminMessage') || createGlobalMessageArea(containerElement);
                        showFormMessage(globalMessageArea, `জব ডিলিট করতে সমস্যা হয়েছে: ${error.message || error}`, 'error');
                    }
                }
            },
            () => { // "Add New" বাটন ক্লিক করলে এই ফাংশন কল হবে
                window.displayOtcEuropeForm(containerElement, null); // null আইডি মানে নতুন জব
            }
        );
    } catch (error) {
        containerElement.innerHTML = `<p style="color:red;">OTC Europe জবের তালিকা লোড করতে সমস্যা হয়েছে: ${error.message || error}</p>`;
    }
};

/**
 * OTC Europe জবের জন্য ফর্ম দেখানো/তৈরি করার ফাংশন
 * @param {HTMLElement} containerElement - যে DOM এলিমেন্টে ফর্ম লোড হবে
 * @param {string|null} jobId - যদি জব এডিট করা হয়, তাহলে জবের আইডি, নাহলে null
 */
window.displayOtcEuropeForm = async function(containerElement, jobId = null) {
    if (!containerElement) {
        console.error("OTC Europe Form: Container element not provided.");
        return;
    }

    const formTemplate = document.getElementById('otcJobFormTemplate');
    if (!formTemplate) {
        containerElement.innerHTML = '<p style="color:red;">Error: OTC Job ফর্ম টেমপ্লেট (<template id="otcJobFormTemplate">) খুঁজে পাওয়া যায়নি।</p>';
        return;
    }

    containerElement.innerHTML = `<h2>${jobId ? 'OTC Europe জব এডিট করুন' : 'নতুন OTC Europe জব যোগ করুন'} <span class="loading-dots">...</span></h2>`;
    const formClone = formTemplate.content.cloneNode(true);
    const formElement = formClone.querySelector('form'); // টেমপ্লেটের ভেতরের form ট্যাগ
    const formMessageElement = formClone.querySelector('.form-message'); // টেমপ্লেটের ভেতরের মেসেজ দেখানোর p ট্যাগ

    if (!formElement) {
         containerElement.innerHTML = '<p style="color:red;">Error: ফর্ম টেমপ্লেটে <form> ট্যাগ খুঁজে পাওয়া যায়নি।</p>';
         return;
    }
     if (!formMessageElement) {
        console.warn("Form message element (.form-message) not found in template. Creating one.");
        const tempMsgP = document.createElement('p');
        tempMsgP.className = 'form-message';
        formElement.appendChild(tempMsgP); // ফর্মের শেষে যোগ করা হলো
        // messageElement = tempMsgP; // এটি কাজ করবে না কারণ formMessageElement const
    }


    if (jobId) {
        // এডিট মোড: API থেকে জবের ডেটা আনুন এবং ফর্মে বসান
        try {
            const jobData = await apiRequest(`/otc-europe-jobs/${jobId}`); // GET রিকোয়েস্ট
            // ফর্মের প্রতিটি ইনপুট ফিল্ডে ডেটা বসান (name অ্যাট্রিবিউট অনুযায়ী)
            formElement.jobId.value = jobData.id || jobData._id; // একটি hidden input field <input type="hidden" name="jobId"> লাগবে
            formElement.title.value = jobData.title || '';
            formElement.description.value = jobData.description || '';
            formElement.logo_url.value = jobData.logo_url || '';
            formElement.telegram_user.value = jobData.telegram_user || '';
            // স্ট্যাটাস ফিল্ড (select dropdown)
            if (formElement.status) formElement.status.value = jobData.status || (jobData.is_active ? 'active' : 'inactive');

        } catch (error) {
            showFormMessage(formElement.querySelector('.form-message') || containerElement, `জবের তথ্য লোড করতে সমস্যা: ${error.message || error}`, 'error');
            // ফর্মের বাকি অংশ লোড না করে ফিরে যান বা একটি এরর মেসেজ দেখান
            // return;
        }
    } else {
        // নতুন জব মোড: jobId ফিল্ড খালি থাকবে বা থাকবে না
        if(formElement.jobId) formElement.jobId.value = '';
    }

    formElement.addEventListener('submit', async function(event) {
        event.preventDefault();
        const formData = getFormData(this); // common.js থেকে
        const currentJobId = formData.jobId; // hidden field থেকে আইডি পান
        delete formData.jobId; // API তে পাঠানোর আগে এটি মুছে ফেলা যেতে পারে যদি API বডিতে আইডি না চায়

        // ফাইল আপলোডের জন্য বিশেষ হ্যান্ডলিং প্রয়োজন (FormData ব্যবহার করতে হবে, JSON নয়)
        // এই উদাহরণে আমরা ধরে নিচ্ছি লোগো একটি URL হিসেবে দেওয়া হচ্ছে
        // যদি ফাইল আপলোড করতে চান, common.js এর apiRequest এবং এই অংশ পরিবর্তন করতে হবে

        try {
            let response;
            if (currentJobId) {
                // আপডেট (PUT রিকোয়েস্ট)
                response = await apiRequest(`/otc-europe-jobs/${currentJobId}`, 'PUT', formData);
            } else {
                // নতুন তৈরি (POST রিকোয়েস্ট)
                response = await apiRequest('/otc-europe-jobs', 'POST', formData);
            }
            showFormMessage(formElement.querySelector('.form-message'), response.message || 'তথ্য সফলভাবে সেভ করা হয়েছে!', 'success');

            // সফলভাবে সেভ হলে, দুই সেকেন্ড পর তালিকা পেজে ফেরত যান
            setTimeout(() => {
                const listNavItem = document.querySelector('.nav-item[data-section="otc-europe-list"]');
                if (listNavItem) listNavItem.click(); // তালিকা পেজে নেভিগেট করা
            }, 2000);

        } catch (error) {
            showFormMessage(formElement.querySelector('.form-message'), `তথ্য সেভ করতে সমস্যা: ${error.message || error}`, 'error');
        }
    });

    // containerElement এ ফর্ম যোগ করার আগে লোডিং মেসেজ মুছে ফেলুন
    containerElement.innerHTML = `<h2>${jobId ? 'OTC Europe জব এডিট করুন' : 'নতুন OTC Europe জব যোগ করুন'}</h2>`;
    containerElement.appendChild(formClone);
};

// একটি helper ফাংশন যা গ্লোবাল মেসেজ দেখানোর জন্য একটি div তৈরি করবে যদি না থাকে
function createGlobalMessageArea(parentElement) {
    let msgArea = document.getElementById('globalAdminMessage');
    if (!msgArea) {
        msgArea = document.createElement('div');
        msgArea.id = 'globalAdminMessage';
        msgArea.style.padding = '10px';
        msgArea.style.marginTop = '10px';
        msgArea.style.border = '1px solid transparent';
        // parentElement এর শুরুতে বা একটি নির্দিষ্ট স্থানে যোগ করুন
        if (parentElement.firstChild) {
            parentElement.insertBefore(msgArea, parentElement.firstChild);
        } else {
            parentElement.appendChild(msgArea);
        }
    }
    return msgArea;
}

// এই ফাইলটি লোড হলে একটি মেসেজ দেখাবে (ডেভেলপমেন্টের জন্য)
console.log("otc_europe.js loaded and ready.");