import * as util from './utils.js'
import TwoView from '../src/TwoView.js'
import ColorMap from '../src/ColorMap.js'

/**
 * Basic 2D view.
 *
 */
class TwoDraw extends TwoView {
    static defaultOptions(model) {
        return {
            patchesColor: 'random',
            initPatches: null,

            turtles: model.turtles,
            turtlesColor: 'random',
            turtlesStrokeColor: 'random',
            turtlesShape: 'dart',
            turtlesSize: 1,
            turtlesRotate: true,

            links: model.links,
            linksColor: 'random',
            linksWidth: 1,

            textProperty: null,
            textSize: 0.5,
            textColor: 'black',

            patchesMap: 'DarkGray',
            turtlesMap: 'Basic16',
        }
    }
    static drawKeys() {
        const defaults = this.defaultOptions({})
        return Object.keys(defaults)
    }
    static separateDrawOptions(viewOptions, drawOptions) {
        if (viewOptions.drawOptions) {
            // drawOptions = viewOptions.drawOptions
            Object.assign(drawOptions, viewOptions.drawOptions)
            delete viewOptions.drawOptions
        }

        const keys = TwoDraw.drawKeys()
        keys.forEach(k => {
            if (viewOptions[k]) {
                drawOptions[k] = viewOptions[k]
                delete viewOptions[k]
            }
        })

        return drawOptions
        // return [viewOptions, drawOptions]
    }

    static fullScreenOptions(patchSize, background = 'black', margin = 10) {
        document.body.style.backgroundColor = background
        document.body.style.margin = `${margin}px`

        const width = window.innerWidth - 2 * margin // - 2
        const height = window.innerHeight - 2 * margin // - 2

        const maxX = Math.floor(width / (2 * patchSize))
        const maxY = Math.floor(height / (2 * patchSize))
        const maxZ = 1

        return {
            maxX: maxX,
            maxY: maxY,
            maxZ: maxZ,
            minX: -maxX,
            minY: -maxY,
            minZ: -maxZ,
        }
    }
    // ======================

    constructor(model, viewOptions = {}, drawOptions = {}) {
        // if (viewOptions.drawOptions) {
        //     drawOptions = viewOptions.drawOptions
        //     delete viewOptions.drawOptions
        // }

        // ;[viewOptions, drawOptions] =
        drawOptions = TwoDraw.separateDrawOptions(viewOptions, drawOptions)

        drawOptions = Object.assign(TwoDraw.defaultOptions(model), drawOptions)

        super(model, viewOptions) // TwoView
        this.model = model

        this.checkOptions(drawOptions)
        this.drawOptions = drawOptions
    }

    // The parameters are easily mistaken: check they are all in the defaults.
    checkOptions(drawOptions) {
        const keys = Object.keys(drawOptions)
        const defaults = TwoDraw.defaultOptions(this.model)

        keys.forEach(k => {
            if (defaults[k] === undefined) {
                console.log(
                    'Legal TwoDraw parameters',
                    Object.keys(TwoDraw.defaultOptions(this.model))
                )
                throw Error('Unknown TwoDraw parameter: ' + k)
            }
        })

        if (typeof drawOptions.patchesMap === 'string') {
            drawOptions.patchesMap = ColorMap[drawOptions.patchesMap]
            if (!drawOptions.patchesMap)
                Error('Unknown patchMap: ' + drawOptions.patchesMap)
        }
        if (typeof drawOptions.turtlesMap === 'string') {
            drawOptions.turtlesMap = ColorMap[drawOptions.turtlesMap]
            if (!drawOptions.turtlesMap)
                Error('Unknown turtlesMap: ' + drawOptions.turtlesMap)
        }
    }

    resetOptions(drawOptions = this.drawOptions) {
        // if (drawOptions !== this.drawOptions)
        //     drawOptions = Object.assign(
        //         {},
        //         TwoDraw.defaultOptions(),
        //         drawOptions
        //     )
        // drawOptions = Object.assign({}, TwoDraw.defaultOptions(), drawOptions)
        this.checkOptions(drawOptions)
        this.drawOptions = drawOptions
        this.ticks = 0
        this.draw()
        // this.view.ticks = 0
        // return drawOptions
    }

