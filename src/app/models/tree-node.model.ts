export interface TreeNode {
    id: string;
    name: string;
    currentSum: number;
    currentSubset: number[];
    children: TreeNode[];
    selected: boolean;
    considered: boolean;
    level: number;
    indexConsidered: number;
    isTarget: boolean;
  }