// --- START OF YOUR EXISTING script.js ---
document.addEventListener('DOMContentLoaded', () => {
    // --- Existing variables and functions START ---
    const navLinks = document.querySelectorAll('.nav-link');
    const pageSections = document.querySelectorAll('.page-section');
    const telegramBaseUrl = 'https://t.me/'; // আপনার টেলিগ্রাম ইউজারনেম বা গ্রুপ আইডি এখানে দিন
    const API_BASE_URL = 'https://your-NON-EXISTENT-api-domain.com/api/v1'; // Placeholder API URL
    const sampleData = { /* ... আপনার sampleData অবজেক্ট ... */
        otcEurope: [ { id: 1, logo: 'images/logo1.png', description: 'Europe Job 1: Short description about the work. Quick and easy task.', telegramUser: 'your_telegram_user' }, { id: 2, logo: 'images/logo2.png', description: 'Europe Job 2: Another opportunity in Europe. Apply now!', telegramUser: 'your_telegram_user' } ],
        otcAsia: [ { id: 1, logo: 'images/logo1.png', description: 'Asia Job 1: Exciting work in the Asian market. Details inside.', telegramUser: 'your_telegram_user' }, { id: 2, logo: 'images/logo2.png', description: 'Asia Job 2: Grow your skills with this Asian project.', telegramUser: 'your_telegram_user' } ],
        activeWork: [ { id: 1, name: 'Data Entry Project', country: 'Germany', isActive: true }, { id: 2, name: 'Translation Task', country: 'France', isActive: false }, { id: 3, name: 'Content Writing', country: 'UK', isActive: true } ],
        instantWorkBD: [ { id: 1, title: 'সহজ কাজ - প্রতিদিন পেমেন্ট (BD)', logo: 'images/logo1.png', fullInfo: 'এই কাজটি খুবই সহজ। আপনাকে প্রতিদিন কিছু ডাটা এন্ট্রি করতে হবে। বিস্তারিত জানতে যোগাযোগ করুন। পেমেন্ট বিকাশে দেওয়া হবে।' }, { id: 2, title: 'বাংলা কনটেন্ট লিখুন (BD)', logo: 'images/logo2.png', fullInfo: 'আমাদের কিছু বাংলা কনটেন্ট প্রয়োজন। প্রতিটি আর্টিকেলের জন্য ভাল পেমেন্ট করা হবে। নমুনাসহ আবেদন করুন।' } ],
        howToWork: [ { id: 1, title: 'কিভাবে আমাদের সাইটে কাজ করবেন?', logo: 'images/logo1.png', fullInfo: 'আমাদের সাইটে কাজ করার জন্য প্রথমে রেজিস্ট্রেশন করতে হবে (যদি থাকে)। এরপর আপনার পছন্দের ক্যাটাগরি থেকে কাজ বেছে নিন। প্রতিটি কাজের বিবরণে নির্দেশাবলী দেওয়া থাকবে। \n\nকোনো সমস্যা হলে আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।' }, { id: 2, title: 'পেমেন্ট পাওয়ার পদ্ধতি', logo: 'images/logo2.png', fullInfo: 'আমরা সাধারণত বিকাশ, নগদ, এবং ব্যাংক ট্রান্সফারের মাধ্যমে পেমেন্ট করে থাকি। কাজের ধরন অনুযায়ী পেমেন্টের সময়সীমা ভিন্ন হতে পারে। বিস্তারিত জানতে কাজের বিবরণে দেখুন।' } ]
    };
    const modal = document.getElementById('infoModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const closeButton = document.querySelector('.close-button');

    function openModal(title, description, imageUrl = null) { /* ... openModal ফাংশন ... */
        modalTitle.textContent = title;
        modalDescription.textContent = description;
        modalDescription.style.whiteSpace = 'pre-wrap';
        if (imageUrl && imageUrl !== 'null' && imageUrl !== '' && !imageUrl.endsWith('default-logo.png')) {
            modalImage.src = imageUrl;
            modalImage.style.display = 'block';
        } else {
            modalImage.style.display = 'none';
        }
        modal.style.display = 'block';
    }

    if(closeButton) { closeButton.onclick = () => modal.style.display = 'none'; }
    window.onclick = (event) => { if (event.target == modal) modal.style.display = 'none'; };

    async function fetchData(categoryKey, apiEndpoint, queryParams = {}) { /* ... fetchData ফাংশন ... */
        let dataFromApi = [];
        let usingApi = false;
        const isPlaceholderApiUrl = API_BASE_URL === 'https://your-NON-EXISTENT-api-domain.com/api/v1';
        if (API_BASE_URL && !isPlaceholderApiUrl) {
            try {
                const url = new URL(`${API_BASE_URL}${apiEndpoint}`);
                Object.keys(queryParams).forEach(key => url.searchParams.append(key, queryParams[key]));
                const response = await fetch(url.toString(), { signal: AbortSignal.timeout(5000) });
                if (response.ok) {
                    const jsonData = await response.json();
                    dataFromApi = Array.isArray(jsonData) ? jsonData : (jsonData.data || []);
                    if (dataFromApi.length > 0) { usingApi = true; console.log(`Fetched from API for ${categoryKey}`); }
                    else { console.warn(`API ok but empty for ${categoryKey}. Using sampleData.`); }
                } else { console.error(`API Error ${response.status} for ${apiEndpoint}. Using sampleData.`); }
            } catch (error) { console.error(`Fetch/parse error for ${apiEndpoint}:`, error, `. Using sampleData.`); }
        } else { console.log("Using sampleData for " + categoryKey); }
        if (usingApi) { return dataFromApi.map(item => ({ ...item })); }
        else if (sampleData[categoryKey]) {
            let fallbackData = JSON.parse(JSON.stringify(sampleData[categoryKey]));
            if (queryParams.limit) { return fallbackData.slice(0, parseInt(queryParams.limit)); }
            return fallbackData;
        } return [];
    }

    function setActivePage(targetId) {
        pageSections.forEach(section => {
            // Hero সেকশন (id="heroSection") হাইড/শো করা হবে না, তাই এটিকে বাদ দিন
            // .page-section class যুক্ত সেকশনগুলোকেই শুধু টার্গেট করা হচ্ছে
            section.classList.toggle('active-page', section.id === targetId);
        });
        navLinks.forEach(link => link.classList.toggle('active-link', link.dataset.target === targetId));

        const heroAnimSection = document.getElementById('heroSection');

        if (targetId === 'home') {
            // If navigating to home, ensure hero is visually prominent (e.g. scroll to top if needed)
            // window.scrollTo({ top: 0, behavior: 'smooth' }); // Scrolls to very top of page
             if (heroAnimSection) heroAnimSection.style.display = 'block'; // Ensure it's visible

            // URL hash update for home
            if (window.location.hash !== '' && window.location.hash !== '#') {
                 try { history.pushState("", document.title, window.location.pathname + window.location.search); } catch(e) {}
            }
        } else {
            // If navigating to other sections, hero might still be visible above.
            // If hero section was previously hidden for other views (not the case here), show it.
            // if (heroAnimSection) heroAnimSection.style.display = 'block'; // Or specific class

            // URL hash update for other pages
            if (window.location.hash !== `#${targetId}`) {
                window.location.hash = `#${targetId}`;
            }
        }
    }


    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.target.dataset.target;
            const targetSectionElement = document.getElementById(targetId);

            if (targetSectionElement) {
                 // Scroll to the target section. Header height is 70px (from body padding-top)
                 // The heroSection is 100vh and has a negative margin-top to fill space behind header.
                 // So, if target is 'home', we want to scroll to the #home section which is after hero.
                 let scrollToElement = targetSectionElement;

                 if (targetId === 'home') {
                    // If 'home' is clicked, we want to see the content section with id="home",
                    // which is located after the full-screen hero.
                    // The hero section itself (heroSection) should already be visible.
                    // So, we scroll to the actual #home (Latest Posts) section.
                 }
                 // For all other pages, we scroll to their respective sections.
                 // These sections are already positioned after the hero.

                // Calculate offset: hero section height + header height (if hero is not using negative margin)
                // Since hero uses negative margin, its effective top is 0.
                // So, just scroll to the target section's top, adjusted for fixed header.
                const headerHeight = document.querySelector('header')?.offsetHeight || 70;
                // window.scrollTo({ top: scrollToElement.offsetTop - headerHeight, behavior: 'smooth' });

                // A simpler way if sections are direct children of main and hero is separate:
                // Find the top of the target element relative to the document.
                // The body's padding-top already accounts for the header.
                // So, targetElement.offsetTop should be the correct scroll position.
                 if (targetId === 'home' && document.getElementById('home')) {
                    document.getElementById('home').scrollIntoView({ behavior: 'smooth', block: 'start' });
                 } else if (targetSectionElement) {
                    targetSectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                 }


                loadContentForPage(targetId); // Load content after deciding scroll target
            } else {
                // Fallback if targetId element doesn't exist, load content for home
                loadContentForPage('home');
                 if (document.getElementById('home')) {
                    document.getElementById('home').scrollIntoView({ behavior: 'smooth', block: 'start' });
                 }
            }
        });
    });

    // --- Content Loading Functions ---
    async function loadOtcEuropeJobs() { /* ... loadOtcEuropeJobs ফাংশন ... */
        const container = document.getElementById('otc-europe-jobs'); if (!container) return; container.innerHTML = '<p class="loading-message">Loading Europe jobs...</p>'; const jobs = await fetchData('otcEurope', '/otc-europe-jobs'); container.innerHTML = ''; if (!jobs || jobs.length === 0) { container.innerHTML = '<p>No jobs available in OTC Europe currently.</p>'; return; } jobs.forEach(job => { const jobCard = `<div class="job-card"><img src="${job.logo || 'images/default-logo.png'}" alt="Job Logo" class="logo"><p class="description">${job.description || 'No description.'}</p><div class="status-contact"><span class="active-icon">${job.status || (typeof job.isActive !== 'undefined' && !job.isActive ? 'Inactive' : 'Active')}</span><a href="${telegramBaseUrl}${job.telegramUser || 'your_default_telegram'}" target="_blank" class="contact-me-icon">Contact Me</a></div></div>`; container.innerHTML += jobCard; });
     }
    async function loadOtcAsiaJobs() { /* ... loadOtcAsiaJobs ফাংশন ... */
        const container = document.getElementById('otc-asia-jobs'); if (!container) return; container.innerHTML = '<p class="loading-message">Loading Asia jobs...</p>'; const jobs = await fetchData('otcAsia', '/otc-asia-jobs'); container.innerHTML = ''; if (!jobs || jobs.length === 0) { container.innerHTML = '<p>No jobs available in OTC Asia currently.</p>'; return; } jobs.forEach(job => { const jobCard = `<div class="job-card"><img src="${job.logo || 'images/default-logo.png'}" alt="Job Logo" class="logo"><p class="description">${job.description || 'No description.'}</p><div class="status-contact"><span class="active-icon">${job.status || (typeof job.isActive !== 'undefined' && !job.isActive ? 'Inactive' : 'Active')}</span><a href="${telegramBaseUrl}${job.telegramUser || 'your_default_telegram'}" target="_blank" class="contact-me-icon">Contact Me</a></div></div>`; container.innerHTML += jobCard; });
     }
    async function loadActiveWork() { /* ... loadActiveWork ফাংশন ... */
         const container = document.getElementById('active-work-list'); if (!container) return; container.innerHTML = '<p class="loading-message">Loading active work items...</p>'; const workItems = await fetchData('activeWork', '/active-works'); container.innerHTML = ''; if (!workItems || workItems.length === 0) { container.innerHTML = '<p>No active work items found.</p>'; return; } workItems.forEach(item => { const itemDiv = `<div class="active-work-item"><div><span class="job-name">${item.name || 'Unnamed Job'}</span> - <span class="country">${item.country || 'N/A'}</span></div><span class="status ${item.isActive ? 'active' : 'deactive'}">${item.isActive ? 'Active' : 'Deactivated'}</span></div>`; container.innerHTML += itemDiv; });
    }
    async function loadInstantWorkBD() { /* ... loadInstantWorkBD ফাংশন ... */
        const container = document.getElementById('instant-work-bd-list'); if (!container) return; container.innerHTML = '<p class="loading-message">Loading instant work...</p>'; const items = await fetchData('instantWorkBD', '/instant-works-bd'); container.innerHTML = ''; if (!items || items.length === 0) { container.innerHTML = '<p>No instant work available.</p>'; return; } items.forEach(item => { const articleCard = document.createElement('div'); articleCard.className = 'article-card'; articleCard.innerHTML = `<img src="${item.logo || 'images/default-logo.png'}" alt="Work Logo" class="logo"><h3 class="title">${item.title || 'Untitled Work'}</h3>`; articleCard.addEventListener('click', () => openModal(item.title, item.fullInfo, item.logo)); container.appendChild(articleCard); });
    }
    async function loadHowToWorkArticles() { /* ... loadHowToWorkArticles ফাংশন ... */
        const container = document.getElementById('how-to-work-articles'); if (!container) return; container.innerHTML = '<p class="loading-message">Loading articles...</p>'; const articles = await fetchData('howToWork', '/how-to-work-articles'); container.innerHTML = ''; if (!articles || articles.length === 0) { container.innerHTML = '<p>No articles found.</p>'; return; } articles.forEach(article => { const articleCard = document.createElement('div'); articleCard.className = 'article-card'; articleCard.innerHTML = `<img src="${article.logo || 'images/default-logo.png'}" alt="Article Logo" class="logo"><h3 class="title">${article.title || 'Untitled Article'}</h3>`; articleCard.addEventListener('click', () => openModal(article.title, article.fullInfo, article.logo)); container.appendChild(articleCard); });
    }
    async function loadHomePageContent() { /* ... loadHomePageContent ফাংশন ... */
         const container = document.querySelector('#home .latest-posts-grid'); if (!container) return; container.innerHTML = '<p class="loading-message">Loading latest posts...</p>'; let results = []; try { results = await Promise.all([ fetchData('otcEurope', '/otc-europe-jobs', { limit: 2 }), fetchData('otcAsia', '/otc-asia-jobs', { limit: 2 }), fetchData('activeWork', '/active-works', { limit: 2 }), fetchData('instantWorkBD', '/instant-works-bd', { limit: 1 }), fetchData('howToWork', '/how-to-work-articles', { limit: 1 }) ]); } catch (error) { console.error("Error fetching home page data:", error); container.innerHTML = '<p>Could not load posts.</p>'; return; } const [otcEuropeLatest, otcAsiaLatest, activeWorkLatest, instantWorkBDLatest, howToWorkLatest] = results.map(res => res || []); container.innerHTML = ''; function createLatestPostItem(item, categoryName, type = 'job', pageTargetId = null) { const itemDiv = document.createElement('div'); itemDiv.className = 'latest-post-item'; let displayTitle = item.title || item.name || 'Untitled'; let displayDescription = ''; if (categoryName === 'OTC EUROPE' || categoryName === 'OTC ASIA') { displayDescription = item.description ? item.description.substring(0, 70) + '...' : ''; } else if (categoryName === 'ACTIVE WORK') { displayDescription = item.country ? `Country: ${item.country}` : ''; if(!item.isActive && type === 'job') displayTitle += " (Inactive)"; } else if (type === 'article') { displayDescription = item.fullInfo ? item.fullInfo.substring(0, 70) + '...' : ''; } let displayLogo = item.logo || 'images/default-logo.png'; let displayFullInfo = item.fullInfo || 'No details.'; itemDiv.innerHTML = `<h4>${categoryName}</h4><p class="item-title">${displayTitle}</p>${displayDescription ? `<p class="item-desc">${displayDescription}</p>` : ''}`; if (type === 'article') { itemDiv.style.cursor = 'pointer'; itemDiv.addEventListener('click', () => openModal(displayTitle, displayFullInfo, displayLogo)); } else if (pageTargetId) { itemDiv.style.cursor = 'pointer'; itemDiv.addEventListener('click', () => { const targetElement = document.getElementById(pageTargetId); if(targetElement) targetElement.scrollIntoView({behavior: 'smooth', block: 'start'}); loadContentForPage(pageTargetId); }); } return itemDiv; } otcEuropeLatest.forEach(item => container.appendChild(createLatestPostItem(item, "OTC EUROPE", 'job', 'otc-europe'))); otcAsiaLatest.forEach(item => container.appendChild(createLatestPostItem(item, "OTC ASIA", 'job', 'otc-asia'))); activeWorkLatest.filter(item => item.isActive !== false).forEach(item => container.appendChild(createLatestPostItem(item, "ACTIVE WORK", 'job', 'active-work'))); instantWorkBDLatest.forEach(item => container.appendChild(createLatestPostItem(item, "INSTANT WORK (BD)", "article"))); howToWorkLatest.forEach(item => container.appendChild(createLatestPostItem(item, "HOW TO WORK ARTICLE", "article"))); if (container.innerHTML.trim() === '') { container.innerHTML = '<p>No recent posts.</p>'; }
    }

    function loadContentForPage(pageId) {
        // The hero section (id="heroSection") is always visible and not managed by this function for display toggle.
        // This function primarily activates the correct .page-section and loads its content.
        setActivePage(pageId);

        switch (pageId) {
            case 'home': loadHomePageContent(); break;
            case 'otc-europe': loadOtcEuropeJobs(); break;
            case 'otc-asia': loadOtcAsiaJobs(); break;
            case 'active-work': loadActiveWork(); break;
            case 'instant-work-bd': loadInstantWorkBD(); break;
            case 'how-to-work': loadHowToWorkArticles(); break;
            default:
                console.warn("Unknown pageId in loadContentForPage:", pageId, ". Defaulting to home.");
                setActivePage('home'); // Ensure 'home' nav link is active
                loadHomePageContent(); // Load content for the #home section
        }
    }

    function initializePage() {
        const hash = window.location.hash.substring(1);
        const validPages = Array.from(navLinks).map(link => link.dataset.target);
        let initialPage = 'home'; // Default to home

        if (hash && validPages.includes(hash)) {
            initialPage = hash;
        }
        
        // Load content for the determined initial page
        loadContentForPage(initialPage);

        // Scroll to the section if it's not home, or to #home section if it is home.
        // The hero (#heroSection) is always visible at the top.
        // We scroll to the content section *below* the hero.
        setTimeout(() => { // Timeout to allow content to potentially load and affect layout
            const targetSectionElement = document.getElementById(initialPage);
            if (targetSectionElement && targetSectionElement.classList.contains('page-section')) {
                 targetSectionElement.scrollIntoView({ behavior: 'auto', block: 'start' });
            } else if (document.getElementById('home')) { // Fallback to #home section if initialPage is not a page-section
                 document.getElementById('home').scrollIntoView({ behavior: 'auto', block: 'start' });
            }
        }, 100); // Small delay
    }


    // Initialize the page on load
    initializePage();

    // Handle hash changes for navigation (e.g. browser back/forward buttons)
    window.addEventListener('hashchange', () => {
        // We get the pageId from hash. If hash is empty or '#', it means 'home'.
        const hash = window.location.hash.substring(1);
        const validPages = Array.from(navLinks).map(link => link.dataset.target);
        let pageIdToLoad = 'home';

        if (hash && validPages.includes(hash)) {
            pageIdToLoad = hash;
        }
        
        loadContentForPage(pageIdToLoad);
        // Scroll to the relevant section after loading content and setting active page
        const targetSection = document.getElementById(pageIdToLoad);
        if (targetSection && targetSection.classList.contains('page-section')) {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (document.getElementById('home')) { // Fallback to #home content section
             document.getElementById('home').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

    }, false);


    // --- Existing variables and functions END ---


    // =========== GSAP Hero Text Animation (for #heroSection h1) START ===========
    // This will target the "EARN" text in the new hero.
    // GSAP, SplitText, ScrambleTextPlugin should be loaded via CDN in index.html <head>

    const heroHeadline = document.querySelector('#heroSection .hero h1'); // Target H1 inside .hero
    if (heroHeadline && typeof gsap !== 'undefined' && typeof SplitText !== 'undefined') {
        try {
            const split = SplitText.create(heroHeadline, { type: 'words,chars' }); // Split by words and chars
            gsap.from(split.chars, { // Animate characters
                duration: 1.2,
                opacity: 0,
                scale: 0,
                y: 80,
                rotationX: 180,
                transformOrigin: "0% 50% -50",
                ease: "back.out(1.7)", // Use a back ease
                stagger: 0.03, // Stagger character animation
            });
        } catch (e) {
            console.error("GSAP SplitText animation failed:", e);
             // Fallback: Simple fade-in if SplitText fails or not available
            gsap.from(heroHeadline, { duration: 1, opacity: 0, y: 50, ease: "power2.out" });
        }
    } else {
        console.warn("Hero section H1 or GSAP/SplitText not found for animation.");
    }

    // The old ScrambleText animation for '.quote' and '#scrambleText' will not run
    // as those elements are not present in the new hero section. This is expected.
    // =========== GSAP Hero Text Animation END ===========


    // =========== Star Background Animation Code START ===========
    // This existing star background will be layered behind the new sphere animation.
    var Stars = function(args) {
        if (args === undefined) args = {};
        var _scope = this;
        this.stars = [];
        this.vel = args.vel || 0.5; // Speed of stars
        this.radius = args.radius || 0.8; // Max radius of stars
        this.alpha = args.alpha || 0.5; // Max alpha of stars
        this.starsCounter = args.stars || 200; // Number of stars
        var center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        var canvas, context;

        this.init = function() {
            canvas = document.getElementById("starfield"); // Use existing canvas from HTML if available
            if (!canvas) { // Create canvas if it doesn't exist
                canvas = document.createElement("canvas");
                canvas.id = 'starfield';
                if (document.body.firstChild) {
                    document.body.insertBefore(canvas, document.body.firstChild);
                } else {
                    document.body.appendChild(canvas);
                }
            }
            
            context = canvas.getContext("2d");
            if (!context) { console.error("Failed to get 2D context for stars."); return; }
            
            context.lineCap = "round";
            this.start();
            this.resize(); // Call resize after start
            window.addEventListener("resize", this.resize.bind(this));
            // Only start animation loop if context is valid
            if (context) this.animate();
        }
        this.start = function() { this.stars = []; for (var i = 0; i < this.starsCounter; i++) { _scope.stars.push(new Star()); } }
        this.resize = function() { 
            if (canvas && context) { 
                canvas.width = window.innerWidth; 
                canvas.height = window.innerHeight; 
                center.x = canvas.width / 2; 
                center.y = canvas.height / 2; 
            } 
        }
        this.animate = function() { 
            // Check if context is still valid (e.g. canvas not removed from DOM)
            if (!canvas || !document.body.contains(canvas)) return; // Stop animation if canvas is gone
            window.requestAnimationFrame(this.animate.bind(this)); 
            this.render(); 
        }
        this.render = function() {
            if (!context) return;
            context.fillStyle = args.backgroundColor || 'rgba(5, 10, 40, 0.08)'; // Very subtle trail effect, main bg from body/hero
            context.fillRect(0, 0, canvas.width, canvas.height);
            for (var i = 0; i < this.stars.length; i++) { if (this.stars[i]) this.stars[i].update(); }
        }
        var Star = function() {
            this.init = function() { 
                this.radius = Math.random() * _scope.radius + 0.3; // Min radius 0.3
                // Start stars from center
                this.x = center.x; 
                this.y = center.y; 
                this.lineWidth = this.radius * (Math.random() * 0.2 + 0.05); // Proportional line width
                this.alpha = Math.random() * (_scope.alpha - 0.2) + 0.2; // Random alpha, min 0.2
                let vx, vy; 
                // Ensure stars have some minimum velocity
                do { 
                    vx = (Math.random() * 2 - 1) * _scope.vel; 
                    vy = (Math.random() * 2 - 1) * _scope.vel; 
                } while(Math.sqrt(vx*vx + vy*vy) < 0.05); // Min speed
                this.vel = { x: vx, y: vy }; 
            }
            this.update = function() { 
                // Increase speed slightly for acceleration effect
                this.vel.x *= 1.01; 
                this.vel.y *= 1.01; 
                
                this.x0 = this.x; 
                this.y0 = this.y; 
                this.x += this.vel.x; 
                this.y += this.vel.y; 
                this.draw(); 
                if (this.isDead()) this.init(); 
            }
            this.draw = function() { 
                context.beginPath(); 
                context.moveTo(this.x0, this.y0); 
                context.lineTo(this.x, this.y); 
                context.lineWidth = this.lineWidth * 2 ; // Use the stored lineWidth
                context.strokeStyle = `rgba(220, 220, 255, ${this.alpha})`; // Light blueish stars
                context.stroke(); 
            }
            this.isDead = function() { return (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height); }
            this.init(); return this;
        }
        // Initialize starfield. Ensure body exists.
        if (document.body) { 
            this.init(); 
        } else { 
            // Fallback if script runs before body is fully parsed (though DOMContentLoaded should prevent this)
            var self = this; 
            document.addEventListener('DOMContentLoaded', function() { self.init(); }); 
        } 
        return this;
    }

    // Initialize Stars
     var _stars = new Stars({
        vel: 0.2,        // Slower speed
        radius: 0.6,     // Smaller max radius
        stars: 120,      // Fewer stars
        alpha: 0.4,      // More subtle alpha
        // backgroundColor: 'rgba(5,10,40,0.05)' // Set via render's fillStyle for trail
    });
    // =========== Star Background Animation Code END ===========

}); // Main DOMContentLoaded Ends Here