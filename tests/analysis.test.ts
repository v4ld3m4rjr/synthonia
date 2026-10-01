import { computeStaticAngles, computeDynamic, buildStaticReport, buildDynamicReport, composeResumo, angleABC } from '../src/lib/analysis';
import type { PoseFrame } from '../src/lib/types';

const assert = (cond: boolean, msg: string) => { if (!cond) { console.error('❌', msg); process.exit(1); } else console.log('✅', msg); };

// ângulo reto
assert(Math.abs(angleABC({x:0,y:0},{x:1,y:0},{x:1,y:1}) - 90) < 0.01, 'angleABC calcula 90°');

// ---- Estático frontal com valgo: joelhos deslocados para dentro
const mkLm = (o: Record<string,[number,number]>) => Object.fromEntries(Object.entries(o).map(([k,v])=>[k,{x:v[0],y:v[1],v:1}]));
const staticFrames: PoseFrame[] = [];
for (let i=0;i<40;i++){
  staticFrames.push({ t:i*150, lm: mkLm({
    leftShoulder:[0.38,0.25], rightShoulder:[0.62,0.25],
    leftHip:[0.42,0.5], rightHip:[0.58,0.5],
    leftKnee:[0.47,0.7], rightKnee:[0.53,0.7],   // joelhos para dentro => valgo
    leftAnkle:[0.4,0.9], rightAnkle:[0.6,0.9],
    nose:[0.5,0.12], leftWrist:[0.3,0.55], rightWrist:[0.7,0.55],
    leftHeel:[0.4,0.93], rightHeel:[0.6,0.93], leftFootIndex:[0.4,0.87], rightFootIndex:[0.6,0.87],
  }) });
}
const ang = computeStaticAngles(staticFrames,'frontal');
console.log('ângulos estáticos:', JSON.stringify(ang,null,1));
assert(ang.valgoVaro != null && ang.valgoVaro > 5, `valgo detectado (${ang.valgoVaro?.toFixed(1)}°)`);
const repS = buildStaticReport(ang,'frontal');
assert(repS.score <= 100 && repS.score >= 25, 'score dentro do intervalo');
assert(repS.exercicios.length > 0, 'exercícios prescritos para o valgo');
repS.resumo = composeResumo(repS,'Maria');
assert(repS.resumo.includes('valgo') || repS.resumo.toLowerCase().includes('glúteo'), 'resumo menciona o achado');

// ---- Dinâmico lateral simulando corrida (joelho flete ~120°, cadência ~160spm)
const dynFrames: PoseFrame[] = [];
const durMs = 9000; const dt = 1000/25;
for (let t=0;t<durMs;t+=dt){
  const phase = (t/ (60000/160)) * 2*Math.PI; // ciclo pela cadência alvo
  const kneeAng = 60 + 55*(0.5+0.5*Math.sin(phase)); // oscila entre 60 e 115... 
  const rad = kneeAng*Math.PI/180;
  const hip=[0.5,0.45]; const thigh=0.22; const shank=0.22;
  // perna: quadril->joelho->tornozelo com flexão variável (vista lateral, y p/ baixo)
  const kA = Math.PI/2 + 0.35*Math.cos(phase); // direção coxa
  const knee=[hip[0]+thigh*Math.sin(kA)*0.2, hip[1]+thigh*Math.cos(kA)];
  const half=(Math.PI-rad)/2;
  const ankle=[knee[0]-shank*Math.sin(half+ (phase>0?0.1:-0.1))*0.5, knee[1]+shank*Math.cos(half)];
  dynFrames.push({ t, lm: mkLm({
    leftShoulder:[0.52,0.2], rightShoulder:[0.5,0.2],
    leftHip:hip as [number,number], rightHip:hip as [number,number],
    leftKnee:knee as [number,number], rightKnee:knee as [number,number],
    leftAnkle:ankle as [number,number], rightAnkle:ankle as [number,number],
    nose:[0.53,0.1], leftWrist:[0.45,0.4], rightWrist:[0.55,0.4],
    leftHeel:[ankle[0],ankle[1]+0.02] as [number,number], rightHeel:[ankle[0],ankle[1]+0.02] as [number,number],
    leftFootIndex:[ankle[0]+0.03,ankle[1]] as [number,number], rightFootIndex:[ankle[0]+0.03,ankle[1]] as [number,number],
  }) });
}
const dyn = computeDynamic(dynFrames,'lateral');
console.log('dinâmica:', JSON.stringify({n: dyn.ciclos.length, cad: dyn.cadenciaSpm, sim: dyn.simetria}, null, 1));
assert(dyn.ciclos.length >= 2, `detectou ciclos (${dyn.ciclos.length})`);
assert(dyn.cadenciaSpm != null && dyn.cadenciaSpm > 100 && dyn.cadenciaSpm < 220, `cadência plausível (${dyn.cadenciaSpm?.toFixed(0)} spm)`);
const repD = buildDynamicReport(dyn,'lateral');
repD.resumo = composeResumo(repD,'Maria');
assert(repD.achados.length > 0, 'relatório dinâmico gerou achados');
console.log('\nRESUMO IA (estático):\n', repS.resumo);
console.log('\nRESUMO IA (dinâmico):\n', repD.resumo);
console.log('\n🎉 Todos os testes passaram');
