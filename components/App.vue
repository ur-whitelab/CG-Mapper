<template>
<div>
  <section>
    <div class="container">
      <div class="columns is-centered">
        <div class="column ">
          <h1 class="is-size-4 is-spaced bd-anchor-title">Enter Smiles</h1>
          <div class="field has-addons">
            <div ref="sequencecontainer" class="control is-expanded">
              <smiles-input :smilesValid="smilesValid" v-on:smiles-update="sequence = $event"> </smiles-input>
            </div>
            <div class="control">
              <a class="button is-info">
                Enter
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section>
    <particle-selector :smilesValid="smilesValid" v-on:selected-update="selectedParticle = $event"></particle-selector>
  </section>
    <section class="hero is-primary  is-bold">
    <div class="hero-body" style="padding: 0px;">
      <div class="container">
        <structure-viewer  v-on:smiles-valid-update="smilesValid = $event"
          :selectedParticle="selectedParticle"
          :sequence="sequence" smiles-canvas="smiles-canvas"
          :view-width="viewWidth"
          v-on:selection-update="selectedIndex = $event"></structure-viewer>
        <div class="container">
        </div>
      </div>
    </div>
  </section>
  <section>
    <div class="container">
      <div class="columns is-centered is-vcentered is-mobile">
        <div class="column has-text-centered">
          <canvas id="smiles-canvas" width="960" height="200"> </canvas>
          </div>
       </div>
    </div>
  </section>
</div>
</template>

<script>
import StructureViewer from './StructureViewer'
import SmilesInput from './SmilesInput'
import ParticleSelector from './ParticleSelector'

export default {
  name: 'App',
  components: { StructureViewer, SmilesInput, ParticleSelector },
  data () {
    return {
      sequence: '',
      selectedParticle: 0,
      viewWidth: 800,
      selectedIndex: -1,
      smilesValid: false
    }
  },
  mounted: function () {
    this.viewWidth = this.$refs.sequencecontainer.offsetWidth
  }
}
</script>

<style lang="scss">
@import "style/style.scss";


.floating-hero {
  position: absolute;
  left: 0px;
  top: 0px;
  padding: 0.75rem;
  z-index: 2;
}

#smiles-canvas {
  text-align: center;
}

section {
  margin-bottom: 1.5em;
}

.tile {
  padding: (0.75rem / 2);
}
.card-footer {
  position: absolute;
  bottom: 0rem;
}
footer {
  position: absolute;
  bottom: 0rem;
}
</style>
