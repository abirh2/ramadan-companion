#!/usr/bin/env tsx

import { spawn, ChildProcess } from 'child_process'
import puppeteer, { Browser, Page } from 'puppeteer'
import { readFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

// Load configuration
const configPath = join(__dirname, 'screenshot-config.json')
if (!existsSync(configPath)) {
  console.error('❌ Error: screenshot-config.json not found!')
  console.error('   Create it from screenshot-config.example.json and add your credentials.')
  process.exit(1)
}

const config = JSON.parse(readFileSync(configPath, 'utf-8'))

// Configuration interface
interface Config {
  auth: {
    email: string
    password: string
  }
  routes: string[]
  components: Array<{ name: string; selector: string; authRequired?: boolean }>
  viewport: { width: number; height: number }
  mobileViewport: { width: number; height: number }
  captureMobile: boolean
  outputDir: string
  serverPort: number
  waitForFonts: number
}

const CONFIG: Config = config

// Ensure output directory exists
const outputPath = join(__dirname, '..', CONFIG.outputDir)
if (!existsSync(outputPath)) {
  mkdirSync(outputPath, { recursive: true })
}

// Global state
let devServer: ChildProcess | null = null
let browser: Browser | null = null
const errors: string[] = []
let successCount = 0

/**
 * Start the Next.js dev server and wait for it to be ready
 */
async function startDevServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting Next.js dev server...')
    
    devServer = spawn('npm', ['run', 'dev'], {
      cwd: join(__dirname, '..'),
      env: { ...process.env, FORCE_COLOR: '0' },
      stdio: 'pipe'
    })

    let serverReady = false
    const timeout = setTimeout(() => {
      if (!serverReady) {
        reject(new Error('Server failed to start within 60 seconds'))
      }
    }, 60000)

    devServer.stdout?.on('data', (data) => {
      const output = data.toString()
      console.log(`   ${output.trim()}`)
      
      // Detect when server is ready
      if (output.includes('Local:') && output.includes(`http://localhost:${CONFIG.serverPort}`)) {
        serverReady = true
        clearTimeout(timeout)
        console.log('✅ Dev server is ready!\n')
        resolve()
      }
    })

    devServer.stderr?.on('data', (data) => {
      console.error(`   ${data.toString().trim()}`)
    })

    devServer.on('error', (error) => {
      clearTimeout(timeout)
      reject(error)
    })
  })
}

/**
 * Stop the dev server
 */
function stopDevServer(): void {
  if (devServer) {
    console.log('\n🛑 Stopping dev server...')
    devServer.kill('SIGTERM')
    devServer = null
  }
}

/**
 * Launch Puppeteer browser
 */
async function launchBrowser(): Promise<Browser> {
  console.log('🌐 Launching browser...')
  browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  console.log('✅ Browser launched!\n')
  return browser
}

/**
 * Close the browser
 */
async function closeBrowser(): Promise<void> {
  if (browser) {
    console.log('\n🔒 Closing browser...')
    await browser.close()
    browser = null
  }
}

/**
 * Set up a new page with light theme and proper viewport
 */
async function setupPage(browser: Browser, viewport: { width: number; height: number } = CONFIG.viewport): Promise<Page> {
  const page = await browser.newPage()
  
  // Set viewport with device scale for high quality
  await page.setViewport({
    ...viewport,
    deviceScaleFactor: 2, // High DPI for quality
  })
  
  // Set light theme, location data, and disable install prompt in localStorage before any navigation
  await page.evaluateOnNewDocument(() => {
    // Set light theme (correct storage key from ThemeProvider)
    localStorage.setItem('ramadan-companion-theme', 'light')
    
    // Set default location (Philadelphia, PA - for consistent screenshots)
    localStorage.setItem('location_lat', '39.9526')
    localStorage.setItem('location_lng', '-75.1652')
    localStorage.setItem('location_city', 'Philadelphia, PA, USA')
    localStorage.setItem('location_type', 'selected')
    
    // Disable PWA install prompt (using correct keys from InstallPrompt component)
    localStorage.setItem('installPromptDismissed', 'true')
    localStorage.setItem('installPromptDismissedAt', Date.now().toString())
    localStorage.setItem('pageViewCount', '0')
  })
  
  return page
}

