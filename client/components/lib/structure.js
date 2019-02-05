import {event, select} from 'd3-selection'
import {forceSimulation, forceManyBody, forceLink} from 'd3-force'
import {drag} from 'd3-drag'
import * as SmilesDrawer from 'smiles-drawer'

class StructureD3 {
  constructor (canvas, smilesCanvas, selectionListener) {
    this.canvas = canvas
    this.smilesCanvas = smilesCanvas
    this.context = canvas.getContext('2d')
    this.width = canvas.width
    this.height = canvas.height
    this.selected = [[]]
    this.colorList = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']
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
      .force('link', forceLink().distance(this.width / 20))
      .force('repel', forceManyBody().strength(-150).distanceMax(5))

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
        .on('drag', () => {
          event.subject.fx = event.x
          event.subject.fy = event.y
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

  convertCoords (x, y) {
    return {
      x: x / this.drawer.canvasWrapper.drawingWidth * this.width,
      y: y / this.drawer.canvasWrapper.drawingHeight * this.height * 0.4
    }
  }

  update (sequence) {
    if (!sequence)
      return
    SmilesDrawer.parse(sequence, (tree) => {
      // Draw to the canvas
      this.drawer.draw(tree, this.smilesCanvas, 'light', false)
      this.nodes = this.drawer.graph.vertices.map((v, i) => {
        let o = {name: v.value.element, id: i}
        let p = this.convertCoords(v.position.x, v.position.y)
        o['x'] = p.x
        o['y'] = p.y
        return o
      })
      this.links = this.drawer.graph.edges.map((e, i) => { return {source: e.sourceId, target: e.targetId} })
      // keep data for existing nodes

      // give new one a kick
      if (this.nodes.length > 0)
        this.nodes[this.nodes.length - 1].vx = 0.0

      // remove selection if too big

      // adjust drawing properties
      // Have upper/lower bound for sizes
      this.radius = Math.min(50, Math.max(10, 250 / (this.nodes.length + 1)))
      this.simulation.force('repel').distanceMax(this.radius * 3)
      this.context.font = `${Math.round(Math.max(10, 72 / Math.sqrt(1 + this.nodes.length)))}px sans-serif`

      // update forces
      this.simulation.nodes(this.nodes)
      this.simulation.force('link').links(this.links)
      this.simulation.force('link').distance(this.width / Math.min(this.nodes.length, 25))
      this.simulation.alphaTarget(0.3).restart()
    })
  }

  ticked () {
    if (!this.nodes)
      return
    this.context.clearRect(0, 0, this.width, this.height)

    this.context.beginPath()
    this.links.forEach((e) => {
      this.context.moveTo(e.source.x, e.source.y)
      this.context.lineTo(e.target.x, e.target.y)
    })
    this.context.strokeStyle = '#a7a4a4'
    this.context.stroke()

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
