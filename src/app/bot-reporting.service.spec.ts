import { TestBed, inject } from '@angular/core/testing';

import { BotReportingService } from './bot-reporting.service';

describe('BotReportingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BotReportingService]
    });
  });

  it('should be created', inject([BotReportingService], (service: BotReportingService) => {
    expect(service).toBeTruthy();
  }));
});
