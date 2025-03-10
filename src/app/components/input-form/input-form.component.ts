import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SubsetSumService } from '../../services/subset-sum.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-input-form',
  templateUrl: './input-form.component.html',
  styleUrls: ['./input-form.component.scss'],
  imports:[CommonModule,FormsModule,ReactiveFormsModule]
})
export class InputFormComponent {
  subsetForm: FormGroup;
  errorMessage = '';
  
  constructor(
    private fb: FormBuilder,
    private subsetSumService: SubsetSumService
  ) {
    this.subsetForm = this.fb.group({
      numbers: ['', [Validators.required]],
      target: ['', [Validators.required, Validators.pattern('^-?\\d+$')]]
    });
  }

  onSubmit(): void {
    if (this.subsetForm.invalid) {
      this.errorMessage = 'Please enter valid numbers and target';
      return;
    }

    this.errorMessage = '';
    
    // Parse input numbers (comma or space separated)
    const numbersStr = this.subsetForm.value.numbers.replace(/\s+/g, ',');
    const numbersArray = numbersStr.split(',')
      .filter((num: string) => num.trim() !== '')
      .map((num: string) => parseInt(num.trim(), 10));
    
    // Validate input
    if (numbersArray.some(isNaN)) {
      this.errorMessage = 'Please enter valid numbers separated by commas or spaces';
      return;
    }

    if (numbersArray.length > 20) {
      this.errorMessage = 'Please enter 20 or fewer numbers for performance reasons';
      return;
    }

    const target = parseInt(this.subsetForm.value.target, 10);
    
    // Call service to find subsets
    this.subsetSumService.findSubsets(numbersArray, target);
  }
}