/**
 * Wait for fonts and network to be ready
 */
async function waitForPageReady(page: Page): Promise<void> {
  // Wait for network to be idle
  await page.waitForNetworkIdle({ timeout: 30000 })
  
  // Wait for fonts to render
  await new Promise(resolve => setTimeout(resolve, CONFIG.waitForFonts))
}

/**
 * Capture a viewport-sized screenshot (fixed dimensions, not full page)
 */
async function capturePageScreenshot(
  page: Page,
  route: string,
  filename: string
): Promise<void> {
  try {
    const url = `http://localhost:${CONFIG.serverPort}${route}`
    console.log(`📸 Capturing ${route}...`)
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
    await waitForPageReady(page)
    
    // Force light theme by removing dark class and hiding install prompt
    await page.evaluate(() => {
      // Force light theme - remove dark class from html and body
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')
      
      // Also set the theme in localStorage in case it wasn't set before navigation
      localStorage.setItem('ramadan-companion-theme', 'light')
      
      // Try various selectors to find and hide the install prompt
      const selectors = [
        '[data-testid="install-prompt"]',
        '[role="alert"]',
        '.install-prompt',
        '[aria-label*="install"]',
        '[class*="InstallPrompt"]'
      ]
      
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector)
        elements.forEach(el => {
          const textContent = el.textContent?.toLowerCase() || ''
          if (textContent.includes('install') || textContent.includes('add to home')) {
            (el as HTMLElement).style.display = 'none'
          }
        })
      }
    })
    
    const outputFile = join(outputPath, filename)
    await page.screenshot({
      path: outputFile,
      fullPage: false, // Only capture viewport, not entire page
      type: 'png',
      omitBackground: false,
    })
    
    console.log(`   ✅ Saved: ${filename}`)
    successCount++
  } catch (error) {
    const errorMsg = `Failed to capture ${route}: ${error instanceof Error ? error.message : String(error)}`
    console.error(`   ❌ ${errorMsg}`)
    errors.push(errorMsg)
  }
}

/**
 * Capture a component screenshot by selector
 */
async function captureComponentScreenshot(
  page: Page,
  componentName: string,
  selector: string,
  filename: string
): Promise<void> {
  try {
    console.log(`📸 Capturing component: ${componentName}...`)
    
    const element = await page.$(selector)
    if (!element) {
      throw new Error(`Element not found: ${selector}`)
    }
    
    const outputFile = join(outputPath, filename)
    await element.screenshot({ 
      path: outputFile,
      type: 'png',
      omitBackground: false,
    })
    
    console.log(`   ✅ Saved: ${filename}`)
    successCount++
  } catch (error) {
    const errorMsg = `Failed to capture ${componentName}: ${error instanceof Error ? error.message : String(error)}`
    console.error(`   ❌ ${errorMsg}`)
    errors.push(errorMsg)
  }
}

/**
 * Perform login
 */
