import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPlanilhaComponent } from './planilha.component';

describe('PlanilhaComponent', () => {
  let component: AdminPlanilhaComponent;
  let fixture: ComponentFixture<AdminPlanilhaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPlanilhaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPlanilhaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
