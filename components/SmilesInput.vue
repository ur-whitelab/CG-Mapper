<template>
  <input id="smiles" class="input" spellcheck="false"
  autocorrect="off" type="text" placeholder="Smiles String"
  v-bind:class="{'is-danger': !smilesValid && smiles.length > 0, 'is-success': smilesValid && smiles.length > 0}"
  v-model="internalSmiles" @keydown="onKeyDown" @keyup="lastKeyCode = 0">
</template>

<script>
// https://stackoverflow.com/questions/46289311/vue-limit-characters-in-text-area-input-truncate-filter
export default {
  name: 'SmilesInput',
  data () {
    return {
      smiles: '',
      pattern: 'acdefghiklmnopqrstuvwyACDEFGHIKLMNOPQRSTVWY.-=#*@$:/()',
      lastKeyCode: 0
    }
  },
  props: {
    smilesValid: Boolean
  },
  mounted: function () {
    // convert pattern to list of integers
    this.pattern = this.pattern.split('').map((x) => { return x.charCodeAt(0) })
  },
  computed: {
    internalSmiles: {
      get: function () { return this.smiles },
      set: function (v) {
        this.smiles = v
        this.$emit('smiles-update', v)
      }

    }
  },
  methods: {
    onKeyDown: function (evt) {
      this.lastKeyCode = evt.keyCode
      // do this instead of rex so it's faster
      // check if it's a control character
    //   if (evt.keyCode >= 48 && evt.keyCode <= 90) {
    //     // check for ctrl, so we don't eat hot keys
    //     if (this.lastKeyCode !== 17 && this.pattern.indexOf(evt.keyCode) < 0)
    //       evt.preventDefault()
    //   } else if (evt.keyCode >= 186 || evt.keyCode === 32) {
    //     // punctuation and space
    //     evt.preventDefault()
    //   }
    //   this.lastKeyCode = evt.keyCode
    }
  }
}
</script>

<style lang="scss">
@import "style/style.scss";
#smiles {
  font-family: $family-mono;
}
</style>