async function performLogin(page: Page): Promise<boolean> {
  try {
    console.log('🔐 Performing login...')
    
    // Navigate to home page
    await page.goto(`http://localhost:${CONFIG.serverPort}/`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    })
    await waitForPageReady(page)
    
    // Click the Login button in header (look for button with "Login" text)
    const loginButtonClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      const loginBtn = buttons.find(btn => btn.textContent?.trim() === 'Login')
      if (loginBtn) {
        loginBtn.click()
        return true
      }
      return false
    })
    
    if (!loginButtonClicked) {
      throw new Error('Login button not found')
    }
    
    // Wait for modal to open
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Fill in email
    const emailInput = await page.$('input[type="email"], input[name="email"]')
    if (!emailInput) {
      throw new Error('Email input not found')
    }
    await emailInput.type(CONFIG.auth.email)
    
    // Fill in password
    const passwordInput = await page.$('input[type="password"], input[name="password"]')
    if (!passwordInput) {
      throw new Error('Password input not found')
    }
    await passwordInput.type(CONFIG.auth.password)
    
    // Click Sign In button (look for submit button or button with "Sign In" text)
    const signInButtonClicked = await page.evaluate(() => {
      // First try to find submit button
      const submitBtn = document.querySelector('button[type="submit"]') as HTMLButtonElement
      if (submitBtn) {
        submitBtn.click()
        return true
      }
      
      // Otherwise find button with "Sign In" text
      const buttons = Array.from(document.querySelectorAll('button'))
      const signInBtn = buttons.find(btn => btn.textContent?.includes('Sign In'))
      if (signInBtn) {
        signInBtn.click()
        return true
      }
      return false
    })
    
    if (!signInButtonClicked) {
      throw new Error('Sign In button not found')
    }
    
    // Wait for navigation/authentication
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Verify authentication succeeded by checking if login button is gone
    const authenticated = await page.evaluate(() => {
      // Check if login button still exists
      const buttons = Array.from(document.querySelectorAll('button'))
      const loginButton = buttons.find(btn => btn.textContent?.trim() === 'Login')
      // If login button is gone, we're authenticated
      return loginButton === undefined
    })
    
    if (authenticated) {
      console.log('   ✅ Login successful!\n')
      return true
    } else {
      throw new Error('Authentication verification failed')
    }
  } catch (error) {
    const errorMsg = `Login failed: ${error instanceof Error ? error.message : String(error)}`
    console.error(`   ❌ ${errorMsg}`)
    errors.push(errorMsg)
    return false
  }
}

/**
 * Capture all guest mode screenshots
 */
