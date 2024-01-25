import {NexusRavenFunction} from "./interfaces";

export const parseNexusRavenFunction = (func: NexusRavenFunction) => {
    let output =["Function:"]
    output.push(sprintf("def %s(%s):", func.functionName, func.parameters.map(p => p.name).join(", ")))
    output.push('"""')
    output.push(func.description)
    output.push('')
    if(func.parameters.length > 0) {
    output.push("Args:")
    func.parameters.forEach(p => {
        output.push(sprintf("%s (%s): %s", p.name, p.type, p.description))
    })
    output.push('')
    }
    if (func.returns.type) {
        output.push("Returns:")
        if (func.returns.description.trim().length > 0) {
            output.push(sprintf("%s: %s", func.returns.type, func.returns.description))
        } else {
            output.push(sprintf("%s", func.returns.type))
        }
    }
    output.push('"""<br>')
    return output.join('<br>')
}

export const parseNexusRavenFunctions = (funcs: NexusRavenFunction[]) => {
    let outputs = funcs.map(parseNexusRavenFunction)
    outputs.push('')
    outputs.push("User Query {query}" + htmlshowasstr("<human_end>"))
    return outputs.join('<br>')
}

function sprintf(format: string, ...args: any[]) {
    let i = 0;
    return format.replace(/%s/g, () => args[i++]);
}

function htmlshowasstr(str: string) {
    return str.replace(/</g, "&lt;").replace(/>/g, "&gt;")
}
