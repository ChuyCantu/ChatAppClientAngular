import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';

import { computePosition, flip, offset, shift, arrow, Placement } from '@floating-ui/dom';

@Component({
  selector: 'app-floating-element',
  templateUrl: './floating-element.component.html',
  styleUrls: ['./floating-element.component.css']
})
export class FloatingElementComponent implements AfterViewInit {

    @Input() arrowColor: string = "";
    @Input() offset: number = 0;
    @Input() placement: Placement = "left-start";

    @ViewChild("container") containerRef!: ElementRef<HTMLElement>;
    @ViewChild("arrow") arrowElemRef!: ElementRef<HTMLElement>;

    ngAfterViewInit(): void {
        this.arrowElemRef.nativeElement.style.backgroundColor = this.arrowColor;
    }

    show(referenceElement: HTMLElement): void {
        this.containerRef.nativeElement.style.display = "block";
        this.updateElementPosition(referenceElement);
    }

    hide(): void {
        this.containerRef.nativeElement.style.display = "";
    }

    private updateElementPosition(referenceElement: HTMLElement): void {
        const container = this.containerRef.nativeElement;
        const arrowElem = this.arrowElemRef.nativeElement;

        computePosition(referenceElement, container, {
            placement: this.placement,
            middleware: [
                offset(this.offset),
                flip(),
                shift({ padding: 5 }),
                arrow({ element: arrowElem })
            ],
        })
            .then(({ x, y, placement, middlewareData }) => {
                Object.assign(container.style, {
                    left: `${x}px`,
                    top: `${y}px`,
                });

                // Accessing the data
                // const { x: arrowX, y: arrowY } = middlewareData.arrow;
                const arrowData = middlewareData.arrow;
                const arrowX = arrowData?.x;
                const arrowY = arrowData?.y;

                const staticSide: any = { // any fixes problems inside Object.assign
                    top: 'bottom',
                    right: 'left',
                    bottom: 'top',
                    left: 'right',
                }[placement.split('-')[0]];

                Object.assign(arrowElem.style, {
                    left: arrowX != null ? `${arrowX}px` : '',
                    top: arrowY != null ? `${arrowY}px` : '',
                    right: '',
                    bottom: '',
                    [staticSide]: '-4px',
                });
            });
    }

}