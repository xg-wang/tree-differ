var zh = {

index: () => {

},

l: () => {

},

keyroots: () => {

},

traverse: () => {

},

preprocess: (dom) => {
  zh.index(dom)
  const list = zh.l(dom)
  const keyroots = zh.keyroots(dom)
  zh.traverse(dom)
  return {
    tree: dom,
    list: list,
    keyroots: keyroots
  }
}

}

module.exports = zh
