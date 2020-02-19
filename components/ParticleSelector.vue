<template>
  <div class="container">
    <div class="tabs is-toggle">
      <ul ref="nav">
        <li class="" v-for="particle in particles">
          <a v-on:click="updateSelected(particle.index)">
            <span>Particle {{particle.index}}</span>
          </a>
        </li>
        <li>
            <a v-on:click="addParticle">
                <span>+</span>
            </a>
        </li>
      </ul>
    </div>
    <div class="field is-grouped">
        <p class="control">
        <button class="button" v-on:click="reset()">
          Reset Mapping
        </button>
        </p>
      <p class="control">
        <button class="button" v-on:click="$root.$emit('download')"
        :disabled="!smilesValid">
          Download
          </button>
      </p>
      <p v-if="!downloadResult" class="help is-danger">
        Incomplete Mapping
        </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ParticleSelector',
  data () {
    return {
      particles: [
        {
          index: 0
        }
      ],
      selected: 0,
      downloadResult: true
    }
  },
  mounted: function () {
    this.$root.$on('download-result', (v) => {
      this.downloadResult = v
    })
  },
  props: {
    smilesValid: Boolean
  },
  methods: {
    addParticle: function () {
      this.particles.push({
        index: this.particles.length
      })
    },
    updateSelected: function (s) {
      let colorList = ['#2E91E5', '#E15F99', '#1CA71C', '#FB0D0D', '#DA16FF', '#222A2A', '#B68100', '#750D86', '#EB663B', '#511CFB', '#00A08B', '#FB00D1', '#FC0080', '#B2828D', '#6C7C32', '#778AAE', '#862A16', '#A777F1', '#620042', '#1616A7', '#DA60CA', '#6C4516', '#0D2A63', '#AF0038']
      this.$refs.nav.children[this.selected].style['background-color'] = ''
      this.$refs.nav.children[s].style['background-color'] = colorList[s]
      this.$emit('selected-update', s)
      this.selected = s
    },
    download: function () {
      this.$emit('download-mapping')
    },
    reset: function () {
      this.selected = 0
      this.particles = [{index: 0}]
      this.$root.$emit('reset')
    }
  }
}
</script>