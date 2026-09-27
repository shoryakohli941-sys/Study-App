from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:5173")
        page.evaluate("localStorage.setItem('orbit_gemini_api_key', 'test_key')")
        page.reload()
        page.wait_for_selector("text=Orbit")
        page.screenshot(path="screenshot.png")
        browser.close()

if __name__ == "__main__":
    verify()
