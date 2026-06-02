"""
End-to-end UI tests for StudyBot (browser automation).

These tests exercise the React UI in Chrome. They do NOT connect to Postgres directly;
signup/login flows hit the Django API, which uses the database.

Prerequisites (all must be running):
  1. Frontend:  npm run dev          -> http://localhost:5173
  2. Backend:   python manage.py runserver -> http://localhost:8000
  3. Database:  schema_postgresql.sql + seed.sql applied in Supabase/Postgres
  4. Chrome browser installed

Run from project root or testing folder:
  pip install -r testing/requirements.txt
  python testing/selenium_tests.py

Optional env:
  STUDYBOT_BASE_URL=http://localhost:5173
  STUDYBOT_HEADLESS=1   (default) or 0 to show the browser
"""
from __future__ import annotations

import os
import sys
import time
import urllib.error
import urllib.request

from selenium import webdriver
from selenium.common.exceptions import TimeoutException, WebDriverException
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager

BASE_URL = os.environ.get('STUDYBOT_BASE_URL', 'http://localhost:5173')
API_URL = os.environ.get('STUDYBOT_API_URL', 'http://localhost:8000/api')
WAIT_SECONDS = int(os.environ.get('STUDYBOT_WAIT', '20'))
HEADLESS = os.environ.get('STUDYBOT_HEADLESS', '1') != '0'


def check_url(name: str, url: str) -> None:
    try:
        urllib.request.urlopen(url, timeout=3)
    except (urllib.error.URLError, TimeoutError) as exc:
        raise SystemExit(
            f'\n[SKIP] {name} is not reachable at {url}\n'
            f'       ({exc})\n'
            f'       Start the frontend/backend before running UI tests.\n'
        ) from exc


def create_driver() -> webdriver.Chrome:
    options = webdriver.ChromeOptions()
    if HEADLESS:
        options.add_argument('--headless=new')
    options.add_argument('--window-size=1920,1080')
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    service = Service(ChromeDriverManager().install())
    return webdriver.Chrome(service=service, options=options)


def open_auth_modal(driver: webdriver.Chrome, wait: WebDriverWait) -> None:
    """Landing page is shown first; auth lives in a modal."""
    driver.get(BASE_URL)
    login_btn = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//header//button[contains(.,'Login')]")
        )
    )
    login_btn.click()
    wait.until(EC.visibility_of_element_located((By.ID, 'login-email')))


def open_signup_tab(driver: webdriver.Chrome, wait: WebDriverWait) -> None:
    open_auth_modal(driver, wait)
    signup_tab = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//button[@role='tab' and contains(.,'Sign Up')]")
        )
    )
    signup_tab.click()
    wait.until(EC.visibility_of_element_located((By.ID, 'signup-name')))


def open_login_tab(driver: webdriver.Chrome, wait: WebDriverWait) -> None:
    open_auth_modal(driver, wait)
    login_tab = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//button[@role='tab' and contains(.,'Login')]")
        )
    )
    login_tab.click()
    wait.until(EC.visibility_of_element_located((By.ID, 'login-email')))


def click_logout(driver: webdriver.Chrome, wait: WebDriverWait) -> None:
    user_menu = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, 'header button[aria-label="User menu"]'))
    )
    user_menu.click()
    logout_item = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//div[@role='menuitem' and contains(.,'Logout')]")
        )
    )
    logout_item.click()


def navigate_sidebar(driver: webdriver.Chrome, wait: WebDriverWait, label: str) -> None:
    btn = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, f"//aside//button[.//span[normalize-space()='{label}']]")
        )
    )
    btn.click()


def test_signup_and_login() -> None:
    check_url('Frontend', BASE_URL)
    check_url('API', f'{API_URL.rstrip("/")}/openapi.json')

    driver = create_driver()
    wait = WebDriverWait(driver, WAIT_SECONDS)
    try:
        open_signup_tab(driver, wait)
        driver.find_element(By.ID, 'signup-name').send_keys('Test Student')
        driver.find_element(By.ID, 'signup-email').send_keys(
            f'test_{int(time.time())}@example.com'
        )
        driver.find_element(By.ID, 'signup-password').send_keys('Test123!')
        driver.find_element(By.XPATH, "//form//button[@type='submit']").click()

        wait.until(
            EC.presence_of_element_located(
                (By.XPATH, "//h1[contains(text(),'Dashboard')]")
            )
        )
        print('PASS: Signup reached student dashboard.')

        click_logout(driver, wait)
        wait.until(
            EC.element_to_be_clickable(
                (By.XPATH, "//header//button[contains(.,'Login')]")
            )
        )

        open_login_tab(driver, wait)
        driver.find_element(By.ID, 'login-email').send_keys('admin@example.com')
        driver.find_element(By.ID, 'login-password').send_keys('adminpass')
        driver.find_element(By.XPATH, "//form//button[@type='submit']").click()

        wait.until(
            EC.presence_of_element_located(
                (
                    By.XPATH,
                    "//h1[contains(text(),'Admin Dashboard') or contains(text(),'Dashboard')]",
                )
            )
        )
        print('PASS: Admin login succeeded.')
    finally:
        driver.quit()


def test_resource_list() -> None:
    check_url('Frontend', BASE_URL)

    driver = create_driver()
    wait = WebDriverWait(driver, WAIT_SECONDS)
    try:
        driver.get(BASE_URL)
        navigate_sidebar(driver, wait, 'Courses')
        wait.until(
            EC.presence_of_element_located(
                (By.XPATH, "//h1[contains(text(),'Courses')]")
            )
        )
        print('PASS: Courses view loaded.')
    finally:
        driver.quit()


def main() -> int:
    tests = [
        ('signup_and_login', test_signup_and_login),
        ('resource_list', test_resource_list),
    ]
    failed = 0
    for name, fn in tests:
        print(f'\n--- {name} ---')
        try:
            fn()
        except (TimeoutException, WebDriverException, AssertionError) as exc:
            failed += 1
            print(f'FAIL: {name}: {exc}')
    print(f'\nDone: {len(tests) - failed}/{len(tests)} passed.')
    return 1 if failed else 0


if __name__ == '__main__':
    sys.exit(main())
