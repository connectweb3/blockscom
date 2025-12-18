const fetch = require('node-fetch');

async function testFullPage() {
    const url = 'https://blockscom.xyz';
    const encodedUrl = encodeURIComponent(url);
    const apiUrl = `https://api.microlink.io/?url=${encodedUrl}&screenshot=true&meta=false&fullPage=true&force=true`;

    console.log(`Fetching: ${apiUrl}`);

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log('Status Code:', response.status);
        console.log('Response JSON:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

testFullPage();
