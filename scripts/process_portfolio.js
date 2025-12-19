const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const showcaseDir = path.join(__dirname, '../portfolio/showcase');
const thumbnailsDir = path.join(showcaseDir, 'thumbnails');
const dataFile = path.join(__dirname, '../portfolio/data.js');

// Ensure thumbnails directory exists
if (!fs.existsSync(thumbnailsDir)) {
    fs.mkdirSync(thumbnailsDir, { recursive: true });
}

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

    const files = fs.readdirSync(showcaseDir).filter(f => f.endsWith('.html') && f !== 'index.html');
    const newData = [];

    console.log(`Found ${files.length} files to process.`);

    // Sort files to maintain some order if possible (optional, but good for consistency)
    files.sort();

    let charCode = 65; // 'A'

    for (const file of files) {
        const originalPath = path.join(showcaseDir, file);

        // Generate name: Theme A, Theme B, ...
        const themeLetter = String.fromCharCode(charCode);
        const newBaseName = `theme_${themeLetter.toLowerCase()}`;
        const displayName = `Theme ${themeLetter}`;
        charCode++;

        const newFileName = `${newBaseName}.html`;
        const newPath = path.join(showcaseDir, newFileName);
        const screenshotName = `${newBaseName}.jpg`;
        const screenshotPath = path.join(thumbnailsDir, screenshotName);

        console.log(`Processing ${file} -> ${newFileName} (${displayName})`);

        // Rename file
        if (file !== newFileName) {
            if (fs.existsSync(newPath) && newPath !== originalPath) {
                // If target exists (e.g. running script again), we might be overwriting
                // This is a bit tricky if we are shuffling. 
                // Simple rename might fail if target exists.
                // But since we are renaming TO a standard set, we might be safe if we are renaming FROM a random set.
                // If we are renaming theme_a -> theme_a, it's fine.
            }
            try {
                fs.renameSync(originalPath, newPath);
            } catch (e) {
                console.warn(`Could not rename ${file} to ${newFileName}: ${e.message}`);
                // If rename fails, maybe it's already named that? 
                // If we fail, continue with current name to at least get screenshot
                if (fs.existsSync(newPath)) {
                    // Proceed
                } else {
                    continue;
                }
            }
        }

        // Take Screenshot
        const fileUrl = `file://${newPath}`;
        try {
            await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 30000 });
            await page.screenshot({ path: screenshotPath, type: 'jpeg', quality: 90 });
        } catch (e) {
            console.error(`Failed to screenshot ${newFileName}:`, e);
        }

        newData.push({
            filename: newFileName,
            name: displayName,
            screenshot: screenshotName
        });
    }

    await browser.close();

    // Generate data.js
    const dataJsContent = `const templates = ${JSON.stringify(newData, null, 4)};\n`;
    fs.writeFileSync(dataFile, dataJsContent);
    console.log('Updated data.js');

})();