async function captureGuestMode(browser: Browser): Promise<void> {
  console.log('👤 === GUEST MODE CAPTURES ===\n')
  
  // Capture full-page screenshots
  console.log('📄 Capturing page screenshots...\n')
  const page = await setupPage(browser)
  
  for (const route of CONFIG.routes) {
    const routeName = route === '/' ? 'home' : route.slice(1).replace(/\//g, '-')
    const filename = `${routeName}-1200x630.png`
    await capturePageScreenshot(page, route, filename)
  }
  
  // Capture component screenshots from home page (only non-auth components)
  console.log('\n🧩 Capturing component screenshots...\n')
  await page.goto(`http://localhost:${CONFIG.serverPort}/`, {
    waitUntil: 'networkidle2',
    timeout: 30000
  })
  await waitForPageReady(page)
  
  const guestComponents = CONFIG.components.filter(c => !c.authRequired)
  for (const component of guestComponents) {
    const filename = `dashboard-${component.name}-1200x630.png`
    await captureComponentScreenshot(page, component.name, component.selector, filename)
  }
  
  await page.close()
}

/**
 * Capture all authenticated mode screenshots
 */
async function captureAuthMode(browser: Browser): Promise<void> {
  console.log('\n🔐 === AUTHENTICATED MODE CAPTURES ===\n')
  
  const page = await setupPage(browser)
  
  // Perform login
  const loginSuccess = await performLogin(page)
  if (!loginSuccess) {
    console.error('⚠️  Skipping authenticated captures due to login failure\n')
    await page.close()
    return
  }
  
  // Capture full-page screenshots
  console.log('📄 Capturing authenticated page screenshots...\n')
  
  for (const route of CONFIG.routes) {
    const routeName = route === '/' ? 'home' : route.slice(1).replace(/\//g, '-')
    const filename = `${routeName}-auth-1200x630.png`
    await capturePageScreenshot(page, route, filename)
  }
  
  // Capture component screenshots from home page (all components including auth-required)
  console.log('\n🧩 Capturing authenticated component screenshots...\n')
  await page.goto(`http://localhost:${CONFIG.serverPort}/`, {
    waitUntil: 'networkidle2',
    timeout: 30000
  })
  await waitForPageReady(page)
  
  // Capture all components in authenticated mode
  for (const component of CONFIG.components) {
    const filename = `dashboard-${component.name}-auth-1200x630.png`
    await captureComponentScreenshot(page, component.name, component.selector, filename)
  }
  
  await page.close()
}

/**
 * Capture all guest mode screenshots in mobile viewport
 */
async function captureGuestModeMobile(browser: Browser): Promise<void> {
  console.log('📱 === GUEST MODE MOBILE CAPTURES ===\n')
  
  // Capture mobile page screenshots
  console.log('📄 Capturing mobile page screenshots...\n')
  const page = await setupPage(browser, CONFIG.mobileViewport)
  
  for (const route of CONFIG.routes) {
    const routeName = route === '/' ? 'home' : route.slice(1).replace(/\//g, '-')
    const filename = `${routeName}-mobile-390x844.png`
    await capturePageScreenshot(page, route, filename)
  }
  
  // Skip component screenshots for mobile (components are already responsive)
  
  await page.close()
}

/**
 * Capture all authenticated mode screenshots in mobile viewport
 */
async function captureAuthModeMobile(browser: Browser): Promise<void> {
  console.log('\n📱🔐 === AUTHENTICATED MODE MOBILE CAPTURES ===\n')
  
  const page = await setupPage(browser, CONFIG.mobileViewport)
  
  // Perform login
  const loginSuccess = await performLogin(page)
  if (!loginSuccess) {
    console.error('⚠️  Skipping authenticated mobile captures due to login failure\n')
    await page.close()
    return
  }
  
  // Capture mobile page screenshots
  console.log('📄 Capturing authenticated mobile page screenshots...\n')
  
  for (const route of CONFIG.routes) {
    const routeName = route === '/' ? 'home' : route.slice(1).replace(/\//g, '-')
    const filename = `${routeName}-auth-mobile-390x844.png`
    await capturePageScreenshot(page, route, filename)
  }
  
  // Skip component screenshots for mobile (components are already responsive)
  
  await page.close()
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  console.log('🎬 Starting screenshot capture process...\n')
  
  try {
    // Start dev server
    await startDevServer()
    
    // Launch browser
    const browser = await launchBrowser()
    
    // Capture desktop screenshots
    await captureGuestMode(browser)
    await captureAuthMode(browser)
    
    // Capture mobile screenshots (if enabled)
    if (CONFIG.captureMobile) {
      await captureGuestModeMobile(browser)
      await captureAuthModeMobile(browser)
    }
    
    // Close browser
    await closeBrowser()
    
    // Stop server
    stopDevServer()
    
    // Print summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 CAPTURE SUMMARY')
    console.log('='.repeat(60))
    console.log(`✅ Successful captures: ${successCount}`)
    console.log(`❌ Failed captures: ${errors.length}`)
    
    if (errors.length > 0) {
      console.log('\n⚠️  Errors:')
      errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`)
      })
    }
    
    console.log('\n✨ Screenshot capture complete!')
    console.log(`📁 Output directory: ${CONFIG.outputDir}`)
    
    // Exit with error code if any captures failed
    if (errors.length > 0) {
      process.exit(1)
    }
  } catch (error) {
    console.error('\n💥 Fatal error:', error instanceof Error ? error.message : String(error))
    
    // Cleanup
    await closeBrowser()
    stopDevServer()
    
    process.exit(1)
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n\n⚠️  Received SIGINT, cleaning up...')
  await closeBrowser()
  stopDevServer()
  process.exit(1)
})

process.on('SIGTERM', async () => {
  console.log('\n\n⚠️  Received SIGTERM, cleaning up...')
  await closeBrowser()
  stopDevServer()
  process.exit(1)
})

// Run the script
main()

