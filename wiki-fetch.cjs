const https = require('https');
const fs = require('fs');

const queries = [
    "Chlorosis leaf", // yellow leaves
    "Monstera deliciosa", // monstera
    "Leaf necrosis", // brown tips
    "Wilting plant", // drooping
    "Sciaridae", // fungus gnats
    "Powdery mildew", // white spots
    "Root rot", // root rot
    "Watering plant", // overwatered
    "Dry soil", // underwatered
    "Watering can", // watering guide
    "Fallen leaves", // losing leaves
    "Leaf curling", // curling leaves
    "Black spot disease plant", // black spots
    "Potting soil", // white mold
    "Tetranychus urticae", // spider mites
    "Etiolation", // leggy
    "Epipremnum aureum", // pothos
    "Spathiphyllum", // peace lily
    "Calathea", // calathea
    "Sansevieria trifasciata" // snake plant
];

const file = 'src/lib/articles.ts';
let content = fs.readFileSync(file, 'utf8');

// The articles are generated with loremflickr sequentially
const imageRegex = /imageUrl:\s*\"https:\/\/loremflickr\.com[^\"]*\"/g;

let matches = content.match(imageRegex) || [];

async function fetchWikiImage(query) {
    return new Promise((resolve) => {
        const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1&pithumbsize=800`;
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const pages = json.query.pages;
                    const pageId = Object.keys(pages)[0];
                    if (pages[pageId].thumbnail) {
                        resolve(pages[pageId].thumbnail.source);
                    } else {
                        resolve(null);
                    }
                } catch(e) {
                    resolve(null);
                }
            });
        }).on('error', () => resolve(null));
    });
}

(async () => {
    let newContent = content;
    for (let i = 0; i < queries.length; i++) {
        let imageUrl = await fetchWikiImage(queries[i]);
        if (!imageUrl) {
            // fallback generic plant image
            imageUrl = await fetchWikiImage('Houseplant');
        }
        
        // Find the nth match and replace it
        // Since we are matching globally, we can do it one by one
        if (imageUrl) {
            console.log(`Matched ${queries[i]} -> ${imageUrl}`);
            // Use regex to replace one by one
            const singleRegex = /imageUrl:\s*\"https:\/\/loremflickr\.com[^\"]*\"/;
            newContent = newContent.replace(singleRegex, `imageUrl: "${imageUrl}"`);
        }
    }
    
    fs.writeFileSync(file, newContent);
    console.log('Replaced all URLs');
})();
