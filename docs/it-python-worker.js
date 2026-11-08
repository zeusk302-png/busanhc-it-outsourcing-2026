let runtime;
onmessage=async event=>{
  if(event.data.type!=='run')return;
  const output=[];
  try{
    if(!runtime){importScripts('https://cdn.jsdelivr.net/pyodide/v0.29.3/full/pyodide.js');runtime=await loadPyodide({indexURL:'https://cdn.jsdelivr.net/pyodide/v0.29.3/full/'});}
    postMessage({type:'ready'});
    const input=String(event.data.input||'').split('\n');
    runtime.setStdout({batched:text=>output.push(text)});runtime.setStderr({batched:text=>output.push(text)});runtime.setStdin({stdin:()=>input.length?input.shift():null});
    const context=runtime.runPython('dict()');
    try{await runtime.runPythonAsync(event.data.code,{globals:context});}finally{context.destroy();}
    postMessage({type:'result',output:output.join('\n')||'실행을 마쳤습니다. 출력할 내용은 없습니다.'});
  }catch(error){postMessage({type:'error',output:[...output,String(error)].join('\n')});}
};
