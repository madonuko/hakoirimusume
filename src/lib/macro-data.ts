import macrosData from '../data/macros/macros.json';

export const macroDataScript = `
<script>
  window.macroData = ${JSON.stringify(macrosData)};
</script>
`;
