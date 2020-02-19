import {event, select} from 'd3-selection'
import {forceSimulation} from 'd3-force'
import {drag} from 'd3-drag'
import * as SmilesDrawer from 'smiles-drawer'

class StructureD3 {
  constructor (canvas, smilesCanvas, selectionListener, smilesParseCallback) {
    this.canvas = canvas
    this.smilesParseCallback = smilesParseCallback
    this.smilesCanvas = smilesCanvas
    this.context = canvas.getContext('2d')
    this.width = canvas.offsetWidth
    this.height = canvas.offsetHeight
    this.selected = [[]]
    this.colorList = ['#FD3216', '#00FE35', '#6A76FC', '#FED4C4', '#FE00CE', '#0DF9FF', '#F6F926', '#FF9616', '#479B55', '#EEA6FB', '#DC587D', '#D626FF', '#6E899C', '#00B5F7', '#B68E00', '#C9FBE5', '#FF0092', '#22FFA7', '#E3EE9E', '#86CE00', '#BC7196', '#7E7DCD', '#FC6955', '#E48F72']
    this.selectionListener = selectionListener
    let options = {
      debug: false,
      atomVisualization: 'default',
      explicitHydrogens: true,
      compactDrawing: false,
      terminalCarbons: false,
      width: this.width,
      height: this.height
    }
    this.drawer = new SmilesDrawer.Drawer(options)

    this.simulation = forceSimulation()

    select(canvas)
      .call(drag()
        .container(canvas)
        .subject(() => this.simulation.find(event.x, event.y))
        .on('start', () => {
          if (!event.active) this.simulation.alphaTarget(0.3).restart()
          event.subject.fx = event.subject.x
          event.subject.fy = event.subject.y
          let index = this.selected[this.selectedParticle].indexOf(event.subject.id)
          if (index === -1) {
            // first remove from any other location
            this.selected.forEach((a, i) => {
              let otherIndex = a.indexOf(event.subject.id)
              if (otherIndex !== -1)
                this.selected[i].splice(otherIndex, 1)
            })
            // now add
            this.selected[this.selectedParticle].push(event.subject.id)
          } else
            this.selected[this.selectedParticle].splice(index, 1)
          this.selectionListener(event.subject.id)
        })
        .on('end', () => {
          if (!event.active) this.simulation.alphaTarget(0)
          event.subject.fx = null
          event.subject.fy = null
        }))

    // default size
    this.radius = 250
    this.selectedParticle = 0
    this.simulation.on('tick', this.ticked.bind(this))
    this.update('')
  }

  getMapping () {
    // see if mapping includes all
    this.nodes.forEach((n) => {
      n['cg'] = -1
    })
    let filteredCG = this.selected.filter((s) => s.length > 0)
    filteredCG.forEach((a, i) => {
      a.forEach((j) => {
        this.nodes[j].cg = i
      })
    })
    let valid = true
    this.nodes.forEach((n) => {
      valid = valid && n.cg >= 0
    })
    if (valid) {
      // filter out forces/velocities which don't mean anything
      let filtered = this.nodes.map((n) => {
        return {'cg': n.cg, 'element': n.name, 'id': n.id}
      })
      return {'cgnodes': filteredCG, 'nodes': filtered, 'edges': this.edges, 'smiles': this.smiles}
    }
    return null
  }

  resetMapping () {
    this.selected = [[]]
    this.selectedParticle = 0
    this.drawNodes()
  }

  convertCoords (x, y, scale) {
    return {
      x: (x + this.drawer.canvasWrapper.offsetX) * scale,
      y: (y + this.drawer.canvasWrapper.offsetY) * scale
    }
  }

