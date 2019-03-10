<template>
  <canvas ref="sequenceGraph" width="1020" height="600"> </canvas>
</template>

<script>
import StructureD3 from './lib/structure.js'
import _ from 'lodash'
export default {
  name: 'StructureViewer',
  props: {
    sequence: String,
    smilesCanvas: String,
    viewWidth: Number,
    selectedParticle: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      sd3: null,
      valid: false
    }
  },
  mounted: function () {
    this.updateCanvasSize()
    this.$root.$on('download', this.download)
    this.$root.$on('reset', this.resetMapping)
  },
  watch: {
    sequence: _.debounce(function () {
      this.sd3.update(this.sequence)
    }, 500),

    viewWidth: function () {
      this.updateCanvasSize()
    },
    selectedParticle: function () {
      this.sd3.updateSelectedParticle(this.selectedParticle)
    },
    valid: function (v) {
      this.$emit('smiles-valid-update', v)
    }

  },
  methods: {
    updateCanvasSize: function () {
      if (this.$refs.sequenceGraph.width !== this.viewWidth) {
        this.$refs.sequenceGraph.width = this.viewWidth
        let ctx = this.$refs.sequenceGraph.getContext('2d')
        console.log('updated: ' + this.viewWidth + ' now ' + this.$refs.sequenceGraph.width + ' canvas ' + ctx.canvas.width)
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        if (!this.sd3) {
          this.sd3 = new StructureD3(this.$refs.sequenceGraph,
            this.smilesCanvas,
            (index) => { this.$emit('selection-update', index) },
            (v) => { this.valid = v })
        } else
          this.sd3.width = this.viewWidth

        this.sd3.update(this.sequence)
      }
    },
    resetMapping: function () {
      this.sd3.resetMapping()
    },
    download: function () {
      let map = this.sd3.getMapping()
      if (map) {
        this.$root.$emit('download-result', true)
        map.version = this.$root.version
        // compute name
        let name = map.smiles.replace(/[^a-z0-9]/gi, '_').toLowerCase()
        let filename = 'cgmap.' + name + '.' + map.cgnodes.length + '.json'
        let element = document.createElement('a')
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(map)))
        element.setAttribute('download', filename)

        element.style.display = 'none'
        document.body.appendChild(element)

        element.click()

        document.body.removeChild(element)
      } else
        this.$root.$emit('download-result', false)
    }
  }
}
</script>

<style lang="scss">


</style>
