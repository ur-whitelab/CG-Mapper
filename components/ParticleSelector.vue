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
      let colorList = ['#FD3216', '#00FE35', '#6A76FC', '#FED4C4', '#FE00CE', '#0DF9FF', '#F6F926', '#FF9616', '#479B55', '#EEA6FB', '#DC587D', '#D626FF', '#6E899C', '#00B5F7', '#B68E00', '#C9FBE5', '#FF0092', '#22FFA7', '#E3EE9E', '#86CE00', '#BC7196', '#7E7DCD', '#FC6955', '#E48F72']
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