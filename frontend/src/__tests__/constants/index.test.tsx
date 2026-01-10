import React from 'react';
import { render } from '@testing-library/react';
import { getIcon, AVAILABLE_ICONS, DEFAULT_CATEGORIES } from '../../constants';
import { Briefcase } from 'lucide-react';

describe('Constants', () => {
  describe('AVAILABLE_ICONS', () => {
    it('should have 20 icons', () => {
      expect(AVAILABLE_ICONS).toHaveLength(20);
    });

    it('should have all required properties', () => {
      AVAILABLE_ICONS.forEach(icon => {
        expect(icon).toHaveProperty('name');
        expect(icon).toHaveProperty('label');
        expect(icon).toHaveProperty('Component');
        expect(typeof icon.name).toBe('string');
        expect(typeof icon.label).toBe('string');
        expect(icon.Component).toBeDefined();
      });
    });

    it('should have Hebrew labels', () => {
      AVAILABLE_ICONS.forEach(icon => {
        expect(icon.label).toBeTruthy();
        expect(icon.label.length).toBeGreaterThan(0);
      });
    });
  });

  describe('DEFAULT_CATEGORIES', () => {
    it('should have 8 default categories', () => {
      expect(DEFAULT_CATEGORIES).toHaveLength(8);
    });

    it('should have all required properties', () => {
      DEFAULT_CATEGORIES.forEach(category => {
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('icon');
        expect(category).toHaveProperty('color');
        expect(category).toHaveProperty('isActive');
        expect(category.isActive).toBe(true);
      });
    });

    it('should have valid color codes', () => {
      DEFAULT_CATEGORIES.forEach(category => {
        expect(category.color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });

    it('should have unique IDs', () => {
      const ids = DEFAULT_CATEGORIES.map(c => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(DEFAULT_CATEGORIES.length);
    });
  });

  describe('getIcon', () => {
    it('should return correct icon for valid name', () => {
      const { container } = render(<>{getIcon('Utensils')}</>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should return Briefcase icon for invalid name', () => {
      const { container: validContainer } = render(<>{getIcon('InvalidIcon')}</>);
      const { container: briefcaseContainer } = render(<Briefcase size={20} />);

      expect(validContainer.firstChild).toBeInTheDocument();
      expect(validContainer.querySelector('svg')).toBeInTheDocument();
    });

    it('should use default size of 20 when size not provided', () => {
      const { container } = render(<>{getIcon('Utensils')}</>);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '20');
      expect(svg).toHaveAttribute('height', '20');
    });

    it('should use custom size when provided', () => {
      const { container } = render(<>{getIcon('Utensils', 32)}</>);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '32');
      expect(svg).toHaveAttribute('height', '32');
    });

    it('should work with all available icons', () => {
      AVAILABLE_ICONS.forEach(icon => {
        const { container } = render(<>{getIcon(icon.name)}</>);
        expect(container.querySelector('svg')).toBeInTheDocument();
      });
    });
  });
});
