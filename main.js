#!/usr/bin/env node

const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const {
    fetchAllOffer,
    filterKeyword,
    toString,
    toLog,
    verbose,
    loadConfig
} = require('./src/utils')
require('dotenv').config()

const { optionFilter, optionView } = loadConfig()
const { argv } = process
const help = `
usage : main.js <option>
-h --help ............... affiche ceci
-s --no-verbose ......... mode silencieux
-o <fileName> ........... sortie vers un fichier log
`

if (argv.indexOf('-h') !== -1 || argv.indexOf('--help') !== -1) {
    console.log(help)
    return
}

if (argv.indexOf('--no-verbose') !== -1 || argv.indexOf('-s') !== -1) 
    verbose(false)

const main = async () => {
    const { WIDTH, HEIGHT, OFFER_LINK } = process.env
    
    let driver = new Builder()
    .forBrowser('chrome')
    .setChromeOptions(new chrome.Options().headless().windowSize({ 
        width : parseInt(WIDTH), 
        height : parseInt(HEIGHT) 
    }))
    .build();

    // await connect(driver)
    await driver.get(OFFER_LINK);
    
    const elemAll = await fetchAllOffer(driver)
    const filterElem = filterKeyword(elemAll, optionFilter)

    console.log(toString(filterElem, optionView))

    // await apply(filterElem[0], driver)

    if (argv.indexOf('-o') !== -1 && argv.length >= 4) {
        const i = argv.indexOf('-o')
        const file = argv[i + 1]
        toLog(filterElem, file, optionView)
    }
    
    await driver.quit()
}

main()