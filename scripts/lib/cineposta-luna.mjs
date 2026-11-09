// Native model metadata comes from the official runtime tool descriptor, never an API key.
export function selectNativeLuna(models) {
  const candidates = models.filter(item => /^gpt-\d+(?:\.\d+)*-luna$/.test(item.model));
  candidates.sort((a, b) => {
    const av = a.model.match(/^gpt-([\d.]+)-luna$/)[1].split('.').map(Number);
    const bv = b.model.match(/^gpt-([\d.]+)-luna$/)[1].split('.').map(Number);
    for (let i = 0; i < Math.max(av.length, bv.length); i++) if ((av[i] || 0) !== (bv[i] || 0)) return (bv[i] || 0) - (av[i] || 0);
    return 0;
  });
  const latest = candidates[0];
  if (!latest) throw new Error('El runtime nativo no anuncia GPT Luna. No se inventan IDs ni se cambia de familia.');
  if (!latest.reasoningEfforts.includes('max')) throw new Error('La última Luna no admite Max; verificar compatibilidad sin elegir otra versión silenciosamente.');
  return { model: latest.model, effort: 'max' };
}
export function validateNativeExecution(execution, selection) {
  if (execution.provider !== 'codex-native' || execution.status !== 'completed' || execution.probe !== 'passed' || !execution.agentId || execution.model !== selection.model || execution.effort !== selection.effort) {
    throw new Error('Falta evidencia del ejecutor nativo Luna Max completado. No basta declarar el modelo en un prompt.');
  }
  return execution;
}
