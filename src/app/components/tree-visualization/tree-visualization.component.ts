import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import * as d3 from 'd3';
import { SubsetSumService } from '../../services/subset-sum.service';
import { VisualizationService } from '../../services/visualization.service';
import { TreeNode } from '../../models/tree-node.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tree-visualization',
  templateUrl: './tree-visualization.component.html',
  styleUrls: ['./tree-visualization.component.scss'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  standalone: true
})
export class TreeVisualizationComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('treeContainer', { static: true }) private treeContainer!: ElementRef;
  
  private svg: any;
  private treeLayout: any;
  private root: any;
  private treeData: any;
  private animationSpeed = 500;
  private subscription: Subscription = new Subscription();
  
  isAnimating = false;
  animationSteps: TreeNode[] = [];
  currentStepIndex = 0;
  treeWidth = 800;
  treeHeight = 600;
  
  constructor(
    private subsetSumService: SubsetSumService,
    private visualizationService: VisualizationService
  ) { }

  ngOnInit(): void {
    // Subscribe to tree data changes
    this.subscription.add(
      this.subsetSumService.treeData$.subscribe(treeData => {
        if (treeData) {
          this.treeData = this.visualizationService.prepareTreeData(treeData);
          this.animationSteps = this.visualizationService.getAnimationSteps(treeData);
          this.currentStepIndex = 0;
          setTimeout(() => this.renderTree(), 100); // Small delay to ensure DOM is ready
        }
      })
    );
  }

  ngAfterViewInit(): void {
    this.initSvg();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private initSvg(): void {
    // Clear any existing SVG
    d3.select(this.treeContainer.nativeElement).select('svg').remove();
    
    // Create new SVG with zoom functionality
    this.svg = d3.select(this.treeContainer.nativeElement)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${this.treeWidth} ${this.treeHeight}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Add a group for zoom transform
    const g = this.svg.append('g')
      .attr('class', 'zoom-group');

    // Add zoom behavior
    this.svg.call(
      d3.zoom()
        .scaleExtent([0.1, 3])
        .on('zoom', (event: any) => {
          g.attr('transform', event.transform);
        })
    );
  }

  renderTree(): void {
    if (!this.treeData || !this.svg) {
      console.warn('Tree data or SVG container not available');
      return;
    }
    
    // Clear previous tree but keep the zoom group
    const zoomGroup = this.svg.select('.zoom-group');
    zoomGroup.selectAll('*').remove();
    
    // Create hierarchy from data
    this.root = d3.hierarchy(this.treeData);
    
    // Calculate sizes based on tree complexity
    const maxDepth = this.root.height;
    const totalNodes = this.root.descendants().length;
    
    // Adjust tree size based on complexity
    const horizontalSpacing = Math.max(120, Math.min(200, this.treeWidth / (maxDepth + 1)));
    const verticalSpacing = Math.max(40, Math.min(80, this.treeHeight / (totalNodes / (maxDepth + 1) * 1.5)));
    
    // Create tree layout - use horizontal layout (left to right)
    this.treeLayout = d3.tree()
      .size([this.treeHeight - 40, this.treeWidth - 160])
      .nodeSize([verticalSpacing, horizontalSpacing])
      .separation((a, b) => (a.parent === b.parent ? 1 : 1.2));
    
    // Apply layout
    this.treeLayout(this.root);
    
    // Calculate bounds for proper centering
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    this.root.each((d: any) => {
      minX = Math.min(minX, d.y);
      maxX = Math.max(maxX, d.y);
      minY = Math.min(minY, d.x);
      maxY = Math.max(maxY, d.x);
    });
    
    // Add a transformation group for the tree
    const treeGroup = zoomGroup.append('g')
      .attr('class', 'tree-group')
      .attr('transform', `translate(40, ${(this.treeHeight - (maxY - minY)) / 2 - minY})`);
    
    // Draw links
    treeGroup.selectAll('.link')
      .data(this.root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkHorizontal()
        .x((d: any) => d.y)
        .y((d: any) => d.x))
      .attr('fill', 'none')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1.5);
    
    // Create nodes
    const nodes = treeGroup.selectAll('.node')
      .data(this.root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `translate(${d.y},${d.x})`)
      .attr('data-id', (d: any) => d.data.id);
    
    // Node dimensions
    const nodeWidth = 80;
    const nodeHeight = 50;
    
    // Add node rectangles
    nodes.append('rect')
      .attr('width', nodeWidth)
      .attr('height', nodeHeight)
      .attr('x', -nodeWidth / 2)
      .attr('y', -nodeHeight / 2)
      .attr('rx', 6)
      .attr('ry', 6)
      .attr('fill', (d: any) => {
        if (d.data.attributes.isTarget) return '#4ade80';  // Green for target sum
        return d.data.attributes.selected ? '#93c5fd' : '#f3f4f6';  // Blue for include, gray for exclude
      })
      .attr('stroke', (d: any) => d.data.attributes.isTarget ? '#16a34a' : '#9ca3af')
      .attr('stroke-width', 1);
    
    // Add node labels
    nodes.append('text')
      .attr('dy', -nodeHeight / 4)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', '#333')
      .text((d: any) => {
        const name = d.data.name;
        return name.length > 15 ? name.substring(0, 12) + '...' : name;
      });
    
    // Add subset text
    nodes.append('text')
      .attr('dy', 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '9px')
      .attr('fill', '#555')
      .text((d: any) => {
        const subset = d.data.attributes.subset;
        return subset.length > 15 ? subset.substring(0, 12) + '...' : subset;
      });
    
    // Add sum text
    nodes.append('text')
      .attr('dy', nodeHeight / 4 + 10)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .text((d: any) => `Sum: ${d.data.attributes.currentSum}`);
    
    // Initial auto-zoom to fit the entire tree
    this.autoFitTree();
  }

  private autoFitTree(): void {
    if (!this.root || !this.svg) return;
    
    // Get bounds of the tree
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    this.root.each((d: any) => {
      const nodeWidth = 80;
      const nodeHeight = 50;
      
      minX = Math.min(minX, d.y - nodeWidth/2);
      maxX = Math.max(maxX, d.y + nodeWidth/2);
      minY = Math.min(minY, d.x - nodeHeight/2);
      maxY = Math.max(maxY, d.x + nodeHeight/2);
    });
    
    // Add padding
    const padding = 40;
    minX -= padding;
    maxX += padding;
    minY -= padding;
    maxY += padding;
    
    // Calculate dimensions
    const width = maxX - minX;
    const height = maxY - minY;
    
    // Calculate scale to fit the container
    const containerWidth = this.treeContainer.nativeElement.clientWidth;
    const containerHeight = this.treeContainer.nativeElement.clientHeight;
    const scale = Math.min(containerWidth / width, containerHeight / height, 1);
    
    // Apply transform to center and scale
    const zoomTransform = d3.zoomIdentity
      .translate((containerWidth - width * scale) / 2 - minX * scale, 
                 (containerHeight - height * scale) / 2 - minY * scale)
      .scale(scale);
    
    this.svg.call(
      d3.zoom().transform, 
      zoomTransform
    );
  }

  startAnimation(): void {
    if (this.isAnimating || this.animationSteps.length === 0) return;
    
    this.isAnimating = true;
    this.currentStepIndex = 0;
    this.animateStep();
  }

  pauseAnimation(): void {
    this.isAnimating = false;
  }

  stepForward(): void {
    if (this.animationSteps.length === 0) return;
    
    this.isAnimating = false;
    this.currentStepIndex = Math.min(this.currentStepIndex + 1, this.animationSteps.length - 1);
    this.highlightNode();
  }

  stepBackward(): void {
    if (this.animationSteps.length === 0) return;
    
    this.isAnimating = false;
    this.currentStepIndex = Math.max(this.currentStepIndex - 1, 0);
    this.highlightNode();
  }

  private animateStep(): void {
    if (!this.isAnimating || this.currentStepIndex >= this.animationSteps.length) {
      this.isAnimating = false;
      return;
    }
    
    this.highlightNode();
    
    this.currentStepIndex++;
    
    setTimeout(() => {
      this.animateStep();
    }, this.animationSpeed);
  }

  private highlightNode(): void {
    if (!this.svg) return;
    
    // Remove previous highlights
    this.svg.selectAll('.node rect')
      .classed('highlighted', false)
      .attr('stroke-width', 1);
    
    // Highlight current node
    const currentNode = this.animationSteps[this.currentStepIndex];
    if (currentNode && currentNode.id) {
      const nodeElement = this.svg.select(`.node[data-id="${currentNode.id}"] rect`);
      if (!nodeElement.empty()) {
        nodeElement
          .classed('highlighted', true)
          .attr('stroke-width', 3)
          .attr('stroke', '#3b82f6');
        
        // Get the transform of the node to auto-center it
        const node = this.svg.select(`.node[data-id="${currentNode.id}"]`);
        if (!node.empty() && this.isAnimating) {
          this.centerNode(node);
        }
      }
    }
  }

  private centerNode(node: any): void {
    // Parse the current transform of the node
    const transform = node.attr('transform');
    const match = /translate\(([^,]+),([^)]+)\)/.exec(transform);
    
    if (!match) return;
    
    const x = parseFloat(match[1]);
    const y = parseFloat(match[2]);
    
    // Get container dimensions
    const containerWidth = this.treeContainer.nativeElement.clientWidth;
    const containerHeight = this.treeContainer.nativeElement.clientHeight;
    
    // Calculate transform to center the node
    const zoomTransform = d3.zoomIdentity
      .translate(containerWidth / 2 - x, containerHeight / 2 - y)
      .scale(1);
    
    // Apply smooth transition
    this.svg.transition()
      .duration(300)
      .call(d3.zoom().transform, zoomTransform);
  }
}