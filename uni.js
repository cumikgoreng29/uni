const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));
const chromePaths = require('chrome-paths');
const moment = require('moment');
const chalk = require('chalk');
const delay = require('delay');
const fs = require('fs');

async function main() {
const Addres = fs.readFileSync('addres.txt', 'utf-8').split('\n');
    const args = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--incognito',
        '--ignore-certifcate-errors',
        '--ignore-certifcate-errors-spki-list',
        '--disable-accelerated-2d-canvas',
        '--no-zygote',
        '--no-first-run',
        '--disable-dev-shm-usage',
        '--cache: no-cache'
        // '--window-size=1920x1080'
    ];

    const browser = await puppeteer.launch({
      headless: true,
      ignoreHTTPSErrors: true,
    //   userDataDir: 'C:/Users/Administrator/AppData/Local/Google/Chrome/User Data/Default',
        executablePath: chromePaths.chrome,
        defaultViewport: {
            width: 375,
            height: 667,
            isMobile: true,
        },
        slowMo: 0,
        devtools: false,
        args
    });
    const context = browser.defaultBrowserContext();
    context.overridePermissions("https://faucet.uniultra.xyz/", ["clipboard-read"]);
    const pages = await browser.pages();
    const page = pages[0];
    await page.setDefaultNavigationTimeout(0);
    await page.goto('https://faucet.uniultra.xyz/', {
       timeout: 0, waitUntil: 'domcontentloaded'
    });
    for (let i = 0; i < Addres.length; i++) {
        const addressAr = Addres[i].trim();
        console.log(`Alamat ${i+1}: ${addressAr}`);
        const nameFaucet = await page.evaluate(() => document.querySelector('#app > div.home__main > div.container__fluid > div.home__form > h1').textContent)
        console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green(`${nameFaucet}`));
        await delay(2000)
        const inputAddres = await page.waitForXPath('//*[@id="app"]/div[2]/div[3]/div[1]/input');
        if (inputAddres){
            await inputAddres.click({clickCount: 3})
            await page.keyboard.type(addressAr, {delay : 100})
        }
        console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green(`Berhasil Paste Addres : ${addressAr}`));
        await delay(2000)
        await page.evaluate(() => document.querySelector('#app > div.home__main > div.container__fluid > div.home__form > button').click())
        console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green(`Berhasil submit`));
        await page.waitForSelector('#app > div.home__main > div.loading > div', { visible: true });
        await page.waitForSelector('#app > div.home__main > div.loading > div', { hidden: true });       
      try {
            const Statu = await page.evaluate(() => document.querySelector('body > div.el-notification.right > div > div.el-notification__content > p').textContent)
            console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green(`${Statu}`));
        } catch (error) {
            const StatuErr = await page.evaluate(() => document.querySelector('body > div.el-notification.right > div > h2').textContent)
            console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green(`${StatuErr}`));
        }
        await delay(5000)
    }
    console.log(`[ ${moment().format("HH:mm:ss")} ] `, chalk.green(`dah abis nunggu sejam buat reclaim`));

    await delay(3600000)
}
main()