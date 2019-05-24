import { TestBed, inject } from '@angular/core/testing';

import { ClientIpServiceService } from './client-ip-service.service';

describe('ClientIpServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClientIpServiceService]
    });
  });

  it('should be created', inject([ClientIpServiceService], (service: ClientIpServiceService) => {
    expect(service).toBeTruthy();
  }));
});
