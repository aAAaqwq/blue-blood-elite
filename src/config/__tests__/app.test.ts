import { describe, it, expect } from 'vitest';
import { appConfig } from '../app';

describe('appConfig', () => {
  it('has correct app name', () => {
    expect(appConfig.name).toBe('蓝血菁英');
    expect(appConfig.englishName).toBe('Blue Blood Elite');
  });

  it('has description', () => {
    expect(appConfig.description).toContain('AI');
  });

  it('has navigation items matching PRD page structure', () => {
    expect(appConfig.navigation).toHaveLength(5);

    const labels = appConfig.navigation.map((n) => n.label);
    expect(labels).toContain('发现');
    expect(labels).toContain('任务池');
    expect(labels).toContain('成长');
    expect(labels).toContain('通知');
    expect(labels).toContain('我的');
  });

  it('navigation items have valid href paths', () => {
    for (const item of appConfig.navigation) {
      expect(item.href).toMatch(/^\//);
    }
  });
});