    // reset(drawOptions = this.drawOptions) {
    //     // this.resetOptions(drawOptions)
    //     // this.patchesView = new PatchesView(this.world.numX, this.world.numY)
    //     // this.turtlesView = new TurtlesView(this.ctx, this.world, options)
    //     // super.reset()
    //     super.initView()
    //     this.ticks = 0
    //     // this.clear()
    //     // super.reset(this.viewOptions.patchSize)
    //     // this.draw()
    // }
    // reset(redraw = true) {
    //     this.ticks = 0
    //     if (redraw) this.draw()
    //     super.reset()
    // }
    reset(patchesSize) {
        this.ticks = 0
        super.reset(patchesSize)
        this.draw()
    }

    setValue(key, val) {
        if (key === 'patchesSize') {
            this.reset(val)
            return
        }

        // const keys = TwoDraw.drawKeys()
        // keys.unshift('patchesSize')
        const keys = ['patchesSize'].concat(TwoDraw.drawKeys())
        if (!keys.includes(key)) {
            throw new Error(`setValue: ${key} not a valid TwoDraw key. Valid keys:
            ${keys.join()}`)
        }
        this.drawOptions[key] = val
        this.draw()
    }

    draw() {
        // params = Object.assign({}, TwoDraw.defaultOptions(), params)
        const model = this.model
        const view = this
        let {
            // data,
            patchesColor,
            initPatches,

            turtles,
            turtlesColor,
            turtlesStrokeColor,
            turtlesShape,
            turtlesSize,
            turtlesRotate,

            links,
            linksColor,
            linksWidth,

            textProperty,
            textSize,
            textColor,

            patchesMap,
            turtlesMap,
        } = this.drawOptions
        // const { model, view } = this

        if (view.ticks === 0) {
            if (textProperty) view.setTextProperties(textSize)

            if (initPatches) {
                // colors is an array of typedColors or pixels:
                const colors = initPatches(model, view)
                view.createPatchPixels(i => colors[i])
                // console.log(colors)
            } else if (patchesColor === 'random') {
                // NOTE: random colors only done once for patches.
                view.createPatchPixels(i => patchesMap.randomColor())
            }
        }

        // if (patchesColor === 'random' || initPatches) {
        //     view.clear() // patch transparent pixels do not clear the canvas!
        //     view.drawPatches() // redraw cached patches colors onto our view canvas
        // } else if (typeof patchesColor === 'function') {
        //     view.drawPatches(model.patches, p => patchesColor(p))
        // } else if (util.isImageable(patchesColor)) {
        //     view.drawPatchesImage(patchesColor)
        // } else {
        //     view.clear(patchesColor)
        // }

        if (util.isImageable(patchesColor)) {
            view.drawPatchesImage(patchesColor)
        } else {
            if (patchesColor === 'random' || initPatches) {
                view.clear() // patch transparent pixels do not clear the canvas!
                view.drawPatches() // redraw cached patches colors onto our view canvas
            } else if (util.isFunction(patchesColor)) {
                view.clear()
                view.drawPatches(model.patches, p => patchesColor(p))
            } else {
                view.clear(patchesColor)
            }
        }

        const checkColor = (agent, color) =>
            color === 'random' ? turtlesMap.atIndex(agent.id).css : color

        view.drawLinks(links, l => ({
            color:
                linksColor === 'random'
                    ? turtlesMap.atIndex(l.id)
                    : typeof linksColor === 'function'
                    ? checkColor(l, linksColor(l))
                    : linksColor,
            // width: linksWidth,
            width:
                typeof linksWidth === 'function' ? linksWidth(l) : linksWidth,
        }))

        view.drawTurtles(turtles, t => ({
            shape:
                typeof turtlesShape === 'function'
                    ? turtlesShape(t)
                    : turtlesShape,
            color:
                turtlesColor === 'random'
                    ? turtlesMap.atIndex(t.id).css
                    : typeof turtlesColor === 'function'
                    ? checkColor(t, turtlesColor(t))
                    : turtlesColor,
            strokeColor:
                turtlesStrokeColor === 'random'
                    ? turtlesMap.atIndex(t.id + 4).css
                    : typeof turtlesColor === 'function'
                    ? checkColor(t, turtlesColor(t))
                    : turtlesColor,
            size:
                typeof turtlesSize === 'function'
                    ? turtlesSize(t)
                    : turtlesSize,
            noRotate:
                typeof turtlesRotate === 'function'
                    ? !turtlesRotate(t)
                    : !turtlesRotate,
        }))

        if (textProperty) {
            turtles.ask(t => {
                if (t[textProperty] != null)
                    view.drawText(t[textProperty], t.x, t.y, textColor)
            })
        }

        view.tick()
    }
}

export default TwoDraw
