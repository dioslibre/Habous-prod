/**
 *  Copyright (c) 2016, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

import { h } from 'preact'
import { format } from 'd3-format'
import { scaleLinear, scaleLog, scalePow } from 'd3-scale'

/** @jsx h */

/**
 * A basic Axis component rendered into SVG. The component can be aligned using the
 * `position` prop, to display it above, below, left or right of a chart or other
 * visualization. Scaling of the axis is done with the `min` and `max`  The scale
 * type can be "linear" or "log", controlled with the `type` prop.
 *
 * Overall size of the SVG component is done with `width` and `height`. You can also control
 * the number of ticks with `tickCount` (for linear scales), the size of the ticks with
 * `tickSize`.
 */

const Tick = ({
  id,
  label,
  width,
  height,
  position,
  size = 10,
  extend = 0,
  align = 'top',
  labelAlign = 'adjacent',
  //transitionTime
}) => {
  /**
   *   ___________   or __________
   *       |                |label
   *     label
   */
  const renderLabel = (label, isTop, tickSize) => {
    const textStyle = {
      fontSize: 14,
      textAnchor: 'left',
      fill: '#000000',
      pointerEvents: 'none',
    }

    const baseLine = isTop ? 'baseline' : 'hanging'

    if (labelAlign === 'adjacent') {
      const x = 2
      const y = isTop ? -6 : 6
      return (
        <text
          key={`label-${label}`}
          className="tick-label"
          style={textStyle}
          textAnchor="left"
          x={x}
          y={y}
          alignmentBaseline={baseLine}
        >
          {label}
        </text>
      )
    } else if (labelAlign === 'center') {
      const x = 0
      const y = isTop ? -tickSize - 3 : tickSize + 3
      return (
        <text
          key={`label-${label}`}
          className="tick-label"
          style={textStyle}
          textAnchor="middle"
          x={x}
          y={y}
          alignmentBaseline={baseLine}
        >
          {label}
        </text>
      )
    }
  }

  const renderVerticalTick = (
    id,
    label,
    labelPosition,
    size,
    extend,
    isTop
  ) => {
    const dir = isTop ? -1 : 1
    const line = {
      x1: 0,
      y1: -dir * extend,
      x2: 0,
      y2: dir * size,
    }

    const style = { stroke: '#AAA', strokeWidth: 1 }
    const groupKey = `grp-${id}}`
    const tickKey = `tick-${id}`

    return (
      <g className="tick-grp" key={groupKey}>
        <line key={tickKey} className="tick-line" style={style} {...line} />
        {renderLabel(label, isTop, size)}
      </g>
    )
  }

  const renderHorizontalTick = (
    id,
    label,
    labelPosition,
    size,
    extend,
    isLeft
  ) => {
    const dir = isLeft ? -1 : 1
    const line = {
      x1: -dir * extend,
      y1: 0,
      x2: dir * size,
      y2: 0,
    }

    const textStyle = {
      fontSize: 14,
      textAnchor: 'left',
      fill: '#000000',
      pointerEvents: 'none',
    }
    const style = { stroke: '#AAA', strokeWidth: 1 }
    const groupKey = `grp-${id}}`
    const tickKey = `tick-${id}`

    return (
      <g className="tick-grp" key={groupKey}>
        <line key={tickKey} className="tick-line" style={style} {...line} />
        <text
          key={`label-${label}`}
          className="tick-label"
          style={textStyle}
          textAnchor={isLeft ? 'end' : 'begin'}
          alignmentBaseline="middle"
          x={isLeft ? -size - 3 : size + 3}
          y={0}
        >
          {label}
        </text>
      </g>
    )
  }

  if (align === 'top' || align === 'bottom') {
    const transform = `translate(${position}px, ${
      align === 'top' ? height : 0
    }px)`
    //const transition = `transform ${transitionTime}ms`;
    return (
      <g className="tick-grp" style={{ transform }}>
        {renderVerticalTick(id, label, position, size, extend, align === 'top')}
      </g>
    )
  } else {
    const transform = `translate(${
      align === 'left' ? width : 0
    }px,${position}px)`
    //const transition = `transform ${transitionTime}ms`;
    return (
      <g className="tick-grp" style={{ transform }}>
        {renderHorizontalTick(
          id,
          label,
          position,
          size,
          extend,
          align === 'left'
        )}
      </g>
    )
  }
}

