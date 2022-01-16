import * as CSS from 'csstype'

interface CssStyle<T> {
    [key: string]: T
}

interface AttrType {
    type: 'style' | 'class'
    content: string | CSS.Properties
}

interface AstCompilerProps {
    attr?: AttrType
    children?: HTMLElement[]
}

function compilerAttrs(ele:HTMLElement, attr?: AttrType) {
    if (attr) {
        switch (attr.type) {
            case 'class':
                ele.className = attr.content as string
                break
            case 'style':
                Object.keys(attr.content as CSS.Properties).forEach(styleKey => {
                    // eslint-disable-next-line max-len
                    ele.style[styleKey as unknown as number] = (attr.content as CssStyle<string>)[styleKey]
                })
                break
            default:
                break
        }
    }
}

export function astCompiler<T extends HTMLElement>(type: string, props?: AstCompilerProps):T {
    const ele = document.createElement(type)
    if (props) {
        const { attr, children } = props
        compilerAttrs(ele, attr)
        if (children) {
            children.forEach(child => ele.appendChild(child))
        }
    }
    return ele as T
}
