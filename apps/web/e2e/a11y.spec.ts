import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PUBLIC_ROUTES = [
  '/pt-BR',
  '/pt-BR/blog',
  '/pt-BR/blog/por-que-a-arquitetura-hexagonal-se-pagou',
  '/pt-BR/contato',
  '/pt-BR/sobre',
  '/pt-BR/habilidades',
  '/pt-BR/experiencias',
  '/pt-BR/projetos',
  '/pt-BR/privacidade',
];

test.describe('WCAG 2.1 AA Accessibility Audit (T07.04)', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`Light Theme: ${route} has zero critical or serious WCAG 2.1 AA violations`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' });
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const criticalOrSerious = accessibilityScanResults.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      );

      expect(criticalOrSerious).toEqual([]);
    });

    test(`Dark Theme: ${route} has zero critical or serious WCAG 2.1 AA violations`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');

      // Set html dark class if next-themes is used
      await page.evaluate(() => {
        document.documentElement.classList.add('dark');
      });

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const criticalOrSerious = accessibilityScanResults.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      );

      expect(criticalOrSerious).toEqual([]);
    });
  }
});
