const apiKey = 'ce520e53d65b4642b975d70c64762122';
const apiUrl = `https://newsapi.org/v2/everything?domains=techcrunch.com,thenextweb.com&apiKey=${apiKey}`;
let allArticles = [];
let isIndonesian = false;

async function fetchNews() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.status === 'ok') {
            allArticles = data.articles;
            displayNews(allArticles);
        } else {
            throw new Error('Failed to fetch news');
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('newsContainer').innerHTML = `
            <div class="loading">
                Failed to load news. Please try again later.
            </div>
        `;
    }
}

function filterNews(category) {
    let filteredArticles = allArticles;
    
    if (category !== 'all') {
        filteredArticles = allArticles.filter(article => {
            const title = article.title.toLowerCase();
            const description = article.description ? article.description.toLowerCase() : '';
            
            switch(category) {
                case 'technology':
                    return title.includes('tech') || description.includes('tech') ||
                           title.includes('software') || description.includes('software');
                case 'startup':
                    return title.includes('startup') || description.includes('startup') ||
                           title.includes('funding') || description.includes('funding');
                case 'gadgets':
                    return title.includes('phone') || description.includes('phone') ||
                           title.includes('device') || description.includes('device') ||
                           title.includes('gadget') || description.includes('gadget');
                default:
                    return true;
            }
        });
    }
    
    displayNews(filteredArticles);
}

async function translateText(text) {
    try {
        const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=id&dt=t&q=${encodeURIComponent(text)}`);
        const data = await response.json();
        return data[0][0][0];
    } catch (error) {
        console.error('Translation error:', error);
        return text;
    }
}

async function displayNews(articles) {
    const newsContainer = document.getElementById('newsContainer');
    newsContainer.innerHTML = '';

    if (articles.length === 0) {
        newsContainer.innerHTML = `
            <div class="loading">
                ${isIndonesian ? 'Tidak ada artikel ditemukan untuk kategori ini.' : 'No articles found for this category.'}
            </div>
        `;
        return;
    }

    for (const article of articles) {
        const date = new Date(article.publishedAt).toLocaleDateString();
        const card = document.createElement('div');
        card.className = 'news-card';

        const title = isIndonesian ? await translateText(article.title) : article.title;
        const description = isIndonesian ? 
            await translateText(article.description || 'No description available') : 
            (article.description || 'No description available');

        card.innerHTML = `
            <img src="${article.urlToImage || '/api/placeholder/300/200'}" alt="${title}" class="news-image">
            <div class="news-content">
                <h2 class="news-title">${title}</h2>
                <p class="news-description">${description}</p>
                <div class="news-meta">
                    <span>${article.source.name}</span>
                    <span>${date}</span>
                </div>
                <a href="${article.url}" target="_blank" class="read-more">
                    ${isIndonesian ? 'Baca Selengkapnya' : 'Read More'}
                </a>
            </div>
        `;
        newsContainer.appendChild(card);
    }
}


document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
      
        document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      
        filterNews(link.dataset.category);
    });
});

document.getElementById('languageToggle').addEventListener('click', () => {
    isIndonesian = !isIndonesian;
    filterNews(document.querySelector('.nav-links a.active').dataset.category);
});
fetchNews();