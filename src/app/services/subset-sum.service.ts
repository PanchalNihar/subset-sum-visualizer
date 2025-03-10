import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Subset } from '../models/subset.model';
import { TreeNode } from '../models/tree-node.model';

@Injectable({
  providedIn: 'root'
})
export class SubsetSumService {
  private subsets = new BehaviorSubject<Subset[]>([]);
  subsets$ = this.subsets.asObservable();

  private treeData = new BehaviorSubject<TreeNode | null>(null);
  treeData$ = this.treeData.asObservable();

  private nodeId = 0;

  constructor() { }

  /**
   * Main function to find all subsets that sum to target
   */
  findSubsets(numbers: number[], targetSum: number): void {
    // Reset state
    const validSubsets: Subset[] = [];
    this.nodeId = 0;
    
    // Create root node for visualization tree
    const rootNode: TreeNode = {
      id: `node-${this.nodeId++}`,
      name: 'Root',
      currentSum: 0,
      currentSubset: [],
      children: [],
      selected: false,
      considered: true,
      level: 0,
      indexConsidered: -1,
      isTarget: false
    };

    // Start backtracking
    this.backtrack(numbers, targetSum, 0, [], 0, validSubsets, rootNode);
    
    // Update subjects with results
    this.subsets.next(validSubsets);
    this.treeData.next(rootNode);
  }

  /**
   * Backtracking algorithm with tree node creation for visualization
   */
  private backtrack(
    numbers: number[], 
    targetSum: number, 
    index: number, 
    currentSubset: number[], 
    currentSum: number, 
    result: Subset[],
    parentNode: TreeNode
  ): void {
    // Check if current subset sums to target
    if (currentSum === targetSum) {
      result.push({
        elements: [...currentSubset],
        sum: currentSum,
        isValid: true
      });
      
      parentNode.isTarget = true;
      return;
    }

    // Check if we've gone past the array length or if current sum exceeds target
    if (index >= numbers.length || currentSum > targetSum) {
      return;
    }

    // Decision 1: Include current element
    const includeSubset = [...currentSubset, numbers[index]];
    const includeSum = currentSum + numbers[index];
    
    // Create tree node for including current element
    const includeNode: TreeNode = {
      id: `node-${this.nodeId++}`,
      name: `Include ${numbers[index]}`,
      currentSum: includeSum,
      currentSubset: [...includeSubset],
      children: [],
      selected: true,
      considered: true,
      level: parentNode.level + 1,
      indexConsidered: index,
      isTarget: false
    };
    
    // Add include node to parent's children
    parentNode.children.push(includeNode);
    
    // Recursive call for include case
    this.backtrack(numbers, targetSum, index + 1, includeSubset, includeSum, result, includeNode);

    // Decision 2: Exclude current element
    // Create tree node for excluding current element
    const excludeNode: TreeNode = {
      id: `node-${this.nodeId++}`,
      name: `Exclude ${numbers[index]}`,
      currentSum: currentSum,
      currentSubset: [...currentSubset],
      children: [],
      selected: false,
      considered: true,
      level: parentNode.level + 1,
      indexConsidered: index,
      isTarget: false
    };
    
    // Add exclude node to parent's children
    parentNode.children.push(excludeNode);
    
    // Recursive call for exclude case
    this.backtrack(numbers, targetSum, index + 1, currentSubset, currentSum, result, excludeNode);
  }

  /**
   * Optimized subset sum with memoization (for larger inputs)
   * Note: This doesn't create the visualization tree
   */
  findSubsetsOptimized(numbers: number[], targetSum: number): void {
    const memo: Map<string, Subset[]> = new Map();
    const result = this.findSubsetsWithMemo(numbers, targetSum, 0, [], 0, memo);
    this.subsets.next(result);
  }

  private findSubsetsWithMemo(
    numbers: number[],
    targetSum: number,
    index: number,
    currentSubset: number[],
    currentSum: number,
    memo: Map<string, Subset[]>
  ): Subset[] {
    // Create a key for memoization
    const key = `${index}-${currentSum}`;
    
    // Check if we've already computed this state
    if (memo.has(key)) {
      return memo.get(key)!;
    }

    const result: Subset[] = [];

    // Base case: target sum reached
    if (currentSum === targetSum) {
      result.push({
        elements: [...currentSubset],
        sum: currentSum,
        isValid: true
      });
    }

    // Base case: end of array or sum exceeds target
    if (index >= numbers.length || currentSum > targetSum) {
      return result;
    }

    // Decision 1: Include current element
    const includeSubset = [...currentSubset, numbers[index]];
    const includeSum = currentSum + numbers[index];
    const includeResult = this.findSubsetsWithMemo(numbers, targetSum, index + 1, includeSubset, includeSum, memo);
    
    // Decision 2: Exclude current element
    const excludeResult = this.findSubsetsWithMemo(numbers, targetSum, index + 1, currentSubset, currentSum, memo);
    
    // Combine results
    result.push(...includeResult, ...excludeResult);
    
    // Memoize and return
    memo.set(key, result);
    return result;
  }
}