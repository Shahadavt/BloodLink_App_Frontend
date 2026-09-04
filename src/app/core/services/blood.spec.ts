import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { BloodService } from './blood';

describe('BloodService', () => {
  let service: BloodService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(BloodService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should normalize paged responses into a request array', (done) => {
    const payload = {
      content: [{ id: 1, bloodGroup: 'O+' }, { id: 2, bloodGroup: 'A-' }],
      totalElements: 2
    };

    service.getPaged(0, 10, '', '').subscribe((requests) => {
      expect(requests).toEqual(payload.content);
      done();
    });

    const req = httpMock.expectOne((request) => request.url.includes('/api/requests/search'));
    expect(req.request.method).toBe('GET');
    req.flush(payload);
  });
});
