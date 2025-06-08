export function escolherInstanceType(processamento: string, uso: string): string {
  if (processamento === 'baixa' && uso === 'esporadico') return 't3.micro';
  if (processamento === 'media') return 't3.medium';
  if (processamento === 'alta' && uso === 'tempo_real') return 'm5.large';
  
  return 't3.micro';
}