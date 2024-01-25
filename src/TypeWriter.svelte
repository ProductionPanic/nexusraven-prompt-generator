<script lang="ts">
    import {onMount} from "svelte";

    export let text:string;

    let  output = ""
    export let speed = 1;
    let running = false;
    let done = false;

    onMount(() => {
        text_changed();
    });

    let prev_text = text;
    $: if (text !== undefined && text !== prev_text) {
        prev_text = text;
        text_changed_debounce();
    }

    let text_changed_debounce = debounce(text_changed, 1000);

    function debounce(func: Function, wait: number) {
        let timeout: number;
        return function executedFunction(...args: any[]) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };



    async function text_changed() {
        if (running) {
            await waitToStop();
        }
        running = true;
        if (output.length > 0) {
            let chars = output;
            let remove_chars = 20;
            while(chars.length > 0) {
                chars = chars.substring(0, chars.length - remove_chars);
                output = chars;
                await sleep(speed);
                if (!running) {
                    break;
                }
            }
        }
        let i = 0;
        let add_chars = 4;
        while (i < text.length) {
            let chars = text.substring(i, i + add_chars);
            output += chars;
            i += add_chars;
            await sleep(speed);
            if (!running) {
                break;
            }
        }
        running = false;
    }

    async function waitToStop() {
        while(running) {
            await sleep(100);
        }
    }

    async function sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
</script>

<pre><code>{@html output}</code></pre>