  /**
   * Taken from Smiles Drawer so we can actually get the scale
   * Scale the canvas based on vertex positions.
   *
   * @param {Vertex[]} vertices An array of vertices containing the vertices associated with the current molecule.
   */
  scale (vertices) {
    // Figure out the final size of the image
    let maxX = -Number.MAX_VALUE
    let maxY = -Number.MAX_VALUE
    let minX = Number.MAX_VALUE
    let minY = Number.MAX_VALUE

    for (var i = 0; i < vertices.length; i++) {
      let p = vertices[i].position

      if (maxX < p.x) maxX = p.x
      if (maxY < p.y) maxY = p.y
      if (minX > p.x) minX = p.x
      if (minY > p.y) minY = p.y
    }

    // Add padding
    var padding = this.drawer.canvasWrapper.opts.padding
    maxX += padding
    maxY += padding
    minX -= padding
    minY -= padding

    var drawingWidth = maxX - minX
    var drawingHeight = maxY - minY

    var scaleX = this.canvas.offsetWidth / drawingWidth
    var scaleY = this.canvas.offsetHeight / drawingHeight

    var scale = (scaleX < scaleY) ? scaleX : scaleY
    return scale
  }

  update (smiles) {
    if (!smiles)
      return
    this.context.clearRect(0, 0, this.width, this.height)
    this.smiles = smiles
    SmilesDrawer.parse(smiles, (tree) => {
      // Draw to the canvas
      this.drawer.draw(tree, this.canvas, 'light', false)
      // recreate point scale, which is reset at this point
      let scale = this.scale(this.drawer.graph.vertices)
      this.nodes = this.drawer.graph.vertices.map((v, i) => {
        let o = {name: v.value.element, id: i}
        let p = this.convertCoords(v.position.x, v.position.y, scale)
        o['x'] = p.x
        o['y'] = p.y
        return o
      })

      this.edges = this.drawer.graph.edges.map((e, i) => { return {source: e.sourceId, target: e.targetId, bondtype: e.bondType} })

      // adjust drawing properties
      // Have upper/lower bound for sizes
      this.radius = Math.min(50, Math.max(10, 250 / (this.nodes.length + 1)))
      this.context.font = `${Math.round(Math.max(10, 72 / Math.sqrt(1 + this.nodes.length)))}px sans-serif`

      // update simulation nodes
      this.simulation.nodes(this.nodes)
      this.simulation.alphaTarget(0.3).restart()
      this.drawNodes()
      this.smilesParseCallback(true)
    }, () => {
      // error callback
      this.smilesParseCallback(false)
      this.nodes = []
      this.simulation.nodes(this.nodes)
      this.context.clearRect(0, 0, this.width, this.height)
    })
  }

  ticked () {
    this.drawNodes()
  }

  drawNodes () {
    if (!this.nodes)
      return

    this.context.beginPath()
    this.nodes.forEach((d) => {
      this.context.moveTo(d.x + this.radius, d.y)
      this.context.arc(d.x, d.y, this.radius, 0, 2 * Math.PI)
    })
    // remove lines inside the cirlce
    this.context.fillStyle = '#FFF'
    this.context.fill()
    this.context.strokeStyle = '#666'
    this.context.stroke()

    // handle selection
    this.selected.forEach((sarray, i) => {
      sarray.forEach((s) => {
        this.context.beginPath()
        this.context.fillStyle = this.colorList[i]
        this.context.moveTo(this.nodes[s] + this.radius, this.nodes[s].y)
        this.context.arc(this.nodes[s].x, this.nodes[s].y, this.radius, 0, 2 * Math.PI)
        this.context.fill()
        this.context.strokeStyle = '#666'
        this.context.stroke()
      })
    })

    this.context.fillStyle = '#444'
    this.context.textAlign = 'center'
    this.context.textBaseline = 'middle'
    this.nodes.forEach((d) => {
      this.context.fillText(d.name.toUpperCase(), d.x, d.y)
    })
  }

  updateSelectedParticle (s) {
    this.selectedParticle = s
    while (s >= this.selected.length)
      this.selected.push([])
  }
}

export default StructureD3
