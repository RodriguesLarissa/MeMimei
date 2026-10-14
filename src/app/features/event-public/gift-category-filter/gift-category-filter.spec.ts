import { TestBed } from '@angular/core/testing';
import { GiftCategoryFilter } from './gift-category-filter';

describe('GiftCategoryFilter', () => {
  it('emits "todos" when the first chip is clicked', () => {
    const fixture = TestBed.createComponent(GiftCategoryFilter);
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.categoryChange.subscribe((value) => emitted.push(value));

    fixture.detectChanges();
    const firstChip = fixture.nativeElement.querySelector('.category-filter__chip') as HTMLButtonElement;
    firstChip.click();

    expect(emitted).toEqual(['todos']);
  });

  it('emits the category id when a category chip is clicked', () => {
    const fixture = TestBed.createComponent(GiftCategoryFilter);
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.categoryChange.subscribe((value) => emitted.push(value));

    fixture.detectChanges();
    const chips = fixture.nativeElement.querySelectorAll('.category-filter__chip');
    (chips[1] as HTMLButtonElement).click();

    expect(emitted).toEqual(['cozinha']);
  });
});
