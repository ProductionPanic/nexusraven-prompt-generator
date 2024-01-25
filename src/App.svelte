<script lang="ts">
    import type {NexusRavenFunction, UUID} from "./lib/interfaces";
    import {onMount, tick} from "svelte";
    import {receive,send} from "./lib/transition";
    import {flip} from "svelte/animate";
    import {parseNexusRavenFunctions} from "./lib/NexusRavenFunctionParser";
    import TypeSelect from "./TypeSelect.svelte";
    import TypeWriter from "./TypeWriter.svelte";

    let newFunctionName: string = '';
    let functions: NexusRavenFunction[] = [];
    let calculated_height = '100vh';

    let output = "";

    $:if(newFunctionName.includes(" ")) {
        newFunctionName = newFunctionName.replace(" ", "_");
    }

    let last_output = "";
    $:if(functions) {
        output = parseNexusRavenFunctions(functions);
        if (JSON.stringify(functions) === last_output || functions.length === 0) {}else {

            last_output = JSON.stringify(functions);
            localStorage.setItem('functions', JSON.stringify(functions));
            rerender();
        }
    }

    const rerender = ()=> {
        functions = [...functions];
        localStorage.setItem('functions', JSON.stringify(functions));
    }

    onMount(async () => {
        const localFunctions = localStorage.getItem('functions');
        if (localFunctions) {
            functions = JSON.parse(localFunctions);
        }
        rerender();

        const controls = document.getElementById('controls');
        const header = document.getElementById('header');
        const screen_height = window.innerHeight-header.clientHeight-controls.clientHeight;
        calculated_height = `${screen_height}px`;
    });

    function uuidv4():UUID {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          // @ts-ignore
          var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          // @ts-ignore
          return v.toString(16);
        });
      }

    function add_func() {
        if (newFunctionName === '') return;
        document.startViewTransition(async()=> {
        functions = [...functions, {id: uuidv4(), functionName: newFunctionName, parameters: [], description:"", returns:{description:"", type:""}}];
        newFunctionName = '';
        localStorage.setItem('functions', JSON.stringify(functions));
        await tick();
        })
    }

    function add_param(func: NexusRavenFunction) {
        func.parameters = [...func.parameters, {name: '', type: ''}];
        rerender();
    }
    let copied = false;

    function copy_content() {
        let out = document.querySelector('pre').innerText;
        navigator.clipboard.writeText(out);
        copied = true;
        setTimeout(()=>copied = false, 2000);
    }

    function reset_all() {
        functions = [];
        rerender();
    }

    function copy_json() {
        navigator.clipboard.writeText(JSON.stringify(functions));
    }

    function import_json() {
        const json = prompt('Paste json here');
        if (json) {
            try {
                functions = JSON.parse(json);
                rerender();
            }catch (e) {
                alert('Invalid json');
            }
        }
    }
</script>

