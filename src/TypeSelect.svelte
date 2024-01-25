<script lang="ts">
    // python types
    export let options = [
        ['int', 'Int'], ['float', 'Float'], ['str', 'String'], ['bool', 'Boolean'], ['list', 'List'], ['dict', 'Dict'],
        ['tuple', 'Tuple'], ['set', 'Set']
    ]

    export let value = 'int'
    export let name = 'type'
    let className = 'select select-bordered w-full '

    export { className as class }
</script>

<select
    class={className}
    bind:value={value}
    id={name}
    name={name}
>
    {#each options as [value, label]}
        <option value={value}>{label}</option>
    {/each}
</select>
