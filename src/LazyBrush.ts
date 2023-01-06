import { LazyPoint, Point } from './LazyPoint'

const RADIUS_DEFAULT = 30

interface LazyBrushOptions {
  radius?: number
  enabled?: boolean
  initialPoint?: Point
}

interface LazyBrushUpdateOptions {
  both?: boolean
  friction?: number
}

class LazyBrush {
  _isEnabled: boolean
  _hasMoved: boolean
  radius: number
  pointer: LazyPoint
  brush: LazyPoint
  angle: number
  distance: number

  velocity: LazyPoint

  /**
   * constructor
   */
  constructor(options: LazyBrushOptions = {}) {
    const initialPoint = options.initialPoint || { x: 0, y: 0 }
    this.radius = options.radius || RADIUS_DEFAULT
    this._isEnabled = options.enabled === true ? true : false

    this.pointer = new LazyPoint(initialPoint.x, initialPoint.y)
    this.brush = new LazyPoint(initialPoint.x, initialPoint.y)
    this.velocity = new LazyPoint(initialPoint.x, initialPoint.y)

    this.angle = 0
    this.distance = 0
    this._hasMoved = false
  }

  /**
   * Enable lazy brush calculations.
   *
   */
  enable(): void {
    this._isEnabled = true
  }

  /**
   * Disable lazy brush calculations.
   *
   */
  disable(): void {
    this._isEnabled = false
  }

  /**
   * @returns {boolean}
   */
  isEnabled(): boolean {
    return this._isEnabled
  }

  /**
   * Update the radius
   *
   * @param {number} radius
   */
  setRadius(radius: number): void {
    this.radius = radius
  }

  /**
   * Return the current radius
   *
   * @returns {number}
   */
  getRadius(): number {
    return this.radius
  }

  /**
   * Return the brush coordinates as a simple object
   *
   * @returns {object}
   */
  getBrushCoordinates(): Point {
    return this.brush.toObject()
  }

  /**
   * Return the pointer coordinates as a simple object
   *
   * @returns {object}
   */
  getPointerCoordinates(): Point {
    return this.pointer.toObject()
  }

  /**
   * Return the brush as a LazyPoint
   *
   * @returns {LazyPoint}
   */
  getBrush(): LazyPoint {
    return this.brush
  }

  /**
   * Return the pointer as a LazyPoint
   *
   * @returns {LazyPoint}
   */
  getPointer(): LazyPoint {
    return this.pointer
  }

  /**
   * Return the angle between pointer and brush
   *
   * @returns {number} Angle in radians
   */
  getAngle(): number {
    return this.angle
  }

  /**
   * Return the distance between pointer and brush
   *
   * @returns {number} Distance in pixels
   */
  getDistance(): number {
    return this.distance
  }

  /**
   * Return if the previous update has moved the brush.
   *
   * @returns {boolean} Whether the brush moved previously.
   */
  brushHasMoved(): boolean {
    return this._hasMoved
  }

  /**
   * Updates the pointer point and calculates the new brush point.
   */
  update(
    newPointerPoint: Point,
    options: LazyBrushUpdateOptions = {}
  ): boolean {
    this._hasMoved = false
    if (
      this.pointer.equalsTo(newPointerPoint) &&
      !options.both &&
      !options.friction
    ) {
      return false
    }

    this.pointer.update(newPointerPoint)

    if (options.both) {
      this._hasMoved = true
      this.brush.update(newPointerPoint)
      return true
    }

    if (this._isEnabled) {
      this.distance = this.pointer.getDistanceTo(this.brush)
      this.angle = this.pointer.getAngleTo(this.brush)

      const isOutside = Math.round((this.distance - this.radius) * 10) / 10 > 0
      const friction =
        options.friction && options.friction < 1
          ? Math.min(Math.max(options.friction, 0.01), 1)
          : undefined

      if (isOutside) {
        this.brush.moveByAngle(
          this.angle,
          this.distance - this.radius,
          friction
        )
        this._hasMoved = true
      }
    } else {
      this.distance = 0
      this.angle = 0
      this.brush.update(newPointerPoint)
      this._hasMoved = true
    }

    return true
  }
}

export default LazyBrush
