const fs = require('fs')
const { Builder, By, Key, until } = require('selenium-webdriver')
require('dotenv').config()

/*
* Récupère les annonces
* 
* @param driver:WebDriver
* @return Promise<WebElement[]>
*/
const fetchAllOffer = async driver => {
    console.log('Fetching the offers ...')
    const next = await driver.findElements(By.css('.pagination-list a'))
    const nextTxt = await Promise.all(next.map(e => e.getAttribute('href')))
    nextTxt.pop()

    console.log('Parsing page 1 ...')
    let elem = await driver.findElements(By.className('jobsearch-SerpJobCard')) 
    let elemAllTxt = await Promise.all(elem.map(e => parseElem(e)))

    for (let i = 0; i < nextTxt.length; i++) {
        console.log('Parsing page', i + 2, '...')
        await driver.get(nextTxt[i])

        driver.findElement(By.className('popover-x-button-close')).click()
        .then(() => console.log('Popup skiped'))
        .catch(() => console.log('Popup not found'))

        elem = await driver.findElements(By.className('jobsearch-SerpJobCard'))
        elemAllTxt = [...elemAllTxt, ...await Promise.all(elem.map(e => parseElem(e)))]
    }
    console.log(elemAllTxt.length, 'offers were found')

    return elemAllTxt
}

/*
* Parse un element dans un objet
* 
* @param elem:WebElement
* @return Promise<{
*    title : string
*    link : string
*    company : string
*    location : string
*    summary : string
*    new : boolean
*    eazy : boolean
* }>
*/
const parseElem = async elem => ({
    title : await elem.findElement(By.className('jobtitle')).getText(),
    link : await elem.findElement(By.className('jobtitle')).getAttribute('href'),
    company : await elem.findElement(By.className('company')).getText(),
    location : await elem.findElement(By.className('location')).getText(),
    summary : await elem.findElement(By.className('summary')).getText(),
    new : await ifExist(elem.findElement(By.className('new'))),
    eazy : await ifExist(elem.findElement(By.className('jobCardShelfContainer')))
})

/*
* Verifi si un element existe
* 
* @param elem:Promise<WebElement>
* @return Promise<boolean>
*/
const ifExist = elem => new Promise((resolve, reject) => {
    elem.then(val => resolve(true))
    .catch(err => resolve(false))
})

/*
* Prend des elements parser et les filtre avec des options
* 
* @param element:object[]
* @param option?: {
*    title?: string[]
*    link?: string[]
*    company?: string[]
*    location?: string[]
*    summary?: string[]
*    new?: boolean
*    eazy?: boolean
* }
* @return Promise<object[]>
*/
const filterKeyword = (element, option = {}) => {
    const opt = {
        title : option.title || [],
        link : option.link || [],
        company : option.company || [],
        location : option.location || [],
        summary : option.summary || [],
        new : option.new || undefined,
        eazy : option.eazy || undefined
    }
    const filter = element.filter(elem => {
        const res = find(opt.title, elem.title.toLowerCase()) &&
        find(opt.link, elem.link.toLowerCase()) &&
        find(opt.company, elem.company.toLowerCase()) &&
        find(opt.location, elem.location.toLowerCase()) &&
        find(opt.summary, elem.summary.toLowerCase()) &&
        (elem.new === opt.new || opt.new === undefined) &&
        (elem.eazy === opt.eazy || opt.eazy === undefined)

        return res
    })
    console.log(filter.length, 'offers were filtered')
    return filter
}

/*
* Envoie une candidature
* 
* @param element:object
* @param driver:WebDriver
* @return Promise<void>
*/
const apply = async (element, driver) => {
    console.log('appling for', element.title, '...')
    await driver.get(element.link)
    // await driver.findElement(By.css('.jobsearch-IndeedApplyButton-buttonWrapper button')).click()
    // await driver.switchTo().frame(0)
    await driver.switchTo().frame(1)
    console.log(await driver.findElement(By.css('iframe')).getAttribute('src'))
    // console.log(await driver.findElement(By.css('.ia-JobInfoHeader-title')).getText())
    
}

