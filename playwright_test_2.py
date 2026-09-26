import asyncio
from playwright.async_api import async_playwright
import time

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 375, 'height': 812})
        page = await context.new_page()

        print("Navigating to http://localhost:5173")
        await page.goto('http://localhost:5173/')

        # Bypass setup
        print("Setting local storage and reloading")
        await page.evaluate("localStorage.setItem('gemini_api_key', 'test_key')")
        await page.reload()

        # Check WarmupVault
        print("Clicking on Vault tab")
        await page.click('button:has-text("Vault")')
        await page.wait_for_timeout(1000)

        print("Clicking on card")
        await page.click('div.perspective-1000')
        await page.wait_for_timeout(1000)

        print("Clicking Mastered")
        await page.click('button:has-text("Mastered")')
        await page.wait_for_timeout(1000)

        await page.screenshot(path='vault_empty.png')
        print("Screenshot of Empty Vault saved to vault_empty.png")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
