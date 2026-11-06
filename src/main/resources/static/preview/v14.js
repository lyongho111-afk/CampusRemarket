// 세 장의 캠퍼스 광고: 자동 전환, 직접 선택, 이전·다음, 일시 정지.
(()=>{
 const hero=document.querySelector('.hero'),copy=hero?.firstElementChild;if(!hero||!copy)return;
 copy.classList.add('ad-copy');hero.setAttribute('aria-roledescription','캐러셀');hero.setAttribute('aria-label','캠퍼스 소식 광고 배너');
 const slides=[{tag:'BACK TO CAMPUS · RE:START',title:'필요했던 그 물건,\n같은 캠퍼스에 있어요.',body:'전공책부터 실습 준비물까지.\n잘 쓰던 물건에 다음 학기를 선물하세요.',button:'우리 학교 물건 둘러보기　↗',tab:'market',theme:''},{tag:'CAMPUS ESSENTIALS · RE:USE',title:'실습의 시작을,\n조금 더 가볍게.',body:'조리복 · 제도 도구 · 노트북.\n선배가 아끼던 준비물을 만나보세요.',button:'실습 준비물 찾아보기　↗',tab:'market',theme:'ad-campus'},{tag:'AROUND CAMPUS · TOGETHER',title:'공강 한 시간도,\n학교 주변과 함께.',body:'지금 열린 가게와 학생 혜택.\n캠퍼스 주변의 새로운 곳을 발견하세요.',button:'학교 주변 업체 보기　↗',tab:'life',theme:'ad-life'}];
 let index=0,paused=false,timer;const controls=el('div','ad-controls');
 const prev=actionButton('‹',()=>{show(index-1);restart()},false,''),next=actionButton('›',()=>{show(index+1);restart()},false,'');prev.setAttribute('aria-label','이전 광고');next.setAttribute('aria-label','다음 광고');controls.append(prev);
 const dots=slides.map((_,i)=>{const b=actionButton('',()=>{show(i);restart()},false,'ad-dot');b.setAttribute('aria-label',(i+1)+'번 광고 보기');controls.append(b);return b});
 const count=el('span','fine-print'),pause=actionButton('일시 정지',()=>{paused=!paused;pause.textContent=paused?'자동 재생':'일시 정지';pause.setAttribute('aria-pressed',String(paused));restart()},false,'ad-pause');controls.append(next,count,pause);hero.append(controls);
 function show(n){index=(n+slides.length)%slides.length;const s=slides[index];hero.classList.remove('ad-campus','ad-life');if(s.theme)hero.classList.add(s.theme);copy.querySelector('.eyebrow').textContent=s.tag;copy.querySelector('h1').replaceChildren(...s.title.split('\n').flatMap((t,i)=>i?[document.createElement('br'),document.createTextNode(t)]:[document.createTextNode(t)]));copy.querySelector('p').textContent=s.body;copy.querySelector('p').style.whiteSpace='pre-line';const c=copy.querySelector('button');c.textContent=s.button;c.onclick=()=>switchTab(s.tab);dots.forEach((b,i)=>{b.classList.toggle('active',i===index);b.setAttribute('aria-current',String(i===index))});count.textContent=(index+1)+' / 3'}
 function restart(){clearInterval(timer);if(!paused&&!document.hidden)timer=setInterval(()=>show(index+1),6000)}
 hero.addEventListener('mouseenter',()=>clearInterval(timer));hero.addEventListener('mouseleave',restart);hero.addEventListener('focusin',()=>clearInterval(timer));hero.addEventListener('focusout',restart);document.addEventListener('visibilitychange',restart);
 show(0);if(matchMedia('(prefers-reduced-motion: reduce)').matches){paused=true;pause.textContent='자동 재생'}restart();
})();
let lastNotificationCount=null;
async function refreshSellerNotifications(){
 if(!currentSession.authenticated||currentSession.member.role!=='STUDENT')return;
 try{const list=await api('notifications'),unread=list.filter(n=>!n.readAt).length;let b=$('#seller-notifications');if(!b){b=actionButton('알림',openSellerNotifications,false,'');b.id='seller-notifications';$('#member-actions').append(b)}b.textContent='알림'+(unread?' '+unread:'');b.setAttribute('aria-label','거래 알림 '+unread+'개 미확인');if(lastNotificationCount!==null&&unread>lastNotificationCount)toast('새 거래 약속 알림이 도착했어요.');lastNotificationCount=unread}catch{}
}
async function openSellerNotifications(){
 try{
  const [list,prefs]=await Promise.all([api('notifications'),api('notifications/settings')]);const root=modal('거래 약속 알림','구매자가 약속을 잡으면 판매자에게 알려 드립니다.');
  const settings=el('form','notification-settings');settings.append(el('strong','','외부 알림 수신 설정'));
  const email=addField(settings,'수신 이메일','email',prefs.email||'','input',false);email.type='email';email.maxLength=100;
  const phone=addField(settings,'수신 전화번호 (문자·카카오)','phone',prefs.phone||'','input',false);phone.type='tel';phone.maxLength=20;
  for(const [key,label]of [['smsEnabled','문자 알림'],['emailEnabled','이메일 알림'],['kakaoEnabled','카카오 알림톡']]){const l=el('label'),i=el('input');i.type='checkbox';i.name=key;i.checked=prefs[key];l.append(i,document.createTextNode(' '+label));settings.append(l)}
  settings.append(el('p','fine-print',prefs.deliveryEnabled?'외부 발송이 활성화되어 있습니다. 채널별 연동 설정에 따라 발송됩니다.':'현재 외부 발송이 꺼져 있습니다. 운영자가 서비스를 연결하면 발송할 수 있습니다.'));
  const save=el('button','primary','수신 설정 저장');save.type='submit';settings.append(save);settings.onsubmit=async e=>{e.preventDefault();save.disabled=true;try{await api('notifications/settings','PUT',{email:email.value,phone:phone.value,smsEnabled:settings.elements.smsEnabled.checked,emailEnabled:settings.elements.emailEnabled.checked,kakaoEnabled:settings.elements.kakaoEnabled.checked});toast('알림 수신 설정을 저장했어요.')}catch(err){toast(err.message)}finally{save.disabled=false}};root.append(settings);
  if(!list.length)root.append(el('p','empty','아직 받은 거래 약속이 없어요.'));
  const labels={PENDING:'발송 대기',SENDING:'발송 처리 중',ACCEPTED:'서비스 접수 완료',FAILED:'발송 실패',SETUP_REQUIRED:'서비스 설정 필요',DISABLED:'수신 꺼짐',CONTACT_REQUIRED:'연락처 필요'};
  for(const n of list){const row=el('article','notification-row');row.append(el('strong','',n.title),el('p','',n.message),el('small','',dateTime(timestamp(n.createdAt))));for(const d of n.deliveries)row.append(el('p','delivery-label',({SMS:'문자',EMAIL:'이메일',KAKAO:'카카오 알림톡'}[d.channel])+' · '+(labels[d.status]||d.status)));row.append(actionButton('거래 보기',()=>{$('#modal').close();tradeProductId=n.saleId;switchTab('integrations')},false,'secondary'));if(!n.readAt)row.append(actionButton('읽음 표시',async()=>{await api('notifications/'+n.id+'/read','POST');await refreshSellerNotifications();openSellerNotifications()},false,'secondary'));if(n.deliveries.some(d=>['FAILED','SETUP_REQUIRED','CONTACT_REQUIRED','DISABLED'].includes(d.status)))row.append(actionButton('외부 알림 다시 시도',async()=>{await api('notifications/'+n.id+'/retry','POST');toast('발송 가능한 채널을 다시 대기열에 넣었어요.');openSellerNotifications()},false,'secondary'));root.append(row)}
 }catch(e){toast(e.message)}
}
document.addEventListener('DOMContentLoaded',()=>{setTimeout(refreshSellerNotifications,1000);setInterval(refreshSellerNotifications,15000)});
