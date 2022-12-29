import { Coordinate } from '../model/coordinate';
import { Point } from '../model/point';

import { LineStyle, LineWidth, setLineStyle } from './draw-line';
import { IPaneRenderer } from './ipane-renderer';

export interface BoxRendererData {
	fillColor: string;
	fillOpacity: number;
	borderColor: string;
	borderStyle: LineStyle;
	borderWidth: LineWidth;
	borderVisible: boolean;

	corners: Point[];
	xLow: Coordinate; // earlyTime
	xHigh: Coordinate; // lateTime
	yLow: Coordinate; // lowPrice
	yHigh: Coordinate; // highPrice
	visible?: boolean;

	// axisLabelVisible
	// title
	width: number; // Canvas width?
	height: number; // Canvas height?
	text?:string;
}

export class BoxRenderer implements IPaneRenderer {
	private _data: BoxRendererData | null = null;

	public setData(data: BoxRendererData): void {
		this._data = data;
	}

	public draw(ctx: CanvasRenderingContext2D, pixelRatio: number, isHovered: boolean, hitTestData?: unknown): void {
		if (this._data === null) {
			return;
		}

		if (this._data.visible === false) {
			return;
		}

		let corners: Point[] = [];
		const height = Math.ceil(this._data.height * pixelRatio);
		const width = Math.ceil(this._data.width * pixelRatio);
		
		if (this._data.corners.length === 0) {
			
			const yLow = Math.round(this._data.yLow * pixelRatio) as Coordinate;

			if (yLow > height) {
				return;
			}

			const yHigh = Math.round(this._data.yHigh * pixelRatio) as Coordinate;

			if (yHigh < 0) {
				return;
			}

			
			const xLow = Math.round(this._data.xLow * pixelRatio) as Coordinate;

			if (xLow > width) {
				return;
			}

			const xHigh = Math.round(this._data.xHigh * pixelRatio) as Coordinate;

			if (xHigh < 0) {
				return;
			}

			corners = [
				{ x: xLow, y: yLow },
				{ x: xLow, y: yHigh },
				{ x: xHigh, y: yHigh },
				{ x: xHigh, y: yLow },
			];
		} else {
			for (let i = 0; i < this._data.corners.length; ++i) {
				corners.push({
					x: Math.round(this._data.corners[i].x * pixelRatio) as Coordinate,
					y: Math.round(this._data.corners[i].y * pixelRatio) as Coordinate,
				});
			}
		}

		ctx.beginPath();
		ctx.moveTo(corners[corners.length - 1].x, corners[corners.length - 1].y);

		for (let i = 0; i < corners.length; ++i) {
			ctx.lineTo(corners[i].x, corners[i].y);
		}

		ctx.fillStyle = this._hexToRgba(this._data.fillColor, this._data.fillOpacity);
		ctx.fill();
		
		if(this._data.text){
			ctx.fillStyle = this._hexToRgba(this._data.borderColor, this._data.fillOpacity);
			ctx.textAlign = "center";
			let start , end;
			
			if(corners.length === 4){
				start = (corners[2].x - corners[0].x) / 2;
				end = (corners[2].y - corners[0].y) / 2;
			}
			else {
				start = corners[0].x + (width / 2);
				end = corners[0].y + (height / 2);
			}
			
			ctx.fillText(this._data.text, start, end);
		}

		if (this._data.borderVisible) {
			ctx.strokeStyle = this._data.borderColor;
			ctx.lineWidth = this._data.borderWidth;
			setLineStyle(ctx, this._data.borderStyle);
		}

		ctx.stroke();
	}

	private _hexToRgba(hex: string, opacity: number): string {
		hex = hex.substring(1);

		if (hex.length === 3) {
			hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
		}

		const r = parseInt(hex.substring(0, 2), 16);
		const g = parseInt(hex.substring(2, 4), 16);
		const b = parseInt(hex.substring(4, 6), 16);

		return `rgba(${r}, ${g}, ${b}, ${opacity})`;
	}
}
