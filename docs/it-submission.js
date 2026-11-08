'use strict';
(() => {
const A=IT_APP,E=A.E,api=COURSE.api,SESSION='busanhc-it-submission-v1';
let learner={};try{learner=JSON.parse(localStorage.getItem(SESSION))||{};}catch{}
let teacherToken='';try{teacherToken=sessionStorage.getItem('busanhc-it-teacher')||'';}catch{}
let selectedRoom='',teacherRooms=[],currentFile=null,workSubmitting=false;
const remember=()=>{try{localStorage.setItem(SESSION,JSON.stringify(learner));}catch{A.toast('접수 정보의 임시 저장이 막혀 있습니다. 접수 번호를 파일로 저장하세요.');}};
async function call(path,{method='GET',data,teacher=false,token}={}){
 const headers={};if(data!==undefined)headers['Content-Type']='application/json';const t=token??(teacher?teacherToken:learner.token);if(t)headers.Authorization='Bearer '+t;
 const abort=new AbortController(),timeout=setTimeout(()=>abort.abort(),30000);
 try{const r=await fetch(api+path,{method,headers,body:data===undefined?undefined:JSON.stringify(data),signal:abort.signal});const result=await r.json();if(!r.ok)throw Object.assign(Error(result.error||'접수를 확인하지 못했습니다.'),{status:r.status});return result;}catch(error){if(error.name==='AbortError')throw Error('응답을 기다리다 멈췄습니다. 접수 내역을 새로 확인하거나 같은 내용으로 다시 보내세요.');throw error;}finally{clearTimeout(timeout);}
}
const message=(id,text,error=false)=>{const el=document.querySelector('#'+id);if(el){el.textContent=text;el.className='status-box'+(error?' error':'');}};
function studentView(){return A.title('작품 제출','저장한 파일을 선생님께 보내기','수업 코드로 입장하고, 내가 만든 실제 파일과 실습 기록을 보냅니다. 접수 번호가 나타났는지 마지막으로 확인하세요.')+`<section class="panel"><h2>1. 수업 코드로 입장</h2><form id="join-form"><label>선생님이 알려 준 수업 코드<input name="roomCode" maxlength="12" autocomplete="off" spellcheck="false" placeholder="8자리 코드" required></label><button type="submit">수업 입장</button></form><div id="join-state" role="status"></div></section><section class="section panel" id="submission-work" hidden><h2>2. 내 파일과 기록 보내기</h2><p id="room-description"></p><p class="note" id="course-file-guide"></p><div id="closed-room-notice" class="status-box" hidden><p id="closed-room-message" role="status">이 수업은 접수를 마감했습니다. 다시 제출하려면 선생님께 요청한 뒤 수업 상태를 확인하세요. 파일과 실습 기록은 PC에 저장할 수 있습니다.</p><button type="button" class="secondary small" id="refresh-room-state">수업 상태 다시 확인</button></div><form id="work-form"><div class="two-grid"><label>작품 코드<small>예: 별01, A_03. 한글·영문·숫자·_·-로 1~24자, 띄어쓰기 없이 적습니다. 실명·학번은 쓰지 않습니다.</small><input name="workCode" data-field="workCode" maxlength="24" pattern="[A-Za-z0-9가-힣_-]{1,24}" value="${E(A.state.fields.workCode||'')}" required></label><label>작품 제목<input name="title" data-field="workTitle" maxlength="80" value="${E(A.state.fields.workTitle||'')}" required></label></div><label>설명 한두 문장<textarea name="summary" data-field="workSummary" maxlength="1500">${E(A.state.fields.workSummary||'')}</textarea></label><p class="note">작품 코드·제목·설명은 지금 쓰는 브라우저에 임시 저장합니다. 제출 화면을 다시 열면 파일은 다시 골라 주세요.</p><label>제출할 실제 파일<small>HTML · PY · JAVA · IPYNB · JSON · TXT · ZIP / 900KB 이하</small><input type="file" id="submission-file" accept=".html,.py,.java,.ipynb,.json,.txt,.zip"></label><div class="actions"><button type="button" class="secondary" id="use-editor-code">현재 편집한 코드 사용</button><button type="button" class="secondary" id="download-selected-code">선택한 파일 내 PC에도 저장</button></div><p id="selected-file" class="note" role="status" aria-atomic="true">아직 파일을 선택하지 않았습니다.</p><label class="checkline"><input type="checkbox" name="checked" required><span>파일을 직접 열어 확인했고, 실명·연락처·계정 정보가 들어 있지 않습니다. 파일과 이 교재의 실습 기록을 선생님에게 보냅니다.</span></label><button type="submit" id="work-submit" disabled>파일과 실습 기록 제출</button></form><div id="submission-state" role="status"></div><div id="new-receipt"></div></section><section class="section"><div class="section-head"><h2>3. 내 접수 내역 확인</h2><button class="secondary small" id="refresh-receipts">새로 확인</button></div><div id="my-receipts"><p class="note">입장하면 같은 브라우저에서 접수한 내역을 불러옵니다.</p></div></section><div class="callout"><b>접수 확인이 안 될 때</b><p>내 파일과 ‘내 기록 저장’ 파일을 PC에 보관하세요. 수업 코드와 접수 내역을 다시 확인하고 선생님에게 알려 주세요. 파일을 선택하거나 다운로드한 것만으로 제출이 끝나지는 않습니다.</p></div>`;}
function teacherOperationGuide(){return `<details id="teacher-operation-guide"><summary>수업 시작부터 접수 확인까지</summary><ol><li><b>1교시 50분은 함께 진행합니다.</b> 실제 채용공고 두 개를 비교하고, 언어·도구와 해커톤 사례를 읽습니다.</li><li><b>거수투표로 A·B·C 중 하나를 정합니다.</b> A는 Python 판매·재고, B는 Java 외주 제작, C는 웹게임입니다. 반 전체가 고른 과정으로 2·3교시를 진행합니다.<br><a href="#vote">투표용 세 과정 보기 →</a></li><li><b>아래에서 수업을 만들고 코드를 안내합니다.</b> 학급 이름과 투표 결과의 과정을 확인하세요. 학생에게는 수업 코드만 알려 줍니다.</li><li><b>마지막 5분은 저장·제출·접수 확인에 씁니다.</b> A는 PY, B는 Main.java, C는 HTML이 기본 파일입니다. 학생은 작품 제출 화면에서 파일을 보내고 접수 번호를 확인합니다. 파일 저장과 제출은 각각 진행합니다.</li><li><b>교사는 실제 파일과 실습 기록을 함께 확인합니다.</b> 아래 수업 목록에서 해당 학급을 선택해 내려받습니다. 제출하지 못한 학생이 있는지 확인한 뒤 접수를 마감합니다. 마감한 수업은 다시 열 수 있습니다.</li></ol><p class="note">수업 전에는 학교 PC에서 교재의 Python·Java 실행창과 사용할 AI 서비스에 접속해 보세요. AI 사용이 막히면 제공 예시의 숫자·규칙을 직접 바꿔 진행할 수 있습니다.</p></details>`;}
function teacherView(){return A.title('교사용 접수함','수업을 열고 제출물을 확인합니다','거수투표로 정한 과정을 선택해 수업을 만드세요. 학생에게는 수업 코드만 알려 줍니다.')+teacherOperationGuide()+`<section class="panel" id="teacher-login"><h2>교사 입장</h2><form id="teacher-login-form"><label>교사 입장키<input type="password" name="teacherKey" autocomplete="off" required></label><button>접수함 열기</button></form><div id="teacher-login-state" role="status"></div><p class="note">입장키는 학생에게 배포하지 않습니다. 교사 로그인은 이 탭에서 유지되며 8시간 후 만료됩니다.</p></section><section class="section panel" id="teacher-console" hidden><h2>새 수업 만들기</h2><form id="room-form"><div class="two-grid"><label>학급 이름<input name="label" maxlength="60" placeholder="예: IT경영과 1반" required></label><label>거수투표로 정한 과정<select name="track">${COURSE.tracks.map(t=>`<option value="${t.id}">${t.id} · ${E(t.name)}</option>`).join('')}</select></label></div><button>수업 코드 만들기</button></form><div id="new-room" role="status"></div><div class="section-head section"><h2>열어 둔 수업</h2><button class="secondary small" id="refresh-rooms">새로 확인</button></div><div id="teacher-room-list" class="room-list"></div><div id="teacher-room-info"></div><div id="teacher-work-list" class="teacher-items"></div><div class="actions"><button class="secondary" id="teacher-export" disabled>현재 수업 접수 목록 저장</button><button class="secondary" id="teacher-close">선택한 수업 접수 마감</button><button class="secondary" id="teacher-reopen">선택한 수업 다시 열기</button><button class="secondary" id="teacher-logout">교사 로그아웃</button></div><p id="teacher-state" role="status"></p></section>`;}
function receiptCard(r){return `<article class="receipt"><h3>${E(r.title)}</h3><p><b>접수 번호</b> ${E(r.id)}<br><b>파일</b> ${E(r.filename)} · ${Number(r.bytes).toLocaleString()}바이트<br><b>작품 코드</b> ${E(r.code)}<br><b>접수 시각</b> ${E(new Date(r.created).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'}))}</p><div class="actions"><button class="secondary small" data-my-download="${E(r.id)}" data-filename="${E(r.filename)}">접수한 파일 다시 받기 ↓</button><button class="secondary small" data-save-receipt="${E(r.id)}">접수증 저장 ↓</button></div><details><summary>파일 확인값</summary><p class="note">SHA-256: ${E(r.sha256)}</p></details></article>`;}
let receipts=[],teacherItems=[],teacherItemsRoom='',teacherRoomsRequest=0,teacherItemsRequest=0;
function selectedWorkFile(){return document.querySelector('#submission-file')?.files?.[0]||currentFile;}
function fileProblem(file){
 if(!file)return '제출할 파일을 고르거나 해당 과정에서 편집한 코드를 사용하세요.';
 if(file.size<1)return '내용이 없는 파일입니다. 코드를 저장한 파일을 다시 골라 주세요.';
 if(file.size>900000)return '900KB를 넘었습니다. 900KB 이하 파일을 골라 주세요.';
 if(!/\.(html|py|java|ipynb|json|txt|zip)$/i.test(file.name))return '지원하지 않는 형식입니다. HTML·PY·JAVA·IPYNB·JSON·TXT·ZIP 파일을 골라 주세요.';
 return '';
}
function showSelectedWorkFile(origin=''){
 const file=selectedWorkFile(),problem=fileProblem(file),label=document.querySelector('#selected-file');
 if(label){label.textContent=file?file.name+' · '+file.size.toLocaleString()+'바이트'+(origin?' · '+origin:'')+(problem?' · '+problem:' · 선택한 파일을 열어 확인한 뒤 아래에 체크하세요.'):problem;label.className='note'+(file&&problem?' danger-text':'');}
 const confirmation=document.querySelector('#work-form [name="checked"]');if(confirmation)confirmation.checked=false;
 updateRoomAvailability();
}
function resetRoomSelection(changed){
 currentFile=null;
 const input=document.querySelector('#submission-file'),selected=document.querySelector('#selected-file');
 if(input)input.value='';
 const confirmation=document.querySelector('#work-form [name="checked"]');if(confirmation)confirmation.checked=false;
 if(selected)selected.className='note';
 if(selected)selected.textContent=changed?'수업을 바꿨습니다. 이 수업에 낼 파일을 다시 고르거나 해당 과정의 편집 코드를 사용하세요.':'아직 파일을 선택하지 않았습니다.';
 const receipt=document.querySelector('#new-receipt'),status=document.querySelector('#submission-state');
 if(receipt)receipt.innerHTML='';
 if(status){status.textContent='';status.className='';}
}
function updateRoomAvailability(){
 const room=learner.room,open=Boolean(room?.open),form=document.querySelector('#work-form'),button=document.querySelector('#work-submit'),notice=document.querySelector('#closed-room-notice'),description=document.querySelector('#room-description'),file=selectedWorkFile(),problem=fileProblem(file);
 if(form)form.classList.toggle('submission-closed',Boolean(room&&!open));
 if(button){
  button.disabled=workSubmitting||!open||Boolean(problem);
  button.textContent=room&&!open?'접수 마감':workSubmitting?'보내는 중…':problem?(file?'파일을 다시 선택하세요':'파일을 먼저 선택하세요'):'파일과 실습 기록 제출';
  button.setAttribute('aria-busy',String(workSubmitting));
  if(room&&!open)button.setAttribute('aria-describedby','closed-room-message');else if(problem)button.setAttribute('aria-describedby','selected-file');else button.removeAttribute('aria-describedby');
 }
 const joinButton=document.querySelector('#join-form button');if(joinButton)joinButton.disabled=workSubmitting;
 const guide=document.querySelector('#course-file-guide'),editorButton=document.querySelector('#use-editor-code');
 const fileHint={A:'Python 프로그램(.py)',B:'Java 코드(Main.java)',C:'웹게임 HTML 파일(.html)'}[room?.track];
 if(guide)guide.innerHTML=fileHint?`이 수업의 기본 제출 파일: <b>${E(fileHint)}</b>. <a href="#${room.track}3">${room.track} 과정 제작창으로 돌아가기 →</a><br>별도로 저장한 파일이나 ZIP 묶음은 아래에서 직접 고릅니다.`:'';
 if(editorButton)editorButton.textContent=room?room.track+' 과정에서 편집한 코드 사용':'현재 편집한 코드 사용';
 if(notice)notice.hidden=!room||open;
 if(description&&room)description.textContent=room.label+' · '+room.track+' 과정'+(open?' · 접수 중':' · 접수 마감');
}
async function loadMe(){if(!learner.token)return false;try{const result=await call('/api/me');learner.room=result.room;remember();const work=document.querySelector('#submission-work');if(!work)return false;updateRoomAvailability();work.hidden=false;message('join-state','입장했습니다. '+result.room.label+'의 '+result.room.track+' 과정입니다.');receipts=result.submissions;document.querySelector('#my-receipts').innerHTML=receipts.length?receipts.map(receiptCard).join(''):'<p class="empty">아직 접수한 파일이 없습니다.</p>';return true;}catch(error){if(error.status===401){learner={};remember();updateRoomAvailability();}message('join-state',error.message,true);return false;}}
function clearTeacherItems(){
 teacherItemsRequest++;teacherItems=[];teacherItemsRoom='';
 const root=document.querySelector('#teacher-work-list'),info=document.querySelector('#teacher-room-info'),button=document.querySelector('#teacher-export'),room=teacherRooms.find(r=>r.id===selectedRoom);
 if(button)button.disabled=true;
 if(info)info.textContent=room?room.label+' · '+room.track+' 과정 · '+(room.open?'접수 중':'마감'):'';
 if(root){root.setAttribute('aria-busy',String(Boolean(selectedRoom)));root.innerHTML=selectedRoom?'<p class="note" role="status">접수 목록을 불러오고 있습니다.</p>':'';}
}
async function loadRooms(){
 const root=document.querySelector('#teacher-room-list'),ticket=++teacherRoomsRequest,token=teacherToken;
 clearTeacherItems();if(!root)return false;
 const current=()=>ticket===teacherRoomsRequest&&token===teacherToken&&root===document.querySelector('#teacher-room-list');
 try{
  const result=await call('/api/rooms',{teacher:true});if(!current())return false;
  teacherRooms=result.rooms.filter(r=>!r.label.startsWith('QA-'));
  if(selectedRoom&&!teacherRooms.some(r=>r.id===selectedRoom)){selectedRoom='';clearTeacherItems();}
  root.innerHTML=teacherRooms.length?teacherRooms.map(r=>`<button class="${r.id===selectedRoom?'':'secondary'}" data-teacher-room="${E(r.id)}">${E(r.label)} · ${E(r.track)} · ${r.count}건${r.open?'':' · 마감'}</button>`).join(''):'<p class="note">첫 수업을 만들어 주세요.</p>';
  if(selectedRoom)await loadTeacherItems();return current();
 }catch(error){
  if(!current())return false;
  const list=document.querySelector('#teacher-work-list');if(list){list.setAttribute('aria-busy','false');list.innerHTML='<p class="note" role="status">목록을 불러오지 못했습니다. 새로 확인을 눌러 다시 시도하세요.</p>';}
  throw error;
 }
}
async function loadTeacherItems(){
 const roomId=selectedRoom,room=teacherRooms.find(r=>r.id===roomId),root=document.querySelector('#teacher-work-list'),token=teacherToken;
 clearTeacherItems();if(!room||!root)return false;
 const ticket=teacherItemsRequest,current=()=>ticket===teacherItemsRequest&&roomId===selectedRoom&&token===teacherToken&&root===document.querySelector('#teacher-work-list');
 try{
  const data=await call('/api/submissions?room='+encodeURIComponent(roomId),{teacher:true});if(!current())return false;
  teacherItems=data.submissions;teacherItemsRoom=roomId;
  root.innerHTML=teacherItems.length?teacherItems.map(s=>`<article><p class="meta">${E(s.code)} · ${E(s.track)} · ${E(new Date(s.created).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'}))}</p><h3>${E(s.title)}</h3><p>${E(s.summary)}</p><p class="meta">${E(s.filename)} · ${s.bytes.toLocaleString()}바이트 · 접수 ${E(s.id)}</p><div class="actions"><button class="secondary small" data-teacher-file="${E(s.id)}" data-filename="${E(s.filename)}">실제 작품 파일 ↓</button><button class="secondary small" data-teacher-record="${E(s.id)}">실습 기록 ↓</button></div></article>`).join(''):'<p class="empty">이 수업에 접수한 작품이 없습니다.</p>';
  root.setAttribute('aria-busy','false');const button=document.querySelector('#teacher-export');if(button)button.disabled=false;return true;
 }catch(error){if(!current())return false;root.setAttribute('aria-busy','false');root.innerHTML='<p class="note" role="status">접수 목록을 불러오지 못했습니다. 새로 확인을 눌러 다시 시도하세요.</p>';throw error;}
}
async function teacherEnter(){
 const token=teacherToken,login=document.querySelector('#teacher-login'),console=document.querySelector('#teacher-console');if(!token||!login||!console)return;
 const current=()=>token===teacherToken&&login===document.querySelector('#teacher-login')&&console===document.querySelector('#teacher-console');
 try{const loaded=await loadRooms();if(!loaded||!current())return;login.hidden=true;console.hidden=false;}
 catch(error){if(!current())return;teacherToken='';sessionStorage.removeItem('busanhc-it-teacher');message('teacher-login-state',error.message,true);}
}
async function fileDownload(id,name,teacher){const r=await fetch(api+'/api/submissions/'+id+'/file',{headers:{Authorization:'Bearer '+(teacher?teacherToken:learner.token)}});if(!r.ok){let data;try{data=await r.json();}catch{}throw Error(data?.error||'파일을 받지 못했습니다.');}const blob=await r.blob();A.download(name,blob);A.toast('다운로드를 시작했습니다. 브라우저의 다운로드 목록에서 파일을 확인하세요.');}
const digest=async text=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))).map(x=>x.toString(16).padStart(2,'0')).join('');
document.addEventListener('submit',async event=>{const form=event.target;if(!['join-form','work-form','teacher-login-form','room-form'].includes(form.id))return;event.preventDefault();if((form.id==='work-form'||form.id==='join-form')&&workSubmitting)return;const button=form.querySelector('button[type=submit]')||form.querySelector('button');button.disabled=true;if(form.id==='work-form'){workSubmitting=true;updateRoomAvailability();}
 try{
  const fields=new FormData(form);
  if(form.id==='join-form'){const code=String(fields.get('roomCode')).trim().toUpperCase().replaceAll(' ','');if(learner.code===code){const loaded=await loadMe();if(loaded||learner.token)return;}const result=await call('/api/join',{method:'POST',data:{code},token:''});if(learner.room?.id!==result.room.id)resetRoomSelection(Boolean(learner.room));learner={token:result.token,room:result.room,code};remember();await loadMe();}
  if(form.id==='work-form'){
   if(!learner.token||!learner.room)throw Error('수업 코드로 먼저 입장하세요.');
   if(!learner.room.open)throw Error('접수가 마감되었습니다. 선생님께 요청한 뒤 수업 상태를 다시 확인하세요.');
   const file=selectedWorkFile(),problem=fileProblem(file);if(problem)throw Error(problem);
   A.state.fields.workCode=String(fields.get('workCode'));A.state.fields.workTitle=String(fields.get('title'));A.state.fields.workSummary=String(fields.get('summary'));A.save();
   const record=JSON.parse(JSON.stringify({format:'busanhc-it-work-v2',track:learner.room.track,fields:A.state.fields,outputs:A.state.outputs,balance:A.state.balance}));
   const bytes=new Uint8Array(await file.arrayBuffer());let raw='';for(let i=0;i<bytes.length;i+=8192)raw+=String.fromCharCode(...bytes.subarray(i,i+8192));
   const payload={code:String(fields.get('workCode')),title:String(fields.get('title')),summary:String(fields.get('summary')),filename:file.name,file:btoa(raw),record};
   const signature=await digest(JSON.stringify(payload));if(learner.pending?.signature!==signature)learner.pending={signature,requestId:crypto.randomUUID()};payload.requestId=learner.pending.requestId;remember();
   message('submission-state','파일과 실습 기록을 보내고 있습니다. 접수 번호를 기다려 주세요.');const result=await call('/api/submissions',{method:'POST',data:payload});if(!result.saved||!result.receipt?.id)throw Error('접수 번호를 확인하지 못했습니다. 같은 내용으로 다시 시도하세요.');
   const newerDraft=A.state.fields.workCode!==payload.code||A.state.fields.workTitle!==payload.title||A.state.fields.workSummary!==payload.summary||selectedWorkFile()!==file;
   const receiptRoot=document.querySelector('#new-receipt');if(receiptRoot)receiptRoot.innerHTML=receiptCard(result.receipt);
   message('submission-state',newerDraft?'접수했습니다. 보내는 동안 고친 입력이나 파일 선택은 그대로 남겨 두었습니다. 이번 접수 내용은 아래 접수증에서 확인하세요.':'접수했습니다. 실제 파일이 저장되었습니다. 아래 접수증을 확인하세요.');
   if(document.querySelector('#submission-work'))await loadMe();
  }
  if(form.id==='teacher-login-form'){const r=await call('/api/teacher/login',{method:'POST',data:{key:fields.get('teacherKey')},token:''});teacherToken=r.token;sessionStorage.setItem('busanhc-it-teacher',teacherToken);form.reset();await teacherEnter();}
  if(form.id==='room-form'){const r=await call('/api/rooms',{method:'POST',data:{label:fields.get('label'),track:fields.get('track')},teacher:true});selectedRoom=r.id;document.querySelector('#new-room').innerHTML=`<div class="receipt"><h3>${E(r.label)} · ${E(r.track)} 과정</h3><p>학생에게 알려 줄 수업 코드: <strong style="font-size:25px;letter-spacing:3px">${E(r.code)}</strong></p><p class="note">코드는 지금 저장해 두세요. 접수 목록에는 코드 원문을 다시 표시하지 않습니다.</p><button class="secondary" data-save-room="${E(r.code)}" data-label="${E(r.label)}">수업 코드 파일로 저장 ↓</button></div>`;await loadRooms();}
 }catch(error){if(form.id==='work-form'&&error.status===409&&learner.room){learner.room.open=0;remember();}const id={'join-form':'join-state','work-form':'submission-state','teacher-login-form':'teacher-login-state','room-form':'teacher-state'}[form.id];message(id,error.message,true);}finally{if(form.id==='work-form'){workSubmitting=false;updateRoomAvailability();}else button.disabled=false;}
});
document.addEventListener('change',event=>{if(event.target.id==='submission-file'){currentFile=null;showSelectedWorkFile();}});
document.addEventListener('click',async event=>{const b=event.target.closest('button');if(!b)return;
 try{
  if(b.id==='use-editor-code'){const track=learner.room?.track||A.state.track,key={A:'python-project',B:'java-project',C:'web-game'}[track],code=A.state.code[key];if(!code)throw Error('먼저 '+track+' 과정의 제작창에서 코드를 편집하거나 실행해 주세요.');currentFile=new File([code],{A:'내프로그램.py',B:'Main.java',C:'내게임.html'}[track],{type:'text/plain'});document.querySelector('#submission-file').value='';showSelectedWorkFile('현재 편집한 코드');}
  if(b.id==='download-selected-code'){const file=document.querySelector('#submission-file').files?.[0]||currentFile;if(!file)throw Error('제출할 파일을 먼저 선택하세요.');A.download(file.name,file);}
  if(b.id==='refresh-receipts'||b.id==='refresh-room-state'){b.disabled=true;try{await loadMe();}finally{b.disabled=false;}}
  if(b.dataset.myDownload)await fileDownload(b.dataset.myDownload,b.dataset.filename,false);
  if(b.dataset.saveReceipt){const receipt=receipts.find(r=>r.id===b.dataset.saveReceipt);if(receipt)A.download('접수증-'+receipt.code+'.json',JSON.stringify(receipt,null,2),'application/json');}
  if(b.id==='refresh-rooms')await loadRooms();
  if(b.dataset.teacherRoom){selectedRoom=b.dataset.teacherRoom;await loadRooms();}
  if(b.dataset.teacherFile)await fileDownload(b.dataset.teacherFile,b.dataset.filename,true);
  if(b.dataset.teacherRecord){const r=await call('/api/submissions/'+b.dataset.teacherRecord,{teacher:true});A.download(r.code+'-실습기록.json',JSON.stringify(r,null,2),'application/json');}
  if(b.dataset.saveRoom)A.download(b.dataset.label+'-수업코드.txt',b.dataset.label+'\n수업 코드: '+b.dataset.saveRoom+'\n학생 교재: https://zeusk302-png.github.io/busanhc-it-outsourcing-2026/#submit');
  if(b.id==='teacher-export'){if(!selectedRoom)throw Error('수업을 먼저 선택하세요.');if(teacherItemsRoom!==selectedRoom)throw Error('접수 목록을 불러온 뒤 다시 저장하세요.');A.download('접수목록.json',JSON.stringify({room:teacherRooms.find(r=>r.id===selectedRoom),submissions:teacherItems},null,2),'application/json');}
  if(b.id==='teacher-close'||b.id==='teacher-reopen'){if(!selectedRoom)throw Error('수업을 먼저 선택하세요.');await call('/api/rooms/'+selectedRoom,{method:'PATCH',teacher:true,data:{open:b.id==='teacher-close'?0:1}});await loadRooms();}
  if(b.id==='teacher-logout'){teacherToken='';sessionStorage.removeItem('busanhc-it-teacher');teacherRoomsRequest++;selectedRoom='';teacherRooms=[];clearTeacherItems();A.route();}
 }catch(error){A.toast(error.message);}
});
window.IT_SUBMISSION={studentView,teacherView,mount:page=>{currentFile=null;if(page==='submit')loadMe();if(page==='teacher')teacherEnter();}};
dispatchEvent(new Event('it-submission-ready'));
})();
