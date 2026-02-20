import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    try {
        await page.goto('http://localhost:5173/admin-home', { waitUntil: 'networkidle0' });
        await page.screenshot({ path: '/Users/svevomondino/Desktop/Cherry Admin App/admin_home.png', fullPage: true });
        console.log("Admin Home screenshot taken");
        
        await page.goto('http://localhost:5173/manager-home', { waitUntil: 'networkidle0' });
        await page.screenshot({ path: '/Users/svevomondino/Desktop/Cherry Admin App/manager_home.png', fullPage: true });
        console.log("Manager Home screenshot taken");
        
        await page.goto('http://localhost:5173/driver', { waitUntil: 'networkidle0' });
        await page.screenshot({ path: '/Users/svevomondino/Desktop/Cherry Admin App/driver_home.png', fullPage: true });
        console.log("Driver Home screenshot taken");
        
        await page.goto('http://localhost:5173/logistics', { waitUntil: 'networkidle0' });
        await page.screenshot({ path: '/Users/svevomondino/Desktop/Cherry Admin App/logistics_home.png', fullPage: true });
        console.log("Logistic Home screenshot taken");
        
        await page.goto('http://localhost:5173/agency-dashboard', { waitUntil: 'networkidle0' });
        await page.screenshot({ path: '/Users/svevomondino/Desktop/Cherry Admin App/agency_dashboard.png', fullPage: true });
        console.log("Agency Dashboard screenshot taken");
    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
})();
