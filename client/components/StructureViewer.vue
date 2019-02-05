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
      sd3: null
    }
  },
  mounted: function () {
    this.updateCanvasSize()
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
    }

  },
  methods: {
    updateCanvasSize: function () {
      if (this.$refs.sequenceGraph.width !== this.viewWidth) {
        this.$refs.sequenceGraph.width = this.viewWidth
        let ctx = this.$refs.sequenceGraph.getContext('2d')
        console.log('updated: ' + this.viewWidth + ' now ' + this.$refs.sequenceGraph.width + ' canvas ' + ctx.canvas.width)
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        if (!this.sd3)
          this.sd3 = new StructureD3(this.$refs.sequenceGraph, this.smilesCanvas, (index) => { this.$emit('selection-update', index) })
        else
          this.sd3.width = this.viewWidth

        this.sd3.update(this.sequence)
      }
    }
  }
}
</script>

<style lang="scss">


</style>
