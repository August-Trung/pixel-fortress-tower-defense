import { TILE_SIZE } from './data/mapData.js';

export default class InputHandler {
  constructor(canvas, callbacks) {
    this.canvas = canvas;
    this.callbacks = callbacks; // { onClick, onMouseMove, onRightClick }
    this.boundHandleClick = this.handleClick.bind(this);
    this.boundHandleMouseMove = this.handleMouseMove.bind(this);
    this.boundHandleContextMenu = this.handleContextMenu.bind(this);
    this.init();
  }

  init() {
    this.canvas.addEventListener('click', this.boundHandleClick);
    this.canvas.addEventListener('mousemove', this.boundHandleMouseMove);
    this.canvas.addEventListener('contextmenu', this.boundHandleContextMenu);
  }

  destroy() {
    this.canvas.removeEventListener('click', this.boundHandleClick);
    this.canvas.removeEventListener('mousemove', this.boundHandleMouseMove);
    this.canvas.removeEventListener('contextmenu', this.boundHandleContextMenu);
  }

  getMouseGridPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Accounts for scale transformations if canvas display size differs from logical size
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    const canvasX = x * scaleX;
    const canvasY = y * scaleY;

    const gridX = Math.floor(canvasX / TILE_SIZE);
    const gridY = Math.floor(canvasY / TILE_SIZE);

    return { gridX, gridY, canvasX, canvasY };
  }

  handleClick(e) {
    const pos = this.getMouseGridPos(e);
    if (this.callbacks && this.callbacks.onClick) {
      this.callbacks.onClick(pos.gridX, pos.gridY);
    }
  }

  handleMouseMove(e) {
    const pos = this.getMouseGridPos(e);
    if (this.callbacks && this.callbacks.onMouseMove) {
      this.callbacks.onMouseMove(pos.gridX, pos.gridY, pos.canvasX, pos.canvasY);
    }
  }

  handleContextMenu(e) {
    e.preventDefault();
    if (this.callbacks && this.callbacks.onRightClick) {
      this.callbacks.onRightClick();
    }
  }
}
