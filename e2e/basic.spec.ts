import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Tasks/);

  // Check if main navigation is visible
  await expect(page.locator('nav')).toBeVisible();
});

test('page navigation works', async ({ page }) => {
  // Start from the index page
  await page.goto('/');

  // Find an element with the text 'About Page' and click on it
  // Note: This will need to be updated based on actual navigation
  // await page.click('text=About Page');

  // The URL should contain "/about"
  // await expect(page).toHaveURL(/.*about/);
});