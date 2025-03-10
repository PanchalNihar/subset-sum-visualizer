import { Injectable } from '@angular/core';
import { TreeNode } from '../models/tree-node.model';

@Injectable({
  providedIn: 'root'
})
export class VisualizationService {
  
  constructor() { }

  /**
   * Prepares tree data for D3 visualization
   */
  prepareTreeData(root: TreeNode | null): any {
    if (!root) return null;
    
    // D3 hierarchy expects a specific format, so we'll transform our data
    return {
      name: root.name,
      id: root.id,
      attributes: {
        currentSum: root.currentSum,
        subset: root.currentSubset.join(', '),
        selected: root.selected,
        considered: root.considered,
        level: root.level,
        isTarget: root.isTarget
      },
      children: root.children.map(child => this.prepareTreeData(child))
    };
  }

  /**
   * Flattens tree for animation steps
   */
  getAnimationSteps(root: TreeNode | null): TreeNode[] {
    const steps: TreeNode[] = [];
    
    if (!root) return steps;
    
    // Depth-first traversal to get exploration order
    this.traverseTree(root, steps);
    
    return steps;
  }

  private traverseTree(node: TreeNode, steps: TreeNode[]): void {
    steps.push({ ...node, children: [] }); // Add a copy without children for animation
    
    // Traverse children
    for (const child of node.children) {
      this.traverseTree(child, steps);
    }
  }
}