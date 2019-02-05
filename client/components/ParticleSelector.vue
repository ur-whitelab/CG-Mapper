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
      selected: 0
    }
  },
  methods: {
    addParticle: function () {
      this.particles.push({
        index: this.particles.length
      })
    },
    updateSelected: function (s) {
      let colorList = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']
      this.$refs.nav.children[this.selected].style['background-color'] = ''
      this.$refs.nav.children[s].style['background-color'] = colorList[s]
      this.$emit('selected-update', s)
      this.selected = s
    }
  }
}
</script>