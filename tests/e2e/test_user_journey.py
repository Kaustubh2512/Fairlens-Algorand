"""
End-to-end tests for the FairLens user journey
"""

import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_government_tender_creation():
    """Test the complete journey of a government user creating a tender"""
    # Setup WebDriver (ensure you have the appropriate driver installed)
    driver = webdriver.Chrome()  # or Firefox(), Safari(), etc.
    
    try:
        # Navigate to the application
        driver.get("http://localhost:8080")
        
        # Wait for page to load
        wait = WebDriverWait(driver, 10)
        
        # Click on Government login
        gov_button = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Login as Government')]"))
        )
        gov_button.click()
        
        # Fill in login form
        email_input = driver.find_element(By.NAME, "email")
        password_input = driver.find_element(By.NAME, "password")
        login_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        
        email_input.send_keys("gov@example.com")
        password_input.send_keys("govpassword")
        login_button.click()
        
        # Wait for dashboard to load
        wait.until(EC.presence_of_element_located((By.XPATH, "//h1[contains(text(), 'Dashboard')]")))
        
        # Navigate to create tender page
        create_tender_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Create Tender')]")
        create_tender_button.click()
        
        # Fill in tender form
        title_input = driver.find_element(By.NAME, "title")
        description_input = driver.find_element(By.NAME, "description")
        budget_input = driver.find_element(By.NAME, "budget")
        submit_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Create Tender')]")
        
        title_input.send_keys("Test Road Construction Project")
        description_input.send_keys("Construction of a new road in the downtown area")
        budget_input.send_keys("5000000")
        submit_button.click()
        
        # Verify tender was created
        success_message = wait.until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'Tender created successfully')]"))
        )
        assert success_message is not None
        
    finally:
        driver.quit()

if __name__ == "__main__":
    pytest.main([__file__])