export const Axis = ({
  width = 100,
  height = 100,
  min,
  max,
  tickCount = 2,
  tickSize = 10,
  tickExtend = 0,
  margin = 0,
  type = 'linear',
  exponent = 2,
  tickFormatSpecifier,
  specifier = '',
  absolute = false,
  standalone = true,
  labelPosition = 50,
  labelStyle = {
    fill: 'black',
    fontSize: 24,
    stroke: '#000000',
    pointerEvents: 'none',
  },
  position,
  label = '',
}) => {
  const renderAxisLabel = () => {
    let translate
    let rotate = `rotate(0)`
    let anchor = 'start'
    switch (position) {
      case 'left':
        translate = `translate(${width - labelPosition},5)`
        rotate = `rotate(-90)`
        anchor = 'end'
        break
      case 'right':
        translate = `translate(${labelPosition},5)`
        rotate = `rotate(-90)`
        anchor = 'end'
        break
      case 'top':
        translate = `translate(5, ${height - labelPosition})`
        break
      case 'bottom':
        translate = `translate(5, ${labelPosition})`
        break
      default:
      //pass
    }
    return (
      <g transform={translate}>
        <text
          transform={rotate}
          fontSize={20}
          textAnchor={anchor}
          style={labelStyle}
        >
          {label}
        </text>
      </g>
    )
  }

  const renderAxisLine = () => {
    const p = position
    if (p === 'left' || p === 'right') {
      return (
        <line
          key="axis"
          className="axis"
          style={{ stroke: '#AAA', strokeWidth: 0.5 }}
          x1={p === 'left' ? width : 0}
          y1={margin}
          x2={p === 'left' ? width : 0}
          y2={height - margin}
        />
      )
    } else {
      return (
        <line
          key="axis"
          className="axis"
          style={{ stroke: '#AAA', strokeWidth: 0.5 }}
          x1={margin}
          y1={p === 'bottom' ? 0 : height}
          x2={width - margin}
          y2={p === 'bottom' ? 0 : height}
        />
      )
    }
  }

  const renderAxisTicks = () => {
    const p = position

    let scale
    switch (type) {
      case 'linear':
        scale = scaleLinear()
          .domain([min, max])
          .range(
            p === 'left' || p === 'right'
              ? [height - margin * 2, 0]
              : [0, width - margin * 2]
          )
        break

      case 'log':
        scale = scaleLog()
          .domain([min, max])
          .range(
            p === 'left' || p === 'right'
              ? [height - margin * 2, 0]
              : [0, width - margin * 2]
          )
        break

      case 'power':
        scale = scalePow()
          .exponent(exponent)
          .domain([min, max])
          .range(
            p === 'left' || p === 'right'
              ? [height - margin * 2, 0]
              : [0, width - margin * 2]
          )
        break

      default:
      //pass
    }

    return scale.ticks(tickCount).map((tickValue) => {
      const tickPosition = scale(tickValue) + margin

      // Get a d3 format function, either from the string the user
      // supplied in the format prop, or ask the scale for its
      // suggestion
      const d3Format = specifier
        ? format(specifier)
        : scale.tickFormat(tickCount, tickFormatSpecifier)

      // The user can specify the values all be positive
      const formatter = (d) => (absolute ? d3Format(Math.abs(d)) : d3Format(d))
      const label = formatter(tickValue)

      return (
        <Tick
          key={tickValue}
          align={position}
          label={label}
          labelAlign="center"
          position={tickPosition}
          size={tickSize}
          extend={tickExtend}
          width={width}
          height={height}
        />
      )
    })
  }

  const renderAxis = () => {
    return (
      <g>
        {renderAxisLine()}
        {/* <TransitionGroup
          component="g"
          transitionName="ticks"
          transitionEnterTimeout={500}
          transitionLeaveTimeout={500}
        > */}
        {renderAxisTicks()}
        {/* </TransitionGroup> */}
        {renderAxisLabel()}
      </g>
    )
  }

  if (standalone) {
    return (
      <svg height={height} width={width}>
        {renderAxis()}
      </svg>
    )
  } else {
    return renderAxis()
  }
}
