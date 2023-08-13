import { TestBed } from '@angular/core/testing';

import { SearchTagService } from './search-tag.service';

describe('SearchTagService', () => {
  let service: SearchTagService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchTagService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
