import { useCallback, useEffect, useRef, useState } from "react";
import { type Token, useGameStore } from "../store/gameStore";

interface GridPosition {
	gridX: number;
	gridY: number;
}

export function BattleMap() {
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const mapImageRef = useRef<HTMLImageElement | null>(null);
	const lastMoveEmitRef = useRef(0); // Throttle token move emissions
	const [draggedToken, setDraggedToken] = useState<string | null>(null);
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

	const {
		tokens,
		selectedTokenId,
		selectToken,
		moveToken,
		mapWidth,
		mapHeight,
		gridSize,
		mapImageUrl,
	} = useGameStore();

	// Cache the map background image in a ref (no re-fetching on every draw)
	useEffect(() => {
		if (!mapImageUrl) {
			mapImageRef.current = null;
			return;
		}
		const img = new Image();
		img.src = mapImageUrl;
		img.onload = () => {
			mapImageRef.current = img;
		};
	}, [mapImageUrl]);

	// Convert pixel position to grid position
	const pixelToGrid = useCallback(
		(pixelX: number, pixelY: number): GridPosition => {
			const canvas = canvasRef.current;
			if (!canvas) return { gridX: 0, gridY: 0 };
			// Account for CSS scaling
			const scaleX = canvas.width / canvas.getBoundingClientRect().width;
			const scaleY = canvas.height / canvas.getBoundingClientRect().height;
			return {
				gridX: Math.floor((pixelX * scaleX) / gridSize),
				gridY: Math.floor((pixelY * scaleY) / gridSize),
			};
		},
		[gridSize],
	);

	// Draw a single token on the canvas
	const drawToken = useCallback(
		(ctx: CanvasRenderingContext2D, token: Token, isSelected: boolean) => {
			const x = token.x * gridSize;
			const y = token.y * gridSize;
			const size = token.size * gridSize;
			const radius = size / 2 - 4;

			// Token circle
			ctx.beginPath();
			ctx.arc(x + size / 2, y + size / 2, radius, 0, Math.PI * 2);

			// Color based on type
			const colors = {
				pc: "#22c55e",
				npc: "#3b82f6",
				monster: "#ef4444",
			};

			ctx.fillStyle = colors[token.type];
			ctx.fill();

			// Selection ring
			if (isSelected) {
				ctx.strokeStyle = "#ffd700";
				ctx.lineWidth = 3;
				ctx.stroke();
			} else {
				ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
				ctx.lineWidth = 2;
				ctx.stroke();
			}

			// Name label
			ctx.fillStyle = "#ffffff";
			ctx.font = "12px sans-serif";
			ctx.textAlign = "center";
			const displayName =
				token.name.length > 12 ? `${token.name.substring(0, 11)}…` : token.name;
			ctx.fillText(displayName, x + size / 2, y + size + 14);

			// HP bar (if available)
			if (token.hp) {
				const hpPercent = Math.min(1, token.hp.current / token.hp.max);
				const barWidth = size - 8;
				const barHeight = 4;
				const barX = x + 4;
				const barY = y + size - 8;

				// Background
				ctx.fillStyle = "#374151";
				ctx.fillRect(barX, barY, barWidth, barHeight);

				// HP fill
				const hpColor =
					hpPercent > 0.5
						? "#22c55e"
						: hpPercent > 0.25
							? "#eab308"
							: "#ef4444";
				ctx.fillStyle = hpColor;
				ctx.fillRect(barX, barY, barWidth * Math.max(0, hpPercent), barHeight);
			}

			// Condition indicators
			if (token.conditions && token.conditions.length > 0) {
				ctx.fillStyle = "#fbbf24";
				ctx.font = "10px sans-serif";
				ctx.fillText("!", x + size - 8, y + 12);
			}
		},
		[gridSize],
	);

	// Draw the map
	const draw = useCallback(() => {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext("2d");
		if (!canvas || !ctx) return;

		const dpr = window.devicePixelRatio || 1;
		const width = mapWidth * gridSize;
		const height = mapHeight * gridSize;

		// Set canvas size accounting for retina/HiDPI
		canvas.width = width * dpr;
		canvas.height = height * dpr;
		canvas.style.width = `${width}px`;
		canvas.style.height = `${height}px`;
		ctx.scale(dpr, dpr);

		// Clear canvas
		ctx.fillStyle = "#1a1a2e";
		ctx.fillRect(0, 0, width, height);

		// Draw cached background image
		if (mapImageRef.current) {
			ctx.drawImage(mapImageRef.current, 0, 0, width, height);
		}

		// Draw grid
		ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
		ctx.lineWidth = 1;

		for (let x = 0; x <= mapWidth; x++) {
			ctx.beginPath();
			ctx.moveTo(x * gridSize, 0);
			ctx.lineTo(x * gridSize, height);
			ctx.stroke();
		}

		for (let y = 0; y <= mapHeight; y++) {
			ctx.beginPath();
			ctx.moveTo(0, y * gridSize);
			ctx.lineTo(width, y * gridSize);
			ctx.stroke();
		}

		// Draw tokens
		for (const token of tokens) {
			drawToken(ctx, token, token.id === selectedTokenId);
		}
	}, [mapWidth, mapHeight, gridSize, tokens, selectedTokenId, drawToken]);

	// Mouse handlers
	const handleMouseDown = useCallback(
		(e: React.MouseEvent<HTMLCanvasElement>) => {
			const canvas = canvasRef.current;
			if (!canvas) return;

			const rect = canvas.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;
			const grid = pixelToGrid(x, y);

			// Find clicked token
			const clickedToken = tokens.find(
				(t) =>
					grid.gridX >= t.x &&
					grid.gridX < t.x + t.size &&
					grid.gridY >= t.y &&
					grid.gridY < t.y + t.size,
			);

			if (clickedToken) {
				selectToken(clickedToken.id);
				setDraggedToken(clickedToken.id);
				setDragOffset({
					x: grid.gridX - clickedToken.x,
					y: grid.gridY - clickedToken.y,
				});
			} else {
				selectToken(null);
			}
		},
		[tokens, pixelToGrid, selectToken],
	);

	const handleMouseMove = useCallback(
		(e: React.MouseEvent<HTMLCanvasElement>) => {
			if (!draggedToken) return;

			const canvas = canvasRef.current;
			if (!canvas) return;

			const rect = canvas.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;
			const grid = pixelToGrid(x, y);

			const newX = Math.max(
				0,
				Math.min(mapWidth - 1, grid.gridX - dragOffset.x),
			);
			const newY = Math.max(
				0,
				Math.min(mapHeight - 1, grid.gridY - dragOffset.y),
			);

			// Only update if position actually changed (grid snap means many mouse moves = same grid pos)
			const token = tokens.find((t) => t.id === draggedToken);
			if (token && (token.x !== newX || token.y !== newY)) {
				// Throttle socket emissions to max 10/sec during drag
				const now = Date.now();
				if (now - lastMoveEmitRef.current > 100) {
					moveToken(draggedToken, newX, newY);
					lastMoveEmitRef.current = now;
				} else {
					// Update local position without emitting to server
					useGameStore.setState((state) => ({
						tokens: state.tokens.map((t) =>
							t.id === draggedToken ? { ...t, x: newX, y: newY } : t,
						),
					}));
				}
			}
		},
		[
			draggedToken,
			dragOffset,
			pixelToGrid,
			mapWidth,
			mapHeight,
			tokens,
			moveToken,
		],
	);

	const handleMouseUp = useCallback(() => {
		if (draggedToken) {
			// Send final position to server
			const token = useGameStore
				.getState()
				.tokens.find((t) => t.id === draggedToken);
			if (token) {
				moveToken(draggedToken, token.x, token.y);
			}
		}
		setDraggedToken(null);
	}, [draggedToken, moveToken]);

	// Redraw when dependencies change
	useEffect(() => {
		draw();
	}, [draw]);

	return (
		<div
			ref={containerRef}
			className="w-full h-full overflow-auto bg-slate-900 flex items-center justify-center"
		>
			<canvas
				ref={canvasRef}
				className="cursor-crosshair"
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				onMouseLeave={handleMouseUp}
			/>
		</div>
	);
}