<div class="grid grid-cols-2">
    <div class="edit-frame h-screen  flex flex-col ">
        <div class="p-4 text-center  flex items-center text-primary-content bg-primary text-xl">
            <div class="dropdown">
                <div tabindex="0" role="button" class="">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                         xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M4 6h16M4 12h16M4 18h16"/>
                    </svg>
                </div>
                <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 text-white">
                    <li>
                        <button on:click={reset_all}>
                            Reset all
                        </button>
                    </li>
                    <li>
                        <button on:click={copy_json}>
                            Copy json
                        </button>
                    </li>
                    <li>
                        <button on:click={import_json}>
                            Import json
                        </button>
                    </li>
                </ul>
            </div>
            <h1 id="header" class="flex-1 ">
                Nexusraven functions prompt generator
            </h1>
        </div>
        <div class="generator flex-1 bg-base-300 p-4 flex flex-col gap-4 overflow-scroll" style="height: {calculated_height}">
            {#each functions as func (func.id)}
                <div class="bg-base-100 border border-gray-500 rounded text-white p-2 relative group function-item"
                    style:view-transition-name="item-{func.id}"
                    in:receive={{key: func.id}}
                    out:send={{key: func.id}}
                     animate:flip={{ duration: 200, delay:200 }}
                >
                    <div class="grid grid-cols-5 gap-4">

                        <div class="form-control col-span-2">
                            <label for={func.functionName}>Function name</label>
                            <input type="text" id={func.functionName} bind:value={func.functionName}/>
                        </div>

                        <div class="form-control">
                            <label for={func.functionName}>Return type</label>
                            <TypeSelect name={func.functionName} bind:value={func.returns.type}/>
                        </div>

                        <div class="form-control col-span-2">
                            <label for={func.functionName}>Return description</label>
                            <input type="text" id={func.functionName} bind:value={func.returns.description}/>
                        </div>
                    </div>
                    <div class="description">
                        <div class="expand-btn text-sm flex gap-2 justify-end cursor-pointer pt-2" on:click={()=>{func.expanded = !func.expanded; rerender();}}>
                            <span>
                                {#if func.expanded}
                                    Hide description
                                {:else}
                                    Show description
                                {/if}
                            </span>
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                 xmlns="http://www.w3.org/2000/svg"
                                    style:transform={func.expanded ? 'rotate(180deg)' : 'rotate(0deg)'}
                            >
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                      d="M19 9l-7 7-7-7"/>
                            </svg>
                        </div>
                        {#if func.expanded}
                            <div class="form-control mb-2">
                                <label for="{func.functionName}_description">Description</label>
                                <textarea id="{func.functionName}_description" bind:value={func.description}
                                            class="textarea h-24 textarea-bordered textarea-accent"
                                            rows="5"
                                ></textarea>
                            </div>
                            {/if}
                    </div>
                    <div class="params">
                        <h2>Parameters</h2>
                        {#each func.parameters as param,i}
                            {#if i>0}
                                <div class="divider"></div>
                            {/if}
                            <div class="flex items-end gap-4">

                                <div class="param ml-4 grid grid-cols-3 gap-2 flex-1 ">
                                    <div class="form-control ">
                                        <label for="{func.functionName}_{param.name}">Name</label>
                                        <input type="text" id="{func.functionName}_{param.name}" bind:value={param.name}/>
                                    </div>
                                    <div class="form-control ">
                                        <label for="{func.functionName}_{param.type}">Type</label>
                                        <TypeSelect name="{func.functionName}_{param.type}" bind:value={param.type}/>
                                    </div>
                                    <div class="form-control ">
                                        <label for="{func.functionName}_{param.description}">Description</label>
                                        <input type="text" id="{func.functionName}_{param.description}" bind:value={param.description}/>
                                        </div>
                                </div>
                                <div>
                                    <span class="block"></span>
                                    <button class="btn btn-error text-error-content block"
                                            on:click={()=>{func.parameters = func.parameters.filter(p => p.name!==param.name); rerender();}}
                                    >

                                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                             xmlns="http://www.w3.org/2000/svg">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                  d="M6 18L18 6M6 6l12 12"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            {/each}
                        <button on:click={()=>add_param(func)} class="btn btn-sm btn-secondary ml-4 mt-2">Add parameter</button>
                        </div>
                    <div class="floating-delete-button group-hover:block hidden">
                        <button class="btn btn-error btn-sm text-error-content" on:click={()=>{functions = functions.filter(f => f.id!==func.id); rerender();}}>
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                      d="M6 18L18 6M6 6l12 12"/>
                            </svg>

                        </button>
                    </div>
                </div>
            {/each}
        </div>
        <div class="controls" id="controls">


            <div class="add-func-form flex items-center">
                <input class="flex-1 input input-bordered rounded-r-none" type="text" id="new-func-name" placeholder="Function name..." bind:value={newFunctionName}/>
                <button class="btn btn-primary rounded-l-none" on:click={add_func}>Add function</button>
            </div>
        </div>
    </div>
    <div class="preview-frame flex flex-col">
        <div class="content flex flex-col h-full">
            <div class="p-4 text-center text-secondary-content bg-secondary text-xl">Preview</div>
            <div class="p-4 flex-1">
                <pre class="hidden">{@html output}</pre>
                <TypeWriter text={output}/>
            </div>
            <div class="copy-btn">
                <button on:click={copy_content} class="btn w-full" class:btn-neutral={!copied} class:btn-neutral-content={!copied} class:btn-success={copied} class:btn-success-content={copied}>
                    {#if copied}
                        Copied!
                    {:else}
                        Copy
                    {/if}
                </button>
            </div>
        </div>
    </div>
</div>


<style lang="scss">
    input[type="text"] {
      @apply input input-bordered;
    }

    .floating-delete-button {
      @apply absolute top-2 right-2;
    }

    .function-item:focus-within {
      @apply border-secondary;
    }
</style>