/*
* Se connecte
* 
* @param driver:WebDriver
* @return Promise<void>
*/
const connect = async driver => {
    console.log('Connection to indeed ...')
    const { EMAIL, PASSWORD, CO_LINK, FORM, INPUT_EMAIL, INPUT_PASS } = process.env
    await driver.get(CO_LINK)
    const form = await driver.findElement(By.css(FORM))
    await form.findElement(By.name(INPUT_EMAIL)).sendKeys(EMAIL)
    await form.findElement(By.name(INPUT_PASS)).sendKeys(PASSWORD, Key.ENTER)

    if (await ifExist(driver.findElement(By.className('gnav-AccountMenu-user'))))
        console.log('Connected to indeed')
    else
        console.log('Not connected to indeed')
}

/*
* Cherche plusieurs elements dans sujet
* 
* @param search:string[]
* @param subject:string
* @return boolean
*/
const find = (search, subject) => {
    return search.length > 0 ? search.map(s =>
        (new RegExp(s)).test(subject)
    ).indexOf(false) === -1 : true
}

/*
* Stringify les elements parser en fonction des options
* 
* @param element:string
* @param option?: {
*    title?: boolean
*    link?: boolean
*    company?: boolean
*    location?: boolean
*    summary?: boolean
*    new?: boolean
*    eazy?: boolean
* }
* @return string
*/
const formatResult = (elem, option = {}) => {
    const opt = {
        title : option.title || false,
        link : option.link || false,
        company : option.company || false,
        location : option.location || false,
        summary : option.summary || false,
        new : option.new || false,
        eazy : option.eazy || false
    }
    let str = '-------------------------------------\n'
    str += opt.title ? 'title : ' + elem.title + '\n' : ''
    str += opt.link ? 'link : ' + elem.link + '\n' : ''
    str += opt.company ? 'company : ' + elem.company + '\n' : ''
    str += opt.location ? 'location : ' + elem.location + '\n' : ''
    str += opt.summary ?  'summary : ' +  elem.summary + '\n' : ''
    str += opt.new ? 'new : ' + elem.new + '\n' : ''
    str += opt.eazy ? 'eazy : ' + elem.eazy + '\n' : ''

    return str
}

/*
* Stringify les elements parser en fonction des options
* 
* @param element:string[]
* @param option?: {
*    title?: boolean
*    link?: boolean
*    company?: boolean
*    location?: boolean
*    summary?: boolean
*    new?: boolean
*    eazy?: boolean
* }
* @return string
*/
const toString = (elem, option = {}) => 
    elem.map(e => formatResult(e, option)).join('')

/*
* enregistre les elements dans un fichier log
* 
* @param element:string[]
* @param fileName:string
* @param option?: {
*    title?: boolean
*    link?: boolean
*    company?: boolean
*    location?: boolean
*    summary?: boolean
*    new?: boolean
*    eazy?: boolean
* }
* @return void
*/
const toLog = (elem, fileName, option = {}) => {
    const date = new Date()
    fs.writeFile(fileName, date + '\n' + toString(elem, option), () => 
        console.log('Logs written in', fileName)
    )
}

/*
* désactive le console.log
* 
* @param verb:boolean
* @return void
*/
const verbose = verb => {
    if (!verb) {
        console = console || {}
        console.log = function(){}
    }
}

/*
* charge un fichier json
* 
* @param element:string
* @return object
*/
const loadConfig = (fileName = 'config.json') => {
    if (!fs.existsSync(fileName)) return {}
    const data = fs.readFileSync(fileName)
    return JSON.parse(data)
}

module.exports = {
    fetchAllOffer,
    filterKeyword,
    connect,
    ifExist,
    apply,
    find,
    formatResult,
    toString,
    toLog,
    verbose,
    loadConfig
}