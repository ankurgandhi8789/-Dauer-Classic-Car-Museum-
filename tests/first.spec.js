import { test, expect } from '@playwright/test';


test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'BUY TICKETS' }).click();
  await page.getByRole('button', { name: 'SELECT TICKET' }).first().click();
  await page.getByRole('button', { name: 'VIP Tour' }).click();
  await page.getByRole('button', { name: 'SELECT TICKET' }).click();
  await page.getByRole('complementary').getByRole('button', { name: 'SELECT DATE →' }).click();
  await page.getByRole('textbox', { name: 'VISIT DATE *' }).fill('2026-10-30');
  await page.getByLabel('ARRIVAL TIME *').selectOption('11:00');
  await page.getByRole('button', { name: 'ENTER DETAILS →' }).first().click();
  await page.getByRole('textbox', { name: 'FIRST NAME *' }).click();
  await page.getByRole('textbox', { name: 'FIRST NAME *' }).fill('ankur');
  await page.getByRole('textbox', { name: 'LAST NAME *' }).click();
  await page.getByRole('textbox', { name: 'LAST NAME *' }).fill('gandhi');
  await page.getByRole('textbox', { name: 'EMAIL ADDRESS *' }).click();
  await page.getByRole('textbox', { name: 'EMAIL ADDRESS *' }).fill('ankur@gmail.com');
  await page.getByRole('textbox', { name: 'PHONE NUMBER *' }).click();
  await page.getByRole('textbox', { name: 'PHONE NUMBER *' }).fill('1234567890');
  await page.getByRole('textbox', { name: 'SPECIAL NOTES (optional)' }).click();
  await page.getByRole('textbox', { name: 'SPECIAL NOTES (optional)' }).fill('asdfghjk');
  await page.getByRole('button', { name: 'REVIEW ORDER →' }).first().click();
  await page.getByRole('button', { name: 'CONFIRM BOOKING →' }).first().click();
  await page.getByRole('button', { name: 'BOOK MORE TICKETS →' }).click();
  await page.goto('http://localhost:5173/admin/login');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@gmail.com');
  await page.getByRole('textbox', { name: 'Password Show password' }).click();
  await page.getByRole('textbox', { name: 'Password Show password' }).fill('admin123');
  await page.getByRole('textbox', { name: 'Password Show password' }).press('Enter');
  await page.getByRole('link', { name: 'Daily schedule', exact: true }).click();
  await page.getByRole('button', { name: 'Next day' }).click();
  await page.getByRole('textbox', { name: 'Pick a date' }).fill('2026-10-29');
  await page.getByRole('link', { name: 'Bookings' }).click();
  await page.getByRole('button', { name: 'Visit ▼' }).click();
  await page.getByRole('button', { name: 'Visit ▼' }).click();
  await page.getByRole('button', { name: 'Clear filters' }).click();
});



