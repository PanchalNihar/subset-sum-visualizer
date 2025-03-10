import { Component, OnInit } from '@angular/core';
import { SubsetSumService } from '../../services/subset-sum.service';
import { Subset } from '../../models/subset.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-subset-display',
  templateUrl: './subset-display.component.html',
  styleUrls: ['./subset-display.component.scss'],
  imports:[CommonModule,FormsModule,ReactiveFormsModule]
})
export class SubsetDisplayComponent implements OnInit {
  subsets: Subset[] = [];
  
  constructor(private subsetSumService: SubsetSumService) { }

  ngOnInit(): void {
    this.subsetSumService.subsets$.subscribe(subsets => {
      this.subsets = subsets;
    });
  }
}