'use client';
import { assert } from 'console';
import { useEffect, useRef, useCallback, useState } from 'react';

// Constants for cell states
const ALIVE = 1;
const DEAD = 0;

// Configuration constants
const CELL_SIZE = 6; // Size of each cell in pixels
const UPDATE_INTERVAL = 1000 / 60; // Animation speed (frames per second)

export default function GameOfLife() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cellsGridRef = useRef<number[][]>([]);
    const cellsToAddRef = useRef<{x: number, y: number, newValue: number}[]>([]);
    const [windowInnerDimensions, setWindowInnerDimensions] = useState<{width: number, height: number}>({width: 0, height: 0});

    // Function to draw a single cell
    const drawCell = useCallback((x: number, y: number, cell: number, context: CanvasRenderingContext2D) => {
        context.fillStyle = cell === ALIVE ? 'white' : 'black';
        // Adjust position and size based on CELL_SIZE
        context.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

        context.fillStyle = 'black';
        context.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }, []);

    // Function to count alive neighbours of a cell
    const getNeighbourCount = useCallback((grid: number[][], x: number, y: number) => {
        let count = 0;
        const width = grid.length;
        const height = grid[0].length;
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue; // Skip the cell itself
                // Wrap around the grid edges
                const newX = (x + dx + width) % width;
                const newY = (y + dy + height) % height;
                count += grid[newX][newY];
            }
        }
        return count;
    }, []);

    // Function to initialize the grid with random cells
    const initCellsGrid = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Calculate grid size based on canvas size and CELL_SIZE
        const width = Math.floor(canvas.width / CELL_SIZE);
        const height = Math.floor(canvas.height / CELL_SIZE);

        // Create a new grid with random alive and dead cells
        const newGrid = Array.from({ length: width }, () =>
            Array.from({ length: height }, () => Math.random() > 0.8 ? ALIVE : DEAD)
        );

        cellsGridRef.current = newGrid;
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        // Draw the initial grid
        newGrid.forEach((row, x) => {
            row.forEach((cell, y) => {
                drawCell(x, y, cell, context);
            });
        });
    }, [drawCell]);

    // Function to run the Game of Life rules
    const run = useCallback(() => {
        const canvas = canvasRef.current as HTMLCanvasElement;
        const context = canvas && canvas.getContext('2d') as CanvasRenderingContext2D;
        const cellsToEdit: {x: number, y: number, newValue: number}[] = cellsToAddRef.current; // Array to keep track of cells to update

        // Calculate the next state for each cell
        const newGrid = cellsGridRef.current.map((row, x) =>
            row.map((cell, y) => {
                const neighbors = getNeighbourCount(cellsGridRef.current, x, y);
                if (cell === ALIVE && (neighbors < 2 || neighbors > 3)) {
                    cellsToEdit.push({ x, y, newValue: DEAD });
                } else if (cell === DEAD && neighbors === 3) {
                    cellsToEdit.push({ x, y, newValue: ALIVE });
                }
                return cell;
            })
        );

        // Update the cells that changed
        cellsToEdit.forEach(({ x, y, newValue }) => {
            context && drawCell(x, y, newValue, context);
            newGrid[x][y] = newValue;
        });

        cellsGridRef.current = newGrid;
        cellsToAddRef.current = [];
    }, [getNeighbourCount, drawCell]);

    const placeRandomCells = (radius: number, prob: number, x:number, y: number, width: number, height: number, context: CanvasRenderingContext2D) => {
        const newCellX = Math.floor(Math.random() * width / CELL_SIZE);
        const newCellY = Math.floor(Math.random() * height / CELL_SIZE);

        for(let dx = -radius; dx <= radius; dx++) {
            for(let dy = -radius; dy <= radius; dy++) {
                if (!cellsGridRef.current[newCellX + dx] || !cellsGridRef.current[newCellX + dx][newCellY + dy]) continue;
                if (cellsGridRef.current[newCellX + dx][newCellY + dy] === ALIVE && Math.random() > prob) {
                    cellsToAddRef.current.push({x: newCellX + dx, y: newCellY + dy, newValue: ALIVE});
                }
            }
        }
    }

    // Create cells on mouse move
    const onMouseMove = (event: MouseEvent) => {
        const canvas = canvasRef.current as HTMLCanvasElement;
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        placeRandomCells(3, 0.7, event.clientX, event.clientY, canvas.width, canvas.height, context);
    }

    // Create cells on mouse click
    const onMouseClick = (event: MouseEvent) => {
        const canvas = canvasRef.current as HTMLCanvasElement;
        const context = canvas.getContext('2d') as CanvasRenderingContext2D;
        placeRandomCells(5, 0.8, event.pageX, event.pageY, canvas.width, canvas.height, context);
    }

    // Effect to initialize and run the game
    useEffect(() => {
        initCellsGrid();
        const runAnimation = () => {
            run();
            setTimeout(() => requestAnimationFrame(runAnimation), UPDATE_INTERVAL);
        };
        const animationFrameId = requestAnimationFrame(runAnimation);
        return () => cancelAnimationFrame(animationFrameId);
    }, [initCellsGrid, run, windowInnerDimensions]);

    // Effect to handle window resize
    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            if (canvas) {
                setWindowInnerDimensions({width: window.innerWidth, height: window.innerHeight});
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                initCellsGrid(); // Re-initialize the grid on resize
            }
        };
        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('click', onMouseClick);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('click', onMouseClick);
        }
    }, [initCellsGrid]);

    // Effect to init window dimensions
    useEffect(() => {
        setWindowInnerDimensions({width: window.innerWidth, height: window.innerHeight});
    }, [setWindowInnerDimensions]);

    return <canvas ref={canvasRef} width={windowInnerDimensions.width} height={windowInnerDimensions.height} />;
}
