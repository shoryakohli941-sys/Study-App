import asyncio
from playwright.async_api import async_playwright

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

        await page.screenshot(path='vault_ui.png')
        print("Screenshot of Vault saved to vault_ui.png")

        # Click on card to flip
        print("Clicking on card")
        # Need to find the card element. It should be visible
        await page.click('div.perspective-1000')
        await page.wait_for_timeout(1000)

        await page.screenshot(path='vault_card_back.png')
        print("Screenshot of Vault Card Back saved to vault_card_back.png")

        # Now go back to Home, clear DB or something? We'll just test the toast in Fight Mode
        print("Clicking on Fight tab")
        await page.click('button:has-text("Fight")')
        await page.wait_for_timeout(1000)

        await page.screenshot(path='fight_ui.png')
        print("Screenshot of Fight Mode saved to fight_ui.png")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
